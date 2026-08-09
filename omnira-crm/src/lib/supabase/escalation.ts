import "server-only";
import { createAdminClient } from "./admin";
import { fetchLeads } from "./queries";

/**
 * Matches the point where NotifBell's live follow-up reminder silently stops
 * showing an overdue item (`diff < -6 * 3600000` in NotifBell.tsx) — this is
 * exactly the gap that needs a real, persistent escalation instead of the
 * lead quietly falling off everyone's radar.
 */
const ESCALATION_THRESHOLD_MS = 6 * 3600000;

export interface EscalationResult {
  ok: boolean;
  scanned: number;
  escalated: number;
  errors: string[];
}

/** Cross-channel auto-fallback message queued when the scheduled call/visit follow-up is missed. */
function autoNudgeMessage(name: string, nameEn: string | undefined) {
  return {
    messageAr: `مرحباً ${name}، نود التأكد من اهتمامك بخدمات أومنيرا فاليه — هل ما زلت مهتماً؟ يسعدنا الإجابة على أي استفسار.`,
    messageEn: `Hi ${nameEn || name}, checking in on your interest in Omnira Valet — still interested? Happy to help with any questions.`,
  };
}

/**
 * Scans every lead stuck in "followup" whose scheduled contact time is more
 * than 6 hours overdue and hasn't already been escalated for this specific
 * follow-up instance (see mapLead's followupEscalated). For each one:
 *  1. Writes a permanent "followupEscalated" activity_log entry (audit trail
 *     — the live bell reminder disappears after 6h with no record left).
 *  2. Auto-queues a cross-channel WhatsApp nudge to the customer (falls back
 *     to a different channel since the scheduled one was missed) using the
 *     same "queue until the Business API is live" pattern as
 *     queueWhatsappFollowup.
 *  3. Sends an urgent notification to the assigned rep and every manager.
 *  4. Stamps followup_escalated_at so it isn't re-escalated until a new
 *     follow-up is scheduled.
 */
export async function escalateOverdueFollowups(): Promise<EscalationResult> {
  const admin = createAdminClient();
  const errors: string[] = [];
  let escalated = 0;

  try {
    const leads = await fetchLeads(admin);
    const now = Date.now();
    const due = leads.filter(
      (l) => l.status === "followup" && l.followupDt && !l.followupEscalated && now - new Date(l.followupDt).getTime() >= ESCALATION_THRESHOLD_MS,
    );

    if (due.length === 0) return { ok: true, scanned: 0, escalated: 0, errors: [] };

    const { data: managers, error: mgrErr } = await admin.from("profiles").select("id").eq("role", "manager");
    if (mgrErr) throw mgrErr;
    const managerIds = (managers ?? []).map((m) => m.id);

    for (const lead of due) {
      try {
        const hoursOverdue = Math.floor((now - new Date(lead.followupDt!).getTime()) / 3600000);

        const { error: logErr } = await admin.from("activity_log").insert({
          lead_id: lead.id,
          who_id: null,
          key: "followupEscalated",
          params: { dt: lead.followupDt!, hoursOverdue },
        });
        if (logErr) throw logErr;

        const { messageAr, messageEn } = autoNudgeMessage(lead.name, lead.nameEn);
        const { error: nudgeErr } = await admin.from("activity_log").insert({
          lead_id: lead.id,
          who_id: null,
          key: "whatsappFollowupQueued",
          params: { messageAr, messageEn },
        });
        if (nudgeErr) throw nudgeErr;

        const recipients = new Set<string>(managerIds);
        if (lead.assignedTo) recipients.add(lead.assignedTo);
        for (const userId of recipients) {
          const { error: notifErr } = await admin.from("notifications").insert({
            user_id: userId,
            lead_id: lead.id,
            kind: "followupEscalated",
            params: { hoursOverdue },
            urgent: true,
          });
          if (notifErr) throw notifErr;
        }

        const { error: stampErr } = await admin.from("leads").update({ followup_escalated_at: new Date().toISOString() }).eq("id", lead.id);
        if (stampErr) throw stampErr;

        escalated++;
      } catch (err) {
        errors.push(`${lead.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { ok: errors.length === 0, scanned: due.length, escalated, errors };
  } catch (err) {
    return { ok: false, scanned: 0, escalated, errors: [err instanceof Error ? err.message : String(err)] };
  }
}
