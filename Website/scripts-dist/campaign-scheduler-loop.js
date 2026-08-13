"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local' });
const APP_URL = process.env.APP_URL ?? 'http://localhost:3500';
const SECRET = process.env.FEEDBACK_SYNC_SECRET;
const INTERVAL_MS = Number(process.env.CAMPAIGN_SCHEDULER_INTERVAL_MS ?? 300000);
if (!SECRET) {
    console.error('FEEDBACK_SYNC_SECRET is not set in .env.local');
    process.exit(1);
}
async function sweep(path) {
    try {
        const res = await fetch(`${APP_URL}${path}`, { method: 'POST', headers: { 'x-poll-secret': SECRET } });
        const body = await res.json().catch(() => null);
        console.log(`[${new Date().toISOString()}] ${path} -> ${res.status}`, body);
    }
    catch (err) {
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
