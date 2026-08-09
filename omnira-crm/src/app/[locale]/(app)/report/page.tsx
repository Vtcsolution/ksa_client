"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { computeFunnel, computeStats, dayAchievement, historyHits, leadsForUser } from "@/lib/selectors";
import { resolveUserName } from "@/lib/resolve";
import { formatClock, formatNumber } from "@/lib/format";
import { FileText, Printer, Sparkles, Loader2 } from "@/lib/icons";

interface AiSummary {
  narrativeAr: string;
  narrativeEn: string;
  recommendationsAr: string[];
  recommendationsEn: string[];
}

export default function ReportPage() {
  const t = useTranslations("reportPage");
  const tUsers = useTranslations("users");
  const tWeekdays = useTranslations("weekdays");
  const tStaff = useTranslations("staffPage");
  const tFunnel = useTranslations("funnel");
  const tTargets = useTranslations("targetsPage");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();

  const users = useAppStore((s) => s.users);
  const leads = useAppStore((s) => s.leads);
  const callInsights = useAppStore((s) => s.callInsights);
  const reps = users.filter((u) => u.role === "rep");
  const [repId, setRepId] = useState(reps[0]?.id ?? "");
  const rep = reps.find((r) => r.id === repId);

  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const repLeads = rep ? leadsForUser(leads, rep.id) : [];
  // eslint-disable-next-line react-hooks/purity -- wall-clock time is inherently impure; used only for a rolling 7-day window
  const weekCutoffMs = Date.now() - 7 * 86400000;
  const repCalls = rep ? callInsights.filter((c) => c.repId === rep.id && c.at >= weekCutoffMs) : [];
  const stats = computeStats(repLeads, repCalls);
  const funnel = computeFunnel(stats);
  const history = rep?.history ?? [];
  const target = rep?.target;
  const hits = target ? historyHits(history, target) : 0;

  const won = repLeads.filter((l) => l.status === "won");
  const totalContract = won.reduce((s, l) => s + (l.contract?.total ?? 0), 0);
  const conv = stats.conversion;
  const good = hits >= 4;

  const generateAiSummary = async () => {
    if (!rep) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const res = await fetch("/api/report/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repName: resolveUserName(rep, tUsers),
          calls: stats.calls,
          answered: stats.answered,
          visits: stats.visits,
          mtgInperson: stats.mtgInperson,
          mtgOnline: stats.mtgOnline,
          won: stats.won,
          conversion: conv,
          targetHits: hits,
          targetDays: history.length,
          totalContract,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setAiSummary({
        narrativeAr: data.narrative_ar,
        narrativeEn: data.narrative_en,
        recommendationsAr: data.recommendations_ar,
        recommendationsEn: data.recommendations_en,
      });
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  const today = new Date();
  const weekStart = new Date(today.getTime() - 6 * 86400000);

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <div className="no-print" style={{ display: "flex", gap: 10 }}>
            <select
              value={repId}
              onChange={(e) => {
                setRepId(e.target.value);
                setAiSummary(null);
                setAiError(false);
              }}
            >
              {reps.map((r) => (
                <option key={r.id} value={r.id}>{resolveUserName(r, tUsers)}</option>
              ))}
            </select>
            <Button variant="gold" onClick={() => window.print()}>
              <Printer size={13} />
              {t("printBtn")}
            </Button>
          </div>
        }
      />

      {!rep ? (
        <EmptyState icon={FileText} title={t("emptyTitle")} />
      ) : (
        <div className="paper">
          <div className="p-brand">
            <div className="pb-l">
              <div>{t("issueDate", { date: today.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") })}</div>
              <div>
                {t("weekRange", {
                  from: weekStart.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US"),
                  to: today.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US"),
                })}
              </div>
              <div>{t("issuedBy")}</div>
            </div>
            <div className="pb-r">
              <div className="pb-logo">OMNIRA VALET</div>
              <h2>{t("docTitle")}</h2>
            </div>
          </div>

          <div className="p-emp">
            <div>{t("employeeLabel")} <b>{resolveUserName(rep, tUsers)}</b></div>
            <div>{t("roleLabel")} <b>{rep.id === "u_azza" ? tStaff("roleMeetings") : tStaff("roleSales")}</b></div>
            <div>
              {t("attendanceLabel")}{" "}
              <b>
                {rep.checkedIn && rep.checkInTime
                  ? `${t("attendanceOn")} ${formatClock(new Date(rep.checkInTime), locale, tDate)}`
                  : t("attendanceOff")}
              </b>
            </div>
          </div>

          <h3 className="p-sec">{t("secSummary")}</h3>
          <div className="p-kpis">
            <div className="p-kpi"><div className="v">{formatNumber(stats.calls, locale)}</div><div className="l">{t("kpiCalls")}</div></div>
            <div className="p-kpi"><div className="v">{formatNumber(stats.answered, locale)}</div><div className="l">{t("kpiAnswered")}</div></div>
            <div className="p-kpi"><div className="v">{formatNumber(stats.visits, locale)}</div><div className="l">{t("kpiVisits")}</div></div>
            <div className="p-kpi"><div className="v">{formatNumber(stats.mtgInperson, locale)}</div><div className="l">{t("kpiInperson")}</div></div>
            <div className="p-kpi"><div className="v">{formatNumber(stats.mtgOnline, locale)}</div><div className="l">{t("kpiOnline")}</div></div>
            <div className="p-kpi win"><div className="v">{formatNumber(stats.won, locale)}</div><div className="l">{t("kpiWon")}</div></div>
          </div>

          <h3 className="p-sec">{t("secCompliance")}</h3>
          <table className="p-tbl">
            <thead>
              <tr>
                <th>{tTargets("colDay")}</th>
                <th>{tTargets("colCalls")}</th>
                <th>{tTargets("colVisits")}</th>
                <th>{tTargets("colMeetings")}</th>
                <th>{tTargets("colResult")}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((d) => {
                const a = target ? dayAchievement(d, target) : "none";
                return (
                  <tr key={d.dayKey}>
                    <td>{tWeekdays(d.dayKey)}</td>
                    <td>{formatNumber(d.calls, locale)}</td>
                    <td>{formatNumber(d.visits, locale)}</td>
                    <td>{formatNumber(d.mtg, locale)}</td>
                    <td className={a === "full" ? "p-ok" : a === "part" ? "p-part" : "p-bad"}>
                      {a === "full" ? tTargets("achieved") : a === "part" ? tTargets("partial") : tTargets("notAchieved")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3 className="p-sec">{t("secFunnel")}</h3>
          {funnel.map((f) => {
            const max = Math.max(...funnel.map((x) => x.value), 1);
            const width = Math.max(6, Math.round((f.value / max) * 100));
            return (
              <div key={f.key} className={`p-frow ${f.key === "contracts" ? "w" : ""}`}>
                <div className="fl">{tFunnel(f.key)}</div>
                <div className="fb-track">
                  <div className="fb" style={{ width: `${width}%` }}>{formatNumber(f.value, locale)}</div>
                </div>
                <div className="fp">{f.pctOfPrev !== null ? `${formatNumber(f.pctOfPrev, locale)}%` : ""}</div>
              </div>
            );
          })}

          <div className="p-summary">
            {t("summaryText", {
              hits: formatNumber(hits, locale),
              total: formatNumber(history.length, locale),
              conv: formatNumber(conv, locale),
              contractLine: totalContract > 0 ? t("summaryContractLine", { total: formatNumber(totalContract, locale) }) : "",
              closing: good ? t("summaryGood") : t("summaryNeedsFollowup"),
            })}
          </div>

          <div className="no-print" style={{ margin: "10px 0" }}>
            <Button variant="gold" sm onClick={generateAiSummary} disabled={aiLoading}>
              {aiLoading ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
              {aiSummary ? t("regenerateAiBtn") : t("generateAiBtn")}
            </Button>
            {aiError && <div style={{ color: "var(--danger-l)", fontSize: 12, marginTop: 6 }}>{t("aiErrorMsg")}</div>}
          </div>

          {aiSummary && (
            <div className="p-summary" style={{ borderColor: "var(--gold-d)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--gold-l)", marginBottom: 6, fontSize: 12 }}>
                <Sparkles size={13} strokeWidth={1.9} />
                {t("aiSummaryTitle")}
              </div>
              <p>{locale === "ar" ? aiSummary.narrativeAr : aiSummary.narrativeEn}</p>
              <ul style={{ marginTop: 8, paddingInlineStart: 18 }}>
                {(locale === "ar" ? aiSummary.recommendationsAr : aiSummary.recommendationsEn).map((rec, i) => (
                  <li key={i} style={{ fontSize: 13, lineHeight: 1.7 }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-notes">
            <h3 className="p-sec">{t("notesTitle")}</h3>
            <div className="nlines" />
            <div className="nlines" />
            <div className="nlines" />
          </div>

          <div className="p-sign">
            <div className="sg">
              <div className="line" />
              {t("signManager")}
            </div>
            <div className="sg">
              <div className="line" />
              {t("signEmployee")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
