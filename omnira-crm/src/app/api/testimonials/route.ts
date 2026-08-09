import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy to the marketing website's public testimonials API —
 * keeps WEBSITE_URL server-only (no CORS, nothing exposed to the client
 * bundle) and lets LeadDetailModal show AI-matched testimonials for a lead's
 * segment. Never surfaces as an error to the UI: an unset WEBSITE_URL, a
 * network failure, or the website being down should just mean "no
 * testimonials to show" — this is an enrichment, not a core feature.
 */
export async function GET(request: NextRequest) {
  const websiteUrl = process.env.WEBSITE_URL;
  if (!websiteUrl) return NextResponse.json({ ok: true, testimonials: [] });

  const segment = request.nextUrl.searchParams.get("segment");
  if (!segment) return NextResponse.json({ ok: true, testimonials: [] });

  try {
    const res = await fetch(`${websiteUrl}/api/testimonials?segment=${encodeURIComponent(segment)}`, {
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
