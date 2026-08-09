"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Chip } from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { formatNumber } from "@/lib/format";
import { Lock, MessageSquareText, AlertTriangle, Star, CheckCircle2, RefreshCw } from "@/lib/icons";

interface WebsiteFeedback {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  rating: number;
  message: string;
  resolved?: boolean;
  notifyCount?: number;
  aiFlag?: {
    flagged: boolean;
    urgency: "low" | "medium" | "high";
    severityPct: number;
    reasonAr: string;
    reasonEn: string;
    suggestedActionAr: string;
    suggestedActionEn: string;
  };
}

export default function FeedbackPage() {
  const t = useTranslations("feedbackPage");
  const locale = useLocale();
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";

  const [items, setItems] = useState<WebsiteFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setItems(data.feedback);
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    if (isMgr) fetchFeedback();
  }, [isMgr, fetchFeedback]);

  const toggleResolved = async (id: string, resolved: boolean) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  if (!isMgr) {
    return <EmptyState icon={Lock} title={t("noAccessTitle")} body={t("noAccessBody")} />;
  }

  const flaggedUnresolved = items.filter((f) => f.aiFlag?.flagged && !f.resolved);
  const avgRating = items.length ? Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10 : 0;

  const sorted = [...items].sort((a, b) => {
    const aFlag = a.aiFlag?.flagged && !a.resolved ? 1 : 0;
    const bFlag = b.aiFlag?.flagged && !b.resolved ? 1 : 0;
    if (aFlag !== bFlag) return bFlag - aFlag;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const urgencyChip = (f: WebsiteFeedback) => {
    if (!f.aiFlag) return null;
    const cls = f.aiFlag.severityPct >= 70 ? "archived" : f.aiFlag.severityPct >= 40 ? "review" : "seg";
    return <Chip cls={cls}>{t("severityChip", { pct: formatNumber(f.aiFlag.severityPct, locale) })}</Chip>;
  };

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <Button sm onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? "spin" : ""} />
            {t("refreshBtn")}
          </Button>
        }
      />

      <KpiRow>
        <KpiCard index={0} icon={MessageSquareText} label={t("kpiTotal")} value={items.length} color="gold" />
        <KpiCard index={1} icon={AlertTriangle} label={t("kpiFlagged")} value={flaggedUnresolved.length} color={flaggedUnresolved.length ? "danger" : "green"} highlight={flaggedUnresolved.length > 0} />
        <KpiCard index={2} icon={Star} label={t("kpiAvgRating")} value={`${avgRating} / 5`} color="blue" />
      </KpiRow>

      <Panel>
        <PanelHeader icon={MessageSquareText} title={t("listTitle", { n: formatNumber(items.length, locale) })} />
        {items.length === 0 ? (
          <EmptyState icon={MessageSquareText} title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((f) => (
              <div
                key={f.id}
                className="panel"
                style={{
                  borderColor: f.aiFlag?.flagged && !f.resolved ? "var(--danger)" : undefined,
                  marginBottom: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700 }}>{f.name}</span>
                      {f.email && <span style={{ fontSize: 11, color: "var(--muted)" }} dir="ltr">{f.email}</span>}
                      {f.resolved && <Chip cls="verified"><CheckCircle2 size={11} strokeWidth={2} /> {t("resolvedChip")}</Chip>}
                      {f.aiFlag?.flagged && !f.resolved && urgencyChip(f)}
                      {!!f.notifyCount && f.notifyCount > 0 && !f.resolved && (
                        <span style={{ fontSize: 11, color: "var(--danger-l)" }}>{t("notifyCountLabel", { n: f.notifyCount })}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 2, marginTop: 4 }} dir="ltr">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} strokeWidth={2} fill={n <= f.rating ? "var(--gold-l)" : "none"} color={n <= f.rating ? "var(--gold-l)" : "var(--line)"} />
                      ))}
                    </div>
                  </div>
                  <Button
                    sm
                    variant={f.resolved ? undefined : "green"}
                    onClick={() => toggleResolved(f.id, !f.resolved)}
                    disabled={busyId === f.id}
                  >
                    {f.resolved ? t("reopenBtn") : t("resolveBtn")}
                  </Button>
                </div>
                <p style={{ fontSize: 13, color: "var(--cream2)", lineHeight: 1.6 }}>{f.message}</p>
                {f.aiFlag?.flagged && (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "var(--panel-2)", fontSize: 12 }}>
                    <div style={{ color: "var(--danger-l)" }}>{locale === "ar" ? f.aiFlag.reasonAr : f.aiFlag.reasonEn}</div>
                    <div style={{ color: "var(--muted)", marginTop: 4 }}>
                      {t("suggestedActionLabel")}: {locale === "ar" ? f.aiFlag.suggestedActionAr : f.aiFlag.suggestedActionEn}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
