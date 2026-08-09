// Local/dev-only interval trigger for /api/ziwo/poll. In production, use a
// real scheduler instead (Vercel Cron, or a system cron `curl`) pointed at
// the same URL — this script exists so the polling behavior is testable
// without deploying or configuring external infra first.
//
// Usage: npm run ziwo:poll-loop
//   (requires the Next.js dev server running separately, and ZIWO_POLL_SECRET
//   set the same in both places)

import { config } from "dotenv";
config({ path: ".env.local" });

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const SECRET = process.env.ZIWO_POLL_SECRET;
const INTERVAL_MS = Number(process.env.ZIWO_POLL_INTERVAL_MS ?? 30000);

if (!SECRET) {
  console.error("ZIWO_POLL_SECRET is not set in .env.local");
  process.exit(1);
}

async function tick() {
  try {
    const res = await fetch(`${APP_URL}/api/ziwo/poll`, { method: "POST", headers: { "x-poll-secret": SECRET! } });
    const body = await res.json().catch(() => null);
    console.log(`[${new Date().toISOString()}] poll -> ${res.status}`, body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] poll failed:`, err);
  }
}

console.log(`Polling ${APP_URL}/api/ziwo/poll every ${INTERVAL_MS}ms. Ctrl+C to stop.`);
tick();
setInterval(tick, INTERVAL_MS);
