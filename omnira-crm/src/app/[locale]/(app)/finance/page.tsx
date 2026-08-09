"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Tbl } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatNumber } from "@/lib/format";
import { BarChart3, Lock, Plus, TrendingDown, TrendingUp, Trash2, Wallet } from "@/lib/icons";

const MONTHS_BACK = 6;

function monthKey(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default function FinancePage() {
  const t = useTranslations("financePage");
  const tCat = useTranslations("expenseCategory");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";
  const revenue = useAppStore((s) => s.revenue);
  const expenses = useAppStore((s) => s.expenses);
  const deleteExpense = useAppStore((s) => s.deleteExpense);
  const openModal = useUiStore((s) => s.openModal);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
  const totalMonthly = revenue.reduce((sum, r) => sum + r.monthly, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const months = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- wall-clock "now" anchors the rolling N-month window shown
    const now = new Date();
    return Array.from({ length: MONTHS_BACK }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "short" }) };
    });
  }, [locale]);

  const monthlyBreakdown = useMemo(() => {
    return months.map((m) => {
      const rev = revenue.filter((r) => monthKey(r.at) === m.key).reduce((sum, r) => sum + r.total, 0);
      const exp = expenses.filter((e) => monthKey(e.date) === m.key).reduce((sum, e) => sum + e.amount, 0);
      return { ...m, revenue: rev, expense: exp };
    });
  }, [months, revenue, expenses]);

  const maxVal = Math.max(...monthlyBreakdown.map((m) => Math.max(m.revenue, m.expense)), 1);

  if (!isMgr) {
    return <EmptyState icon={Lock} title={t("noAccessTitle")} body={t("noAccessBody")} />;
  }

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />

      <KpiRow>
        <KpiCard index={0} icon={TrendingUp} label={t("kpiRevenue")} value={totalRevenue} color="green" />
        <KpiCard index={1} icon={Wallet} label={t("kpiMonthly")} value={totalMonthly} sub={t("kpiMonthlySub")} color="gold" />
        <KpiCard index={2} icon={TrendingDown} label={t("kpiExpenses")} value={totalExpenses} color="purple" />
        <KpiCard
          index={3}
          icon={BarChart3}
          label={t("kpiNet")}
          value={netProfit}
          color={netProfit >= 0 ? "green" : "warn"}
          highlight
        />
      </KpiRow>

      <Panel>
        <PanelHeader icon={BarChart3} title={t("chartTitle")} />
        <div className="fin-legend">
          <div className="fin-legend-item">
            <span className="fin-legend-dot revenue" />
            {t("legendRevenue")}
          </div>
          <div className="fin-legend-item">
            <span className="fin-legend-dot expense" />
            {t("legendExpense")}
          </div>
        </div>
        <div className="fin-chart">
          {monthlyBreakdown.map((m) => (
            <div key={m.key} className="fin-chart-col">
              <div className="fin-chart-track">
                <div className="fin-bar-wrap">
                  <div
                    className="fin-bar revenue"
                    style={{ height: `${Math.max(2, (m.revenue / maxVal) * 100)}%` }}
                    title={`${t("legendRevenue")}: ${formatNumber(m.revenue, locale)} ${tCommon("sar")}`}
                  />
                </div>
                <div className="fin-bar-wrap">
                  <div
                    className="fin-bar expense"
                    style={{ height: `${Math.max(2, (m.expense / maxVal) * 100)}%` }}
                    title={`${t("legendExpense")}: ${formatNumber(m.expense, locale)} ${tCommon("sar")}`}
                  />
                </div>
              </div>
              <span className="fin-chart-label">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="chart-caption">{t("chartCaption")}</p>

        <Tbl>
          <thead>
            <tr>
              <th>{t("colMonth")}</th>
              <th>{t("colRevenue")}</th>
              <th>{t("colExpense")}</th>
              <th>{t("colNet")}</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBreakdown.map((m) => (
              <tr key={m.key}>
                <td>{m.label}</td>
                <td>{formatNumber(m.revenue, locale)}</td>
                <td>{formatNumber(m.expense, locale)}</td>
                <td style={{ color: m.revenue - m.expense >= 0 ? "var(--ok)" : "var(--danger-l)" }}>
                  {formatNumber(m.revenue - m.expense, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </Tbl>
      </Panel>

      <Panel>
        <PanelHeader
          icon={Wallet}
          title={t("expensesTitle", { n: formatNumber(expenses.length, locale) })}
          action={
            <Button sm variant="gold" onClick={() => openModal({ type: "addExpense" })}>
              <Plus size={13} strokeWidth={2} />
              {t("addExpenseBtn")}
            </Button>
          }
        />
        {expenses.length === 0 ? (
          <EmptyState icon={Wallet} title={t("emptyExpensesTitle")} body={t("emptyExpensesBody")} />
        ) : (
          <Tbl>
            <thead>
              <tr>
                <th>{t("colDate")}</th>
                <th>{t("colDescription")}</th>
                <th>{t("colCategory")}</th>
                <th>{t("colAmount")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</td>
                  <td className="name-cell">{e.description}</td>
                  <td>{tCat(e.category)}</td>
                  <td>{formatNumber(e.amount, locale)} {tCommon("sar")}</td>
                  <td>
                    <button type="button" onClick={() => deleteExpense(e.id)} style={{ color: "var(--danger-l)", display: "flex" }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tbl>
        )}
      </Panel>
    </>
  );
}
