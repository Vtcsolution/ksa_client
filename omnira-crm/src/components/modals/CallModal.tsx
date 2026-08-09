"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Opt, OptGrid, TextInput, Textarea } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { QUICK_KEYS, REJECT_REASON_KEYS } from "@/lib/constants";
import { formatDuration, formatDT, quickDT } from "@/lib/format";
import { resolveLeadName } from "@/lib/resolve";
import type { CallAnswered } from "@/lib/types";
import { Phone, CheckCircle2, PhoneMissed, Clock, Handshake, Video, Bell, Archive } from "@/lib/icons";

type Outcome = "inperson" | "online" | "followup" | "reject" | null;

export default function CallModal({ leadId }: { leadId: string }) {
  const t = useTranslations("callModal");
  const tCommon = useTranslations("common");
  const tQuicks = useTranslations("quicks");
  const tDate = useTranslations("dateHelpers");
  const tReject = useTranslations("reasons.reject");
  const tLeadDetail = useTranslations("leadDetail");
  const tMeeting = useTranslations("meetingModal");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const currentUserId = useAppStore((s) => s.currentUserId);
  const recordCall = useAppStore((s) => s.recordCall);
  const pushToast = useToastStore((s) => s.push);

  const [step, setStep] = useState(1);
  const [durSec, setDurSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [answered, setAnswered] = useState<CallAnswered | null>(null);
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [meetingDt, setMeetingDt] = useState("");
  const [followupDt, setFollowupDt] = useState("");
  const [rejectReasonKey, setRejectReasonKey] = useState<string | null>(null);
  const [customReject, setCustomReject] = useState("");
  const [retryDt, setRetryDt] = useState("");
  const [askCancel, setAskCancel] = useState(false);
  const [cancelExisting, setCancelExisting] = useState<boolean | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setDurSec((d) => d + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  if (!lead || !currentUserId) return null;

  const hasActiveMeeting = !!(lead.meeting && !lead.meeting.done && !lead.meeting.missed);
  const attemptN = lead.calls.length + 1;

  const goStep2 = () => {
    if (!answered) {
      pushToast("markCallResultFirst", undefined, "warn");
      return;
    }
    setRunning(false);
    setStep(2);
  };

  const pickFollowup = () => {
    if (hasActiveMeeting) {
      setAskCancel(true);
      setCancelExisting(null);
    }
    setOutcome("followup");
  };

  const finish = () => {
    if (!answered) return;
    if (answered !== "answered") {
      if (!retryDt) {
        pushToast("setRetryDate", undefined, "warn");
        return;
      }
      recordCall(leadId, currentUserId, { answered, durSec, note, retryDt });
      closeModal();
      return;
    }
    if (!outcome) {
      pushToast("setOutcome", undefined, "warn");
      return;
    }
    if (outcome === "inperson" || outcome === "online") {
      if (!meetingDt) {
        pushToast("setDateAgreeNow", undefined, "warn");
        return;
      }
      recordCall(leadId, currentUserId, { answered, durSec, note, outcome, meetingDt });
      closeModal();
      return;
    }
    if (outcome === "followup") {
      if (hasActiveMeeting && cancelExisting === null) {
        setAskCancel(true);
        return;
      }
      if (!followupDt) {
        pushToast("setDateAskWhen", undefined, "warn");
        return;
      }
      recordCall(leadId, currentUserId, {
        answered,
        durSec,
        note,
        outcome,
        followupDt,
        cancelExistingMeeting: !!cancelExisting,
      });
      closeModal();
      return;
    }
    if (outcome === "reject") {
      if (!rejectReasonKey) {
        pushToast("chooseRejectReason", undefined, "warn");
        return;
      }
      const finalKey = rejectReasonKey === "custom" ? `custom:${customReject}` : rejectReasonKey;
      recordCall(leadId, currentUserId, { answered, durSec, note, outcome, rejectReasonKey: finalKey });
      closeModal();
    }
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<Phone size={18} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        step === 1 ? (
          <>
            <Button variant="gold" onClick={goStep2}>
              {tCommon("nextArrow")}
            </Button>
            <Button onClick={closeModal}>{tCommon("cancel")}</Button>
          </>
        ) : (
          <>
            <Button variant="gold" onClick={finish}>
              {tCommon("saveAndFinish")}
            </Button>
            <Button onClick={() => setStep(1)}>{tCommon("backArrow")}</Button>
          </>
        )
      }
    >
      {step === 1 && (
        <>
          <p style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
            {lead.phone}
          </p>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 46,
                fontWeight: 700,
                color: "var(--gold-l)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatDuration(durSec, locale)}
            </div>
            <Button variant={running ? "danger" : "green"} onClick={() => setRunning((r) => !r)} style={{ marginTop: 8 }}>
              {running ? t("endTimer") : t("startCall")}
            </Button>
          </div>
          <Frow>
            <OptGrid columns={3}>
              <Opt selected={answered === "answered"} onClick={() => setAnswered("answered")} icon={<CheckCircle2 size={17} strokeWidth={1.75} />}>
                {t("answered")}
              </Opt>
              <Opt selected={answered === "noanswer"} onClick={() => setAnswered("noanswer")} icon={<PhoneMissed size={17} strokeWidth={1.75} />}>
                {t("noAnswer")}
              </Opt>
              <Opt selected={answered === "busy"} onClick={() => setAnswered("busy")} icon={<Clock size={17} strokeWidth={1.75} />}>
                {t("busy")}
              </Opt>
            </OptGrid>
            <div className="hintline">{t("resultHint")}</div>
          </Frow>
          <Frow>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notesPlaceholder")} />
          </Frow>
        </>
      )}

      {step === 2 && answered === "answered" && (
        <>
          <div className="script-hint" style={{ background: "var(--ok-bg)", borderColor: "rgba(123,166,123,.3)" }}>
            {t("answeredBanner", { dur: formatDuration(durSec, locale) })}
          </div>
          <div className="script-hint">{t("scriptHint")}</div>

          {!askCancel && (
            <div className="ladder">
              <button
                type="button"
                className={`lad l1 ${outcome === "inperson" ? "sel" : ""}`}
                onClick={() => setOutcome("inperson")}
              >
                <span className="li"><Handshake size={20} strokeWidth={1.75} /></span>
                <span className="lt">
                  <b>{t("ladder.l1Title")}</b>
                  <span>{t("ladder.l1Sub")}</span>
                </span>
                <span className="lrank">{t("ladder.l1Rank")}</span>
              </button>
              <button
                type="button"
                className={`lad l2 ${outcome === "online" ? "sel" : ""}`}
                onClick={() => setOutcome("online")}
              >
                <span className="li"><Video size={20} strokeWidth={1.75} /></span>
                <span className="lt">
                  <b>{t("ladder.l2Title")}</b>
                  <span>{t("ladder.l2Sub")}</span>
                </span>
                <span className="lrank">{t("ladder.l2Rank")}</span>
              </button>
              <button type="button" className={`lad l3 ${outcome === "followup" ? "sel" : ""}`} onClick={pickFollowup}>
                <span className="li"><Bell size={20} strokeWidth={1.75} /></span>
                <span className="lt">
                  <b>{t("ladder.l3Title")}</b>
                  <span>{t("ladder.l3Sub")}</span>
                </span>
                <span className="lrank">{t("ladder.l3Rank")}</span>
              </button>
              <button
                type="button"
                className={`lad l4 ${outcome === "reject" ? "sel" : ""}`}
                onClick={() => setOutcome("reject")}
              >
                <span className="li"><Archive size={20} strokeWidth={1.75} /></span>
                <span className="lt">
                  <b>{t("ladder.l4Title")}</b>
                  <span>{t("ladder.l4Sub")}</span>
                </span>
                <span className="lrank">{t("ladder.l4Rank")}</span>
              </button>
            </div>
          )}

          {askCancel && (
            <div className="panel" style={{ background: "var(--bg2)" }}>
              <p style={{ fontSize: 12, color: "var(--cream2)", marginBottom: 12 }}>
                {tLeadDetail("meetingConflictWarning", { dt: formatDT(lead.meeting!.dt, locale, tDate) })}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Button
                  variant="danger"
                  onClick={() => {
                    setCancelExisting(true);
                    setAskCancel(false);
                  }}
                >
                  {tLeadDetail("cancelMeetingKeepFollowup")}
                </Button>
                <Button
                  variant="blue"
                  onClick={() => {
                    setCancelExisting(false);
                    setAskCancel(false);
                  }}
                >
                  {tLeadDetail("keepMeetingAndFollowup")}
                </Button>
                <Button
                  onClick={() => {
                    setAskCancel(false);
                    setOutcome(null);
                  }}
                >
                  {tCommon("back")}
                </Button>
              </div>
            </div>
          )}

          {(outcome === "inperson" || outcome === "online") && (
            <Frow label={tMeeting("dateLabel")}>
              <input type="datetime-local" value={meetingDt} onChange={(e) => setMeetingDt(e.target.value)} />
            </Frow>
          )}

          {outcome === "followup" && !askCancel && (
            <Frow label={t("whenContact")}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {QUICK_KEYS.map((k) => (
                  <Button key={k} sm onClick={() => setFollowupDt(quickDT(k))}>
                    {tQuicks(k)}
                  </Button>
                ))}
              </div>
              <input type="datetime-local" value={followupDt} onChange={(e) => setFollowupDt(e.target.value)} />
            </Frow>
          )}

          {outcome === "reject" && (
            <Frow>
              <OptGrid columns={1}>
                {REJECT_REASON_KEYS.map((k) => (
                  <Opt key={k} selected={rejectReasonKey === k} onClick={() => setRejectReasonKey(k)}>
                    {tReject(k)}
                  </Opt>
                ))}
                <Opt selected={rejectReasonKey === "custom"} onClick={() => setRejectReasonKey("custom")}>
                  {tCommon("otherReason")}
                </Opt>
              </OptGrid>
              {rejectReasonKey === "custom" && (
                <TextInput
                  value={customReject}
                  onChange={(e) => setCustomReject(e.target.value)}
                  placeholder={tCommon("writeReasonPlaceholder")}
                  style={{ marginTop: 8 }}
                />
              )}
            </Frow>
          )}
        </>
      )}

      {step === 2 && answered && answered !== "answered" && (
        <>
          <div className="script-hint" style={{ background: "var(--warn-bg)", borderColor: "rgba(212,162,78,.3)" }}>
            {t("attemptNumber", { n: attemptN })}
          </div>
          <Frow label={t("retryPrompt")}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {QUICK_KEYS.map((k) => (
                <Button key={k} sm onClick={() => setRetryDt(quickDT(k))}>
                  {tQuicks(k)}
                </Button>
              ))}
            </div>
            <input type="datetime-local" value={retryDt} onChange={(e) => setRetryDt(e.target.value)} />
          </Frow>
        </>
      )}
    </Modal>
  );
}
