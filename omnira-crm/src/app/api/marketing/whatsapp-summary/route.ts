import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Manager-authed, in-process equivalent of /api/whatsapp/queue-summary — that
 * route is shared-secret-gated for the Website's own marketing dashboard to
 * call over HTTP; this one serves the CRM's own marketing page directly from
 * a logged-in session, no secret round-trip needed since both live in the
 * same app.
 */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "manager") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data, error } = await admin
    .from("activity_log")
    .select("id, params, at, leads(name)")
    .eq("key", "whatsappFollowupQueued")
    .gte("at", since)
    .order("at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as unknown as { id: string; params: Record<string, unknown> | null; at: string; leads: { name: string } | null }[];
  const items = rows.map((row) => ({
    id: row.id,
    leadName: row.leads?.name ?? "",
    message: String(row.params?.messageAr ?? ""),
    at: row.at,
  }));

  return NextResponse.json({ ok: true, total: items.length, items });
}
