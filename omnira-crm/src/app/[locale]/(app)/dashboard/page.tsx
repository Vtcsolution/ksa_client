"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Select } from "@/components/ui/Form";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Funnel from "@/components/ui/Funnel";
import { Tbl } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import StaffCard from "@/components/StaffCard";
import MeetingsList from "@/components/MeetingsList";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { computeFunnel, computeStats, computeTodayActivity } from "@/lib/selectors";
import { DAY_KEYS } from "@/lib/constants";
import { formatDT, formatNumber } from "@/lib/format";
import { resolveLeadName, resolveUserName } from "@/lib/resolve";
import {
  AlertCircle,
  Car,
  Check,
  CheckCircle2,
  ClipboardList,
  Handshake,
  Lock,
  Phone,
  RefreshCw,
  ThumbsUp,
  Target,
  TrendingUp,
  Users,
  Video,
  Wallet,
  X,
} from "@/lib/icons";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tFollowup = useTranslations("followupCadence");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tWeekdays = useTranslations("weekdays");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();

  const leads = useAppStore((s) => s.leads);
  const callInsights = useAppStore((s) => s.callInsights);
  const users = useAppStore((s) => s.users);
  const approveQuote = useAppStore((s) => s.approveQuote);
  const rejectQuote = useAppStore((s) => s.rejectQuote);
  const openModal = useUiStore((s) => s.openModal);

  const reps = users.filter((u) => u.role === "rep");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [range, setRange] = useState<"day" | "week" | "month">("week");

  // eslint-disable-next-line react-hooks/purity -- wall-clock time is inherently impure; used only for relative "recent activity" filtering
  const nowMs = Date.now();

  const scoped = useMemo(() => {
    const byStaff = staffFilter === "all" ? leads : leads.filter((l) => l.assignedTo === staffFilter);
    const cutoff = range === "day" ? 86400000 : range === "week" ? 7 * 86400000 : 30 * 86400000;
    return byStaff.filter((l) => nowMs - l.createdAt <= cutoff || l.updatedAt >= nowMs - cutoff);
  }, [leads, staffFilter, range, nowMs]);

  const scopedCalls = useMemo(() => {
    const cutoff = range === "day" ? 86400000 : range === "week" ? 7 * 86400000 : 30 * 86400000;
    return callInsights.filter(
      (c) => (staffFilter === "all" || c.repId === staffFilter) && nowMs - c.at <= cutoff,
    );
  }, [callInsights, staffFilter, range, nowMs]);

  const stats = computeStats(scoped, scopedCalls);
  const funnel = computeFunnel(stats);

  const scopedReps = staffFilter === "all" ? reps : reps.filter((r) => r.id === staffFilter);

  // Ranked regardless of staffFilter — comparing one rep against nobody
  // defeats the point of a leaderboard. Same time-range cutoff as `scoped`.
  const leaderboard = useMemo(() => {
    const cutoff = range === "day" ? 86400000 : range === "week" ? 7 * 86400000 : 30 * 86400000;
    const rows = reps.map((r) => {
      const repLeads = leads.filter((l) => l.assignedTo === r.id && (nowMs - l.createdAt <= cutoff || l.updatedAt >= nowMs - cutoff));
      const repCalls = callInsights.filter((c) => c.repId === r.id && nowMs - c.at <= cutoff);
      const s = computeStats(repLeads, repCalls);
      return { rep: r, stats: s };
    });
    const activeRows = rows.filter((r) => r.stats.calls + r.stats.visits > 0);
    const avgConversion = activeRows.length ? activeRows.reduce((sum, r) => sum + r.stats.conversion, 0) / activeRows.length : 0;
    return rows
      .map((r) => ({
        ...r,
        // Flag only reps with enough activity to judge fairly, meaningfully
        // below the team average — not every rep with zero deals this period.
        needsSupport: r.stats.calls >= 5 && r.stats.conversion < avgConversion - 15,
      }))
      .sort((a, b) => b.stats.won - a.stats.won || b.stats.conversion - a.stats.conversion);
  }, [reps, leads, callInsights, range, nowMs]);
  const weekBars = DAY_KEYS.map((dayKey) => {
    let value = 0;
    for (const r of scopedReps) {
      const d = r.history?.find((h) => h.dayKey === dayKey);
      if (d) value += d.calls + d.visits + d.mtg;
    }
    return { dayKey, value };
  });
  const todayValue = computeTodayActivity(scoped, scopedCalls);
  const allBars = [...weekBars, { dayKey: "today", value: todayValue }];
  const maxBar = Math.max(...allBars.map((b) => b.value), 1);

  const donutPct = stats.conversion;

  const pendingQuotes = scoped.filter((l) => l.pendingQuote?.status === "pending");

  const now = nowMs;
  const overdueMeetings = leads.filter(
    (l) => l.meeting && !l.meeting.done && !l.meeting.missed && new Date(l.meeting.dt).getTime() < now,
  );
  const missedMeetings = leads.filter((l) => l.meeting?.missed);
  const doneMeetings = leads.filter((l) => l.meeting?.done);
  const overdueFollowups = leads.filter(
    (l) => l.followupDt && l.status !== "won" && l.status !== "archived" && new Date(l.followupDt).getTime() < now,
  );
  const wonViaMeeting = leads.filter((l) => l.status === "won" && l.contract?.via === "meeting").length;
  const wonDirect = leads.filter((l) => l.status === "won" && l.contract?.via === "direct").length;

  // Leads that would otherwise silently go untouched: inbound (website/Ziwo)
  // leads nobody has claimed yet, and leads whose whole cold/warm/hot
  // sequence ran out with no response — both need a human decision, not
  // more automation.
  const unassignedLeads = leads.filter((l) => !l.assignedTo && l.status !== "won" && l.status !== "archived");
  const dormantLeads = leads.filter((l) => l.followupDormant);

  const phoneEditRows = reps
    .map((r) => {
      const rLeads = leads.filter((l) => l.assignedTo === r.id);
      const phoneEdits = rLeads.reduce((sum, l) => sum + (l.phoneEdits ?? 0), 0);
      const discounts = rLeads.filter((l) => l.discount).length;
      return { rep: r, phoneEdits, discounts };
    })
    .filter((r) => r.phoneEdits > 0 || r.discounts > 0);

  const allDiscounts = leads.filter((l) => l.discount);
  const avgDiscountPct = allDiscounts.length
    ? Math.round(
        (allDiscounts.reduce((sum, l) => sum + (1 - l.discount!.given / l.discount!.official), 0) /
          allDiscounts.length) *
          100,
      )
    : 0;

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <>
            <SegmentedControl
              value={range}
              onChange={setRange}
              options={[
                { value: "day", label: tCommon("day") },
                { value: "week", label: tCommon("week") },
                { value: "month", label: tCommon("month") },
              ]}
            />
            <Select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
              <option value="all">{tCommon("allStaff")}</option>
              {reps.map((r) => (
                <option key={r.id} value={r.id}>
                  {resolveUserName(r, tUsers)}
                </option>
              ))}
            </Select>
          </>
        }
      />

      <KpiRow>
        <KpiCard index={0} icon={Phone} label={t("kpiCalls")} value={stats.calls} sub={t("kpiCallsSub")} color="blue" />
        <KpiCard index={1} icon={Car} label={t("kpiVisits")} value={stats.visits} sub={t("kpiVisitsSub")} color="gold" />
        <KpiCard index={2} icon={Handshake} label={t("kpiInperson")} value={stats.mtgInperson} color="purple" />
        <KpiCard index={3} icon={Video} label={t("kpiOnline")} value={stats.mtgOnline} color="teal" />
        <KpiCard index={4} icon={CheckCircle2} label={t("kpiWon")} value={stats.won} color="green" />
        <KpiCard index={5} icon={TrendingUp} label={t("kpiConversion")} value={stats.conversion} suffix="%" color="warn" />
        <KpiCard
          index={6}
          icon={Wallet}
          label={t("kpiRevenue")}
          value={stats.monthlyRev}
          highlight
          color="gold"
          sub={t("kpiRevenueSub", { total: formatNumber(stats.totalRev, locale) })}
        />
      </KpiRow>

      <div className="dash-charts">
        <Panel className="chart-panel">
          <PanelHeader title={t("activityChartTitle")} />
          <div className="bar-chart">
            {allBars.map((b, i) => (
              <div key={b.dayKey} className="bar-chart-col">
                <div className="bar-chart-track">
                  <motion.div
                    className="bar-chart-fill"
                    data-today={b.dayKey === "today" || undefined}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (b.value / maxBar) * 100)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
                  />
                </div>
                <span className="bar-chart-label">
                  {b.dayKey === "today" ? t("activityChartToday") : tWeekdays(b.dayKey)}
                </span>
              </div>
            ))}
          </div>
          <p className="chart-caption">{t("activityChartCaption")}</p>
        </Panel>
        <Panel className="chart-panel">
          <PanelHeader title={t("conversionChartTitle")} />
          <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(var(--gold) 0% ${donutPct}%, var(--bg2) ${donutPct}% 100%)` }}>
              <div className="donut-hole">
                <div className="donut-value">{formatNumber(donutPct, locale)}%</div>
                <div className="donut-caption">{t("kpiWon")}</div>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend-row">
                <span className="donut-dot" style={{ background: "var(--gold)" }} />
                {t("kpiWon")}
                <b>{formatNumber(stats.won, locale)}</b>
              </div>
              <div className="donut-legend-row">
                <span className="donut-dot" style={{ background: "var(--bg2)", border: "1px solid var(--line2)" }} />
                {t("kpiCalls")}
                <b>{formatNumber(stats.calls, locale)}</b>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader icon={Target} title={t("funnelTitle")} />
        <Funnel stages={funnel} />
        <p className="chart-caption">{t("funnelCaption")}</p>
      </Panel>

      <MeetingsList mine={false} />

      {pendingQuotes.length > 0 && (
        <Panel style={{ borderColor: "var(--warn)" }}>
          <PanelHeader icon={Lock} title={t("pendingQuotesTitle")} />
          {pendingQuotes.map((l) => (
            <div key={l.id} className="lead-card">
              <div className="lc-top" style={{ marginBottom: 6 }}>
                <div className="lc-name">{resolveLeadName(l, locale)}</div>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{resolveUserName(users.find((u) => u.id === l.assignedTo), tUsers)}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--cream2)", marginBottom: 8 }}>
                {formatNumber(l.pendingQuote!.count, locale)} × {formatNumber(l.pendingQuote!.price, locale)} = {formatNumber(l.pendingQuote!.total, locale)} {tCommon("sar")}/{tCommon("month")}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="green" sm onClick={() => approveQuote(l.id)}>
                  <Check size={13} />
                  {t("approveAndSend")}
                </Button>
                <Button variant="danger" sm onClick={() => rejectQuote(l.id)}>
                  <X size={13} />
                  {t("reject")}
                </Button>
              </div>
            </div>
          ))}
        </Panel>
      )}

      {(unassignedLeads.length > 0 || dormantLeads.length > 0) && (
        <Panel style={{ borderColor: "var(--muted)" }}>
          <PanelHeader icon={Users} title={t("needsDecisionTitle")} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <Chip cls="new">{t("needsDecisionUnassigned")}: {formatNumber(unassignedLeads.length, locale)}</Chip>
            <Chip cls="archived">{t("needsDecisionDormant")}: {formatNumber(dormantLeads.length, locale)}</Chip>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {unassignedLeads.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lead-card"
                style={{ textAlign: "start", margin: 0 }}
                onClick={() => openModal({ type: "leadDetail", leadId: l.id })}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b className="lc-name">{resolveLeadName(l, locale)}</b>
                  <Chip cls="new">{t("needsDecisionUnassignedChip")}</Chip>
                </div>
              </button>
            ))}
            {dormantLeads.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lead-card"
                style={{ textAlign: "start", margin: 0 }}
                onClick={() => openModal({ type: "leadDetail", leadId: l.id })}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b className="lc-name">{resolveLeadName(l, locale)}</b>
                  {l.followupTier && <Chip cls={`tier-${l.followupTier}`}>{tFollowup(`tier.${l.followupTier}`)}</Chip>}
                  <Chip cls="archived">{t("needsDecisionDormantChip")}</Chip>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeader icon={AlertCircle} title={t("complianceTitle")} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <Chip cls="verified"><Check size={11} strokeWidth={2} />{t("complianceDone")}: {formatNumber(doneMeetings.length, locale)}</Chip>
          <Chip cls="archived"><X size={11} strokeWidth={2} />{t("complianceNotDone")}: {formatNumber(missedMeetings.length, locale)}</Chip>
          <Chip cls="late"><AlertCircle size={11} strokeWidth={2} />{t("complianceOverdueNoUpdate")}: {formatNumber(overdueMeetings.length, locale)}</Chip>
          <Chip cls="followup"><RefreshCw size={11} strokeWidth={2} />{t("complianceOverdueFollowups")}: {formatNumber(overdueFollowups.length, locale)}</Chip>
          <Chip cls="won"><Handshake size={11} strokeWidth={2} />{t("complianceWonViaMeeting")}: {formatNumber(wonViaMeeting, locale)}</Chip>
          <Chip cls="new"><Phone size={11} strokeWidth={2} />{t("complianceWonDirect")}: {formatNumber(wonDirect, locale)}</Chip>
        </div>
        {overdueMeetings.length === 0 && overdueFollowups.length === 0 && missedMeetings.length === 0 ? (
          <EmptyState icon={ThumbsUp} title={t("complianceEmpty")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overdueMeetings.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lead-card"
                style={{ textAlign: "start", margin: 0, borderColor: "var(--danger)" }}
                onClick={() => openModal({ type: "leadDetail", leadId: l.id })}
              >
                <b className="lc-name">{resolveLeadName(l, locale)}</b>
                <div style={{ fontSize: 11, color: "var(--danger-l)" }}>
                  {t("overdueMeetingLine", {
                    dt: formatDT(l.meeting!.dt, locale, tDate),
                    rep: resolveUserName(users.find((u) => u.id === l.assignedTo), tUsers),
                  })}
                </div>
              </button>
            ))}
            {overdueFollowups.map((l) => (
              <button
                key={l.id}
                type="button"
                className="lead-card"
                style={{ textAlign: "start", margin: 0, borderColor: "var(--teal)" }}
                onClick={() => openModal({ type: "leadDetail", leadId: l.id })}
              >
                <b className="lc-name">{resolveLeadName(l, locale)}</b>
                <div style={{ fontSize: 11, color: "var(--teal)" }}>{t("overdueFollowupLine")}</div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader icon={ClipboardList} title={t("auditTitle")} />
        <div className="mini-row">
          <div className="mini">
            <div className="mv">{formatNumber(leads.filter((l) => l.phoneEdits).length, locale)}</div>
            <div className="ml">{t("auditPhoneEdits")}</div>
          </div>
          <div className="mini">
            <div className="mv">{formatNumber(allDiscounts.length, locale)}</div>
            <div className="ml">{t("auditDiscounts")}</div>
          </div>
          <div className="mini">
            <div className="mv" style={{ color: avgDiscountPct > 20 ? "var(--danger-l)" : undefined }}>
              {formatNumber(avgDiscountPct, locale)}%
            </div>
            <div className="ml">{t("auditAvgDiscount")}</div>
          </div>
        </div>
        {phoneEditRows.length > 0 && (
          <Tbl>
            <thead>
              <tr>
                <th>{t("auditRepCol")}</th>
                <th>{t("auditPhoneCol")}</th>
                <th>{t("auditDiscountCol")}</th>
              </tr>
            </thead>
            <tbody>
              {phoneEditRows.map((r) => (
                <tr key={r.rep.id}>
                  <td className="name-cell">{resolveUserName(r.rep, tUsers)}</td>
                  <td>{formatNumber(r.phoneEdits, locale)}</td>
                  <td style={r.discounts > 2 ? { color: "var(--warn)" } : undefined}>{formatNumber(r.discounts, locale)}</td>
                </tr>
              ))}
            </tbody>
          </Tbl>
        )}
        <p className="chart-caption">{t("auditHint")}</p>
      </Panel>

      <Panel>
        <PanelHeader icon={TrendingUp} title={t("leaderboardTitle")} />
        {leaderboard.length === 0 ? (
          <EmptyState icon={Users} title={t("leaderboardEmpty")} />
        ) : (
          <Tbl>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("leaderboardRep")}</th>
                <th>{t("kpiCalls")}</th>
                <th>{t("kpiVisits")}</th>
                <th>{t("leaderboardMeetings")}</th>
                <th>{t("kpiWon")}</th>
                <th>{t("kpiConversion")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={row.rep.id}>
                  <td>{i + 1}</td>
                  <td className="name-cell">{resolveUserName(row.rep, tUsers)}</td>
                  <td>{formatNumber(row.stats.calls, locale)}</td>
                  <td>{formatNumber(row.stats.visits, locale)}</td>
                  <td>{formatNumber(row.stats.mtgInperson + row.stats.mtgOnline, locale)}</td>
                  <td>{formatNumber(row.stats.won, locale)}</td>
                  <td>{formatNumber(row.stats.conversion, locale)}%</td>
                  <td>
                    {row.needsSupport && (
                      <Chip cls="late">
                        <AlertCircle size={11} strokeWidth={2} />
                        {t("leaderboardNeedsSupport")}
                      </Chip>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tbl>
        )}
        <p className="chart-caption">{t("leaderboardCaption")}</p>
      </Panel>

      <Panel>
        <PanelHeader icon={Users} title={t("staffPerfTitle")} />
        <div className="staff-grid">
          {reps.map((r) => (
            <StaffCard key={r.id} user={r} />
          ))}
        </div>
      </Panel>
    </>
  );
}
