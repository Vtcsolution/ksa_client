"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: ".env.local" });
const APP_URL = process.env.APP_URL ?? "http://localhost:3417";
const SECRET = process.env.ZIWO_POLL_SECRET;
const INTERVAL_MS = Number(process.env.ZIWO_POLL_INTERVAL_MS ?? 30000);
if (!SECRET) {
    console.error("ZIWO_POLL_SECRET is not set in .env.local");
    process.exit(1);
}
async function tick() {
    try {
        const res = await fetch(`${APP_URL}/api/ziwo/poll`, { method: "POST", headers: { "x-poll-secret": SECRET } });
        const body = await res.json().catch(() => null);
        console.log(`[${new Date().toISOString()}] poll -> ${res.status}`, body);
    }
    catch (err) {
        console.error(`[${new Date().toISOString()}] poll failed:`, err);
    }
}
console.log(`Polling ${APP_URL}/api/ziwo/poll every ${INTERVAL_MS}ms. Ctrl+C to stop.`);
tick();
setInterval(tick, INTERVAL_MS);
