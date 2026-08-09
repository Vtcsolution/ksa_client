import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Manager-authed proxy to the Website's full testimonials list (all statuses,
 * for moderation) — distinct from the sibling /api/testimonials route, which
 * is an unauthenticated segment-filtered proxy used to enrich LeadDetailModal
 * with already-approved quotes. Same shared-secret pattern as the feedback
 * and site-leads proxies.
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
  if (!websiteUrl || !secret) return NextResponse.json({ ok: true, testimonials: [] });

  try {
    const res = await fetch(`${websiteUrl}/api/testimonials`, {
      headers: { "x-api-secret": secret },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ ok: true, testimonials: [] });
    const data = await res.json();
    return NextResponse.json({ ok: true, testimonials: Array.isArray(data?.testimonials) ? data.testimonials : [] });
  } catch {
    return NextResponse.json({ ok: true, testimonials: [] });
  }
}
