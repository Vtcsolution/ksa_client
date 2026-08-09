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

/** Proxies approve/reject to the Website — see /api/testimonials/admin (GET) for the read-side of this same proxy pair. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ error: "not_configured" }, { status: 502 });

  const body = await request.json().catch(() => null);
  if (body?.status !== "approved" && body?.status !== "rejected") {
    return NextResponse.json({ error: "invalid_body" }, { status: 422 });
  }

  const { id } = await params;
  try {
    const res = await fetch(`${websiteUrl}/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-api-secret": secret },
      body: JSON.stringify({ status: body.status }),
      // approving triggers an OpenAI classification call on the Website side
      // before it responds — needs real headroom, not the plain-CRUD 5s used elsewhere.
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return NextResponse.json({ error: "website_error" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireManager())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const websiteUrl = process.env.WEBSITE_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!websiteUrl || !secret) return NextResponse.json({ error: "not_configured" }, { status: 502 });

  const { id } = await params;
  try {
    const res = await fetch(`${websiteUrl}/api/testimonials/${id}`, {
      method: "DELETE",
      headers: { "x-api-secret": secret },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ error: "website_error" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
