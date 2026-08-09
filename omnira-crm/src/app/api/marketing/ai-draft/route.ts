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

export async function POST(request: NextRequest) {
  if (!(await requireManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ error: "not_configured" }, { status: 502 });

  const body = await request.json().catch(() => null);
  const brief = typeof body?.brief === "string" ? body.brief.trim() : "";
  if (!brief || brief.length < 3) return NextResponse.json({ error: "brief_required" }, { status: 422 });

  try {
    const res = await fetch(`${websiteUrl}/api/marketing/ai-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": secret },
      body: JSON.stringify({ brief }),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return NextResponse.json({ error: data?.error ?? "website_error" }, { status: 502 });
    return NextResponse.json({ ok: true, draft: data.draft });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
