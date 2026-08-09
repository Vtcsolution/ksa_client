import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { normPhone } from "@/lib/phone";
import { analyzeZiwoCall, appendProcessingLog } from "./analysis";

// Confirmed against two real webhook deliveries from the omneraone-poc
// account on 2026-08-04 (both unanswered outbound calls) plus one real
// answered call fetched directly via GET /callHistory on 2026-08-05:
//   recordingFile: "<callID>.mp3" — a bare filename, callID + extension.
//   Fetch its downloadable URL via GET /callHistory/{callID}/recording/signed-url
//   -> { url, id }; that url serves the file directly (Content-Type:
//   audio/mpeg, no auth header needed, GCS-backed, cached long-term).
//   Confirmed live: real 48KB mp3, 200 OK.
export interface ZiwoWebhookPayload {
  action: string; // only "create" observed so far — unconfirmed whether other values exist (e.g. a later "update" delivery for the same call)
  content: {
    id: number;
    callID: string;
    direction: "inbound" | "outbound" | string;
    callerIDNumber: string | null;
    didCalled: string | null;
    hangupCause: string | null;
    disposition: string | null;
    startedAt: string | null;
    answeredAt: string | null;
    endedAt: string | null;
    duration: number;
    talkTime: number;
    ringTime: number;
    result: string; // "answered" | "no-answer" | "cancel" observed — not a confirmed exhaustive enum
    customerId: string | null; // Ziwo's own internal contact id — NOT used for CRM matching, see resolveCustomerNumber
    agentId: number | null;
    agent: { id: number; firstName: string | null; lastName: string | null; username: string | null; ccLogin: string | null } | null;
    customer: { id: string; firstName: string | null; lastName: string | null } | null;
    recordingFile: string | null; // confirmed: "<callID>.mp3" when present, see comment above
  };
}

export function parseZiwoWebhookPayload(body: unknown): ZiwoWebhookPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.action !== "string" || !b.content || typeof b.content !== "object") return null;
  const c = b.content as Record<string, unknown>;
  if (typeof c.callID !== "string" || typeof c.id !== "number") return null;
  return b as unknown as ZiwoWebhookPayload;
}

/**
 * Customer-facing phone number for this call, direction-aware.
 * Outbound confirmed live: didCalled = the customer's number.
 * Inbound is the mirror case per instruction — NOT yet confirmed against a
 * real inbound call (Ziwo's inbound number for this POC account is still
 * pending from their support).
 */
export function resolveCustomerNumber(content: ZiwoWebhookPayload["content"]): string | null {
  if (content.direction === "inbound") return content.callerIDNumber;
  return content.didCalled;
}

/**
 * normPhone() (src/lib/phone.ts) was built for staff-typed phone entry
 * dedup and only strips the Saudi country code for *mobile* numbers
 * (05xxxxxxxx) — most seeded leads are Riyadh-area landlines (011x), and
 * Ziwo sends numbers in full E.164-ish form (+966..., 966..., or 00966...).
 * Without stripping the country code for landlines too, a real Saudi
 * landline call would never match its lead. Scoped to this matcher only —
 * not touching normPhone() itself since other call sites depend on its
 * current (mobile-only) behavior.
 */
function toLocalSaudiFormat(raw: string): string {
  const stripped = raw.replace(/[\s\-()]/g, "").replace(/^(\+|00)?966(?=\d)/, "0");
  return normPhone(stripped);
}

function mapResultKey(result: string): "answered" | "noAnswer" | "busy" | null {
  switch (result) {
    case "answered":
      return "answered";
    case "no-answer":
      return "noAnswer";
    case "busy":
      return "busy";
    default:
      return null; // e.g. "cancel" — no matching callModal key, caller falls back to the raw label
  }
}

export interface ProcessZiwoCallResult {
  matchedLeadId: string | null;
  matchedRepId: string | null;
  customerNumber: string | null;
}

/**
 * Matches the call to a lead by phone number (never by Ziwo's customerId —
 * that's Ziwo's own contact record, unrelated to our leads), upserts a
 * call_insights row (idempotent on ziwo_call_id, safe against redelivery),
 * and — if matched — writes a line onto the lead's activity timeline.
 *
 * If the call was answered and already has a recording, kicks off
 * transcription/analysis in the background (NOT awaited — this function, and
 * the webhook route that calls it, must stay fast; Ziwo needs its 200 back
 * quickly regardless of how long transcription takes). If there's no
 * recording yet, analysis is skipped here — the polling job is what catches
 * it once the recording becomes available (see /api/ziwo/poll).
 */
export async function processZiwoCallEvent(payload: ZiwoWebhookPayload): Promise<ProcessZiwoCallResult> {
  const { content } = payload;
  const admin = createAdminClient();
  const customerNumber = resolveCustomerNumber(content);

  let matchedLeadId: string | null = null;
  let matchedRepId: string | null = null;

  if (customerNumber) {
    const normalized = toLocalSaudiFormat(customerNumber);
    const { data: lead, error } = await admin.from("leads").select("id, assigned_to").eq("phone", normalized).maybeSingle();
    if (error) throw error;
    if (lead) {
      matchedLeadId = lead.id;
      matchedRepId = lead.assigned_to;
    } else {
      // No existing lead has this phone number — this is a real caller Ziwo
      // captured that isn't in the CRM yet. Auto-create a bare lead (name =
      // phone number, unassigned so a manager triages/assigns it) instead of
      // leaving the call as an orphaned call_insights row invisible on the
      // All Clients page.
      const { data: created, error: createErr } = await admin
        .from("leads")
        .insert({ name: customerNumber, phone: normalized, source: "ziwo", status: "new" })
        .select("id")
        .single();

      if (createErr) {
        // 23505 = unique_violation on leads_phone_unique_idx — the webhook
        // and the poll cycle can both discover the same brand-new number at
        // nearly the same time; whichever loses this race just adopts the
        // lead the winner already created, instead of failing the call event
        // (and skips the manager notification — the winner already sent it).
        if (createErr.code === "23505") {
          const { data: winner, error: refetchErr } = await admin.from("leads").select("id, assigned_to").eq("phone", normalized).single();
          if (refetchErr) throw refetchErr;
          matchedLeadId = winner.id;
          matchedRepId = winner.assigned_to;
        } else {
          throw createErr;
        }
      } else {
        matchedLeadId = created.id;

        // Nobody's assigned yet, so nudge every manager to triage it — otherwise
        // this lead is invisible until someone happens to open All Clients.
        const { data: managers, error: mgrErr } = await admin.from("profiles").select("id").eq("role", "manager");
        if (mgrErr) throw mgrErr;
        if (managers && managers.length > 0) {
          const { error: notifyErr } = await admin.from("notifications").insert(
            managers.map((m) => ({
              user_id: m.id,
              lead_id: created.id,
              kind: "ziwoLeadCreated",
              params: { phone: customerNumber },
              urgent: false,
            })),
          );
          if (notifyErr) throw notifyErr;
        }
      }
    }
  }

  // Deliberately omits `status` — it defaults to 'processing' on first insert
  // (table default) and is left untouched by PostgREST on a redelivery/
  // reprocess of a call that's already been through analysis. Explicitly
  // setting status: "processing" here would regress an analyzed call back
  // to processing every time the webhook or poll job sees it again.
  const { data: upserted, error: upsertErr } = await admin
    .from("call_insights")
    .upsert(
      {
        ziwo_call_id: content.callID,
        lead_id: matchedLeadId,
        rep_id: matchedRepId,
        lead_phone: customerNumber,
        at: content.startedAt ?? undefined,
        dur_sec: content.duration,
        recording_url: content.recordingFile,
        result: content.result,
      },
      { onConflict: "ziwo_call_id" },
    )
    .select("status")
    .single();
  if (upsertErr) throw upsertErr;
  const alreadyAnalyzed = upserted.status === "analyzed";

  await appendProcessingLog(admin, content.callID, "webhook_received", { action: payload.action, result: content.result });

  if (matchedLeadId) {
    const resultKey = mapResultKey(content.result);
    const { error: logErr } = await admin.from("activity_log").insert({
      lead_id: matchedLeadId,
      who_id: null,
      key: "ziwoCallLogged",
      params: {
        direction: content.direction,
        resultKey: resultKey ?? "",
        resultLabel: content.result,
        durSec: content.duration,
      },
    });
    if (logErr) throw logErr;
  }

  if (!alreadyAnalyzed && content.result === "answered" && content.recordingFile) {
    // Atomic claim (UPDATE ... WHERE analysis_claimed_at IS NULL) — the
    // webhook and the poll cycle can both reach this point for the same
    // call within moments of each other; only whichever one flips this
    // column first actually starts analysis. Cleared again in
    // analyzeZiwoCall's finally-equivalent (both success and failure paths)
    // so a failed call can still be retried on the next sync.
    const { data: claimed, error: claimErr } = await admin
      .from("call_insights")
      .update({ analysis_claimed_at: new Date().toISOString() })
      .eq("ziwo_call_id", content.callID)
      .is("analysis_claimed_at", null)
      .select("ziwo_call_id")
      .maybeSingle();
    if (claimErr) throw claimErr;
    if (claimed) {
      analyzeZiwoCall({ ziwoCallId: content.callID, leadId: matchedLeadId, repId: matchedRepId }).catch((err) => {
        console.error(`[ziwo analysis] background analysis failed for call ${content.callID}:`, err);
      });
    }
  }

  return { matchedLeadId, matchedRepId, customerNumber };
}
