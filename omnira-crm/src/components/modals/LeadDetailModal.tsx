"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { PanelHeader } from "@/components/ui/Panel";
import { Chip, StatusChip } from "@/components/ui/Chip";
import { Frow, Frow2, Opt, OptGrid, Select, TextInput, Textarea } from "@/components/ui/Form";
import ProofThumbs, { ProofTile } from "@/components/ui/ProofThumbs";
import Timeline from "@/components/ui/Timeline";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { ACCEPT_REASON_KEYS, MISSED_REASON_KEYS, QUICK_KEYS, REJECT_REASON_KEYS } from "@/lib/constants";
import { formatDT, formatDuration, formatNumber, quickDT } from "@/lib/format";
import { resolveDecisionMakerName, resolveLeadName, resolveReason, resolveSegmentNameById } from "@/lib/resolve";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  CalendarClock,
  Camera,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  History,
  IdCard,
  MapPin,
  MapPinned,
  Pencil,
  Phone,
  Quote,
  Sparkles,
  Trash2,
  X,
  MeetingTypeIcon,
  SegmentIcon,
  SourceIcon,
} from "@/lib/icons";

type ResultFlow = "won" | "reject" | "followup" | null;

interface SimilarTestimonial {
  id: string;
  name: string;
  role?: string;
  quote: string;
  ai?: { whyAr: string; whyEn: string; stage: "cold" | "warm" | "hot" };
}

export default function LeadDetailModal({ leadId }: { leadId: string }) {
  const t = useTranslations("leadDetail");
  const tCommon = useTranslations("common");
  const tSegments = useTranslations("segments");
  const tAccept = useTranslations("reasons.accept");
  const tReject = useTranslations("reasons.reject");
  const tMissed = useTranslations("reasons.missed");
  const tQuicks = useTranslations("quicks");
  const tDate = useTranslations("dateHelpers");
  const tLeadCard = useTranslations("leadCard");
  const tSentiment = useTranslations("callsPage.sentiment");
  const tFollowup = useTranslations("followupCadence");
  const locale = useLocale();

  const closeModal = useUiStore((s) => s.closeModal);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useToastStore((s) => s.push);

  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const segments = useAppStore((s) => s.segments);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const me = users.find((u) => u.id === currentUserId);
  const isMgr = me?.role === "manager";

  const updateLeadCore = useAppStore((s) => s.updateLeadCore);
  const deleteLead = useAppStore((s) => s.deleteLead);
  const setResultWon = useAppStore((s) => s.setResultWon);
  const setResultArchived = useAppStore((s) => s.setResultArchived);
  const setFollowup = useAppStore((s) => s.setFollowup);
  const markMeetingDone = useAppStore((s) => s.markMeetingDone);
  const markMeetingMissed = useAppStore((s) => s.markMeetingMissed);
  const restartFollowupCadence = useAppStore((s) => s.restartFollowupCadence);
  const setReferredByCode = useAppStore((s) => s.setReferredByCode);

  const [resultFlow, setResultFlow] = useState<ResultFlow>(null);
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [missedPicker, setMissedPicker] = useState(false);
  const [proofCaptured, setProofCaptured] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState("");

  const [editName, setEditName] = useState(lead?.name ?? "");
  const [editPhone, setEditPhone] = useState(lead?.phone ?? "");
  const [editEmail, setEditEmail] = useState(lead?.email ?? "");
  const [editSegment, setEditSegment] = useState(lead?.segment ?? "");
  const [editLocation, setEditLocation] = useState(lead?.location ?? "");
  const [editReferredByCode, setEditReferredByCode] = useState(lead?.referredByCode ?? "");

  const [winReasonKey, setWinReasonKey] = useState<string>(ACCEPT_REASON_KEYS[0]);
  const [winCustom, setWinCustom] = useState("");
  const [months, setMonths] = useState(12);
  const [monthly, setMonthly] = useState(0);

  const [rejectReasonKey, setRejectReasonKey] = useState<string | null>(null);
  const [rejectCustom, setRejectCustom] = useState("");

  const [followupDt, setFollowupDtState] = useState("");
  const [followupAskCancel, setFollowupAskCancel] = useState(false);

  const [testimonials, setTestimonials] = useState<SimilarTestimonial[]>([]);
  useEffect(() => {
    if (!lead?.segment) return;
    let cancelled = false;
    fetch(`/api/testimonials?segment=${encodeURIComponent(lead.segment)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.ok) setTestimonials((data.testimonials ?? []).slice(0, 2));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lead?.segment]);

  const [missedReasonKey, setMissedReasonKey] = useState<string | null>(null);
  const [rescheduleDt, setRescheduleDt] = useState("");

  if (!lead || !me) return null;

  const segment = segments.find((s) => s.id === lead.segment);
  const canAct = !isMgr && lead.assignedTo === me.id && lead.status !== "won" && lead.status !== "archived";
  const hasActiveMeeting = !!(lead.meeting && !lead.meeting.done && !lead.meeting.missed);
  const lastCall = lead.calls[lead.calls.length - 1];

  const openAction = (type: "call" | "visit" | "meeting" | "transfer" | "content" | "fixData") =>
    openModal({ type, leadId });

  const saveEdit = () => {
    if (!editName.trim() || !editPhone.trim()) {
      pushToast("enterNameAndPhone", undefined, "warn");
      return;
    }
    updateLeadCore(leadId, { name: editName, phone: editPhone, email: editEmail, segment: editSegment, location: editLocation });
    if (editReferredByCode.trim().toUpperCase() !== (lead?.referredByCode ?? "")) {
      setReferredByCode(leadId, editReferredByCode);
    }
    setEditing(false);
  };

  const confirmWin = () => {
    if (!monthly || monthly <= 0) {
      pushToast("enterAgreedPrice", undefined, "warn");
      return;
    }
    const reasonKey = winReasonKey === "custom" ? `custom:${winCustom}` : winReasonKey;
    setResultWon(leadId, me.id, { reasonKey, months, monthly });
    setResultFlow(null);
  };

  const confirmReject = () => {
    if (!rejectReasonKey) {
      pushToast("chooseRejectReason", undefined, "warn");
      return;
    }
    const finalKey = rejectReasonKey === "custom" ? `custom:${rejectCustom}` : rejectReasonKey;
    setResultArchived(leadId, me.id, finalKey);
    setResultFlow(null);
  };

  const confirmFollowup = (cancelMeeting: boolean) => {
    if (!followupDt) {
      pushToast("setDateFromCalendar", undefined, "warn");
      return;
    }
    setFollowup(leadId, me.id, followupDt, cancelMeeting);
    setResultFlow(null);
    setFollowupAskCancel(false);
  };

  const meetingDoneTiles: ProofTile[] = [
    { key: "photo", icon: Camera, label: t("proofRequired"), state: proofCaptured ? "filled" : "empty" },
  ];

  const confirmMeetingMissed = () => {
    if (!missedReasonKey) {
      pushToast("chooseMissedReason", undefined, "warn");
      return;
    }
    if (missedReasonKey === "postponed") {
      if (!rescheduleDt) {
        pushToast("setNewApptFromCalendar", undefined, "warn");
        return;
      }
      markMeetingMissed(leadId, me.id, missedReasonKey, rescheduleDt);
    } else {
      markMeetingMissed(leadId, me.id, missedReasonKey);
    }
    setMissedPicker(false);
    setMissedReasonKey(null);
    setRescheduleDt("");
  };

  return (
    <Modal title={resolveLeadName(lead, locale)} icon={<SegmentIcon segmentId={lead.segment} size={17} strokeWidth={1.75} />} onClose={closeModal} wide
      footer={
        canAct && !resultFlow && !editing && !deleteConfirm ? (
          <>
            <Button variant="green" onClick={() => setResultFlow("won")}>
              <CheckCircle2 size={13} />
              {t("resultWon")}
            </Button>
            <Button variant="blue" onClick={() => setResultFlow("followup")}>
              <CalendarClock size={13} />
              {t("resultFollowup")}
            </Button>
            <Button variant="danger" onClick={() => setResultFlow("reject")}>
              <X size={13} />
              {t("resultArchive")}
            </Button>
          </>
        ) : undefined
      }
    >
      {/* info grid */}
      <div className="lead-info-grid">
        <div className="lead-info-cell">
          <span className="lic-i"><Phone size={15} strokeWidth={1.75} /></span>
          <div className="lic-t">
            <div className="lic-l">{t("phone")}</div>
            <div className="lic-v">{lead.phone}</div>
          </div>
        </div>
        <div className="lead-info-cell">
          <span className="lic-i">{segment && <SegmentIcon segmentId={segment.id} size={15} strokeWidth={1.75} />}</span>
          <div className="lic-t">
            <div className="lic-l">{t("segment")}</div>
            <div className="lic-v">{segment && resolveSegmentNameById(segment.id, segments, tSegments)}</div>
          </div>
        </div>
        <div className="lead-info-cell">
          <span className="lic-i"><AlertCircle size={15} strokeWidth={1.75} /></span>
          <div className="lic-t">
            <div className="lic-l">{t("status")}</div>
            <div className="lic-v"><StatusChip status={lead.status} /></div>
          </div>
        </div>
        <div className="lead-info-cell">
          <span className="lic-i"><SourceIcon source={lead.source} size={15} strokeWidth={1.75} /></span>
          <div className="lic-t">
            <div className="lic-l">{t("source")}</div>
            <div className="lic-v">
              {lead.source === "field" ? t("fromField") : lead.source === "ziwo" ? t("fromZiwo") : t("fromExcel")}
            </div>
          </div>
        </div>
      </div>

      {lead.referralCode && (
        <div className="lead-info-cell" style={{ marginBottom: 14, borderColor: "var(--gold-d)" }}>
          <span className="lic-i"><Gift size={15} strokeWidth={1.75} /></span>
          <div className="lic-t" style={{ flex: 1 }}>
            <div className="lic-l">{t("referralCode")}</div>
            <div className="lic-v" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "monospace", letterSpacing: 0.5 }}>{lead.referralCode}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(lead.referralCode!);
                  pushToast("copiedToClipboard", undefined, "ok");
                }}
                style={{ display: "flex", color: "var(--gold-l)" }}
                aria-label="copy"
              >
                <Copy size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* annotation chips */}
      <div className="lead-meta-chips">
        {lead.status !== "won" && lead.status !== "archived" && (
          <Chip cls={`tier-${lead.followupTier ?? "cold"}`}>{tFollowup(`tier.${lead.followupTier ?? "cold"}`)}</Chip>
        )}
        {lead.status === "followup" && lead.followupEscalated && (
          <Chip cls="archived">
            <AlertTriangle size={11} strokeWidth={2} />
            {t("escalatedChip")}
          </Chip>
        )}
        {lead.calls.length > 0 && lastCall && (
          <Chip cls="new">{t("callsChip", { n: formatNumber(lead.calls.length, locale), dur: formatDuration(lastCall.durSec, locale) })}</Chip>
        )}
        {lead.visit && <Chip cls={lead.visit.verified ? "verified" : "review"}>{lead.visit.verified ? t("visitVerified") : t("visitReview")}</Chip>}
        {lead.meeting && !lead.meeting.done && (
          <Chip cls={lead.meeting.type}>
            <MeetingTypeIcon type={lead.meeting.type} size={11} strokeWidth={2} />
            {t("meetingChip", { type: tLeadCard(lead.meeting.type), dt: formatDT(lead.meeting.dt, locale, tDate) })}
          </Chip>
        )}
        {lead.decisionMaker && <Chip cls="seg">{t("decisionMakerChip", { name: resolveDecisionMakerName(lead.decisionMaker, locale) })}</Chip>}
        {lead.meeting?.done && <Chip cls="verified">{lead.meeting.proof ? t("meetingDoneProofChip") : t("meetingDoneChip")}</Chip>}
        {lead.meeting?.missed && lead.meeting.missedReasonKey && (
          <Chip cls="archived">{t("meetingMissedChip", { reason: resolveReason(lead.meeting.missedReasonKey, tMissed) })}</Chip>
        )}
        {!!lead.mtgPostponed && <Chip cls="followup">{t("postponedChip", { n: formatNumber(lead.mtgPostponed, locale) })}</Chip>}
        {!!lead.phoneEdits && <Chip cls="review">{t("phoneEditsChip", { n: formatNumber(lead.phoneEdits, locale) })}</Chip>}
        {lead.discount && <Chip cls="review">{t("discountChip", { given: formatNumber(lead.discount.given, locale), official: formatNumber(lead.discount.official, locale) })}</Chip>}
        {lead.contract && (
          <>
            <Chip cls="won">{t("contractChip", { monthly: formatNumber(lead.contract.monthly, locale), months: formatNumber(lead.contract.months, locale), total: formatNumber(lead.contract.total, locale) })}</Chip>
            <Chip cls="seg">{lead.contract.via === "meeting" ? t("contractViaMeeting") : t("contractViaDirect")}</Chip>
          </>
        )}
        {lead.pendingQuote && (
          <Chip cls={lead.pendingQuote.status === "approved" ? "verified" : lead.pendingQuote.status === "rejected" ? "archived" : "review"}>
            {lead.pendingQuote.status === "approved" ? t("quoteApproved") : lead.pendingQuote.status === "rejected" ? t("quoteRejected") : t("quotePending")}
          </Chip>
        )}
        {lead.resultReasonKey && lead.status === "archived" && (
          <Chip cls="archived">{resolveReason(lead.resultReasonKey, tReject)}</Chip>
        )}
        {lead.resultReasonKey && lead.status === "won" && (
          <Chip cls="won">{resolveReason(lead.resultReasonKey, tAccept)}</Chip>
        )}
        {lead.location && (
          <a href={lead.location} target="_blank" rel="noreferrer" className="chip seg" style={{ textDecoration: "none" }}>
            <MapPin size={11} strokeWidth={2} />
            {t("locationChip")}
            <ExternalLink size={10} strokeWidth={2} />
          </a>
        )}
      </div>

      {testimonials.length > 0 && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gold-l)", marginBottom: 8 }}>
            <Sparkles size={13} strokeWidth={1.9} />
            {t("similarTestimonials")}
          </div>
          {testimonials.map((ts) => (
            <div key={ts.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", gap: 6, fontSize: 12, color: "var(--cream2)", lineHeight: 1.6 }}>
                <Quote size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2, color: "var(--gold-d)" }} />
                <span>{ts.quote}</span>
              </div>
              {ts.ai && (
                <div style={{ fontSize: 11, color: "var(--gold-d)", marginTop: 4 }}>{locale === "ar" ? ts.ai.whyAr : ts.ai.whyEn}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  {ts.name}
                  {ts.role ? ` · ${ts.role}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ts.quote);
                    pushToast("copiedToClipboard", undefined, "ok");
                  }}
                  style={{ display: "flex", color: "var(--gold-l)" }}
                  aria-label="copy"
                >
                  <Copy size={12} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lead.meeting?.summaryAr && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gold-l)", marginBottom: 8 }}>
            <Sparkles size={13} strokeWidth={1.9} />
            {t("meetingSummaryTitle")}
            {lead.meeting.sentiment && (
              <Chip cls={lead.meeting.sentiment === "positive" ? "verified" : lead.meeting.sentiment === "negative" ? "archived" : "seg"}>
                {tSentiment(lead.meeting.sentiment)}
              </Chip>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.6 }}>{locale === "ar" ? lead.meeting.summaryAr : lead.meeting.summaryEn}</p>
          {lead.meeting.nextStepsAr && (
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              {t("nextStepsLabel")}: {locale === "ar" ? lead.meeting.nextStepsAr : lead.meeting.nextStepsEn}
            </p>
          )}
        </div>
      )}

      {lead.followupDormant && (
        <div className="panel" style={{ marginBottom: 14, borderColor: "var(--muted)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cream2)", marginBottom: 2 }}>{tFollowup("dormantTitle")}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{tFollowup("dormantBody")}</div>
            </div>
            <Button sm variant="gold" onClick={() => restartFollowupCadence(leadId)}>
              {tFollowup("restartBtn")}
            </Button>
          </div>
        </div>
      )}

      {lead.followupMessages.length > 0 && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--gold-l)", marginBottom: 8 }}>
            <Sparkles size={13} strokeWidth={1.9} />
            {tFollowup("messagesTitle")}
          </div>
          {lead.followupMessages.slice(0, 5).map((m) => (
            <div key={m.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Chip cls={`tier-${m.tier}`}>{tFollowup(`tier.${m.tier}`)}</Chip>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{tFollowup(`theme.${m.theme}`)}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>· {m.status === "queued" ? tFollowup("queued") : m.status}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.6 }}>{locale === "ar" ? m.messageAr : m.messageEn}</p>
            </div>
          ))}
        </div>
      )}

      {lead.notes && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-l)", marginBottom: 6 }}>{t("notesTitle")}</div>
          <div style={{ fontSize: 12, color: "var(--cream2)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{lead.notes}</div>
        </div>
      )}

      {/* result flows */}
      {resultFlow === "won" && (
        <div className="panel">
          <div className="panel-h">
            <h3>{t("winPickerTitle")}</h3>
          </div>
          <OptGrid columns={1}>
            {ACCEPT_REASON_KEYS.map((k) => (
              <Opt key={k} selected={winReasonKey === k} onClick={() => setWinReasonKey(k)}>
                {tAccept(k)}
              </Opt>
            ))}
            <Opt selected={winReasonKey === "custom"} onClick={() => setWinReasonKey("custom")}>
              {tCommon("otherReason")}
            </Opt>
          </OptGrid>
          {winReasonKey === "custom" && (
            <TextInput value={winCustom} onChange={(e) => setWinCustom(e.target.value)} placeholder={tCommon("writeReasonPlaceholder")} style={{ marginTop: 8, marginBottom: 8 }} />
          )}
          <Frow2>
            <Frow label={t("months")}>
              <input type="number" min={1} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
            </Frow>
            <Frow label={t("monthlyPrice")}>
              <input type="number" min={0} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} placeholder="13000" />
            </Frow>
          </Frow2>
          <div className="kpi" style={{ marginBottom: 12 }}>
            <div className="kv" style={{ fontSize: 16 }}>{t("totalValuePreview", { total: formatNumber(months * monthly, locale) })}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="green" onClick={confirmWin}>{t("confirmContractBtn")}</Button>
            <Button onClick={() => setResultFlow(null)}>{tCommon("cancel")}</Button>
          </div>
        </div>
      )}

      {resultFlow === "reject" && (
        <div className="panel">
          <div className="panel-h"><h3>{t("rejectPickerTitle")}</h3></div>
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
            <TextInput value={rejectCustom} onChange={(e) => setRejectCustom(e.target.value)} placeholder={tCommon("writeReasonPlaceholder")} style={{ marginTop: 8, marginBottom: 8 }} />
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="danger" onClick={confirmReject}>{tCommon("confirm")}</Button>
            <Button onClick={() => setResultFlow(null)}>{tCommon("cancel")}</Button>
          </div>
        </div>
      )}

      {resultFlow === "followup" && (
        <div className="panel">
          <div className="panel-h"><h3>{t("followupPickerTitle")}</h3></div>
          {hasActiveMeeting && !followupAskCancel && (
            <div style={{ marginBottom: 10 }}>
              <Button variant="blue" onClick={() => setFollowupAskCancel(true)}>
                <AlertTriangle size={13} />
                {formatDT(lead.meeting!.dt, locale, tDate)}
              </Button>
            </div>
          )}
          {hasActiveMeeting && followupAskCancel ? (
            <>
              <p style={{ fontSize: 12, color: "var(--cream2)", marginBottom: 10 }}>
                {t("meetingConflictWarning", { dt: formatDT(lead.meeting!.dt, locale, tDate) })}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {QUICK_KEYS.map((k) => (
                    <Button key={k} sm onClick={() => setFollowupDtState(quickDT(k))}>{tQuicks(k)}</Button>
                  ))}
                </div>
                <input type="datetime-local" value={followupDt} onChange={(e) => setFollowupDtState(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="danger" onClick={() => confirmFollowup(true)}>{t("cancelMeetingKeepFollowup")}</Button>
                <Button variant="blue" onClick={() => confirmFollowup(false)}>{t("keepMeetingAndFollowup")}</Button>
                <Button onClick={() => setResultFlow(null)}>{tCommon("cancel")}</Button>
              </div>
            </>
          ) : (
            !hasActiveMeeting && (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {QUICK_KEYS.map((k) => (
                    <Button key={k} sm onClick={() => setFollowupDtState(quickDT(k))}>{tQuicks(k)}</Button>
                  ))}
                </div>
                <input type="datetime-local" value={followupDt} onChange={(e) => setFollowupDtState(e.target.value)} style={{ marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="blue" onClick={() => confirmFollowup(false)}>{tCommon("confirm")}</Button>
                  <Button onClick={() => setResultFlow(null)}>{tCommon("cancel")}</Button>
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* manager controls */}
      {isMgr && !resultFlow && (
        <div style={{ marginBottom: 14 }}>
          {!editing && !deleteConfirm && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button onClick={() => setEditing(true)}>
                <Pencil size={13} />
                {t("editDataBtn")}
              </Button>
              <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
                <Trash2 size={13} />
                {t("deleteBtn")}
              </Button>
            </div>
          )}
          {editing && (
            <div className="panel">
              <Frow2>
                <Frow>
                  <TextInput value={editName} onChange={(e) => setEditName(e.target.value)} />
                </Frow>
                <Frow>
                  <TextInput value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </Frow>
              </Frow2>
              <Frow label={t("emailLabel")} hint={t("emailHint")}>
                <TextInput
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </Frow>
              <Frow2>
                <Frow>
                  <Select value={editSegment} onChange={(e) => setEditSegment(e.target.value)}>
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>{resolveSegmentNameById(s.id, segments, tSegments)}</option>
                    ))}
                  </Select>
                </Frow>
                <Frow>
                  <TextInput value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                </Frow>
              </Frow2>
              <Frow label={t("referredByCodeLabel")}>
                <TextInput
                  value={editReferredByCode}
                  onChange={(e) => setEditReferredByCode(e.target.value)}
                  placeholder="OMV-XXXXXX"
                  style={{ fontFamily: "monospace", direction: "ltr" }}
                />
              </Frow>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="gold" onClick={saveEdit}>{t("saveEdit")}</Button>
                <Button onClick={() => setEditing(false)}>{t("cancelEdit")}</Button>
              </div>
            </div>
          )}
          {deleteConfirm && (
            <div className="panel">
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteLead(leadId);
                    closeModal();
                  }}
                >
                  {t("confirmDeleteBtn")}
                </Button>
                <Button onClick={() => setDeleteConfirm(false)}>{t("undoBtn")}</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* meeting status update */}
      {canAct && hasActiveMeeting && !resultFlow && (
        <div className="panel">
          {!missedPicker ? (
            <>
              {lead.meeting!.type === "inperson" && !proofCaptured ? (
                <>
                  <ProofThumbs tiles={meetingDoneTiles} onTap={() => setProofCaptured(true)} />
                  {proofCaptured && (
                    <>
                      <Frow label={t("meetingNotesLabel")} hint={t("meetingNotesHint")}>
                        <Textarea value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} rows={3} placeholder={t("meetingNotesPlaceholder")} />
                      </Frow>
                      <Button
                        variant="green"
                        onClick={() => {
                          markMeetingDone(leadId, me.id, true, meetingNotes);
                          setMeetingNotes("");
                        }}
                        style={{ marginTop: 10 }}
                      >
                        {t("confirmMeetingDone")}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Frow label={t("meetingNotesLabel")} hint={t("meetingNotesHint")}>
                    <Textarea value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} rows={3} placeholder={t("meetingNotesPlaceholder")} />
                  </Frow>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      variant="green"
                      onClick={() => {
                        markMeetingDone(leadId, me.id, lead.meeting!.type === "inperson", meetingNotes);
                        setMeetingNotes("");
                      }}
                    >
                      <CheckCircle2 size={13} />
                      {t("meetingHappenedBtn")}
                    </Button>
                    <Button variant="danger" onClick={() => setMissedPicker(true)}>
                      <X size={13} />
                      {t("meetingDidntHappenBtn")}
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <OptGrid columns={1}>
                {MISSED_REASON_KEYS.map((k) => (
                  <Opt key={k} selected={missedReasonKey === k} onClick={() => setMissedReasonKey(k)}>
                    {tMissed(k)}
                  </Opt>
                ))}
              </OptGrid>
              {missedReasonKey === "postponed" && (
                <Frow label={t("rescheduleDatePrompt")}>
                  <input type="datetime-local" value={rescheduleDt} onChange={(e) => setRescheduleDt(e.target.value)} />
                </Frow>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button variant="danger" onClick={confirmMeetingMissed}>{tCommon("confirm")}</Button>
                <Button onClick={() => setMissedPicker(false)}>{tCommon("cancel")}</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* rep action row */}
      {canAct && !resultFlow && (
        <div className="lc-actions" style={{ marginBottom: 14 }}>
          <Button sm onClick={() => openAction("fixData")}>
            <IdCard size={13} />
            {t("phoneDecisionMakerBtn")}
          </Button>
          <Button sm variant="gold" onClick={() => openAction("call")}>
            <Phone size={13} />
            {tLeadCard("callBtn")}
          </Button>
          <Button sm onClick={() => openAction("visit")}>
            <MapPinned size={13} />
            {tLeadCard("visitBtn")}
          </Button>
          {me.perms?.meetings && (
            <Button sm variant="blue" onClick={() => openAction("meeting")}>
              <CalendarClock size={13} />
              {tLeadCard("meetingBtn")}
            </Button>
          )}
          {me.perms?.transfer && (
            <Button sm onClick={() => openAction("transfer")}>
              <ArrowLeftRight size={13} />
              {tLeadCard("transferBtn")}
            </Button>
          )}
          {me.perms?.content && (
            <Button sm onClick={() => openAction("content")}>
              <BookOpen size={13} />
              {tLeadCard("contentBtn")}
            </Button>
          )}
        </div>
      )}

      {/* activity log */}
      <PanelHeader icon={History} title={t("activityLogTitle")} />
      <Timeline entries={lead.log} />
    </Modal>
  );
}
