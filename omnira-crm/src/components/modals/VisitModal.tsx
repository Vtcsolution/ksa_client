"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Frow2, Select, Textarea, TextInput } from "@/components/ui/Form";
import ProofThumbs, { ProofTile } from "@/components/ui/ProofThumbs";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { resolveLeadName, resolveSegmentName } from "@/lib/resolve";
import { Camera, MapPin, MapPinned, ScanFace } from "@/lib/icons";

export default function VisitModal({ leadId }: { leadId: string }) {
  const t = useTranslations("visitModal");
  const tCommon = useTranslations("common");
  const tSegments = useTranslations("segments");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const segments = useAppStore((s) => s.segments);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const logVisit = useAppStore((s) => s.logVisit);
  const pushToast = useToastStore((s) => s.push);

  const [name, setName] = useState(lead?.name ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [contact, setContact] = useState("");
  const [segment, setSegment] = useState(lead?.segment ?? segments[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [gpsState, setGpsState] = useState<"empty" | "loading" | "filled" | "review">("empty");

  if (!lead || !currentUserId) return null;

  const tapPhoto = () => {
    if (photo) return;
    setPhoto(true);
  };
  const tapSelfie = () => {
    if (selfie) return;
    setSelfie(true);
  };
  const tapGps = () => {
    if (gpsState !== "empty") return;
    setGpsState("loading");
    setTimeout(() => {
      const verified = lead.source === "field" ? true : Math.random() > 0.25;
      setGpsState(verified ? "filled" : "review");
    }, 1100);
  };

  const tiles: ProofTile[] = [
    { key: "photo", icon: Camera, label: t("photoLabel"), state: photo ? "filled" : "empty" },
    { key: "gps", icon: MapPin, label: t("gpsLabel"), state: gpsState },
    { key: "selfie", icon: ScanFace, label: t("selfieLabel"), state: selfie ? "filled" : "empty" },
  ];

  const proofsDone = photo && selfie && (gpsState === "filled" || gpsState === "review");
  const canSave = name.trim() && phone.trim() && proofsDone;

  const save = () => {
    if (!name.trim() || !phone.trim()) {
      pushToast("completeForm", undefined, "warn");
      return;
    }
    if (!proofsDone) {
      pushToast("completeProofs", undefined, "warn");
      return;
    }
    logVisit(leadId, currentUserId, {
      name,
      phone,
      contact,
      segment,
      note,
      verified: gpsState === "filled",
    });
    closeModal();
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<MapPinned size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save} disabled={!canSave}>
            {t("saveBtn")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <p style={{ fontSize: 12.5, color: "var(--cream2)", marginBottom: 12 }}>{t("intro")}</p>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
        {t("formTitle")}
      </p>
      <Frow2>
        <Frow label={t("entityName")}>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Frow>
        <Frow label={t("phone")}>
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Frow>
      </Frow2>
      <Frow2>
        <Frow label={t("contactPerson")}>
          <TextInput
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t("contactPersonPlaceholder")}
          />
        </Frow>
        <Frow label={t("segment")}>
          <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {resolveSegmentName(s, tSegments)}
              </option>
            ))}
          </Select>
        </Frow>
      </Frow2>
      <Frow label={t("notesTitle")}>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notesPlaceholder")} />
      </Frow>
      <Frow label={t("proofTitle")}>
        <ProofThumbs tiles={tiles} onTap={(k) => (k === "photo" ? tapPhoto() : k === "selfie" ? tapSelfie() : tapGps())} />
        {gpsState === "review" && <p style={{ fontSize: 11, color: "var(--warn)", marginTop: 8 }}>{t("gpsReviewWarning")}</p>}
      </Frow>
    </Modal>
  );
}
