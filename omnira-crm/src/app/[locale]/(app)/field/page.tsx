"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Select } from "@/components/ui/Form";
import { Tbl } from "@/components/ui/Table";
import { Chip, StatusChip } from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveLeadName, resolveUserNameById } from "@/lib/resolve";
import { formatDT, formatNumber } from "@/lib/format";
import { AlertTriangle, Car, CheckCircle2, Info, Lightbulb, Scale, SourceIcon, Trophy } from "@/lib/icons";

export default function FieldPage() {
  const t = useTranslations("fieldPage");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();

  const leads = useAppStore((s) => s.leads);
  const users = useAppStore((s) => s.users);
  const openModal = useUiStore((s) => s.openModal);
  const reps = users.filter((u) => u.role === "rep");
  const [repFilter, setRepFilter] = useState("all");

  const scoped = useMemo(
    () => (repFilter === "all" ? leads : leads.filter((l) => l.assignedTo === repFilter)),
    [leads, repFilter],
  );

  const fieldLeads = scoped.filter((l) => l.source === "field");
  const verifiedVisits = scoped.filter((l) => l.visit?.verified).length;
  const reviewVisits = scoped.filter((l) => l.visit && !l.visit.verified).length;
  const fieldWon = fieldLeads.filter((l) => l.status === "won").length;

  const excelLeads = scoped.filter((l) => l.source === "excel");
  const ziwoLeads = scoped.filter((l) => l.source === "ziwo");
  const fieldWonCount = fieldLeads.filter((l) => l.status === "won").length;
  const excelWonCount = excelLeads.filter((l) => l.status === "won").length;
  const ziwoWonCount = ziwoLeads.filter((l) => l.status === "won").length;
  const fieldConv = fieldLeads.length ? Math.round((fieldWonCount / fieldLeads.length) * 100) : 0;
  const excelConv = excelLeads.length ? Math.round((excelWonCount / excelLeads.length) * 100) : 0;
  const ziwoConv = ziwoLeads.length ? Math.round((ziwoWonCount / ziwoLeads.length) * 100) : 0;
  const topConv = Math.max(fieldConv, excelConv, ziwoConv);
  const isWinner = (conv: number) => topConv > 0 && conv === topConv;

  const activity = scoped.filter((l) => l.visit || l.source === "field" || l.source === "ziwo").sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <Select value={repFilter} onChange={(e) => setRepFilter(e.target.value)}>
            <option value="all">{tCommon("allStaff")}</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {resolveUserNameById(r.id, users, tUsers)}
              </option>
            ))}
          </Select>
        }
      />

      <KpiRow>
        <KpiCard index={0} icon={Car} label={t("kpiFieldClients")} value={fieldLeads.length} sub={t("kpiFieldClientsSub")} color="blue" />
        <KpiCard index={1} icon={CheckCircle2} label={t("kpiVerified")} value={verifiedVisits} sub={t("kpiVerifiedSub")} color="green" />
        <KpiCard index={2} icon={AlertTriangle} label={t("kpiReview")} value={reviewVisits} sub={t("kpiReviewSub")} color="warn" />
        <KpiCard index={3} icon={Trophy} label={t("kpiFieldWon")} value={fieldWon} color="gold" />
      </KpiRow>

      <Panel>
        <PanelHeader icon={Scale} title={t("compareTitle")} />
        <div className="compare-grid">
          <div className={`compare-card ${isWinner(fieldConv) ? "win" : ""}`}>
            <div className="compare-title">
              {isWinner(fieldConv) && <Trophy size={14} strokeWidth={2} />}
              {t("compareFieldLabel")}
            </div>
            <div className="compare-line">
              {t("compareCount")}: <b>{formatNumber(fieldLeads.length, locale)}</b>
            </div>
            <div className="compare-line">
              {t("compareWon")}: <b>{formatNumber(fieldWonCount, locale)}</b>
            </div>
            <div className="compare-pct">{formatNumber(fieldConv, locale)}%</div>
          </div>
          <div className={`compare-card ${isWinner(excelConv) ? "win" : ""}`}>
            <div className="compare-title">
              {isWinner(excelConv) && <Trophy size={14} strokeWidth={2} />}
              {t("compareExcelLabel")}
            </div>
            <div className="compare-line">
              {t("compareCount")}: <b>{formatNumber(excelLeads.length, locale)}</b>
            </div>
            <div className="compare-line">
              {t("compareWon")}: <b>{formatNumber(excelWonCount, locale)}</b>
            </div>
            <div className="compare-pct">{formatNumber(excelConv, locale)}%</div>
          </div>
          <div className={`compare-card ${isWinner(ziwoConv) ? "win" : ""}`}>
            <div className="compare-title">
              {isWinner(ziwoConv) && <Trophy size={14} strokeWidth={2} />}
              {t("compareZiwoLabel")}
            </div>
            <div className="compare-line">
              {t("compareCount")}: <b>{formatNumber(ziwoLeads.length, locale)}</b>
            </div>
            <div className="compare-line">
              {t("compareWon")}: <b>{formatNumber(ziwoWonCount, locale)}</b>
            </div>
            <div className="compare-pct">{formatNumber(ziwoConv, locale)}%</div>
          </div>
        </div>
        <p className="tip-line">
          <Lightbulb size={13} strokeWidth={1.8} />
          {t("compareTip")}
        </p>
      </Panel>

      <Panel>
        <PanelHeader icon={Car} title={t("logTitle", { n: formatNumber(activity.length, locale) })} />
        {activity.length === 0 ? (
          <EmptyState icon={Car} title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <Tbl>
            <thead>
              <tr>
                <th>{t("colClient")}</th>
                <th>{t("colSource")}</th>
                <th>{t("colRep")}</th>
                <th>{t("colVisitTime")}</th>
                <th>{t("colGps")}</th>
                <th>{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((l) => {
                return (
                  <tr key={l.id} onClick={() => openModal({ type: "leadDetail", leadId: l.id })} style={{ cursor: "pointer" }}>
                    <td className="name-cell">{resolveLeadName(l, locale)}</td>
                    <td>
                      <Chip cls="seg">
                        <SourceIcon source={l.source} size={11} strokeWidth={2} />
                        {tCommon(l.source)}
                      </Chip>
                    </td>
                    <td>{resolveUserNameById(l.assignedTo, users, tUsers)}</td>
                    <td>{l.visit ? formatDT(l.visit.at, locale, tDate) : "—"}</td>
                    <td>
                      {l.visit ? (
                        <Chip cls={l.visit.verified ? "verified" : "review"}>
                          {l.visit.verified ? <CheckCircle2 size={11} strokeWidth={2} /> : <AlertTriangle size={11} strokeWidth={2} />}
                          {l.visit.verified ? t("gpsVerified") : t("gpsReview")}
                        </Chip>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <StatusChip status={l.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tbl>
        )}
      </Panel>

      <Panel>
        <PanelHeader icon={Info} title={t("whyTitle")} />
        <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("whyBody")}</p>
      </Panel>
    </>
  );
}
