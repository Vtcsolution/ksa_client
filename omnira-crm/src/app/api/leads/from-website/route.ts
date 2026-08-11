import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPhoneLike, normPhone } from "@/lib/phone";

/**
 * Called by the Website the moment a real contact-form submission is saved
 * (see Website/app/api/leads/route.ts) — creates a matching CRM lead so it
 * enters the same tiered follow-up pipeline as a call-sourced lead, instead
 * of only existing in the read-only "Website Inquiries" mirror. Unassigned
 * on creation, same as an unrecognized Ziwo caller — a manager triages it.
 * Best-effort on the Website's side: a failure here never blocks the public
 * form submission from succeeding.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!secret) return false;
  return request.headers.get("x-api-secret") === secret;
}

interface WebsiteLeadPayload {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let payload: WebsiteLeadPayload;
  try {
    payload = (await request.json()) as WebsiteLeadPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!payload.name?.trim() || !payload.phone?.trim() || !isPhoneLike(payload.phone)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 422 });
  }

  const admin = createAdminClient();
  const phone = normPhone(payload.phone);

  const notesLines = [payload.service ? `Service: ${payload.service}` : "", payload.message ?? ""].filter(Boolean);
  const email = payload.email?.trim() || null;

  const { data: existing, error: findErr } = await admin.from("leads").select("id, email").eq("phone", phone).maybeSingle();
  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (existing) {
    // A later submission with an email we didn't have yet is still worth capturing.
    if (email && !existing.email) await admin.from("leads").update({ email }).eq("id", existing.id);
    return NextResponse.json({ ok: true, leadId: existing.id, created: false });
  }

  const { data: created, error: createErr } = await admin
    .from("leads")
    .insert({ name: payload.name.trim(), phone, email, source: "website", status: "new", notes: notesLines.join("\n") })
    .select("id")
    .single();

  if (createErr) {
    // 23505 = unique_violation on leads_phone_unique_idx — a race with
    // another creation path for the same number; not a real failure.
    if (createErr.code === "23505") return NextResponse.json({ ok: true, created: false });
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  const { data: managers } = await admin.from("profiles").select("id").eq("role", "manager");
  if (managers && managers.length > 0) {
    await admin.from("notifications").insert(
      managers.map((m) => ({
        user_id: m.id,
        lead_id: created.id,
        kind: "websiteLeadCreated",
        params: { name: payload.name.trim() },
        urgent: false,
      })),
    );
  }

  return NextResponse.json({ ok: true, leadId: created.id, created: true });
}
