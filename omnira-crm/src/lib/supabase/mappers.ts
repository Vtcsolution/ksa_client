// Maps Supabase rows (snake_case, split across tables) onto the app's
// existing Lead/User/Segment shapes (src/lib/types.ts) so every page,
// modal, and component keeps working against the exact same shapes as
// the old mock store — only useAppStore's internals changed.

import type { CallRecord, FollowupMessageRecord, Lead, LogEntry, MeetingRecord, PendingQuote, Segment, User, VisitRecord } from "@/lib/types";
import type { Database } from "./database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type CallRow = Database["public"]["Tables"]["calls"]["Row"];
type VisitRow = Database["public"]["Tables"]["visits"]["Row"];
type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];
type QuoteRow = Database["public"]["Tables"]["quotes"]["Row"];
type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activity_log"]["Row"];
type FollowupMessageRow = Database["public"]["Tables"]["followup_messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TargetRow = Database["public"]["Tables"]["targets"]["Row"];
type SegmentRow = Database["public"]["Tables"]["segments"]["Row"];
type DailyStatsRow = Database["public"]["Views"]["daily_stats"]["Row"];

export type LeadWithRelations = LeadRow & {
  calls: CallRow[] | null;
  visits: VisitRow[] | null;
  meetings: MeetingRow[] | null;
  quotes: QuoteRow[] | null;
  contracts: ContractRow[] | null;
  activity_log: ActivityRow[] | null;
  followup_messages: FollowupMessageRow[] | null;
};

function mapFollowupMessages(rows: FollowupMessageRow[] | null): FollowupMessageRecord[] {
  if (!rows) return [];
  return [...rows]
    .sort((a, b) => ms(b.created_at) - ms(a.created_at))
    .map((r) => ({
      id: r.id,
      tier: r.tier as FollowupMessageRecord["tier"],
      step: r.step,
      theme: r.theme,
      messageAr: r.message_ar,
      messageEn: r.message_en,
      status: r.status,
      at: ms(r.created_at),
    }));
}

const ms = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

// "YYYY-MM-DDTHH:mm" — the local-time string shape MeetingRecord.dt /
// Lead.followupDt already use everywhere in the frontend (datetime-local inputs).
function toLocalDtString(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapCall(row: CallRow): CallRecord {
  return { durSec: row.dur_sec, answered: row.answered, at: ms(row.at), note: row.note ?? undefined };
}

function pickCurrentVisit(rows: VisitRow[] | null): VisitRecord | null {
  if (!rows || rows.length === 0) return null;
  const latest = [...rows].sort((a, b) => ms(b.at) - ms(a.at))[0];
  return { verified: latest.verified, reviewed: latest.reviewed ?? undefined, note: latest.note ?? "", contact: latest.contact ?? undefined, at: ms(latest.at) };
}

function pickCurrentMeeting(rows: MeetingRow[] | null): MeetingRecord | null {
  if (!rows || rows.length === 0) return null;
  const active = rows.find((m) => !m.done && !m.missed);
  const row = active ?? [...rows].sort((a, b) => ms(b.dt) - ms(a.dt))[0];
  return {
    id: row.id,
    type: row.type,
    dt: toLocalDtString(row.dt),
    done: row.done,
    missed: row.missed || undefined,
    missedReasonKey: row.missed_reason_key ?? undefined,
    proof: row.proof || undefined,
    notes: row.notes ?? undefined,
    summaryAr: row.summary_ar ?? undefined,
    summaryEn: row.summary_en ?? undefined,
    nextStepsAr: row.next_steps_ar ?? undefined,
    nextStepsEn: row.next_steps_en ?? undefined,
    sentiment: (row.sentiment as "positive" | "neutral" | "negative" | null) ?? undefined,
  };
}

function pickPendingQuote(rows: QuoteRow[] | null): PendingQuote | undefined {
  if (!rows || rows.length === 0) return undefined;
  const latest = [...rows].sort((a, b) => ms(b.created_at) - ms(a.created_at))[0];
  return { count: latest.count, price: latest.price, total: latest.total, status: latest.status };
}

function mapLog(rows: ActivityRow[] | null): LogEntry[] {
  if (!rows) return [];
  return [...rows]
    .sort((a, b) => ms(b.at) - ms(a.at))
    .map((r) => ({ t: ms(r.at), whoId: r.who_id ?? "", key: r.key, params: (r.params as LogEntry["params"]) ?? undefined }));
}

export function mapLead(row: LeadWithRelations): Lead {
  const contract = row.contracts && row.contracts.length > 0 ? row.contracts[0] : null;
  const followupDt = row.status === "followup" ? followupDtFromLog(row.activity_log) : null;
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en ?? undefined,
    phone: row.phone,
    location: row.location,
    segment: row.segment_id ?? "",
    source: row.source,
    status: row.status,
    assignedTo: row.assigned_to ?? "",
    calls: (row.calls ?? []).map(mapCall).sort((a, b) => a.at - b.at),
    visit: pickCurrentVisit(row.visits),
    meeting: pickCurrentMeeting(row.meetings),
    followupDt,
    // escalated_at is only "current" if it happened at/after the active
    // followupDt — a later reschedule (newer dt, no fresh escalation yet)
    // must read as not-escalated again.
    followupEscalated: !!(followupDt && row.followup_escalated_at && ms(row.followup_escalated_at) >= ms(followupDt)),
    followupTier: row.followup_tier ?? undefined,
    followupMessages: mapFollowupMessages(row.followup_messages),
    result: (row.result as Lead["result"]) ?? null,
    resultReasonKey: row.result_reason_key,
    notes: row.notes,
    createdAt: ms(row.created_at),
    updatedAt: ms(row.updated_at),
    log: mapLog(row.activity_log),
    discount:
      row.discount_official != null && row.discount_given != null
        ? { official: row.discount_official, given: row.discount_given }
        : undefined,
    referralCode: row.referral_code ?? undefined,
    referredByCode: row.referred_by_code ?? undefined,
    decisionMaker: row.decision_maker_name
      ? { name: row.decision_maker_name, nameEn: row.decision_maker_name_en ?? undefined, phone: row.decision_maker_phone ?? undefined }
      : undefined,
    contract: contract ? { months: contract.months, monthly: contract.monthly, total: contract.total, via: contract.via } : undefined,
    pendingQuote: pickPendingQuote(row.quotes),
    phoneEdits: row.phone_edits || undefined,
    mtgPostponed: row.mtg_postponed || undefined,
    transferredFrom: row.transferred_from ?? undefined,
    transferredAt: row.transferred_at ? ms(row.transferred_at) : undefined,
  };
}

// followupDt isn't a stored column (it's implied by status='followup' + the most
// recent followupScheduled/followupToast-style log entry's `dt` param) — the
// activity log is the source of truth we already write on every followup action.
function followupDtFromLog(rows: ActivityRow[] | null): string | null {
  if (!rows) return null;
  const sorted = [...rows].sort((a, b) => ms(b.at) - ms(a.at));
  const entry = sorted.find((r) => typeof r.params === "object" && r.params !== null && "dt" in (r.params as object) && (r.key.includes("followup") || r.key === "callAttempt"));
  const dt = entry?.params && (entry.params as Record<string, unknown>).dt;
  return typeof dt === "string" ? dt : null;
}

export function mapUser(profile: ProfileRow, target: TargetRow | null, history: DailyStatsRow[]): User {
  const DAY_KEY_BY_JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  return {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    perms:
      profile.role === "manager"
        ? null
        : {
            transfer: profile.perm_transfer,
            receive: profile.perm_receive,
            addField: profile.perm_add_field,
            meetings: profile.perm_meetings,
            quote: profile.perm_quote,
            content: profile.perm_content,
          },
    target:
      profile.role === "manager" || !target
        ? null
        : {
            dailyCalls: target.daily_calls,
            dailyVisits: target.daily_visits,
            weeklyMeetings: target.weekly_meetings,
            monthlyContracts: target.monthly_contracts,
          },
    checkedIn: profile.checked_in,
    checkInTime: profile.check_in_time ? ms(profile.check_in_time) : null,
    history: history.map((h) => ({
      dayKey: DAY_KEY_BY_JS_DAY[new Date(h.day!).getDay()],
      calls: h.calls ?? 0,
      visits: h.visits ?? 0,
      mtg: h.meetings ?? 0,
    })),
  };
}

export function mapSegment(row: SegmentRow): Segment {
  return { id: row.id, nameKey: row.name_key, customName: row.custom_name ?? undefined };
}
