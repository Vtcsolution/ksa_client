"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { CallInsightView } from "@/lib/supabase/callInsights";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveCallInsightLeadName, resolveUserName } from "@/lib/resolve";
import { formatDT, formatDuration, formatNumber } from "@/lib/format";
import { Chip } from "@/components/ui/Chip";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Flame, Loader2, SegmentIcon, SentimentIcon } from "@/lib/icons";

export default function CallInsightCard({ call, index = 0 }: { call: CallInsightView; index?: number }) {
  const t = useTranslations("callsPage");
  const tUsers = useTranslations("users");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();
  const users = useAppStore((s) => s.users);
  const openModal = useUiStore((s) => s.openModal);

  const rep = users.find((u) => u.id === call.repId);
  const repName = resolveUserName(rep, tUsers);
  const isProcessing = call.status === "processing";
  const isFailed = call.status === "failed";
  const scoreColor = call.leadScore >= 75 ? "var(--ok)" : call.leadScore >= 50 ? "var(--warn)" : "var(--danger)";

  return (
    <motion.button
      type="button"
      className={`call-card ${isFailed ? "failed" : isProcessing ? "processing" : `sentiment-${call.sentiment}`}`}
      style={{ textAlign: "start", width: "100%", cursor: "pointer" }}
      onClick={() => openModal({ type: "callInsight", callId: call.id })}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03, ease: "easeOut" }}
    >
      <div className="cc-top">
        <div className="cc-lead">
          <div className="cc-avatar">
            <SegmentIcon segmentId={call.segment} size={17} strokeWidth={1.75} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="cc-name">{resolveCallInsightLeadName(call, locale)}</div>
            <div className="cc-meta">
              <span>{repName}</span>
              <span>·</span>
              <span>{formatDT(call.at, locale, tDate)}</span>
              <span>·</span>
              <Clock size={10} strokeWidth={2} />
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatDuration(call.durSec, locale)}</span>
            </div>
          </div>
        </div>
        {isFailed ? (
          <Chip cls="failed">
            <AlertTriangle size={11} strokeWidth={2} />
            {t("statusFailed")}
          </Chip>
        ) : isProcessing ? (
          <Chip cls="processing">
            <Loader2 size={11} strokeWidth={2} />
            {t("statusProcessing")}
          </Chip>
        ) : (
          <Chip cls={`sentiment-${call.sentiment}`}>
            <SentimentIcon sentiment={call.sentiment} size={11} strokeWidth={2} />
            {t(`sentiment.${call.sentiment}`)}
          </Chip>
        )}
      </div>

      <p className="cc-intent">
        {isFailed ? t("failedHint") : isProcessing ? t("processingHint") : locale === "ar" ? call.intent.ar : call.intent.en}
      </p>

      <div className="cc-bottom">
        {!isProcessing && !isFailed && (
          <div className="cc-score">
            <span className="cc-score-label">{t("leadScoreLabel")}</span>
            <div className="prog" style={{ flex: 1, marginTop: 0 }}>
              <div className="bar" style={{ width: `${call.leadScore}%`, background: scoreColor }} />
            </div>
            <span className="cc-score-val">{formatNumber(call.leadScore, locale)}</span>
          </div>
        )}
        <div className="cc-actions">
          {!isProcessing && call.leadScore >= 75 && (
            <Chip cls="intent-high">
              <Flame size={11} strokeWidth={2} />
              {t("hotLead")}
            </Chip>
          )}
          <span className="row-chevron">
            {locale === "ar" ? <ChevronLeft size={15} strokeWidth={2} /> : <ChevronRight size={15} strokeWidth={2} />}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
