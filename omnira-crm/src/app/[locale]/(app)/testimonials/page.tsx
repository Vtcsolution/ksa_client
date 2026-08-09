"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Chip } from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { Lock, Quote, Star, Check, X, Trash2, RefreshCw, Sparkles, Clock, CheckCircle2 } from "@/lib/icons";

type TestimonialStatus = "pending" | "approved" | "rejected";

interface Testimonial {
  id: string;
  createdAt: string;
  name: string;
  role?: string;
  segment: string;
  rating: number;
  quote: string;
  status: TestimonialStatus;
  ai?: {
    bestSegments: string[];
    stage: "cold" | "warm" | "hot";
    whyAr: string;
    whyEn: string;
  };
}

const STATUS_CLS: Record<TestimonialStatus, string> = { pending: "review", approved: "verified", rejected: "archived" };

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function TestimonialsAdminPage() {
  const t = useTranslations("testimonialsAdminPage");
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";

  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<TestimonialStatus | "all">("pending");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/testimonials/admin", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setItems(data.testimonials);
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (isMgr) fetchItems();
  }, [isMgr, fetchItems]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/testimonials/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/testimonials/admin/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((x) => x.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  const shown = useMemo(() => (tab === "all" ? items : items.filter((x) => x.status === tab)), [items, tab]);
  const sorted = useMemo(() => [...shown].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [shown]);

  if (!isMgr) {
    return <EmptyState icon={Lock} title={t("noAccessTitle")} body={t("noAccessBody")} />;
  }

  const pendingCount = items.filter((x) => x.status === "pending").length;
  const approvedCount = items.filter((x) => x.status === "approved").length;

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
        <KpiCard index={0} icon={Quote} label={t("kpiTotal")} value={items.length} color="gold" />
        <KpiCard index={1} icon={Clock} label={t("kpiPending")} value={pendingCount} color={pendingCount ? "warn" : "green"} highlight={pendingCount > 0} />
        <KpiCard index={2} icon={CheckCircle2} label={t("kpiApproved")} value={approvedCount} color="green" />
      </KpiRow>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 14px" }}>
        {(["pending", "approved", "rejected", "all"] as const).map((k) => (
          <Chip key={k} cls={tab === k ? "verified" : "seg"}>
            <button style={{ all: "unset", cursor: "pointer" }} onClick={() => setTab(k)}>
              {t(`tab_${k}`)}
            </button>
          </Chip>
        ))}
      </div>

      <Panel>
        <PanelHeader icon={Quote} title={t("listTitle", { n: items.length })} />
        {sorted.length === 0 ? (
          <EmptyState icon={Quote} title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((x) => (
              <div key={x.id} className="panel" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700 }}>{x.name}</span>
                      {x.role && <span style={{ fontSize: 11, color: "var(--muted)" }}>{x.role}</span>}
                      <Chip cls="seg">{x.segment}</Chip>
                      <Chip cls={STATUS_CLS[x.status]}>{t(`tab_${x.status}`)}</Chip>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginTop: 4 }} dir="ltr">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} strokeWidth={2} fill={n <= x.rating ? "var(--gold-l)" : "none"} color={n <= x.rating ? "var(--gold-l)" : "var(--line)"} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{fmtDate(x.createdAt)}</span>
                    {x.status === "pending" && (
                      <>
                        <Button sm variant="green" onClick={() => decide(x.id, "approved")} disabled={busyId === x.id}>
                          <Check size={13} />
                        </Button>
                        <Button sm variant="danger" onClick={() => decide(x.id, "rejected")} disabled={busyId === x.id}>
                          <X size={13} />
                        </Button>
                      </>
                    )}
                    <Button sm onClick={() => remove(x.id)} disabled={busyId === x.id}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--cream2)", lineHeight: 1.6 }}>{x.quote}</p>
                {x.ai && (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "var(--panel-2)", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold-l)", marginBottom: 4 }}>
                      <Sparkles size={13} />
                      <span>{t("aiSuggested")}</span>
                    </div>
                    <div style={{ color: "var(--muted)" }}>{x.ai.whyEn || x.ai.whyAr}</div>
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
