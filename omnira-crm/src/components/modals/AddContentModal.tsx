"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, TextInput } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { UploadCloud, FileText, Globe } from "@/lib/icons";

export default function AddContentModal() {
  const t = useTranslations("addContentModal");
  const tCommon = useTranslations("common");
  const closeModal = useUiStore((s) => s.closeModal);
  const uploadContentFile = useAppStore((s) => s.uploadContentFile);
  const addContentLink = useAppStore((s) => s.addContentLink);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = name.trim() && (mode === "file" ? !!file : url.trim());

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      if (mode === "file" && file) {
        await uploadContentFile(file, name.trim(), nameEn.trim());
      } else if (mode === "link") {
        await addContentLink(name.trim(), nameEn.trim(), url.trim());
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t("title")}
      icon={<UploadCloud size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save} disabled={!canSave || saving}>
            {saving ? t("savingBtn") : t("saveBtn")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Button sm variant={mode === "file" ? "gold" : undefined} onClick={() => setMode("file")}>
          <FileText size={13} strokeWidth={2} />
          {t("modeFile")}
        </Button>
        <Button sm variant={mode === "link" ? "gold" : undefined} onClick={() => setMode("link")}>
          <Globe size={13} strokeWidth={2} />
          {t("modeLink")}
        </Button>
      </div>

      <Frow label={t("nameLabel")}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder={t("namePlaceholder")} />
      </Frow>
      <Frow label={t("nameEnLabel")}>
        <TextInput value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder={t("nameEnPlaceholder")} />
      </Frow>

      {mode === "file" ? (
        <Frow label={t("fileLabel")}>
          <div
            className="upload-zone"
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            style={{ padding: "16px" }}
          >
            <div className="uz-t" style={{ fontSize: 12 }}>{file ? file.name : t("filePickHint")}</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Frow>
      ) : (
        <Frow label={t("urlLabel")}>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </Frow>
      )}
      <p style={{ fontSize: 10, color: "var(--soft)", marginTop: 8 }}>{t("hint")}</p>
    </Modal>
  );
}
