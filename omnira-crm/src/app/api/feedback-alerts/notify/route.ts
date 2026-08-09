import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Receives one recurring alert from the Website's feedback escalation sweep
 * (app/api/feedback/escalate/route.ts) and fans it out as a real notification
 * to every manager — reuses the existing notifications table + NotifBell
 * rendering exactly like ziwoCallAnalyzed/followupEscalated. Shared-secret
 * auth since the caller is another server, not a logged-in CRM session.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!secret) return false;
  return request.headers.get("x-api-secret") === secret;
}

interface AlertPayload {
  feedbackId: string;
  name: string;
  rating: number;
  severityPct: number;
  urgency: "low" | "medium" | "high";
  reasonAr: string;
  message: string;
  notifyCount: number;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let payload: AlertPayload;
  try {
    payload = (await request.json()) as AlertPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!payload.feedbackId) return NextResponse.json({ error: "missing_feedback_id" }, { status: 422 });

  const admin = createAdminClient();
  const { data: managers, error: mgrErr } = await admin.from("profiles").select("id").eq("role", "manager");
  if (mgrErr) return NextResponse.json({ error: mgrErr.message }, { status: 500 });

  const urgent = payload.severityPct >= 70 || payload.urgency === "high";
  const rows = (managers ?? []).map((m) => ({
    user_id: m.id,
    lead_id: null,
    kind: "websiteFeedbackAlert",
    params: {
      feedbackId: payload.feedbackId,
      name: payload.name,
      rating: payload.rating,
      severityPct: payload.severityPct,
      notifyCount: payload.notifyCount,
    },
    urgent,
  }));
  if (rows.length > 0) {
    const { error: insertErr } = await admin.from("notifications").insert(rows);
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notified: rows.length });
}
