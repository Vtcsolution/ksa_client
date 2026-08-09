import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a new rep login. Needs the service-role client because it calls
 * `auth.admin.createUser` — RLS alone can't grant that, it's a Supabase Auth
 * admin operation, so this is the one action in Milestone 1 that can't be a
 * direct client → Supabase call.
 *
 * No invite-email flow yet (out of scope for Milestone 1) — the generated
 * password is returned once in the response for the manager to hand off
 * out-of-band. Revisit before this goes to real staff.
 */
export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "manager") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const roleChoice = body?.roleChoice === "sales" ? "sales" : "meetings";
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "rep";
  const email = `${slug}.${Date.now().toString(36)}@omnira-staff.local`;
  const password = `Omnira!${Math.random().toString(36).slice(2, 10)}A1`;

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "rep" },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "failed to create user" }, { status: 500 });
  }

  // Matches DEFAULT_PERMS in src/lib/constants.ts (all true) with only
  // `transfer` conditional on the chosen role — addStaff's original mock logic.
  const { error: permErr } = await admin
    .from("profiles")
    .update({
      perm_transfer: roleChoice === "sales",
      perm_receive: true,
      perm_add_field: true,
      perm_meetings: true,
      perm_quote: true,
      perm_content: true,
    })
    .eq("id", created.user.id);
  if (permErr) return NextResponse.json({ error: permErr.message }, { status: 500 });

  return NextResponse.json({ id: created.user.id, name, email, password });
}
