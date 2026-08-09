import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy to the marketing website's protected feedback API —
 * manager-session-authed here (a logged-in CRM manager), shared-secret
 * authed on the Website side (see WEBSITE_URL/FEEDBACK_SYNC_SECRET). Same
 * direction as the testimonials proxy. Never surfaces a hard error to the
 * UI: an unset config or unreachable Website just means an empty list.
 */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "manager") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ ok: true, feedback: [] });

  try {
    const res = await fetch(`${websiteUrl}/api/feedback`, {
      headers: { "x-api-secret": secret },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ ok: true, feedback: [] });
    const data = await res.json();
    return NextResponse.json({ ok: true, feedback: Array.isArray(data?.feedback) ? data.feedback : [] });
  } catch {
    return NextResponse.json({ ok: true, feedback: [] });
  }
}
