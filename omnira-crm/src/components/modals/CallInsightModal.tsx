"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ScoreGauge from "@/components/ui/ScoreGauge";
import { Chip, SegmentChip } from "@/components/ui/Chip";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { resolveCallInsightLeadName, resolveUserName } from "@/lib/resolve";
import { formatDT, formatDuration } from "@/lib/format";
import {
  Mic,
  Phone,
  Languages,
  Play,
  Pause,
  Sparkles,
  AlertTriangle,
  ListChecks,
  MessageSquareText,
  Loader2,
  Flame,
  SentimentIcon,
} from "@/lib/icons";

type Lang = "ar" | "en";

export default function CallInsightModal({ callId }: { callId: string }) {
  const t = useTranslations("callInsightModal");
  const tUsers = useTranslations("users");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const users = useAppStore((s) => s.users);
  const queueWhatsappFollowup = useAppStore((s) => s.queueWhatsappFollowup);
  const pushToast = useToastStore((s) => s.push);

  const call = useAppStore((s) => s.callInsights).find((c) => c.id === callId);
  const [lang, setLang] = useState<Lang>(locale === "ar" ? "ar" : "en");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (playing && call) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= call.durSec) {
            setPlaying(false);
            return call.durSec;
          }
          return e + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const bars = useMemo(() => {
    if (!call) return [];
    let seed = 0;
    for (let i = 0; i < call.id.length; i++) seed += call.id.charCodeAt(i) * (i + 1);
    return Array.from({ length: 46 }, (_, i) => {
      const h = 22 + Math.abs(Math.sin(i * 0.6 + seed * 0.01)) * 78;
      return Math.round(h);
    });
  }, [call]);

  if (!call) return null;
  const rep = users.find((u) => u.id === call.repId);
  const repName = resolveUserName(rep, tUsers);
  const progressPct = call.durSec ? elapsed / call.durSec : 0;
  const playedBars = Math.round(bars.length * progressPct);

  const sendFollowup = () => {
    if (!call.leadId) {
      pushToast("whatsappFollowupNoLead", undefined, "warn");
      return;
    }
    queueWhatsappFollowup(call.id, call.leadId, call.nextFollowup.recommendation.ar, call.nextFollowup.recommendation.en);
  };
  const togglePlay = () => {
    if (!playing && elapsed >= call.durSec) setElapsed(0);
    setPlaying((p) => !p);
  };

  return (
    <Modal title={resolveCallInsightLeadName(call, locale)} icon={<Mic size={18} strokeWidth={1.75} />} onClose={closeModal} xwide>
      <div className="call-detail-head">
        <span>{repName}</span>
        <span className="sep">·</span>
        <SegmentChip segmentId={call.segment} />
        <span className="sep">·</span>
        <span>{formatDT(call.at, locale, tDate)}</span>
        <span className="sep">·</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{call.leadPhone}</span>
        <span className="source-tag">
          <Phone size={10} strokeWidth={2} />
          {t("ziwoSource")}
        </span>
      </div>

      <div className="call-player">
        <button type="button" className="call-player-btn" onClick={togglePlay} aria-label="play">
          {playing ? <Pause size={16} strokeWidth={2} fill="currentColor" /> : <Play size={16} strokeWidth={2} fill="currentColor" />}
        </button>
        <div className={`waveform${playing ? " playing" : ""}`}>
          {bars.map((h, i) => (
            <span key={i} className={i < playedBars ? "played" : undefined} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="call-player-time">
          {formatDuration(elapsed, locale)} / {formatDuration(call.durSec, locale)}
        </div>
      </div>

      {call.status === "failed" ? (
        <div className="processing-block">
          <div className="processing-spin" style={{ animation: "none", background: "var(--danger-bg)", color: "var(--danger)" }}>
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--cream)", marginBottom: 6 }}>
            {t("failedTitle")}
          </h4>
          <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: "48ch", margin: "0 auto 8px" }}>
            {t("failedBody")}
          </p>
          {call.failureReason && (
            <p style={{ fontSize: 11, color: "var(--danger-l)", maxWidth: "48ch", margin: "0 auto", fontFamily: "monospace" }}>
              {call.failureReason}
            </p>
          )}
        </div>
      ) : call.status === "processing" ? (
        <div className="processing-block">
          <div className="processing-spin">
            <Loader2 size={22} strokeWidth={2} />
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--cream)", marginBottom: 6 }}>
            {t("processingTitle")}
          </h4>
          <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: "42ch", margin: "0 auto" }}>
            {t("processingBody")}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <SegmentedControl
              value={lang}
              onChange={setLang}
              options={[
                { value: "ar", label: t("langAr") },
                { value: "en", label: t("langEn") },
              ]}
            />
          </div>

          <div className="call-detail-grid">
            <div>
              <div className="panel-h" style={{ marginBottom: 12 }}>
                <h3>
                  <span className="pi">
                    <Languages size={16} strokeWidth={1.75} />
                  </span>
                  {t("transcriptTitle")}
                </h3>
              </div>
              {/* The real pipeline transcribes as one block (Whisper, no speaker
                  diarization, no per-line translation) — unlike the old mock
                  data's per-speaker bilingual bubbles, this is always shown as
                  recorded (original spoken language), regardless of the AR/EN
                  toggle above, which only affects the AI-generated fields. */}
              <p className="transcript-note">{t("transcriptOriginalNote")}</p>
              <div className="transcript-scroll">
                {call.transcriptText ? (
                  <p className="transcript-block">{call.transcriptText}</p>
                ) : (
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>{t("transcriptUnavailable")}</p>
                )}
              </div>
            </div>

            <div>
              <div className="panel-h" style={{ marginBottom: 12 }}>
                <h3>
                  <span className="pi">
                    <Sparkles size={16} strokeWidth={1.75} />
                  </span>
                  {t("aiSummaryTitle")}
                </h3>
              </div>

              <p className="ai-summary-text">{lang === "ar" ? call.summary.ar : call.summary.en}</p>

              <div className="ai-chip-row">
                <Chip cls={`sentiment-${call.sentiment}`}>
                  <SentimentIcon sentiment={call.sentiment} size={11} strokeWidth={2} />
                  {t(`sentiment.${call.sentiment}`)}
                </Chip>
                <Chip cls={`intent-${call.buyingIntent}`}>
                  <Flame size={11} strokeWidth={2} />
                  {t(`buyingIntent.${call.buyingIntent}`)}
                </Chip>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <ScoreGauge value={call.leadScore} caption={t("leadScoreCap")} />
                <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.6, flex: 1 }}>
                  {lang === "ar" ? call.intent.ar : call.intent.en}
                </p>
              </div>

              {call.objections.length > 0 && (
                <>
                  <div className="ai-section-label">{t("objectionsTitle")}</div>
                  <div className="ai-list" style={{ marginBottom: 16 }}>
                    {call.objections.map((o, i) => (
                      <div key={i} className="ai-list-item objection">
                        <AlertTriangle size={13} strokeWidth={2} />
                        <span>{lang === "ar" ? o.ar : o.en}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {call.actionItems.length > 0 && (
                <>
                  <div className="ai-section-label">{t("actionItemsTitle")}</div>
                  <div className="ai-list" style={{ marginBottom: 16 }}>
                    {call.actionItems.map((a, i) => (
                      <div key={i} className="ai-list-item action">
                        <ListChecks size={13} strokeWidth={2} />
                        <span>{lang === "ar" ? a.ar : a.en}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="followup-card">
                <div className="followup-card-head">
                  <MessageSquareText size={13} strokeWidth={2} />
                  {t("nextFollowupTitle")}
                </div>
                <p>{lang === "ar" ? call.nextFollowup.recommendation.ar : call.nextFollowup.recommendation.en}</p>
                <Button variant="green" sm onClick={sendFollowup} disabled={call.whatsappSent}>
                  <MessageSquareText size={13} strokeWidth={2} />
                  {call.whatsappSent ? t("followupSent") : t("sendFollowup")}
                </Button>
              </div>

              <div className="ai-notes-line">
                <Sparkles size={13} strokeWidth={2} />
                <span>{lang === "ar" ? call.aiNotes.ar : call.aiNotes.en}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
