import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeMeetingNotes } from "@/lib/openai/meetingSummary";

export const dynamic = "force-dynamic";

/**
 * Turns a rep's own meeting notes into a structured AI recap — session-authed
 * for any logged-in user (not manager-only, since the rep who just completed
 * their own meeting is the one triggering this), same permissive style as
 * /api/ziwo/sync. Runs after markMeetingDone has already saved successfully,
 * so a failure here never loses the rep's notes — it just means no AI recap.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: meeting, error: fetchErr } = await admin
    .from("meetings")
    .select("id, type, notes, lead_id")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!meeting || !meeting.notes?.trim()) return NextResponse.json({ ok: true, summary: null });

  const { data: lead } = await admin.from("leads").select("name").eq("id", meeting.lead_id).maybeSingle();
  const summary = await analyzeMeetingNotes(meeting.notes, lead?.name ?? "", meeting.type);
  if (!summary) return NextResponse.json({ ok: true, summary: null });

  const { error: updateErr } = await admin
    .from("meetings")
    .update({
      summary_ar: summary.summaryAr,
      summary_en: summary.summaryEn,
      next_steps_ar: summary.nextStepsAr,
      next_steps_en: summary.nextStepsEn,
      sentiment: summary.sentiment,
      summarized_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  await admin.from("activity_log").insert({
    lead_id: meeting.lead_id,
    who_id: user.id,
    key: "meetingSummarized",
    params: { sentiment: summary.sentiment, summaryEn: summary.summaryEn },
  });

  return NextResponse.json({ ok: true, summary });
}
