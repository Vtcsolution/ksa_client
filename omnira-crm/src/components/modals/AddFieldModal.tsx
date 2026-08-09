"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Select, TextInput } from "@/components/ui/Form";
import ProofThumbs, { ProofTile } from "@/components/ui/ProofThumbs";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { resolveSegmentName } from "@/lib/resolve";
import { Camera, Car, MapPin, ScanFace } from "@/lib/icons";

export default function AddFieldModal() {
  const t = useTranslations("addFieldModal");
  const tCommon = useTranslations("common");
  const tSegments = useTranslations("segments");
  const closeModal = useUiStore((s) => s.closeModal);
  const segments = useAppStore((s) => s.segments);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const addFieldLead = useAppStore((s) => s.addFieldLead);
  const pushToast = useToastStore((s) => s.push);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState(segments[0]?.id ?? "");
  const [proof, setProof] = useState({ gps: false, photo: false, selfie: false });
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const tap = (key: "gps" | "photo" | "selfie") => {
    if (proof[key] || loadingKey) return;
    setLoadingKey(key);
    setTimeout(() => {
      setProof((p) => ({ ...p, [key]: true }));
      setLoadingKey(null);
    }, key === "gps" ? 900 : 500);
  };

  const tiles: ProofTile[] = [
    { key: "gps", icon: MapPin, label: t("gpsLabel"), state: loadingKey === "gps" ? "loading" : proof.gps ? "filled" : "empty" },
    { key: "photo", icon: Camera, label: t("photoLabel"), state: loadingKey === "photo" ? "loading" : proof.photo ? "filled" : "empty" },
    { key: "selfie", icon: ScanFace, label: t("selfieLabel"), state: loadingKey === "selfie" ? "loading" : proof.selfie ? "filled" : "empty" },
  ];

  const allProof = proof.gps && proof.photo && proof.selfie;
  const canSave = name.trim() && phone.trim() && allProof;

  const save = async () => {
    if (!currentUserId) return;
    if (!name.trim() || !phone.trim()) {
      pushToast("enterNameAndPhone", undefined, "warn");
      return;
    }
    if (!allProof) {
      pushToast("completeVisitProof", undefined, "warn");
      return;
    }
    const res = await addFieldLead({ name, phone, segment }, currentUserId);
    if (!res.ok) {
      if (res.error === "duplicate") {
        pushToast("leadPhoneDuplicate", { name: res.existingName ?? "" }, "warn");
      }
      return;
    }
    closeModal();
  };

  return (
    <Modal
      title={t("title")}
      icon={<Car size={17} strokeWidth={1.75} />}
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
      <Frow label={t("entityName")}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t("entityNamePlaceholder")} />
      </Frow>
      <Frow label={t("phone")}>
        <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
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
      <Frow label={t("proofTitle")}>
        <ProofThumbs tiles={tiles} onTap={(k) => tap(k as "gps" | "photo" | "selfie")} />
      </Frow>
    </Modal>
  );
}
