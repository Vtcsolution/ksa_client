"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { MiniRow, MiniStat } from "@/components/ui/MiniStat";
import Funnel from "@/components/ui/Funnel";
import TargetHistory from "@/components/TargetHistory";
import { useAppStore } from "@/store/useAppStore";
import { computeFunnel, computeStats, leadsForUser } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import { Check, Target } from "@/lib/icons";

function isSameDay(a: number, b: number) {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}
function isSameWeek(ms: number) {
  return Date.now() - ms <= 7 * 86400000;
}
function isSameMonth(ms: number) {
  const d = new Date(ms);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

export default function MyStatsPage() {
  const t = useTranslations("statsPage");
  const locale = useLocale();
  const leads = useAppStore((s) => s.leads);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const me = users.find((u) => u.id === currentUserId);

  if (!me) return null;

  const myLeads = leadsForUser(leads, me.id);
  const stats = computeStats(myLeads);
  const funnel = computeFunnel(stats);
  // eslint-disable-next-line react-hooks/purity -- wall-clock time is inherently impure; used only for "today/this week" grouping
  const now = Date.now();

  const callsToday = myLeads.reduce((sum, l) => sum + l.calls.filter((c) => isSameDay(c.at, now)).length, 0);
  const visitsToday = myLeads.filter((l) => l.visit && isSameDay(l.visit.at, now)).length;
  const meetingsWeek = myLeads.filter((l) => l.meeting && isSameWeek(new Date(l.meeting.dt).getTime())).length;
  const contractsMonth = myLeads.filter((l) => l.status === "won" && l.updatedAt && isSameMonth(l.updatedAt)).length;

  const target = me.target!;

  const progressRows = [
    { label: t("progressCallsToday"), val: callsToday, goal: target.dailyCalls },
    { label: t("progressVisitsToday"), val: visitsToday, goal: target.dailyVisits },
    { label: t("progressMeetingsWeek"), val: meetingsWeek, goal: target.weeklyMeetings },
    { label: t("progressContractsMonth"), val: contractsMonth, goal: target.monthlyContracts },
  ];

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />
      <MiniRow>
        <MiniStat value={stats.calls} label={t("miniCalls")} />
        <MiniStat value={stats.visits} label={t("miniVisits")} />
        <MiniStat value={stats.mtgInperson + stats.mtgOnline} label={t("miniMeetings")} />
        <MiniStat value={stats.won} label={t("miniWon")} />
      </MiniRow>

      <Panel>
        <PanelHeader icon={Target} title={t("funnelTitle")} />
        <Funnel stages={funnel} />
      </Panel>

      <Panel>
        <PanelHeader icon={Target} title={t("progressTitle")} />
        {progressRows.map((r) => {
          const met = r.goal > 0 && r.val >= r.goal;
          return (
            <div key={r.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--cream2)", marginBottom: 4 }}>
                <span>{r.label}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {formatNumber(r.val, locale)} / {formatNumber(r.goal, locale)} {met && <Check size={13} strokeWidth={2.5} style={{ color: "var(--ok)" }} />}
                </span>
              </div>
              <div className={`prog ${met ? "ok" : ""}`}>
                <div className="bar" style={{ width: `${r.goal ? Math.min(100, Math.round((r.val / r.goal) * 100)) : 0}%` }} />
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel>
        <TargetHistory history={me.history ?? []} target={target} />
      </Panel>
    </>
  );
}
