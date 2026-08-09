import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireManager() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === "manager";
}

export async function GET() {
  if (!(await requireManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ ok: true, campaigns: [] });

  try {
    const res = await fetch(`${websiteUrl}/api/marketing/sms/campaigns`, {
      headers: { "x-api-secret": secret },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ ok: true, campaigns: [] });
    const data = await res.json();
    return NextResponse.json({ ok: true, campaigns: Array.isArray(data?.campaigns) ? data.campaigns : [] });
  } catch {
    return NextResponse.json({ ok: true, campaigns: [] });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ error: "not_configured" }, { status: 502 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid_body" }, { status: 422 });

  try {
    const res = await fetch(`${websiteUrl}/api/marketing/sms/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json({ error: data?.error ?? "website_error", issues: data?.issues }, { status: res.status === 422 ? 422 : 502 });
    return NextResponse.json({ ok: true, campaign: data.campaign });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
