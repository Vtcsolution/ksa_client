// Local/dev-only interval trigger for /api/followups/cadence-sweep. In
// production, use a real scheduler instead (a system cron `curl`) pointed at
// the same URL. Day-granularity cadence, so this doesn't need to run often —
// mirrors scripts/followup-escalation-loop.ts.
//
// Usage: npm run followups:cadence-loop
//   (requires the Next.js dev server running separately, and
//   FOLLOWUP_ESCALATION_SECRET set in .env.local)

import { config } from "dotenv";
config({ path: ".env.local" });

const APP_URL = process.env.APP_URL ?? "http://localhost:3417";
const SECRET = process.env.FOLLOWUP_ESCALATION_SECRET;
const INTERVAL_MS = Number(process.env.FOLLOWUP_CADENCE_INTERVAL_MS ?? 6 * 3600000); // 6h default

if (!SECRET) {
  console.error("FOLLOWUP_ESCALATION_SECRET is not set in .env.local");
  process.exit(1);
}

async function tick() {
  try {
    const res = await fetch(`${APP_URL}/api/followups/cadence-sweep`, { method: "POST", headers: { "x-poll-secret": SECRET! } });
    const body = await res.json().catch(() => null);
    console.log(`[${new Date().toISOString()}] cadence-sweep -> ${res.status}`, body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] cadence-sweep failed:`, err);
  }
}

console.log(`Sweeping ${APP_URL}/api/followups/cadence-sweep every ${INTERVAL_MS}ms. Ctrl+C to stop.`);
tick();
setInterval(tick, INTERVAL_MS);
