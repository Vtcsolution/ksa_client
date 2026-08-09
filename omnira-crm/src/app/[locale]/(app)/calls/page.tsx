"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Select } from "@/components/ui/Form";
import SegmentedControl from "@/components/ui/SegmentedControl";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import CallInsightCard from "@/components/CallInsightCard";
import { useAppStore } from "@/store/useAppStore";
import { useToastStore } from "@/store/useToastStore";
import { computeCallInsightStats } from "@/lib/callInsights";
import { resolveUserName } from "@/lib/resolve";
import { formatNumber } from "@/lib/format";
import { Mic, Smile, Gauge, Flame, Loader2, RefreshCw, AlertTriangle } from "@/lib/icons";

type StatusFilter = "all" | "analyzed" | "processing" | "failed";

export default function CallsPage() {
  const t = useTranslations("callsPage");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const locale = useLocale();
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const callInsights = useAppStore((s) => s.callInsights);
  const pushToast = useToastStore((s) => s.push);
  const me = users.find((u) => u.id === currentUserId);

  const [repFilter, setRepFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [syncing, setSyncing] = useState(false);

  const syncZiwoCalls = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/ziwo/sync", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        pushToast("syncCallsToast", { n: data.processed ?? 0 }, "ok");
      } else {
        pushToast("syncCallsErrorToast", undefined, "warn");
      }
    } catch {
      pushToast("syncCallsErrorToast", undefined, "warn");
    } finally {
      setSyncing(false);
    }
  };

  const reps = users.filter((u) => u.role === "rep");
  const isMgr = me?.role === "manager";

  const scoped = useMemo(() => {
    let list = callInsights;
    if (!isMgr && me) list = list.filter((c) => c.repId === me.id);
    else if (repFilter !== "all") list = list.filter((c) => c.repId === repFilter);
    if (sentimentFilter !== "all") list = list.filter((c) => c.sentiment === sentimentFilter);
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    return [...list].sort((a, b) => b.at - a.at);
  }, [callInsights, isMgr, me, repFilter, sentimentFilter, statusFilter]);

  const stats = computeCallInsightStats(scoped);

  if (!me) return null;

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub", { n: formatNumber(scoped.length, locale) })}
        actions={
          <>
            <SegmentedControl
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: tCommon("all") },
                { value: "analyzed", label: t("statusAnalyzed") },
                { value: "processing", label: t("statusProcessing") },
                { value: "failed", label: t("statusFailed") },
              ]}
            />
            <Select value={sentimentFilter} onChange={(e) => setSentimentFilter(e.target.value)}>
              <option value="all">{t("allSentiments")}</option>
              <option value="positive">{t("sentiment.positive")}</option>
              <option value="neutral">{t("sentiment.neutral")}</option>
              <option value="negative">{t("sentiment.negative")}</option>
            </Select>
            {isMgr && (
              <Select value={repFilter} onChange={(e) => setRepFilter(e.target.value)}>
                <option value="all">{tCommon("allStaff")}</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {resolveUserName(r, tUsers)}
                  </option>
                ))}
              </Select>
            )}
            <Button onClick={syncZiwoCalls} disabled={syncing}>
              {syncing ? <Loader2 size={13} strokeWidth={2} className="spin" /> : <RefreshCw size={13} strokeWidth={2} />}
              {syncing ? t("syncingButton") : t("syncButton")}
            </Button>
          </>
        }
      />

      <KpiRow>
        <KpiCard index={0} icon={Mic} label={t("kpiTotal")} value={stats.total} sub={t("kpiTotalSub")} color="blue" />
        <KpiCard index={1} icon={Smile} label={t("kpiAvgSentiment")} value={stats.avgSentiment} suffix="%" color="green" />
        <KpiCard index={2} icon={Gauge} label={t("kpiAvgScore")} value={stats.avgLeadScore} color="gold" />
        <KpiCard index={3} icon={Flame} label={t("kpiHotLeads")} value={stats.hotLeads} sub={t("kpiHotLeadsSub")} color="warn" />
        <KpiCard index={4} icon={Loader2} label={t("kpiProcessing")} value={stats.processing} color="purple" />
        {stats.failed > 0 && <KpiCard index={5} icon={AlertTriangle} label={t("kpiFailed")} value={stats.failed} color="danger" />}
      </KpiRow>

      {scoped.length === 0 ? (
        <EmptyState icon={Mic} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <div>
          {scoped.map((call, i) => (
            <CallInsightCard key={call.id} call={call} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
