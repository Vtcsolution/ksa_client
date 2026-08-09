import { NextResponse } from "next/server";
import { runPollCycle } from "@/lib/ziwo/pollCycle";

/**
 * One polling cycle — meant to be invoked on an interval by something
 * external (Vercel Cron — see vercel.json, a system cron `curl`, or
 * scripts/ziwo-poll-loop.ts for local dev). Next.js Route Handlers don't
 * self-schedule, so the actual "every N minutes" behavior lives outside
 * this file, in whatever calls it.
 *
 * Shared-secret auth (not a user session) — this is meant to be called by a
 * scheduler, not a logged-in browser. See /api/ziwo/sync for the manager-
 * facing, session-authed equivalent triggered by the "Sync Ziwo Calls" button.
 *
 * Accepts the secret two ways: `x-poll-secret` (manual/curl/local dev) or
 * `Authorization: Bearer <secret>` (Vercel Cron's native format — it sends
 * this automatically when a `CRON_SECRET` env var is set on the project;
 * set CRON_SECRET to the same value as ZIWO_POLL_SECRET so one secret covers
 * both invocation paths).
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.ZIWO_POLL_SECRET;
  if (!secret) return false; // fail closed — this route touches the service-role client
  if (request.headers.get("x-poll-secret") === secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runPollCycle();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export const POST = handle;
export const GET = handle;
