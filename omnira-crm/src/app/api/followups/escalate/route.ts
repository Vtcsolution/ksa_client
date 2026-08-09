import { NextResponse } from "next/server";
import { escalateOverdueFollowups } from "@/lib/supabase/escalation";

/**
 * One escalation sweep — meant to be invoked on an interval by something
 * external (Vercel Cron — see vercel.json, a system cron `curl`, or
 * scripts/followup-escalation-loop.ts for local dev). Same shared-secret
 * pattern as /api/ziwo/poll.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.FOLLOWUP_ESCALATION_SECRET;
  if (!secret) return false; // fail closed — this route touches the service-role client
  if (request.headers.get("x-poll-secret") === secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await escalateOverdueFollowups();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export const POST = handle;
export const GET = handle;
