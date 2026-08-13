"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: ".env.local" });
const APP_URL = process.env.APP_URL ?? "http://localhost:3417";
const SECRET = process.env.FOLLOWUP_ESCALATION_SECRET;
const INTERVAL_MS = Number(process.env.FOLLOWUP_ESCALATION_INTERVAL_MS ?? 300000);
if (!SECRET) {
    console.error("FOLLOWUP_ESCALATION_SECRET is not set in .env.local");
    process.exit(1);
}
async function tick() {
    try {
        const res = await fetch(`${APP_URL}/api/followups/escalate`, { method: "POST", headers: { "x-poll-secret": SECRET } });
        const body = await res.json().catch(() => null);
        console.log(`[${new Date().toISOString()}] escalate -> ${res.status}`, body);
    }
    catch (err) {
        console.error(`[${new Date().toISOString()}] escalate failed:`, err);
    }
}
console.log(`Sweeping ${APP_URL}/api/followups/escalate every ${INTERVAL_MS}ms. Ctrl+C to stop.`);
tick();
setInterval(tick, INTERVAL_MS);
