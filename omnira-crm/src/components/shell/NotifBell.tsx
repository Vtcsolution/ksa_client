"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatDT } from "@/lib/format";
import { resolveLeadName, resolveUserNameById } from "@/lib/resolve";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  CalendarClock,
  MessageSquareText,
  Phone,
  RefreshCw,
  Sparkles,
  Zap,
  type LucideIcon,
} from "@/lib/icons";

interface Entry {
  id?: string;
  dt: number;
  leadId: string | null;
  navigateTo?: string;
  urgent: boolean;
  icon: LucideIcon;
  text: string;
  onOpen?: () => void;
}

export default function NotifBell() {
  const t = useTranslations("notif");
  const tUsers = useTranslations("users");
  const tDate = useTranslations("dateHelpers");
  const tSentiment = useTranslations("callInsightModal.sentiment");
  const tTier = useTranslations("followupCadence");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const leads = useAppStore((s) => s.leads);
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const me = users.find((u) => u.id === currentUserId);
  const isMgr = me?.role === "manager";
  const openModal = useUiStore((s) => s.openModal);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const entries = useMemo<Entry[]>(() => {
    if (!me) return [];
    // eslint-disable-next-line react-hooks/purity -- wall-clock time is inherently impure; recomputed on the tick interval below
    const now = Date.now();
    const out: Entry[] = [];

    for (const l of leads) {
      if (
        l.meeting &&
        l.meeting.dt &&
        l.status === "meeting" &&
        !l.meeting.done &&
        !l.meeting.missed &&
        (isMgr || l.assignedTo === me.id)
      ) {
        const time = new Date(l.meeting.dt).getTime();
        const diff = time - now;
        const dtStr = formatDT(l.meeting.dt, locale, tDate);
        if (diff < -6 * 3600000) {
          // too stale for the bell
        } else if (diff < 0) {
          out.push({ dt: time, leadId: l.id, urgent: true, icon: AlertCircle, text: t("meetingOverdue", { name: resolveLeadName(l, locale), dt: dtStr }) });
        } else if (diff <= 3600000) {
          out.push({ dt: time, leadId: l.id, urgent: true, icon: Zap, text: t("meetingSoon", { name: resolveLeadName(l, locale), dt: dtStr }) });
        } else if (diff <= 24 * 3600000) {
          out.push({
            dt: time,
            leadId: l.id,
            urgent: false,
            icon: CalendarClock,
            text: t(l.meeting.type === "inperson" ? "meetingUpcomingInperson" : "meetingUpcomingOnline", {
              name: resolveLeadName(l, locale),
              dt: dtStr,
            }),
          });
        }
      }
    }

    if (!isMgr && me) {
      for (const l of leads) {
        if (
          l.transferredFrom &&
          l.assignedTo === me.id &&
          l.status !== "won" &&
          l.status !== "archived" &&
          l.transferredAt &&
          now - l.transferredAt < 48 * 3600000
        ) {
          out.push({
            dt: l.transferredAt,
            leadId: l.id,
            urgent: false,
            icon: ArrowLeftRight,
            text: t("transferred", { from: resolveUserNameById(l.transferredFrom, users, tUsers), name: resolveLeadName(l, locale) }),
          });
        }
      }
    }

    for (const l of leads) {
      if (l.followupDt && l.status !== "won" && l.status !== "archived" && (isMgr || l.assignedTo === me.id)) {
        const time = new Date(l.followupDt).getTime();
        const diff = time - now;
        const dtStr = formatDT(l.followupDt, locale, tDate);
        if (diff < -6 * 3600000) continue;
        if (diff < 0) {
          out.push({ dt: time, leadId: l.id, urgent: true, icon: AlertCircle, text: t("followupOverdue", { name: resolveLeadName(l, locale), dt: dtStr }) });
        } else if (diff <= 3600000) {
          out.push({ dt: time, leadId: l.id, urgent: true, icon: RefreshCw, text: t("followupSoon", { name: resolveLeadName(l, locale), dt: dtStr }) });
        } else if (diff <= 24 * 3600000) {
          out.push({ dt: time, leadId: l.id, urgent: false, icon: Bell, text: t("followupUpcoming", { name: resolveLeadName(l, locale), dt: dtStr }) });
        }
      }
    }

    for (const n of notifications) {
      if (n.read) continue;
      if (n.kind === "ziwoCallAnalyzed") {
        const sentimentKey = String(n.params.sentiment ?? "");
        const sentiment = ["positive", "neutral", "negative"].includes(sentimentKey) ? tSentiment(sentimentKey) : sentimentKey;
        out.push({
          id: n.id,
          dt: n.at,
          leadId: n.leadId,
          urgent: n.urgent,
          icon: Sparkles,
          text: t("ziwoCallAnalyzed", { score: Number(n.params.leadScore ?? 0), sentiment }),
          onOpen: () => markNotificationRead(n.id),
        });
      } else if (n.kind === "ziwoLeadCreated") {
        out.push({
          id: n.id,
          dt: n.at,
          leadId: n.leadId,
          urgent: n.urgent,
          icon: Phone,
          text: t("ziwoLeadCreated", { phone: String(n.params.phone ?? "") }),
          onOpen: () => markNotificationRead(n.id),
        });
      } else if (n.kind === "websiteFeedbackAlert") {
        out.push({
          id: n.id,
          dt: n.at,
          leadId: null,
          navigateTo: "/feedback",
          urgent: n.urgent,
          icon: MessageSquareText,
          text: t("websiteFeedbackAlert", { name: String(n.params.name ?? ""), pct: Number(n.params.severityPct ?? 0) }),
          onOpen: () => markNotificationRead(n.id),
        });
      } else if (n.kind === "followupEscalated") {
        const lead = leads.find((l) => l.id === n.leadId);
        out.push({
          id: n.id,
          dt: n.at,
          leadId: n.leadId,
          urgent: n.urgent,
          icon: AlertTriangle,
          text: t("followupEscalated", { name: lead ? resolveLeadName(lead, locale) : "", hours: Number(n.params.hoursOverdue ?? 0) }),
          onOpen: () => markNotificationRead(n.id),
        });
      } else if (n.kind === "urgentLeadFollowup") {
        const lead = leads.find((l) => l.id === n.leadId);
        out.push({
          id: n.id,
          dt: n.at,
          leadId: n.leadId,
          urgent: n.urgent,
          icon: AlertTriangle,
          text: t("urgentLeadFollowup", { name: lead ? resolveLeadName(lead, locale) : "", score: Number(n.params.leadScore ?? 0) }),
          onOpen: () => markNotificationRead(n.id),
        });
      } else if (n.kind === "websiteLeadCreated") {
        out.push({
          id: n.id,
          dt: n.at,
          leadId: n.leadId,
          urgent: n.urgent,
          icon: Phone,
          text: t("websiteLeadCreated", { name: String(n.params.name ?? "") }),
          onOpen: () => markNotificationRead(n.id),
        });
      } else if (n.kind === "followupCadenceExhausted") {
        const lead = leads.find((l) => l.id === n.leadId);
        const tierKey = String(n.params.tier ?? "cold");
        out.push({
          id: n.id,
          dt: n.at,
          leadId: n.leadId,
          urgent: n.urgent,
          icon: AlertTriangle,
          text: t("followupCadenceExhausted", { name: lead ? resolveLeadName(lead, locale) : "", tier: tTier(`tier.${tierKey}`) }),
          onOpen: () => markNotificationRead(n.id),
        });
      }
    }

    out.sort((a, b) => a.dt - b.dt);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, users, me?.id, isMgr, locale, tick, notifications]);

  const urgentCount = entries.filter((e) => e.urgent).length;

  return (
    <div className="notif-wrap">
      <button type="button" className="notif-btn" onClick={() => setOpen((o) => !o)} aria-label="notifications">
        <Bell size={16} strokeWidth={1.9} />
        {entries.length > 0 && (
          <span
            className="nbadge"
            style={!urgentCount ? { background: "var(--gold-d)" } : undefined}
          >
            {entries.length}
          </span>
        )}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="np-h">{t("title")}</div>
          {entries.length === 0 ? (
            <div className="notif-empty">{t("empty")}</div>
          ) : (
            entries.map((e, i) => {
              const IconCmp = e.icon;
              return (
                <button
                  key={e.id ?? i}
                  type="button"
                  className={`notif-item ${e.urgent ? "urgent" : ""}`}
                  onClick={() => {
                    e.onOpen?.();
                    if (e.leadId) openModal({ type: "leadDetail", leadId: e.leadId });
                    else if (e.navigateTo) router.push(e.navigateTo);
                    setOpen(false);
                  }}
                >
                  <span className="ni-i">
                    <IconCmp size={15} strokeWidth={1.9} />
                  </span>
                  <span className="ni-t">{e.text}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
