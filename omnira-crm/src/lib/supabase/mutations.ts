import type { SupabaseClient } from "@supabase/supabase-js";
import type { CallAnswered, MeetingType } from "@/lib/types";
import { isPhoneLike, normPhone } from "@/lib/phone";
import { resolveLeadName } from "@/lib/resolve";
import type { Database } from "./database.types";
import { fetchLeadById } from "./queries";

type Client = SupabaseClient<Database>;
type LogParams = Record<string, string | number | boolean> | undefined;

async function logActivity(supabase: Client, leadId: string, whoId: string | null, key: string, params?: LogParams) {
  const { error } = await supabase.from("activity_log").insert({ lead_id: leadId, who_id: whoId, key, params: params ?? null });
  if (error) throw error;
}

async function touchLead(supabase: Client, leadId: string, patch: Database["public"]["Tables"]["leads"]["Update"]) {
  const { error } = await supabase.from("leads").update(patch).eq("id", leadId);
  if (error) throw error;
}

// ===== staff / permissions / targets =====

export async function updatePerm(supabase: Client, userId: string, key: string, value: boolean) {
  const patch: Database["public"]["Tables"]["profiles"]["Update"] = {};
  switch (key) {
    case "transfer":
      patch.perm_transfer = value;
      break;
    case "receive":
      patch.perm_receive = value;
      break;
    case "addField":
      patch.perm_add_field = value;
      break;
    case "meetings":
      patch.perm_meetings = value;
      break;
    case "quote":
      patch.perm_quote = value;
      break;
    case "content":
      patch.perm_content = value;
      break;
  }
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function updateTarget(
  supabase: Client,
  userId: string,
  target: { dailyCalls: number; dailyVisits: number; weeklyMeetings: number; monthlyContracts: number },
) {
  const { error } = await supabase
    .from("targets")
    .upsert({
      user_id: userId,
      daily_calls: target.dailyCalls,
      daily_visits: target.dailyVisits,
      weekly_meetings: target.weeklyMeetings,
      monthly_contracts: target.monthlyContracts,
    });
  if (error) throw error;
}

// ===== segments =====

export async function addSegment(supabase: Client, name: string) {
  const id = name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40) + "-" + Date.now().toString(36).slice(-4);
  const { error } = await supabase.from("segments").insert({ id, name_key: null, custom_name: name.trim() });
  if (error) throw error;
  return id;
}

// ===== leads: bulk / lifecycle =====

export async function importLeads(
  supabase: Client,
  rows: { name: string; phone: string; location: string; segment: string }[],
  assignedTo: string,
  actorId: string,
): Promise<{ added: number; skipped: number }> {
  const { data: existing, error: existingErr } = await supabase.from("leads").select("phone");
  if (existingErr) throw existingErr;
  const existingPhones = new Set((existing ?? []).map((r) => normPhone(r.phone)));

  let added = 0;
  let skipped = 0;
  const toInsert: Database["public"]["Tables"]["leads"]["Insert"][] = [];
  for (const row of rows) {
    if (!row.name.trim() || !row.phone.trim() || !isPhoneLike(row.phone)) {
      skipped++;
      continue;
    }
    const phone = normPhone(row.phone);
    if (existingPhones.has(phone)) {
      skipped++;
      continue;
    }
    existingPhones.add(phone);
    added++;
    toInsert.push({
      name: row.name.trim(),
      phone,
      location: row.location,
      segment_id: row.segment,
      source: "excel",
      status: "new",
      assigned_to: assignedTo,
    });
  }
  if (added > 0) {
    const { data: inserted, error } = await supabase.from("leads").insert(toInsert).select("id");
    if (error) throw error;
    await Promise.all(
      (inserted ?? []).map((l) => logActivity(supabase, l.id, actorId, "distributedTo", { toUserId: assignedTo })),
    );
  }
  return { added, skipped };
}

export async function addFieldLead(
  supabase: Client,
  input: { name: string; phone: string; segment: string },
  actorId: string,
): Promise<{ ok: true } | { ok: false; error: "duplicate" | "invalid"; existingName?: string }> {
  if (!input.name.trim() || !input.phone.trim() || !isPhoneLike(input.phone)) return { ok: false, error: "invalid" };
  const phone = normPhone(input.phone);
  const { data: dup, error: dupErr } = await supabase.from("leads").select("id, name, name_en").eq("phone", phone).maybeSingle();
  if (dupErr) throw dupErr;
  if (dup) return { ok: false, error: "duplicate", existingName: resolveLeadName({ name: dup.name, nameEn: dup.name_en ?? undefined }, "ar") };

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: input.name.trim(),
      phone,
      segment_id: input.segment,
      source: "field",
      status: "contacted",
      assigned_to: actorId,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: visitErr } = await supabase.from("visits").insert({ lead_id: lead.id, rep_id: actorId, verified: true, note: "" });
  if (visitErr) throw visitErr;
  await logActivity(supabase, lead.id, actorId, "fieldClientAdded");
  return { ok: true };
}

export async function updateLeadCore(
  supabase: Client,
  leadId: string,
  patch: { name: string; phone: string; segment: string; location: string },
  actorId: string,
) {
  if (!isPhoneLike(patch.phone)) throw new Error("Invalid phone number");
  await touchLead(supabase, leadId, { name: patch.name, phone: normPhone(patch.phone), segment_id: patch.segment, location: patch.location });
  await logActivity(supabase, leadId, actorId, "managerEdited");
}

export async function deleteLead(supabase: Client, leadId: string) {
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) throw error;
}

export async function reopenLead(supabase: Client, leadId: string, actorId: string) {
  await touchLead(supabase, leadId, { status: "new", result: null, result_reason_key: null });
  await logActivity(supabase, leadId, actorId, "reopened");
}

// ===== rep actions =====

export async function recordCall(
  supabase: Client,
  leadId: string,
  actorId: string,
  input: {
    answered: CallAnswered;
    durSec: number;
    note: string;
    outcome?: "inperson" | "online" | "followup" | "reject";
    meetingDt?: string;
    followupDt?: string;
    rejectReasonKey?: string;
    cancelExistingMeeting?: boolean;
    retryDt?: string;
  },
) {
  const lead = await fetchLeadById(supabase, leadId);
  if (!lead) return;
  const hasActiveMeeting = !!(lead.meeting && !lead.meeting.done && !lead.meeting.missed);

  const { error: callErr } = await supabase
    .from("calls")
    .insert({ lead_id: leadId, rep_id: actorId, dur_sec: input.durSec, answered: input.answered, note: input.note || null });
  if (callErr) throw callErr;

  if (input.note) {
    const notes = lead.notes ? `${lead.notes}\n${input.note}` : input.note;
    await touchLead(supabase, leadId, { notes });
  }

  if (input.answered === "answered") {
    if (input.outcome === "inperson" || input.outcome === "online") {
      await touchLead(supabase, leadId, { status: "meeting" });
      const { error } = await supabase.from("meetings").insert({ lead_id: leadId, rep_id: actorId, type: input.outcome, dt: input.meetingDt! });
      if (error) throw error;
      await logActivity(supabase, leadId, actorId, "bookedMeeting", { typeKey: input.outcome, dt: input.meetingDt! });
      return;
    }
    if (input.outcome === "followup") {
      if (hasActiveMeeting && !input.cancelExistingMeeting) {
        await logActivity(supabase, leadId, actorId, "followupScheduled", { dt: input.followupDt! });
        return;
      }
      if (hasActiveMeeting) {
        const { error } = await supabase.from("meetings").update({ missed: true, missed_reason_key: "cancelled" }).eq("lead_id", leadId).eq("done", false).eq("missed", false);
        if (error) throw error;
      }
      await touchLead(supabase, leadId, { status: "followup" });
      await logActivity(supabase, leadId, actorId, hasActiveMeeting ? "followupMeetingCancelled" : "followupScheduled", { dt: input.followupDt! });
      return;
    }
    if (input.outcome === "reject") {
      await touchLead(supabase, leadId, { status: "archived", result: "archived", result_reason_key: input.rejectReasonKey! });
      await logActivity(supabase, leadId, actorId, "archived", { reasonKey: input.rejectReasonKey! });
      return;
    }
    return;
  }

  // no-answer / busy
  const n = lead.calls.length + 1;
  const resultKey = input.answered === "noanswer" ? "noAnswer" : "busy";
  if (!hasActiveMeeting) await touchLead(supabase, leadId, { status: "followup" });
  await logActivity(supabase, leadId, actorId, hasActiveMeeting ? "callAttemptMeetingKept" : "callAttempt", {
    resultKey,
    n,
    retryDt: input.retryDt!,
  });
}

export async function logVisit(
  supabase: Client,
  leadId: string,
  actorId: string,
  input: { name: string; phone: string; contact: string; segment: string; note: string; verified: boolean },
) {
  const lead = await fetchLeadById(supabase, leadId);
  if (!lead) return;
  const notes = input.note ? (lead.notes ? `${lead.notes}\n${input.note}` : input.note) : lead.notes;

  await touchLead(supabase, leadId, {
    name: input.name,
    phone: input.phone,
    segment_id: input.segment,
    notes,
    status: lead.status === "new" ? "contacted" : lead.status,
  });
  const { error } = await supabase
    .from("visits")
    .insert({ lead_id: leadId, rep_id: actorId, verified: input.verified, note: input.note, contact: input.contact });
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "visitLogged", { verified: input.verified, contact: input.contact ?? "", note: input.note ?? "" });
}

export async function bookMeeting(supabase: Client, leadId: string, actorId: string, type: MeetingType, dt: string) {
  await touchLead(supabase, leadId, { status: "meeting" });
  const { error } = await supabase.from("meetings").insert({ lead_id: leadId, rep_id: actorId, type, dt });
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "bookedMeeting", { typeKey: type, dt });
}

export async function transferLead(supabase: Client, leadId: string, fromUserId: string, toUserId: string, reasonKey: string) {
  await touchLead(supabase, leadId, { assigned_to: toUserId, transferred_from: fromUserId, transferred_at: new Date().toISOString() });
  await logActivity(supabase, leadId, fromUserId, "transferred", { toUserId, reasonKey });
}

export async function sendQuote(
  supabase: Client,
  leadId: string,
  actorId: string,
  input: { packageId: "silver" | "gold" | "platinum"; count: number; price: number },
  minPrice: number,
  packagePrice: number,
): Promise<{ ok: true } | { ok: false; error: "belowMin" }> {
  if (input.packageId !== "platinum" && input.price < minPrice) return { ok: false, error: "belowMin" };

  if (input.packageId === "platinum") {
    const { error } = await supabase
      .from("quotes")
      .insert({ lead_id: leadId, count: input.count, price: input.price, total: input.price * input.count, status: "pending" });
    if (error) throw error;
    await logActivity(supabase, leadId, actorId, "quotePendingApproval");
    return { ok: true };
  }

  if (input.price < packagePrice) {
    await touchLead(supabase, leadId, { discount_official: packagePrice, discount_given: input.price });
  }
  await logActivity(supabase, leadId, actorId, "quoteSent", { count: input.count, price: input.price, total: input.price * input.count });
  return { ok: true };
}

export async function approveQuote(supabase: Client, leadId: string, actorId: string) {
  const { error } = await supabase.from("quotes").update({ status: "approved" }).eq("lead_id", leadId).eq("status", "pending");
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "quoteApproved");
}

export async function rejectQuote(supabase: Client, leadId: string, actorId: string) {
  const { error } = await supabase.from("quotes").update({ status: "rejected" }).eq("lead_id", leadId).eq("status", "pending");
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "quoteRejected");
}

export async function fixLeadContact(
  supabase: Client,
  leadId: string,
  input: { newPhone: string; decisionMakerName: string; decisionMakerPhone: string },
  actorId: string,
): Promise<{ ok: true } | { ok: false; error: "duplicate"; existingName?: string }> {
  const lead = await fetchLeadById(supabase, leadId);
  if (!lead) return { ok: false, error: "duplicate" };

  const phoneChanged = !!input.newPhone && input.newPhone !== lead.phone;
  if (phoneChanged) {
    const { data: dup, error } = await supabase.from("leads").select("id, name, name_en").neq("id", leadId).eq("phone", normPhone(input.newPhone)).maybeSingle();
    if (error) throw error;
    if (dup) return { ok: false, error: "duplicate", existingName: resolveLeadName({ name: dup.name, nameEn: dup.name_en ?? undefined }, "ar") };
  }
  const dmChanged = input.decisionMakerName.trim().length > 0;
  if (!phoneChanged && !dmChanged) return { ok: true };

  const patch: Database["public"]["Tables"]["leads"]["Update"] = {};
  if (phoneChanged) {
    patch.phone = input.newPhone;
    patch.phone_edits = (lead.phoneEdits ?? 0) + 1;
    await logActivity(supabase, leadId, actorId, "phoneFixed", { old: lead.phone, new: input.newPhone });
  }
  if (dmChanged) {
    patch.decision_maker_name = input.decisionMakerName;
    patch.decision_maker_phone = input.decisionMakerPhone;
    await logActivity(supabase, leadId, actorId, "decisionMakerSet", { name: input.decisionMakerName, phone: input.decisionMakerPhone });
  }
  await touchLead(supabase, leadId, patch);
  return { ok: true };
}

/**
 * Snapshots the item's name at send-time (not just its id) — content_items
 * can be deleted/renamed later, and the lead's timeline should keep reading
 * correctly regardless.
 */
export async function sendContent(supabase: Client, leadId: string, actorId: string, contentId: string, nameAr: string, nameEn: string) {
  await logActivity(supabase, leadId, actorId, "contentSent", { contentId, nameAr, nameEn });
}

// No ambiguous chars (0/O, 1/I) — this gets read aloud/typed by hand.
const REFERRAL_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)];
  return `OMV-${code}`;
}

export async function setResultWon(
  supabase: Client,
  leadId: string,
  actorId: string,
  input: { reasonKey: string; months: number; monthly: number },
) {
  const lead = await fetchLeadById(supabase, leadId);
  if (!lead) return;
  const total = input.months * input.monthly;
  const via = lead.meeting && (lead.meeting.done || lead.status === "meeting") ? "meeting" : "direct";

  // Issue a referral code the first time a lead is won — a later reopen +
  // re-win keeps the original code rather than replacing it.
  if (!lead.referralCode) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error: codeErr } = await supabase.from("leads").update({ referral_code: generateReferralCode() }).eq("id", leadId);
      if (!codeErr) break;
      if (codeErr.code !== "23505") throw codeErr; // anything but a code collision is a real error
    }
  }

  await touchLead(supabase, leadId, { status: "won", result: "won", result_reason_key: input.reasonKey });
  const { error } = await supabase.from("contracts").insert({ lead_id: leadId, months: input.months, monthly: input.monthly, total, via });
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "won", { reasonKey: input.reasonKey });

  await createReferralRewardIfEligible(supabase, leadId, actorId, lead.referredByCode);
}

export async function setReferredByCode(supabase: Client, leadId: string, actorId: string, code: string) {
  const normalized = code.trim().toUpperCase() || null;
  await touchLead(supabase, leadId, { referred_by_code: normalized });
  await logActivity(supabase, leadId, actorId, "referredByCodeSet", normalized ? { code: normalized } : undefined);
}

export async function decideReferralReward(supabase: Client, rewardId: string, actorId: string, status: "approved" | "paid" | "rejected") {
  const { error } = await supabase.from("referral_rewards").update({ status, decided_by: actorId, decided_at: new Date().toISOString() }).eq("id", rewardId);
  if (error) throw error;
}

const REFERRAL_REWARD_POINTS = 500;

/**
 * Fires once, right after a lead is won — if that lead was tagged with a
 * referred_by_code (staff cross-referenced a Website-captured code against a
 * real CRM code), find the client who owns that code and create a pending
 * reward for them. Never blocks or throws into the win flow: a missing code,
 * an unmatched code, or self-referral just means no reward gets created —
 * the deal itself has already been saved by this point.
 */
async function createReferralRewardIfEligible(supabase: Client, referredLeadId: string, actorId: string, referredByCode: string | undefined) {
  if (!referredByCode) return;
  try {
    const { data: referrer, error: findErr } = await supabase
      .from("leads")
      .select("id")
      .eq("referral_code", referredByCode)
      .neq("id", referredLeadId)
      .maybeSingle();
    if (findErr || !referrer) return;

    const { data: existing } = await supabase
      .from("referral_rewards")
      .select("id")
      .eq("referrer_lead_id", referrer.id)
      .eq("referred_lead_id", referredLeadId)
      .maybeSingle();
    if (existing) return; // already recorded (e.g. reopen + re-win)

    const { error: insertErr } = await supabase.from("referral_rewards").insert({
      referrer_lead_id: referrer.id,
      referred_lead_id: referredLeadId,
      referral_code: referredByCode,
      points: REFERRAL_REWARD_POINTS,
    });
    if (insertErr) return;

    await logActivity(supabase, referredLeadId, actorId, "referralRewardCreated", { points: REFERRAL_REWARD_POINTS });
    await logActivity(supabase, referrer.id, actorId, "referralRewardEarned", { points: REFERRAL_REWARD_POINTS });
  } catch {
    // best-effort — the win itself already succeeded above
  }
}

export async function setResultArchived(supabase: Client, leadId: string, actorId: string, reasonKey: string) {
  await touchLead(supabase, leadId, { status: "archived", result: "archived", result_reason_key: reasonKey });
  await logActivity(supabase, leadId, actorId, "archived", { reasonKey });
}

export async function setFollowup(supabase: Client, leadId: string, actorId: string, dt: string, cancelMeeting: boolean) {
  const lead = await fetchLeadById(supabase, leadId);
  if (!lead) return;
  const hadMeeting = !!(lead.meeting && !lead.meeting.done && !lead.meeting.missed);

  if (cancelMeeting && hadMeeting) {
    const { error } = await supabase.from("meetings").update({ missed: true, missed_reason_key: "cancelled" }).eq("lead_id", leadId).eq("done", false).eq("missed", false);
    if (error) throw error;
  }
  if (cancelMeeting || !hadMeeting) {
    await touchLead(supabase, leadId, { status: "followup" });
  }
  await logActivity(supabase, leadId, actorId, cancelMeeting ? "followupMeetingCancelled" : "followupScheduled", { dt });
}

export async function markMeetingDone(supabase: Client, leadId: string, actorId: string, proof: boolean, notes?: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("meetings")
    .update({ done: true, proof, notes: notes?.trim() || null })
    .eq("lead_id", leadId)
    .eq("done", false)
    .eq("missed", false)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "meetingDone", { proof });
  return data?.id ?? null;
}

export async function markMeetingMissed(supabase: Client, leadId: string, actorId: string, reasonKey: string, rescheduleDt?: string) {
  const lead = await fetchLeadById(supabase, leadId);
  if (!lead || !lead.meeting) return;
  const oldDt = lead.meeting.dt;

  if (reasonKey === "postponed" && rescheduleDt) {
    const { error } = await supabase
      .from("meetings")
      .update({ dt: rescheduleDt, done: false, missed: false })
      .eq("lead_id", leadId)
      .eq("done", false)
      .eq("missed", false);
    if (error) throw error;
    await touchLead(supabase, leadId, { mtg_postponed: (lead.mtgPostponed ?? 0) + 1 });
    await logActivity(supabase, leadId, actorId, "meetingRescheduled", { old: oldDt, new: rescheduleDt });
    return;
  }
  const { error } = await supabase
    .from("meetings")
    .update({ missed: true, missed_reason_key: reasonKey })
    .eq("lead_id", leadId)
    .eq("done", false)
    .eq("missed", false);
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "meetingMissed", { reasonKey });
}

// ===== call insights / whatsapp follow-up =====

/**
 * Queues a WhatsApp follow-up for real — until the Business API is
 * approved, "queue" means: persist the exact message that would be sent,
 * mark the call as handled, and log it on the lead's timeline, instead of
 * a client-only toast that changed nothing. Swapping in the real send is a
 * drop-in change to this one function once the API key exists.
 */
export async function queueWhatsappFollowup(
  supabase: Client,
  callInsightId: string,
  leadId: string,
  actorId: string,
  messageAr: string,
  messageEn: string,
) {
  const { error } = await supabase.from("call_insights").update({ whatsapp_sent: true }).eq("id", callInsightId);
  if (error) throw error;
  await logActivity(supabase, leadId, actorId, "whatsappFollowupQueued", { messageAr, messageEn });
}
