// Local/dev-only interval trigger for /api/feedback/escalate. In production,
// use a real scheduler instead (Vercel Cron, or a system cron `curl`) pointed
// at the same URL — this script exists so the recurring severity-based
// re-alert behavior is testable without deploying or configuring external
// infra first. Mirrors omnira-crm/scripts/followup-escalation-loop.ts.
//
// Usage: npm run feedback:escalate-loop
//   (requires the Next.js dev server running separately, and
//   FEEDBACK_SYNC_SECRET set the same in both this app's and the CRM's .env.local)

import { config } from 'dotenv';
config({ path: '.env.local' });

const APP_URL = process.env.APP_URL ?? 'http://localhost:3500';
const SECRET = process.env.FEEDBACK_SYNC_SECRET;
const INTERVAL_MS = Number(process.env.FEEDBACK_ESCALATION_INTERVAL_MS ?? 600000); // 10 min default — fine-grained enough to honor the 6h/12h/24h severity tiers

if (!SECRET) {
  console.error('FEEDBACK_SYNC_SECRET is not set in .env.local');
  process.exit(1);
}

async function tick() {
  try {
    const res = await fetch(`${APP_URL}/api/feedback/escalate`, { method: 'POST', headers: { 'x-poll-secret': SECRET! } });
    const body = await res.json().catch(() => null);
    console.log(`[${new Date().toISOString()}] escalate -> ${res.status}`, body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] escalate failed:`, err);
  }
}

console.log(`Sweeping ${APP_URL}/api/feedback/escalate every ${INTERVAL_MS}ms. Ctrl+C to stop.`);
tick();
setInterval(tick, INTERVAL_MS);
