import { NextResponse } from "next/server";
import { runFollowupCadenceSweep } from "@/lib/supabase/followupCadence";

/**
 * One cadence sweep — fires any cold/warm/hot lead's next due touchpoint
 * (see followupCadence.ts). Meant to be invoked on an interval by something
 * external (system cron `curl`, or scripts/followup-cadence-loop.ts for
 * local dev). Same shared-secret pattern as /api/followups/escalate.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.FOLLOWUP_ESCALATION_SECRET;
  if (!secret) return false; // fail closed — this route touches the service-role client
  if (request.headers.get("x-poll-secret") === secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runFollowupCadenceSweep();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export const POST = handle;
export const GET = handle;
