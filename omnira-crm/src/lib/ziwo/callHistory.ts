import "server-only";
import { ziwoFetch } from "./client";

// Endpoint addresses confirmed against Ziwo's Postman docs
// (https://documenter.getpostman.com/view/1450071/RWToNwzB, Admin > Call
// history (CDR)) on 2026-08-04. Response *shapes* are deliberately NOT typed
// here yet — the client asked us to wait for confirmed field names rather
// than build against generic docs, since their live account's response may
// differ. Everything below returns `unknown` on purpose; fill in the real
// shape (and update src/lib/supabase/database.types.ts's call_insights
// columns if needed) once those are confirmed.
//
// Known open question worth resolving before wiring the real parsing: the
// docs show TWO different call identifiers — a numeric `id` (used in
// `/callHistory/{id}`) and a UUID `callID` (used in the recording endpoint).
// Confirm which one is the stable idempotency key before this goes further.

/**
 * GET /callHistory — list calls, optionally filtered by date range.
 * (The Postman sidebar labels this item "POST" — that's wrong; confirmed
 * live against the real account on 2026-08-04 that only GET returns data,
 * POST 404s. Worth flagging to Ziwo/whoever maintains those docs.)
 *
 * Docs list many available filter params (fromDate/toDate/fromTime/toTime/
 * limit/skip/recordings/contactNumber/agents[]/queues[]/...) — intentionally
 * not wiring any of them yet since the exact filter set to poll with hasn't
 * been confirmed. Called with no filters for now: returns whatever the
 * default page is, purely to prove the endpoint + auth work end to end.
 */
export async function listRecentCalls(): Promise<unknown> {
  const res = await ziwoFetch("/callHistory");
  if (!res.ok) throw new Error(`Ziwo listRecentCalls failed (HTTP ${res.status})`);
  return res.json();
}

/** GET /callHistory/{id} — single CDR by its numeric id. */
export async function getCallById(id: string | number): Promise<unknown> {
  const res = await ziwoFetch(`/callHistory/${id}`);
  if (!res.ok) throw new Error(`Ziwo getCallById(${id}) failed (HTTP ${res.status})`);
  return res.json();
}

/** GET /callHistory/{callID}/recording/signed-url — no-auth-needed download link for the recording. */
export async function getRecordingSignedUrl(callID: string): Promise<unknown> {
  const res = await ziwoFetch(`/callHistory/${callID}/recording/signed-url`);
  if (!res.ok) throw new Error(`Ziwo getRecordingSignedUrl(${callID}) failed (HTTP ${res.status})`);
  return res.json();
}
