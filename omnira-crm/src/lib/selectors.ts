import type { HistoryDay, Lead, Target } from "./types";
import type { CallInsightView } from "./supabase/callInsights";

export interface Stats {
  calls: number;
  answered: number;
  visits: number;
  mtgInperson: number;
  mtgOnline: number;
  won: number;
  archived: number;
  followup: number;
  meeting: number;
  conversion: number;
  monthlyRev: number;
  totalRev: number;
}

/**
 * `callInsights` should already be scoped by the caller (same staff/date
 * filter applied to `leads`) — real Ziwo call volume, replacing the old
 * seeded lead.calls[] counts so this matches what Call Intelligence shows.
 */
export function computeStats(leads: Lead[], callInsights: CallInsightView[] = []): Stats {
  let visits = 0;
  let mtgInperson = 0;
  let mtgOnline = 0;
  let won = 0;
  let archived = 0;
  let followup = 0;
  let meeting = 0;
  let monthlyRev = 0;
  let totalRev = 0;

  const calls = callInsights.length;
  const answered = callInsights.filter((c) => c.answered).length;

  for (const l of leads) {
    if (l.visit) visits++;
    if (l.meeting?.type === "inperson") mtgInperson++;
    if (l.meeting?.type === "online") mtgOnline++;
    if (l.status === "won") won++;
    if (l.status === "archived") archived++;
    if (l.status === "followup") followup++;
    if (l.status === "meeting") meeting++;
    if (l.status === "won" && l.contract) {
      monthlyRev += l.contract.monthly;
      totalRev += l.contract.total;
    }
  }

  return {
    calls,
    answered,
    visits,
    mtgInperson,
    mtgOnline,
    won,
    archived,
    followup,
    meeting,
    conversion: leads.length ? Math.round((won / leads.length) * 100) : 0,
    monthlyRev,
    totalRev,
  };
}

export interface FunnelStage {
  key: "calls" | "answered" | "meetings" | "contracts";
  value: number;
  pctOfPrev: number | null;
}

export function computeFunnel(stats: Stats): FunnelStage[] {
  const meetings = stats.mtgInperson + stats.mtgOnline;
  const contracts = stats.won;
  const pct = (v: number, prev: number) => (prev > 0 ? Math.round((v / prev) * 100) : 0);
  return [
    { key: "calls", value: stats.calls, pctOfPrev: null },
    { key: "answered", value: stats.answered, pctOfPrev: pct(stats.answered, stats.calls) },
    { key: "meetings", value: meetings, pctOfPrev: pct(meetings, stats.answered) },
    { key: "contracts", value: contracts, pctOfPrev: pct(contracts, meetings) },
  ];
}

export type DayAchievement = "full" | "part" | "none";

export function dayAchievement(day: HistoryDay, target: Target): DayAchievement {
  const okCalls = day.calls >= target.dailyCalls;
  const okVisits = day.visits >= target.dailyVisits;
  if (okCalls && okVisits) return "full";
  if (okCalls || okVisits) return "part";
  return "none";
}

export function historyHits(history: HistoryDay[], target: Target): number {
  return history.filter((d) => dayAchievement(d, target) === "full").length;
}

export function leadsForUser(leads: Lead[], userId: string): Lead[] {
  return leads.filter((l) => l.assignedTo === userId);
}

function isToday(ms: number): boolean {
  const d = new Date(ms);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function computeTodayActivity(leads: Lead[], callInsights: CallInsightView[] = []): number {
  let total = callInsights.filter((c) => isToday(c.at)).length;
  for (const l of leads) {
    if (l.visit && isToday(l.visit.at)) total += 1;
    total += l.log.filter((e) => e.key === "bookedMeeting" && isToday(e.t)).length;
  }
  return total;
}
