"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Tbl } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { formatNumber } from "@/lib/format";
import { Gift, Lock, Clock, CheckCircle2, Wallet } from "@/lib/icons";

export default function ReferralsPage() {
  const t = useTranslations("referralsPage");
  const locale = useLocale();
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";
  const rewards = useAppStore((s) => s.referralRewards);
  const decideReferralReward = useAppStore((s) => s.decideReferralReward);

  if (!isMgr) {
    return <EmptyState icon={Lock} title={t("noAccessTitle")} body={t("noAccessBody")} />;
  }

  const pending = rewards.filter((r) => r.status === "pending");
  const approved = rewards.filter((r) => r.status === "approved");
  const paid = rewards.filter((r) => r.status === "paid");
  const pendingPoints = pending.reduce((sum, r) => sum + r.points, 0);
  const paidPoints = paid.reduce((sum, r) => sum + r.points, 0);

  const statusChip = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: "review", label: t("statusPending") },
      approved: { cls: "verified", label: t("statusApproved") },
      paid: { cls: "won", label: t("statusPaid") },
      rejected: { cls: "archived", label: t("statusRejected") },
    };
    const m = map[status] ?? map.pending;
    return <span className={`chip ${m.cls}`}>{m.label}</span>;
  };

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />

      <KpiRow>
        <KpiCard index={0} icon={Clock} label={t("kpiPending")} value={pending.length} sub={t("kpiPendingSub", { points: formatNumber(pendingPoints, locale) })} color="warn" />
        <KpiCard index={1} icon={CheckCircle2} label={t("kpiApproved")} value={approved.length} color="blue" />
        <KpiCard index={2} icon={Wallet} label={t("kpiPaid")} value={paid.length} sub={t("kpiPaidSub", { points: formatNumber(paidPoints, locale) })} color="green" highlight />
      </KpiRow>

      <Panel>
        <PanelHeader icon={Gift} title={t("listTitle", { n: formatNumber(rewards.length, locale) })} />
        {rewards.length === 0 ? (
          <EmptyState icon={Gift} title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <Tbl>
            <thead>
              <tr>
                <th>{t("colReferrer")}</th>
                <th>{t("colReferred")}</th>
                <th>{t("colCode")}</th>
                <th>{t("colPoints")}</th>
                <th>{t("colStatus")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id}>
                  <td className="name-cell">
                    {r.referrerName}
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.referrerPhone}</div>
                  </td>
                  <td className="name-cell">
                    {r.referredName}
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.referredPhone}</div>
                  </td>
                  <td style={{ fontFamily: "monospace" }}>{r.referralCode}</td>
                  <td>{formatNumber(r.points, locale)}</td>
                  <td>{statusChip(r.status)}</td>
                  <td>
                    {r.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button sm variant="green" onClick={() => decideReferralReward(r.id, "approved")}>
                          {t("approveBtn")}
                        </Button>
                        <Button sm variant="danger" onClick={() => decideReferralReward(r.id, "rejected")}>
                          {t("rejectBtn")}
                        </Button>
                      </div>
                    )}
                    {r.status === "approved" && (
                      <Button sm variant="gold" onClick={() => decideReferralReward(r.id, "paid")}>
                        {t("markPaidBtn")}
                      </Button>
                    )}
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
