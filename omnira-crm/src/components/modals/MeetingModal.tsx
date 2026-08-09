"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow } from "@/components/ui/Form";
import { Opt, OptGrid } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveLeadName } from "@/lib/resolve";
import type { MeetingType } from "@/lib/types";
import { CalendarClock, Handshake, Video } from "@/lib/icons";

export default function MeetingModal({ leadId }: { leadId: string }) {
  const t = useTranslations("meetingModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const currentUserId = useAppStore((s) => s.currentUserId);
  const bookMeeting = useAppStore((s) => s.bookMeeting);

  const [type, setType] = useState<MeetingType>("inperson");
  const [dt, setDt] = useState("");

  if (!lead || !currentUserId) return null;

  const save = () => {
    if (!dt) return;
    bookMeeting(leadId, currentUserId, type, dt);
    closeModal();
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<CalendarClock size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save} disabled={!dt}>
            {t("saveBtn")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <Frow label={t("typeLabel")}>
        <OptGrid columns={2}>
          <Opt selected={type === "inperson"} onClick={() => setType("inperson")} icon={<Handshake size={14} strokeWidth={1.8} />}>
            {t("inperson")}
          </Opt>
          <Opt selected={type === "online"} onClick={() => setType("online")} icon={<Video size={14} strokeWidth={1.8} />}>
            {t("online")}
          </Opt>
        </OptGrid>
      </Frow>
      <Frow label={t("dateLabel")} hint={t("hint")}>
        <input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
      </Frow>
    </Modal>
  );
}
