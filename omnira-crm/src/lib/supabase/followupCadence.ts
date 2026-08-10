import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeTier, CADENCE } from "@/lib/followupCadence";
import { draftFollowupMessage } from "@/lib/openai/followupMessage";

const DAY_MS = 86400000;

interface TestimonialHit {
  quote?: string;
}

/** Best-effort — a missing/unreachable Website just means no testimonial gets woven in, not a failed sweep. */
async function fetchMatchingTestimonialQuote(segmentSlug: string | null): Promise<string | undefined> {
  if (!segmentSlug) return undefined;
  const websiteUrl = process.env.WEBSITE_URL;
  if (!websiteUrl) return undefined;
  try {
    const res = await fetch(`${websiteUrl}/api/testimonials?segment=${encodeURIComponent(segmentSlug)}`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const items = Array.isArray(data?.testimonials) ? (data.testimonials as TestimonialHit[]) : [];
    return items[0]?.quote;
  } catch {
    return undefined;
  }
}

export interface CadenceSweepResult {
  ok: boolean;
  scanned: number;
  sent: number;
  errors: string[];
}

/**
 * Runs the cold/warm/hot follow-up cadence — for every active lead whose
 * next touchpoint's day has arrived, drafts a personalized WhatsApp message
 * and queues it (see followup_messages; actual send activates once the
 * WhatsApp Business API is connected, same "queue until connected" pattern
 * used everywhere else). Urgent tier is NOT handled here — it's fired
 * immediately at the moment a call is analyzed, see ziwo/analysis.ts.
 */
export async function runFollowupCadenceSweep(): Promise<CadenceSweepResult> {
  const admin = createAdminClient();
  const errors: string[] = [];
  let sent = 0;

  const { data: leads, error: leadsErr } = await admin
    .from("leads")
    .select("id, name, name_en, notes, segment_id, followup_tier, followup_cadence_started_at, followup_step, created_at, status")
    .neq("status", "won")
    .neq("status", "archived");
  if (leadsErr) return { ok: false, scanned: 0, sent: 0, errors: [leadsErr.message] };

  const { data: segments } = await admin.from("segments").select("id, name_key, custom_name");
  const segmentLabel = new Map((segments ?? []).map((s) => [s.id, s.custom_name || s.name_key || s.id]));

  const now = Date.now();
  const due = (leads ?? []).filter((lead) => {
    const tier = lead.followup_tier ?? "cold";
    if (tier === "urgent") return false; // handled at analysis-time, not here
    const touchpoints = CADENCE[tier];
    if (lead.followup_step >= touchpoints.length) return false; // cadence exhausted
    const cadenceStart = lead.followup_cadence_started_at ?? lead.created_at;
    const daysSince = Math.floor((now - new Date(cadenceStart).getTime()) / DAY_MS);
    return daysSince >= touchpoints[lead.followup_step].day;
  });

  for (const lead of due) {
    try {
      const tier = (lead.followup_tier ?? "cold") as Exclude<ReturnType<typeof computeTier>, "urgent">;
      const touchpoint = CADENCE[tier][lead.followup_step];
      const segLabel = lead.segment_id ? segmentLabel.get(lead.segment_id) : undefined;
      const testimonialQuote = touchpoint.theme === "testimonial" ? await fetchMatchingTestimonialQuote(segLabel ?? null) : undefined;

      const draft = await draftFollowupMessage({
        leadName: lead.name_en || lead.name,
        segmentLabel: segLabel,
        notes: lead.notes || undefined,
        tier,
        theme: touchpoint.theme,
        testimonialQuote,
      });
      if (!draft) continue; // best-effort — retried next sweep since step doesn't advance

      const { error: insertErr } = await admin.from("followup_messages").insert({
        lead_id: lead.id,
        tier,
        step: lead.followup_step,
        theme: touchpoint.theme,
        message_ar: draft.ar,
        message_en: draft.en,
        status: "queued",
      });
      if (insertErr) throw insertErr;

      await admin.from("activity_log").insert({
        lead_id: lead.id,
        who_id: null,
        key: "tierFollowupQueued",
        params: { tier, theme: touchpoint.theme },
      });

      await admin.from("leads").update({ followup_step: lead.followup_step + 1 }).eq("id", lead.id);
      sent++;
    } catch (err) {
      errors.push(`${lead.id}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }

  return { ok: errors.length === 0, scanned: due.length, sent, errors };
}
