// One-time demo data seed. Run after real Supabase credentials are in
// .env.local and migrations have been applied:
//   npm run seed
//
// Safe to re-run: users are created idempotently (skips if the email already
// exists) and leads are matched by phone number.

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { DEMO_ACCOUNTS } from "../src/lib/demoAccounts";
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient<Database>(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const DAY_MS = 86400000;
const now = Date.now();
const daysAgo = (n: number, hour = 9, min = 0) => {
  const d = new Date(now - n * DAY_MS);
  d.setHours(hour, min, 0, 0);
  return d;
};
const isoInDays = (n: number, hour = 10, min = 0) => {
  const d = new Date(now + n * DAY_MS);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const isoAgoDays = (n: number, hour = 10, min = 0) => daysAgo(n, hour, min).toISOString();
const todayAt = (hour: number, min = 0) => {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  return d;
};

async function ensureUser(account: (typeof DEMO_ACCOUNTS)[number]): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === account.email);
  if (existing) {
    console.log(`user exists: ${account.email}`);
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { name: account.key, role: account.role },
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");
  console.log(`created user: ${account.email}`);
  return data.user.id;
}

async function seedHistory(userId: string, history: { daysAgoIdx: number; calls: number; visits: number; mtg: number }[]) {
  for (const h of history) {
    const day = daysAgo(h.daysAgoIdx, 10, 0);
    for (let i = 0; i < h.calls; i++) {
      await admin.from("calls").insert({ lead_id: await anyLeadId(), rep_id: userId, dur_sec: 180, answered: "answered", at: day.toISOString() });
    }
    for (let i = 0; i < h.visits; i++) {
      await admin.from("visits").insert({ lead_id: await anyLeadId(), rep_id: userId, verified: true, note: "", at: day.toISOString() });
    }
    for (let i = 0; i < h.mtg; i++) {
      await admin.from("meetings").insert({ lead_id: await anyLeadId(), rep_id: userId, type: "inperson", dt: day.toISOString(), done: true });
    }
  }
}

let cachedLeadId: string | null = null;
async function anyLeadId(): Promise<string> {
  if (cachedLeadId) return cachedLeadId;
  const { data } = await admin.from("leads").select("id").limit(1).single();
  cachedLeadId = data!.id;
  return cachedLeadId;
}

async function main() {
  console.log("== segments ==");
  const segments = [
    { id: "hotels", name_key: "hotels" },
    { id: "restaurants", name_key: "restaurants" },
    { id: "malls", name_key: "malls" },
    { id: "hospitals", name_key: "hospitals" },
    { id: "halls", name_key: "halls" },
    { id: "complexes", name_key: "complexes" },
  ];
  for (const s of segments) {
    const { error } = await admin.from("segments").upsert(s);
    if (error) throw error;
  }

  console.log("== users ==");
  const ids: Record<string, string> = {};
  for (const account of DEMO_ACCOUNTS) {
    ids[account.key] = await ensureUser(account);
  }

  await admin.from("targets").upsert({ user_id: ids.u_faris, daily_calls: 10, daily_visits: 3, weekly_meetings: 8, monthly_contracts: 5 });
  await admin.from("targets").upsert({ user_id: ids.u_azza, daily_calls: 6, daily_visits: 1, weekly_meetings: 10, monthly_contracts: 6 });
  await admin.from("profiles").update({ perm_transfer: true }).eq("id", ids.u_faris);
  await admin.from("profiles").update({ perm_transfer: false }).eq("id", ids.u_azza);

  console.log("== leads ==");
  type LeadSeed = {
    name: string;
    name_en: string;
    phone: string;
    location?: string;
    segment_id: string;
    status: Database["public"]["Tables"]["leads"]["Row"]["status"];
    assigned_to: string;
    source?: "excel" | "field";
    decision_maker_name?: string;
    decision_maker_name_en?: string;
    decision_maker_phone?: string;
    discount_official?: number;
    discount_given?: number;
    result?: string;
    result_reason_key?: string;
  };

  const leads: LeadSeed[] = [
    {
      name: "فندق النخيل الذهبي", name_en: "Golden Palm Hotel", phone: "0114567890",
      location: "https://maps.google.com/?q=24.7136,46.6753", segment_id: "hotels", status: "contacted", assigned_to: ids.u_faris,
      discount_official: 6500, discount_given: 4500,
    },
    {
      name: "مطعم البخاري الفاخر", name_en: "Al Bukhari Elite Restaurant", phone: "0126789012",
      segment_id: "restaurants", status: "interested", assigned_to: ids.u_faris,
      decision_maker_name: "أبو محمد — مدير التشغيل", decision_maker_name_en: "Abu Mohammed — Operations Manager", decision_maker_phone: "0551112233",
    },
    { name: "مجمّع الواحة الطبي", name_en: "Al Waha Medical Complex", phone: "0113344556", segment_id: "hospitals", status: "meeting", assigned_to: ids.u_azza },
    { name: "مول الرياض بارك", name_en: "Riyadh Park Mall", phone: "0115566778", segment_id: "malls", status: "meeting", assigned_to: ids.u_azza },
    { name: "قاعة أفراح الماس", name_en: "Almas Wedding Hall", phone: "0117788990", segment_id: "halls", status: "won", assigned_to: ids.u_azza, result: "won", result_reason_key: "service" },
    { name: "فندق روز جاردن", name_en: "Rose Garden Hotel", phone: "0118877665", segment_id: "hotels", status: "meeting", assigned_to: ids.u_azza },
    { name: "فندق قصر البادية", name_en: "Al Badia Palace Hotel", phone: "0114411223", segment_id: "hotels", status: "followup", assigned_to: ids.u_faris },
    { name: "مطعم اللؤلؤة", name_en: "Al Lulua Restaurant", phone: "0129900112", segment_id: "restaurants", status: "archived", assigned_to: ids.u_faris, result: "archived", result_reason_key: "wrongNumber" },
    { name: "مستشفى الحياة", name_en: "Al Hayat Hospital", phone: "0112233445", segment_id: "hospitals", status: "new", assigned_to: ids.u_faris },
    { name: "برج مكاتب العليا", name_en: "Al Ulya Office Tower", phone: "0116677889", segment_id: "complexes", status: "new", assigned_to: ids.u_faris },
    { name: "فندق الأصالة (ميداني)", name_en: "Al Asala Hotel (Field)", phone: "0554433221", segment_id: "hotels", source: "field", status: "contacted", assigned_to: ids.u_faris },
  ];

  for (const l of leads) {
    const { data: existing } = await admin.from("leads").select("id").eq("phone", l.phone).maybeSingle();
    if (existing) {
      console.log(`lead exists, skipping: ${l.name}`);
      continue;
    }
    const { data: inserted, error } = await admin
      .from("leads")
      .insert({
        name: l.name,
        name_en: l.name_en,
        phone: l.phone,
        location: l.location ?? "",
        segment_id: l.segment_id,
        status: l.status,
        assigned_to: l.assigned_to,
        source: l.source ?? "excel",
        decision_maker_name: l.decision_maker_name,
        decision_maker_name_en: l.decision_maker_name_en,
        decision_maker_phone: l.decision_maker_phone,
        discount_official: l.discount_official,
        discount_given: l.discount_given,
        result: l.result,
        result_reason_key: l.result_reason_key,
      })
      .select("id")
      .single();
    if (error) throw error;
    console.log(`created lead: ${l.name}`);

    await admin.from("activity_log").insert({ lead_id: inserted.id, who_id: ids.u_mgr, key: "distributedTo", params: { toUserId: l.assigned_to } });

    if (l.status === "meeting") {
      const dt = l.assigned_to === ids.u_azza ? isoInDays(1, 11, 0) : isoAgoDays(1, 17, 0);
      await admin.from("meetings").insert({ lead_id: inserted.id, rep_id: l.assigned_to, type: "inperson", dt, done: false });
    }
    if (l.status === "won") {
      await admin.from("meetings").insert({ lead_id: inserted.id, rep_id: l.assigned_to, type: "inperson", dt: isoAgoDays(1, 14, 0), done: true });
      await admin.from("contracts").insert({ lead_id: inserted.id, months: 12, monthly: 13000, total: 156000, via: "meeting" });
    }
    if (l.status === "followup") {
      await admin.from("activity_log").insert({ lead_id: inserted.id, who_id: l.assigned_to, key: "followupScheduled", params: { dt: isoInDays(3, 10, 0) } });
    }
    if (l.source === "field") {
      await admin.from("visits").insert({ lead_id: inserted.id, rep_id: l.assigned_to, verified: true, note: "زيارة ميدانية", at: todayAt(11, 30).toISOString() });
    }
    if (l.name.includes("النخيل")) {
      await admin.from("calls").insert({ lead_id: inserted.id, rep_id: l.assigned_to, dur_sec: 222, answered: "answered", at: daysAgo(1, 10, 20).toISOString() });
    }
    if (l.name.includes("البخاري")) {
      await admin.from("calls").insert({ lead_id: inserted.id, rep_id: l.assigned_to, dur_sec: 310, answered: "answered", at: todayAt(9, 15).toISOString() });
    }
  }

  console.log("== history (last week's calls/visits/meetings for daily_stats) ==");
  await seedHistory(ids.u_faris, [
    { daysAgoIdx: 6, calls: 11, visits: 3, mtg: 1 },
    { daysAgoIdx: 5, calls: 10, visits: 4, mtg: 2 },
    { daysAgoIdx: 4, calls: 7, visits: 2, mtg: 0 },
    { daysAgoIdx: 3, calls: 12, visits: 3, mtg: 2 },
    { daysAgoIdx: 2, calls: 10, visits: 1, mtg: 1 },
    { daysAgoIdx: 1, calls: 6, visits: 3, mtg: 1 },
  ]);
  await seedHistory(ids.u_azza, [
    { daysAgoIdx: 6, calls: 6, visits: 1, mtg: 2 },
    { daysAgoIdx: 5, calls: 7, visits: 1, mtg: 3 },
    { daysAgoIdx: 4, calls: 6, visits: 2, mtg: 1 },
    { daysAgoIdx: 3, calls: 4, visits: 0, mtg: 2 },
    { daysAgoIdx: 2, calls: 6, visits: 1, mtg: 2 },
    { daysAgoIdx: 1, calls: 5, visits: 1, mtg: 1 },
  ]);

  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
