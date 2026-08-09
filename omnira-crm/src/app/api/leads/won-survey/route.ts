import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Fired from the client right after a lead is marked won (see
 * useAppStore.ts:setResultWon) — schedules a post-deal feedback survey on
 * the Website side. Session-authed only (any logged-in user, since any rep
 * can win a deal); the actual WEBSITE_URL/FEEDBACK_SYNC_SECRET call happens
 * server-side here so the shared secret never reaches the browser. Best-
 * effort: a failure here must never surface as an error to the rep — the
 * win itself already succeeded before this runs.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!name || !phone) return NextResponse.json({ ok: true });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ ok: true });

  try {
    await fetch(`${websiteUrl}/api/feedback/schedule-survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": secret },
      body: JSON.stringify({ name, phone, delayDays: 3 }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // best-effort — the win itself already succeeded
  }

  return NextResponse.json({ ok: true });
}
