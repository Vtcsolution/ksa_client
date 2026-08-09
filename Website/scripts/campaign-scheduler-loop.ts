// Local/dev-only interval trigger for /api/marketing/campaigns/due and
// /api/feedback/surveys/due — both are "send whatever is due now" sweeps, so
// one loop covers both rather than juggling two dev processes. In
// production, use a real scheduler instead (Vercel Cron — see vercel.json,
// or a system cron `curl`) pointed at each URL separately. Mirrors
// scripts/feedback-escalation-loop.ts.
//
// Usage: npm run marketing:scheduler-loop

import { config } from 'dotenv';
config({ path: '.env.local' });

const APP_URL = process.env.APP_URL ?? 'http://localhost:3500';
const SECRET = process.env.FEEDBACK_SYNC_SECRET;
const INTERVAL_MS = Number(process.env.CAMPAIGN_SCHEDULER_INTERVAL_MS ?? 300000); // 5 min default

if (!SECRET) {
  console.error('FEEDBACK_SYNC_SECRET is not set in .env.local');
  process.exit(1);
}

async function sweep(path: string) {
  try {
    const res = await fetch(`${APP_URL}${path}`, { method: 'POST', headers: { 'x-poll-secret': SECRET! } });
    const body = await res.json().catch(() => null);
    console.log(`[${new Date().toISOString()}] ${path} -> ${res.status}`, body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ${path} failed:`, err);
  }
}

async function tick() {
  await sweep('/api/marketing/campaigns/due');
  await sweep('/api/feedback/surveys/due');
}

console.log(`Sweeping campaigns/due + surveys/due on ${APP_URL} every ${INTERVAL_MS}ms. Ctrl+C to stop.`);
tick();
setInterval(tick, INTERVAL_MS);
