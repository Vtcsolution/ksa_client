import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeTier, CADENCE } from "@/lib/followupCadence";
import { draftFollowupMessage } from "@/lib/openai/followupMessage";

const DAY_MS = 86400000;

interface TestimonialHit {
  quote?: string;
}

const THEME_SUBJECT: Record<string, string> = {
  check_in: "Just checking in — Omnira Valet",
  share_content: "Something that might help — Omnira Valet",
  value_reminder: "A quick reminder — Omnira Valet",
  reengage: "Still here whenever you're ready — Omnira Valet",
  special_offer: "A time-limited offer for you — Omnira Valet",
  final_nurture: "Reach out anytime — Omnira Valet",
  follow_up: "Following up — Omnira Valet",
  handle_objection: "A quick answer to your question — Omnira Valet",
  same_day_note: "Great speaking with you — Omnira Valet",
  testimonial: "What other clients are saying — Omnira Valet",
  push_to_book: "Ready to move forward? — Omnira Valet",
};

/**
 * Best-effort email side of a touchpoint — fired alongside the WhatsApp
 * queue whenever the lead has an email on file (see lead.email). Uses the
 * same shared-secret pattern as every other CRM<->Website call; a missing
 * WEBSITE_URL/secret or an unreachable Website just means no email, never a
 * failed sweep.
 */
async function sendFollowupEmail(email: string, theme: string, messageEn: string): Promise<void> {
  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return;

  const subject = THEME_SUBJECT[theme] ?? "A message from Omnira Valet";
  const html = `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#222;">${messageEn
    .split("\n")
    .map((line) => `<p>${line}</p>`)
    .join("")}</div>`;

  try {
    await fetch(`${websiteUrl}/api/marketing/send-followup-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": secret },
      body: JSON.stringify({ to: email, subject, html }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // best-effort — the WhatsApp queue entry already succeeded regardless
  }
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
  dormant: number;
  errors: string[];
}

/**
 * Runs the cold/warm/hot follow-up cadence — for every active lead whose
 * next touchpoint's day has arrived, drafts a personalized WhatsApp message
 * and queues it (see followup_messages; actual send activates once the
 * WhatsApp Business API is connected, same "queue until connected" pattern
 * used everywhere else). Urgent tier is NOT handled here — it's fired
 * immediately at the moment a call is analyzed, see ziwo/analysis.ts.
 *
 * Also marks a lead dormant the first time its cadence runs out of
 * touchpoints with no status change — "we tried the whole sequence, they
 * went quiet" — so it surfaces on the dashboard instead of silently going
 * untouched forever. A manager (or the assigned rep) can manually restart
 * it via restartFollowupCadence, which clears this and begins again at cold.
 */
export async function runFollowupCadenceSweep(): Promise<CadenceSweepResult> {
  const admin = createAdminClient();
  const errors: string[] = [];
  let sent = 0;
  let dormant = 0;

  const { data: leads, error: leadsErr } = await admin
    .from("leads")
    .select("id, name, name_en, email, notes, segment_id, followup_tier, followup_cadence_started_at, followup_step, followup_dormant_at, created_at, status")
    .neq("status", "won")
    .neq("status", "archived");
  if (leadsErr) return { ok: false, scanned: 0, sent: 0, dormant: 0, errors: [leadsErr.message] };

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

  const newlyDormant = (leads ?? []).filter((lead) => {
    const tier = lead.followup_tier ?? "cold";
    if (tier === "urgent" || lead.followup_dormant_at) return false;
    return lead.followup_step >= CADENCE[tier].length;
  });
  for (const lead of newlyDormant) {
    try {
      await admin.from("leads").update({ followup_dormant_at: new Date().toISOString() }).eq("id", lead.id);
      await admin.from("activity_log").insert({
        lead_id: lead.id,
        who_id: null,
        key: "followupCadenceExhausted",
        params: { tier: lead.followup_tier ?? "cold" },
      });
      const { data: managers } = await admin.from("profiles").select("id").eq("role", "manager");
      if (managers && managers.length > 0) {
        await admin.from("notifications").insert(
          managers.map((m) => ({ user_id: m.id, lead_id: lead.id, kind: "followupCadenceExhausted", params: { tier: lead.followup_tier ?? "cold" }, urgent: false })),
        );
      }
      dormant++;
    } catch (err) {
      errors.push(`${lead.id} (dormant): ${err instanceof Error ? err.message : "failed"}`);
    }
  }

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

      if (lead.email) await sendFollowupEmail(lead.email, touchpoint.theme, draft.en);

      sent++;
    } catch (err) {
      errors.push(`${lead.id}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }

  return { ok: errors.length === 0, scanned: due.length, sent, dormant, errors };
}
