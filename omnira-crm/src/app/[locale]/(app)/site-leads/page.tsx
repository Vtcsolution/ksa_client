"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Chip } from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { Lock, Globe, Star, Trash2, RefreshCw, Phone, Mail } from "@/lib/icons";

type SiteLeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "archived";

interface SiteLead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
  status: SiteLeadStatus;
  priority: "normal" | "high";
  starred: boolean;
  source?: string;
  referralCode?: string;
  notes: { at: string; text: string }[];
}

const STATUS_ORDER: SiteLeadStatus[] = ["new", "contacted", "qualified", "won", "lost", "archived"];
const STATUS_CLS: Record<SiteLeadStatus, string> = {
  new: "new",
  contacted: "contacted",
  qualified: "interested",
  won: "won",
  lost: "archived",
  archived: "archived",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function SiteLeadsPage() {
  const t = useTranslations("siteLeadsPage");
  const tStatus = useTranslations("siteLeadsPage.status");
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";

  const [items, setItems] = useState<SiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SiteLeadStatus | "all">("all");

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/site-leads", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setItems(data.leads);
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (isMgr) fetchLeads();
  }, [isMgr, fetchLeads]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/site-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      const res = await fetch(`/api/site-leads/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  const shown = useMemo(() => (filter === "all" ? items : items.filter((l) => l.status === filter)), [items, filter]);
  const sorted = useMemo(
    () => [...shown].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [shown],
  );

  if (!isMgr) {
    return <EmptyState icon={Lock} title={t("noAccessTitle")} body={t("noAccessBody")} />;
  }

  const todayCount = items.filter((l) => {
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;
  const newCount = items.filter((l) => l.status === "new").length;

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
        <KpiCard index={0} icon={Globe} label={t("kpiTotal")} value={items.length} color="gold" />
        <KpiCard index={1} icon={Globe} label={t("kpiToday")} value={todayCount} color="blue" />
        <KpiCard index={2} icon={Globe} label={t("kpiNew")} value={newCount} color={newCount ? "green" : "gold"} highlight={newCount > 0} />
      </KpiRow>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 14px" }}>
        <Chip cls={filter === "all" ? "verified" : "seg"} className="clickable" >
          <button style={{ all: "unset", cursor: "pointer" }} onClick={() => setFilter("all")}>
            {t("filterAll")}
          </button>
        </Chip>
        {STATUS_ORDER.map((s) => (
          <Chip key={s} cls={filter === s ? "verified" : STATUS_CLS[s]}>
            <button style={{ all: "unset", cursor: "pointer" }} onClick={() => setFilter(s)}>
              {tStatus(s)}
            </button>
          </Chip>
        ))}
      </div>

      <Panel>
        <PanelHeader icon={Globe} title={t("listTitle", { n: items.length })} />
        {sorted.length === 0 ? (
          <EmptyState icon={Globe} title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((l) => (
              <div key={l.id} className="panel" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700 }}>{l.name}</span>
                      <Chip cls={STATUS_CLS[l.status]}>{tStatus(l.status)}</Chip>
                      {l.priority === "high" && <Chip cls="archived">{t("highPriority")}</Chip>}
                      {l.referralCode && <Chip cls="seg">{l.referralCode}</Chip>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 12, color: "var(--muted)" }} dir="ltr">
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} /> {l.phone}
                      </span>
                      {l.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={12} /> {l.email}
                        </span>
                      )}
                      <span>{fmtDate(l.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <select
                      value={l.status}
                      disabled={busyId === l.id}
                      onChange={(e) => patch(l.id, { status: e.target.value })}
                      style={{ background: "var(--panel-2)", color: "var(--cream)", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {tStatus(s)}
                        </option>
                      ))}
                    </select>
                    <Button sm variant={l.starred ? "gold" : undefined} onClick={() => patch(l.id, { priority: l.priority === "high" ? "normal" : "high" })} disabled={busyId === l.id}>
                      <Star size={13} fill={l.priority === "high" ? "currentColor" : "none"} />
                    </Button>
                    <Button sm variant="danger" onClick={() => remove(l.id)} disabled={busyId === l.id}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
                {l.service && <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{t("serviceLabel")}: {l.service}</p>}
                {l.message && <p style={{ fontSize: 13, color: "var(--cream2)", lineHeight: 1.6 }}>{l.message}</p>}
                {l.notes.length > 0 && (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "var(--panel-2)", fontSize: 12 }}>
                    {l.notes.map((n, i) => (
                      <div key={i} style={{ color: "var(--muted)", marginBottom: i < l.notes.length - 1 ? 4 : 0 }}>
                        {fmtDate(n.at)} — {n.text}
                      </div>
                    ))}
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
