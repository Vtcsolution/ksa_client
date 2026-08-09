import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseZiwoWebhookPayload, processZiwoCallEvent } from "@/lib/ziwo/webhookEvent";

/**
 * Security: Ziwo's webhook config has an "API key header" field — whatever
 * value is entered there gets echoed back as the `x-api-key` header on every
 * webhook call. That, not HMAC signing, is the actual mechanism here. Checked
 * against ZIWO_WEBHOOK_API_KEY below.
 *
 * Always captures the full raw request first (unconditionally, regardless of
 * what parsing does with it below) — that raw log is what let us confirm the
 * schema in the first place and is what we'll diff the eventual
 * answered-call payload against.
 *
 * Parsing/CRM-matching is wired up against the confirmed no-answer schema
 * (see src/lib/ziwo/webhookEvent.ts for exactly what's confirmed vs still
 * open, particularly recordingFile). Never touches transcription/sentiment/
 * summary — that's a separate, not-yet-built step gated on the recording
 * shape.
 */
function isAuthorized(request: Request): boolean {
  const expected = process.env.ZIWO_WEBHOOK_API_KEY;
  if (!expected) return false; // fail closed
  const provided = request.headers.get("x-api-key");
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function capture(request: Request, authorized: boolean) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const rawBody = await request.text().catch(() => "");
  let body: unknown = null;
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }
  }

  const captured = {
    method: request.method,
    url: request.url,
    authorized,
    headers,
    query,
    body,
    capturedAt: new Date().toISOString(),
  };

  console.log("[ziwo webhook capture]", JSON.stringify(captured, null, 2));

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      action: authorized ? "ziwo_webhook_capture" : "ziwo_webhook_rejected",
      entity_type: "ziwo_webhook",
      meta: captured,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[ziwo webhook capture] audit_logs write failed, logged to console only:", err);
  }

  return captured;
}

async function handle(request: Request) {
  const authorized = isAuthorized(request);
  // Log rejected attempts too (still logged, still 401'd) — during this
  // capture phase, seeing *why* a request was rejected (wrong/missing header,
  // wrong casing, etc.) is more useful than a silent black hole.
  const captured = await capture(request, authorized);
  if (!authorized) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Parsing/matching failures must never turn into a non-200 back to Ziwo —
  // the raw capture above already succeeded, which is what matters most
  // right now. Log and move on.
  try {
    const payload = parseZiwoWebhookPayload(captured.body);
    if (payload) {
      const result = await processZiwoCallEvent(payload);
      console.log("[ziwo webhook processed]", JSON.stringify(result));
    } else {
      console.warn("[ziwo webhook] body didn't match the expected {action, content} shape — skipped parsing");
    }
  } catch (err) {
    console.error("[ziwo webhook] parsing/matching failed:", err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
