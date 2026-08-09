import "server-only";
import { listRecentCalls } from "./callHistory";
import { processZiwoCallEvent, type ZiwoWebhookPayload } from "./webhookEvent";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * One polling cycle — reuses processZiwoCallEvent() (the same matching/
 * upsert/analysis-trigger logic the webhook route uses) for every call
 * GET /callHistory returns. Shared by two callers with different auth:
 * /api/ziwo/poll (shared-secret, meant for an external scheduler) and
 * /api/ziwo/sync (manager session auth, the "Sync Ziwo Calls" button).
 */
export interface PollCycleResult {
  ok: boolean;
  seen: number;
  processed: number;
  errors: string[];
}

/** Best-effort — a broken/unconfigured Supabase must not itself crash the caller while it's reporting an error. */
async function tryAuditLog(action: string, meta: Record<string, unknown>) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({ action, entity_type: "ziwo_call_history", meta });
  } catch {
    // swallow — audit logging is best-effort, never the reason a poll cycle fails to report
  }
}

export async function runPollCycle(): Promise<PollCycleResult> {
  try {
    const raw = (await listRecentCalls()) as { result?: boolean; content?: unknown[] };
    const calls = Array.isArray(raw?.content) ? raw.content : [];

    let processed = 0;
    const errors: string[] = [];
    for (const call of calls) {
      try {
        await processZiwoCallEvent({ action: "poll_discovered", content: call as ZiwoWebhookPayload["content"] });
        processed++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    await tryAuditLog("ziwo_poll_cycle", { seen: calls.length, processed, errors: errors.length ? errors : undefined });
    return { ok: true, seen: calls.length, processed, errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await tryAuditLog("ziwo_poll_cycle_failed", { error: message });
    return { ok: false, seen: 0, processed: 0, errors: [message] };
  }
}
