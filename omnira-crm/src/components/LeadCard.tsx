"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { Lead } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { SegmentChip, StatusChip } from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import { formatDT, formatDuration } from "@/lib/format";
import { resolveLeadName, resolveUserNameById } from "@/lib/resolve";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Calculator,
  CalendarClock,
  MapPinned,
  MoreHorizontal,
  Phone,
} from "@/lib/icons";

export default function LeadCard({ lead, index = 0 }: { lead: Lead; index?: number }) {
  const t = useTranslations("leadCard");
  const tUsers = useTranslations("users");
  const tDate = useTranslations("dateHelpers");
  const tFollowup = useTranslations("followupCadence");
  const locale = useLocale();
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const me = users.find((u) => u.id === currentUserId);
  const openModal = useUiStore((s) => s.openModal);

  const lastCall = lead.calls[lead.calls.length - 1];
  const closed = lead.status === "won" || lead.status === "archived";
  // eslint-disable-next-line react-hooks/purity -- wall-clock time is inherently impure; used only for a "recently transferred" badge
  const recentlyTransferred = lead.transferredFrom && lead.transferredAt && Date.now() - lead.transferredAt < 48 * 3600000;

  return (
    <motion.div
      className="lead-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
    >
      <div className="lc-top">
        <div>
          <div className="lc-name">{resolveLeadName(lead, locale)}</div>
          <div className="lc-meta">
            <SegmentChip segmentId={lead.segment} />
            <span className="lc-phone">{lead.phone}</span>
            {!closed && (
              <span className={`chip tier-${lead.followupTier ?? "cold"}`}>{tFollowup(`tier.${lead.followupTier ?? "cold"}`)}</span>
            )}
            {recentlyTransferred && (
              <span className="chip followup">
                <ArrowLeftRight size={11} strokeWidth={2} />
                {t("transferredBadge", { from: resolveUserNameById(lead.transferredFrom, users, tUsers) })}
              </span>
            )}
            {lead.status === "followup" && lead.followupEscalated && (
              <span className="chip" style={{ color: "var(--danger-l)", borderColor: "var(--danger)" }}>
                <AlertTriangle size={11} strokeWidth={2} />
                {t("escalatedBadge")}
              </span>
            )}
          </div>
        </div>
        <StatusChip status={lead.status} />
      </div>

      {lastCall && (
        <div className="lc-line">
          {t("lastCall", { dt: formatDT(lastCall.at, locale, tDate), dur: formatDuration(lastCall.durSec, locale) })}
        </div>
      )}
      {lead.status === "followup" && lead.followupDt && (
        <div className="lc-line" style={{ color: "var(--teal)" }}>{t("followupAt", { dt: formatDT(lead.followupDt, locale, tDate) })}</div>
      )}
      {lead.meeting && !lead.meeting.done && (
        <div className="lc-line" style={{ color: "var(--purple)" }}>
          {t("meetingAt", {
            dt: formatDT(lead.meeting.dt, locale, tDate),
            type: lead.meeting.type === "inperson" ? t("inperson") : t("online"),
          })}
        </div>
      )}

      <div className="lc-actions">
        {closed ? (
          <Button sm onClick={() => openModal({ type: "leadDetail", leadId: lead.id })}>
            <MoreHorizontal size={13} />
            {t("detailsBtn")}
          </Button>
        ) : (
          <>
            <Button sm variant="gold" onClick={() => openModal({ type: "call", leadId: lead.id })}>
              <Phone size={13} />
              {t("callBtn")}
            </Button>
            <Button sm onClick={() => openModal({ type: "visit", leadId: lead.id })}>
              <MapPinned size={13} />
              {t("visitBtn")}
            </Button>
            {me?.perms?.meetings && (
              <Button sm variant="blue" onClick={() => openModal({ type: "meeting", leadId: lead.id })}>
                <CalendarClock size={13} />
                {t("meetingBtn")}
              </Button>
            )}
            {me?.perms?.quote && (
              <Button sm onClick={() => openModal({ type: "quote", leadId: lead.id })}>
                <Calculator size={13} />
                {t("quoteBtn")}
              </Button>
            )}
            {me?.perms?.content && (
              <Button sm onClick={() => openModal({ type: "content", leadId: lead.id })}>
                <BookOpen size={13} />
                {t("contentBtn")}
              </Button>
            )}
            {me?.perms?.transfer && (
              <Button sm onClick={() => openModal({ type: "transfer", leadId: lead.id })}>
                <ArrowLeftRight size={13} />
                {t("transferBtn")}
              </Button>
            )}
            <Button sm onClick={() => openModal({ type: "leadDetail", leadId: lead.id })}>
              <MoreHorizontal size={13} />
              {t("detailsBtn")}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
