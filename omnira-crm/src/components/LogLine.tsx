"use client";

import { useLocale, useTranslations } from "next-intl";
import type { LogEntry } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { resolveReason, resolveSegmentNameById, resolveUserNameById } from "@/lib/resolve";
import { formatDT, formatDuration } from "@/lib/format";

export function useLogLineText(entry: LogEntry): string {
  const locale = useLocale();
  const t = useTranslations("log");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tSegments = useTranslations("segments");
  const tAccept = useTranslations("reasons.accept");
  const tReject = useTranslations("reasons.reject");
  const tTransfer = useTranslations("reasons.transfer");
  const tMissed = useTranslations("reasons.missed");
  const tCallModal = useTranslations("callModal");
  const tLeadCard = useTranslations("leadCard");
  const tSentiment = useTranslations("callsPage.sentiment");
  const tFollowup = useTranslations("followupCadence");
  const tDate = useTranslations("dateHelpers");
  const users = useAppStore((s) => s.users);
  const segments = useAppStore((s) => s.segments);

  const p = entry.params ?? {};
  const dt = (v: unknown) => formatDT(v as string | number, locale, tDate);
  const dur = (v: unknown) => formatDuration(Number(v), locale);

  switch (entry.key) {
    case "distributedTo":
      return t("distributedTo", { name: resolveUserNameById(String(p.toUserId), users, tUsers) });
    case "calledDuration":
      return t("calledDuration", { dur: dur(p.durSec) });
    case "interestedDuration":
      return t("interestedDuration", { dur: dur(p.durSec) });
    case "callAttempt":
      return t("callAttempt", {
        result: tCallModal(String(p.resultKey)),
        n: Number(p.n),
        dt: dt(p.retryDt),
      });
    case "callAttemptMeetingKept":
      return t("callAttemptMeetingKept", {
        result: tCallModal(String(p.resultKey)),
        n: Number(p.n),
        dt: dt(p.retryDt),
      });
    case "bookedMeeting":
      return t("bookedMeeting", {
        type: tLeadCard(String(p.typeKey)),
        dt: dt(p.dt),
      });
    case "followupScheduled":
      return t("followupScheduled", { dt: dt(p.dt) });
    case "followupMeetingCancelled":
      return t("followupMeetingCancelled", { dt: dt(p.dt) });
    case "followupEscalated":
      return t("followupEscalated", { hours: Number(p.hoursOverdue ?? 0) });
    case "archived":
      return t("archived", { reason: resolveReason(String(p.reasonKey), tReject) });
    case "visitLogged": {
      const status = p.verified
        ? t("visitLocationMatch")
        : t("visitLocationReview");
      return t("visitLogged", {
        status,
        contact: p.contact ? ` · ${p.contact}` : "",
        note: p.note ? ` · ${p.note}` : "",
      });
    }
    case "transferred":
      return t("transferred", {
        name: resolveUserNameById(String(p.toUserId), users, tUsers),
        reason: resolveReason(String(p.reasonKey), tTransfer),
      });
    case "quoteSent":
      return t("quoteSent", {
        count: Number(p.count),
        price: Number(p.price),
        total: Number(p.total),
      });
    case "quotePendingApproval":
      return t("quotePendingApproval");
    case "quoteApproved":
      return t("quoteApproved");
    case "quoteRejected":
      return t("quoteRejected");
    case "phoneFixed":
      return t("phoneFixed", { old: String(p.old), new: String(p.new) });
    case "decisionMakerSet":
      return t("decisionMakerSet", {
        name: String(p.name),
        phone: p.phone ? ` — ${p.phone}` : "",
      });
    case "contentSent":
      return t("contentSent", { name: locale === "ar" ? String(p.nameAr ?? "") : String(p.nameEn ?? p.nameAr ?? "") });
    case "fieldClientAdded":
      return t("fieldClientAdded");
    case "won":
      return t("won", { reason: resolveReason(String(p.reasonKey), tAccept) });
    case "meetingDone":
      return t("meetingDone", { proof: p.proof ? t("meetingDoneProofNote") : "" });
    case "meetingMissed":
      return t("meetingMissed", { reason: resolveReason(String(p.reasonKey), tMissed) });
    case "meetingRescheduled":
      return t("meetingRescheduled", { old: dt(p.old), new: dt(p.new) });
    case "managerEdited":
      return t("managerEdited");
    case "deleted":
      return t("deleted");
    case "reopened":
      return t("reopened");
    case "ziwoCallLogged": {
      // Ziwo's raw `result` values seen so far: "answered", "no-answer", "cancel" — only
      // the first two map to an existing callModal translation; anything else (e.g.
      // "cancel") falls back to the raw label rather than risk an unresolvable key.
      const resultKey = String(p.resultKey ?? "");
      const result = ["answered", "noAnswer", "busy"].includes(resultKey)
        ? tCallModal(resultKey)
        : String(p.resultLabel ?? resultKey);
      return t("ziwoCallLogged", {
        direction: p.direction === "inbound" ? tCommon("inbound") : tCommon("outbound"),
        result,
        dur: dur(p.durSec),
      });
    }
    case "ziwoCallAnalyzed": {
      const sentimentKey = String(p.sentiment ?? "");
      const sentiment = ["positive", "neutral", "negative"].includes(sentimentKey) ? tSentiment(sentimentKey) : sentimentKey;
      return t("ziwoCallAnalyzed", { score: Number(p.leadScore ?? 0), sentiment });
    }
    case "meetingSummarized": {
      const sentimentKey = String(p.sentiment ?? "");
      const sentiment = ["positive", "neutral", "negative"].includes(sentimentKey) ? tSentiment(sentimentKey) : sentimentKey;
      return t("meetingSummarized", { sentiment });
    }
    case "tierFollowupQueued": {
      return t("tierFollowupQueued", { tier: tFollowup(`tier.${String(p.tier ?? "")}`), theme: tFollowup(`theme.${String(p.theme ?? "")}`) });
    }
    case "websiteLeadScored": {
      return t("websiteLeadScored", { score: Number(p.leadScore ?? 0), tier: tFollowup(`tier.${String(p.tier ?? "")}`) });
    }
    case "followupCadenceExhausted": {
      return t("followupCadenceExhausted", { tier: tFollowup(`tier.${String(p.tier ?? "")}`) });
    }
    case "followupCadenceRestarted": {
      return t("followupCadenceRestarted");
    }
    case "whatsappFollowupQueued": {
      const message = locale === "ar" ? String(p.messageAr ?? "") : String(p.messageEn ?? "");
      return t("whatsappFollowupQueued", { message });
    }
    case "referredByCodeSet":
      return p.code ? t("referredByCodeSet", { code: String(p.code) }) : t("referredByCodeCleared");
    case "referralRewardCreated":
      return t("referralRewardCreated", { points: Number(p.points) });
    case "referralRewardEarned":
      return t("referralRewardEarned", { points: Number(p.points) });
    case "segmentRef":
      return resolveSegmentNameById(String(p.segmentId), segments, tSegments);
    default:
      return entry.key;
  }
}

export default function LogLine({ entry }: { entry: LogEntry }) {
  const locale = useLocale();
  const tDate = useTranslations("dateHelpers");
  const tUsers = useTranslations("users");
  const users = useAppStore((s) => s.users);
  const text = useLogLineText(entry);
  const who = resolveUserNameById(entry.whoId, users, tUsers);

  return (
    <div className="tl-item">
      <div className="tl-time">
        {formatDT(entry.t, locale, tDate)} · <span className="tl-who">{who}</span>
      </div>
      <div className="tl-txt">{text}</div>
    </div>
  );
}
