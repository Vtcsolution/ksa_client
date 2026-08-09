"use client";

import { useLocale, useTranslations } from "next-intl";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Chip } from "@/components/ui/Chip";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatDT } from "@/lib/format";
import { resolveLeadName } from "@/lib/resolve";
import { AlertCircle, CalendarClock, Zap } from "@/lib/icons";

export default function MeetingsList({ mine }: { mine: boolean }) {
  const t = useTranslations("dashboard");
  const tRep = useTranslations("repLeadsPage");
  const tCard = useTranslations("leadCard");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();
  const leads = useAppStore((s) => s.leads);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const openModal = useUiStore((s) => s.openModal);

  const items = leads
    .filter(
      (l) =>
        l.meeting &&
        !l.meeting.done &&
        !l.meeting.missed &&
        (!mine || l.assignedTo === currentUserId),
    )
    .sort((a, b) => new Date(a.meeting!.dt).getTime() - new Date(b.meeting!.dt).getTime());

  if (items.length === 0) return null;

  // eslint-disable-next-line react-hooks/purity -- wall-clock time is inherently impure; used only to flag overdue/soon meetings
  const now = Date.now();

  return (
    <Panel>
      <PanelHeader icon={CalendarClock} title={mine ? tRep("myMeetingsTitle") : t("meetingsListTitle")} />
      <div className="tbl" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((l) => {
          const diff = new Date(l.meeting!.dt).getTime() - now;
          return (
            <button
              key={l.id}
              type="button"
              className="lead-card"
              style={{ textAlign: "start", margin: 0 }}
              onClick={() => openModal({ type: "leadDetail", leadId: l.id })}
            >
              <div className="lc-top" style={{ marginBottom: 0 }}>
                <div>
                  <div className="lc-name">{resolveLeadName(l, locale)}</div>
                  <div className="lc-meta">
                    {formatDT(l.meeting!.dt, locale, tDate)} · {l.meeting!.type === "inperson" ? tCard("inperson") : tCard("online")}
                  </div>
                </div>
                {diff < 0 && (
                  <Chip cls="late">
                    <AlertCircle size={11} strokeWidth={2} />
                  </Chip>
                )}
                {diff >= 0 && diff <= 3600000 && (
                  <Chip cls="review">
                    <Zap size={11} strokeWidth={2} />
                  </Chip>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
