import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Feeds the Website's unified marketing dashboard (Email + SMS + WhatsApp in
 * one view) — every WhatsApp follow-up queued by a rep, the CallInsight
 * "queue" button, or the follow-up escalation sweep is a
 * "whatsappFollowupQueued" activity_log entry (see logActivity calls in
 * mutations.ts and escalation.ts); this just aggregates those. Shared-secret
 * auth since the caller is another server, not a logged-in CRM session —
 * same pattern as /api/ziwo/poll and /api/followups/escalate.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.WHATSAPP_SUMMARY_SECRET;
  if (!secret) return false;
  return request.headers.get("x-api-secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
