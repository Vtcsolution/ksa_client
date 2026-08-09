"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { KpiCard, KpiRow } from "@/components/ui/Kpi";
import { Chip } from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { Lock, Mail, MessageSquareText, MessageCircle, RefreshCw, Send, Trash2, Sparkles, Loader2, Eye, MousePointerClick, Users, Clock } from "@/lib/icons";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost" | "archived";
type CampaignStatus = "draft" | "sending" | "sent" | "failed";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  scheduledAt?: string;
  recipientCount: number;
  sentCount: number;
  queuedCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
}

interface SmsCampaign {
  id: string;
  name: string;
  message: string;
  status: CampaignStatus;
  recipientCount: number;
  sentCount: number;
  queuedCount: number;
  failedCount: number;
}

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost", "archived"];
const SERVICE_OPTIONS = [
  "parking-management",
  "valet-parking",
  "advanced-technology",
  "professional-organizers",
  "consultation",
  "golf-cart",
  "support-services",
  "car-wash",
];

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "var(--panel-2)",
  color: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 13,
};

const STATUS_CLS: Record<CampaignStatus, string> = { draft: "seg", sending: "review", sent: "verified", failed: "archived" };

type Tab = "email" | "sms" | "whatsapp";

export default function MarketingPage() {
  const t = useTranslations("marketingPage");
  const tStatus = useTranslations("siteLeadsPage.status");
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";

  const [tab, setTab] = useState<Tab>("email");

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [emailLoaded, setEmailLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [service, setService] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [creating, setCreating] = useState(false);

  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>([]);
  const [smsLoaded, setSmsLoaded] = useState(false);
  const [smsBusyId, setSmsBusyId] = useState<string | null>(null);
  const [smsName, setSmsName] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [smsStatus, setSmsStatus] = useState<LeadStatus | "">("");
  const [smsService, setSmsService] = useState("");
  const [smsCreating, setSmsCreating] = useState(false);

  const [waTotal, setWaTotal] = useState(0);
  const [waItems, setWaItems] = useState<{ id: string; leadName: string; message: string; at: string }[]>([]);
  const [waLoaded, setWaLoaded] = useState(false);

  const refreshEmail = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/marketing/campaigns", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setCampaigns(data.campaigns);
    } finally {
      setRefreshing(false);
      setEmailLoaded(true);
    }
  }, []);

  const refreshSms = useCallback(async () => {
    const res = await fetch("/api/marketing/sms/campaigns", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setSmsCampaigns(data.campaigns);
    setSmsLoaded(true);
  }, []);

  const refreshWhatsapp = useCallback(async () => {
    const res = await fetch("/api/marketing/whatsapp-summary", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) {
      setWaTotal(data.total);
      setWaItems(data.items);
    }
    setWaLoaded(true);
  }, []);

  useEffect(() => {
    if (!isMgr) return;
    if (tab === "email" && !emailLoaded) refreshEmail();
    if (tab === "sms" && !smsLoaded) refreshSms();
    if (tab === "whatsapp" && !waLoaded) refreshWhatsapp();
  }, [isMgr, tab, emailLoaded, smsLoaded, waLoaded, refreshEmail, refreshSms, refreshWhatsapp]);

  const aiDraft = useCallback(async () => {
    if (!brief.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/marketing/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubject(data.draft.subject);
        setBodyHtml(data.draft.bodyHtml);
        if (!name) setName(brief.slice(0, 60));
      }
    } finally {
      setAiLoading(false);
    }
  }, [brief, name]);

  const createDraft = useCallback(async () => {
    if (!name.trim() || !subject.trim() || !bodyHtml.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          bodyHtml,
          status: status || undefined,
          service: service || undefined,
          scheduledAt: sendAt ? new Date(sendAt).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setName("");
        setSubject("");
        setBodyHtml("");
        setBrief("");
        setStatus("");
        setService("");
        setSendAt("");
        await refreshEmail();
      }
    } finally {
      setCreating(false);
    }
  }, [name, subject, bodyHtml, status, service, sendAt, refreshEmail]);

  const sendCampaign = useCallback(
    async (id: string) => {
      if (!confirm(t("confirmSend"))) return;
      setBusyId(id);
      try {
        await fetch(`/api/marketing/campaigns/${id}/send`, { method: "POST" });
        await refreshEmail();
      } finally {
        setBusyId(null);
      }
    },
    [refreshEmail, t],
  );

  const removeCampaign = useCallback(
    async (id: string) => {
      if (!confirm(t("confirmDelete"))) return;
      const res = await fetch(`/api/marketing/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) setCampaigns((prev) => prev.filter((c) => c.id !== id));
    },
    [t],
  );

  const createSmsDraft = useCallback(async () => {
    if (!smsName.trim() || !smsMessage.trim()) return;
    setSmsCreating(true);
    try {
      const res = await fetch("/api/marketing/sms/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: smsName, message: smsMessage, status: smsStatus || undefined, service: smsService || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setSmsName("");
        setSmsMessage("");
        setSmsStatus("");
        setSmsService("");
        await refreshSms();
      }
    } finally {
      setSmsCreating(false);
    }
  }, [smsName, smsMessage, smsStatus, smsService, refreshSms]);

  const sendSmsCampaign = useCallback(
    async (id: string) => {
      if (!confirm(t("confirmSend"))) return;
      setSmsBusyId(id);
      try {
        await fetch(`/api/marketing/sms/campaigns/${id}/send`, { method: "POST" });
        await refreshSms();
      } finally {
        setSmsBusyId(null);
      }
    },
    [refreshSms, t],
  );

  const removeSmsCampaign = useCallback(
    async (id: string) => {
      if (!confirm(t("confirmDelete"))) return;
      const res = await fetch(`/api/marketing/sms/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) setSmsCampaigns((prev) => prev.filter((c) => c.id !== id));
    },
    [t],
  );

  if (!isMgr) {
    return <EmptyState icon={Lock} title={t("noAccessTitle")} body={t("noAccessBody")} />;
  }

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount + c.queuedCount, 0);
  const totalOpens = campaigns.reduce((s, c) => s + c.openCount, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clickCount, 0);
  const smsSent = smsCampaigns.reduce((s, c) => s + c.sentCount + c.queuedCount, 0);
  const smsFailed = smsCampaigns.reduce((s, c) => s + c.failedCount, 0);

  const refreshCurrent = tab === "email" ? refreshEmail : tab === "sms" ? refreshSms : refreshWhatsapp;

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <Button sm onClick={refreshCurrent} disabled={refreshing}>
            <RefreshCw size={13} className={refreshing ? "spin" : ""} />
            {t("refreshBtn")}
          </Button>
        }
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 14px" }}>
        {([
          { key: "email" as const, label: t("tabEmail"), icon: Mail },
          { key: "sms" as const, label: t("tabSms"), icon: MessageSquareText },
          { key: "whatsapp" as const, label: t("tabWhatsapp"), icon: MessageCircle },
        ]).map((tb) => (
          <Chip key={tb.key} cls={tab === tb.key ? "verified" : "seg"}>
            <button style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setTab(tb.key)}>
              <tb.icon size={13} /> {tb.label}
            </button>
          </Chip>
        ))}
      </div>

      {tab === "email" && (
        <>
          <KpiRow>
            <KpiCard index={0} icon={Mail} label={t("kpiCampaigns")} value={campaigns.length} color="gold" />
            <KpiCard index={1} icon={Users} label={t("kpiSent")} value={totalSent} color="blue" />
            <KpiCard index={2} icon={Eye} label={t("kpiOpens")} value={totalOpens} color="teal" />
            <KpiCard index={3} icon={MousePointerClick} label={t("kpiClicks")} value={totalClicks} color="green" />
          </KpiRow>

          <Panel>
            <PanelHeader icon={Sparkles} title={t("newCampaignTitle")} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input style={inputStyle} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={t("briefPlaceholder")} />
              <Button onClick={aiDraft} disabled={aiLoading || !brief.trim()}>
                {aiLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                {t("aiDraftBtn")}
              </Button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} />
              <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subjectPlaceholder")} />
            </div>
            <textarea
              style={{ ...inputStyle, marginTop: 8, resize: "vertical", fontFamily: "monospace" }}
              rows={6}
              dir="ltr"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder={t("bodyPlaceholder")}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "")}>
                <option value="">{t("allStatuses")}</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {tStatus(s)}
                  </option>
                ))}
              </select>
              <select style={inputStyle} value={service} onChange={(e) => setService(e.target.value)}>
                <option value="">{t("allServices")}</option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t(`service_${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{t("sendAtLabel")}</label>
              <input type="datetime-local" style={inputStyle} value={sendAt} onChange={(e) => setSendAt(e.target.value)} />
            </div>
            <Button variant="gold" onClick={createDraft} disabled={creating || !name.trim() || !subject.trim() || !bodyHtml.trim()} style={{ marginTop: 10 }}>
              {creating ? <Loader2 size={14} className="spin" /> : <Mail size={14} />}
              {sendAt ? t("saveScheduledBtn") : t("saveDraftBtn")}
            </Button>
          </Panel>

          <Panel>
            <PanelHeader icon={Mail} title={t("campaignsTitle", { n: campaigns.length })} />
            {campaigns.length === 0 ? (
              <EmptyState icon={Mail} title={t("emptyCampaignsTitle")} body={t("emptyCampaignsBody")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {campaigns.map((c) => (
                  <div key={c.id} className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>{c.name}</span>
                        <Chip cls={STATUS_CLS[c.status]}>{t(`campaignStatus_${c.status}`)}</Chip>
                        {c.status === "draft" && c.scheduledAt && (
                          <Chip cls="review">
                            <Clock size={11} /> {t("scheduledForChip", { dt: new Date(c.scheduledAt).toLocaleString() })}
                          </Chip>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {c.status === "draft" && (
                          <Button sm variant="green" onClick={() => sendCampaign(c.id)} disabled={busyId === c.id}>
                            <Send size={13} /> {t("sendNowBtn")}
                          </Button>
                        )}
                        <Button sm onClick={() => removeCampaign(c.id)} disabled={busyId === c.id}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--cream2)", marginTop: 6 }}>{c.subject}</p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                      <span>{t("recipients")}: {c.recipientCount}</span>
                      {c.status !== "draft" && (
                        <>
                          <span>{t("sent")}: {c.sentCount}</span>
                          <span>{t("queued")}: {c.queuedCount}</span>
                          {c.failedCount > 0 && <span style={{ color: "var(--danger-l)" }}>{t("failed")}: {c.failedCount}</span>}
                          <span>{t("opens")}: {c.openCount}</span>
                          <span>{t("clicks")}: {c.clickCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {tab === "sms" && (
        <>
          <KpiRow>
            <KpiCard index={0} icon={MessageSquareText} label={t("kpiCampaigns")} value={smsCampaigns.length} color="gold" />
            <KpiCard index={1} icon={Users} label={t("kpiSent")} value={smsSent} color="blue" />
            <KpiCard index={2} icon={Clock} label={t("kpiFailed")} value={smsFailed} color={smsFailed ? "danger" : "green"} />
          </KpiRow>

          <Panel>
            <PanelHeader icon={MessageSquareText} title={t("newSmsCampaignTitle")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input style={inputStyle} value={smsName} onChange={(e) => setSmsName(e.target.value)} placeholder={t("namePlaceholder")} />
              <select style={inputStyle} value={smsStatus} onChange={(e) => setSmsStatus(e.target.value as LeadStatus | "")}>
                <option value="">{t("allStatuses")}</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {tStatus(s)}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              style={{ ...inputStyle, marginTop: 8, resize: "vertical" }}
              rows={3}
              maxLength={600}
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value.slice(0, 600))}
              placeholder={t("smsMessagePlaceholder")}
            />
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{smsMessage.length}/600</p>
            <select style={{ ...inputStyle, marginTop: 4 }} value={smsService} onChange={(e) => setSmsService(e.target.value)}>
              <option value="">{t("allServices")}</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`service_${s}`)}
                </option>
              ))}
            </select>
            <Button variant="gold" onClick={createSmsDraft} disabled={smsCreating || !smsName.trim() || !smsMessage.trim()} style={{ marginTop: 10 }}>
              {smsCreating ? <Loader2 size={14} className="spin" /> : <MessageSquareText size={14} />}
              {t("saveDraftBtn")}
            </Button>
          </Panel>

          <Panel>
            <PanelHeader icon={MessageSquareText} title={t("campaignsTitle", { n: smsCampaigns.length })} />
            {smsCampaigns.length === 0 ? (
              <EmptyState icon={MessageSquareText} title={t("emptyCampaignsTitle")} body={t("emptyCampaignsBody")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {smsCampaigns.map((c) => (
                  <div key={c.id} className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>{c.name}</span>
                        <Chip cls={STATUS_CLS[c.status]}>{t(`campaignStatus_${c.status}`)}</Chip>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {c.status === "draft" && (
                          <Button sm variant="green" onClick={() => sendSmsCampaign(c.id)} disabled={smsBusyId === c.id}>
                            <Send size={13} /> {t("sendNowBtn")}
                          </Button>
                        )}
                        <Button sm onClick={() => removeSmsCampaign(c.id)} disabled={smsBusyId === c.id}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--cream2)", marginTop: 6 }}>{c.message}</p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                      <span>{t("recipients")}: {c.recipientCount}</span>
                      {c.status !== "draft" && (
                        <>
                          <span>{t("sent")}: {c.sentCount}</span>
                          <span>{t("queued")}: {c.queuedCount}</span>
                          {c.failedCount > 0 && <span style={{ color: "var(--danger-l)" }}>{t("failed")}: {c.failedCount}</span>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      {tab === "whatsapp" && (
        <>
          <KpiRow>
            <KpiCard index={0} icon={MessageCircle} label={t("kpiWaQueued")} value={waTotal} color="green" />
          </KpiRow>
          <Panel>
            <PanelHeader icon={MessageCircle} title={t("waListTitle")} />
            {waLoaded && waItems.length === 0 ? (
              <EmptyState icon={MessageCircle} title={t("emptyWaTitle")} body={t("emptyWaBody")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {waItems.map((item) => (
                  <div key={item.id} className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>{item.leadName || t("waUnknownLead")}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(item.at).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--cream2)", marginTop: 6 }}>{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </>
  );
}
