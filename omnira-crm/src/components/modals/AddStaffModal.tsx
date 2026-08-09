"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Opt, OptGrid, TextInput } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { Copy, UserPlus, UserRound, Users } from "@/lib/icons";

export default function AddStaffModal() {
  const t = useTranslations("addStaffModal");
  const tCommon = useTranslations("common");
  const closeModal = useUiStore((s) => s.closeModal);
  const addStaff = useAppStore((s) => s.addStaff);
  const pushToast = useToastStore((s) => s.push);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"sales" | "meetings">("sales");
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const created = await addStaff(name, role);
      if (created) setCredentials(created);
    } finally {
      setSaving(false);
    }
  };

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    pushToast("copiedToClipboard", undefined, "ok");
  };

  if (credentials) {
    return (
      <Modal
        title={t("credentialsTitle")}
        icon={<UserPlus size={17} strokeWidth={1.75} />}
        onClose={closeModal}
        footer={<Button variant="gold" onClick={closeModal}>{tCommon("done")}</Button>}
      >
        <p style={{ fontSize: 12, color: "var(--cream2)", marginBottom: 14 }}>{t("credentialsHint")}</p>
        <Frow label={t("emailLabel")}>
          <div style={{ display: "flex", gap: 8 }}>
            <TextInput value={credentials.email} readOnly />
            <Button sm onClick={() => copy(credentials.email)}>
              <Copy size={13} strokeWidth={2} />
            </Button>
          </div>
        </Frow>
        <Frow label={t("passwordLabel")}>
          <div style={{ display: "flex", gap: 8 }}>
            <TextInput value={credentials.password} readOnly />
            <Button sm onClick={() => copy(credentials.password)}>
              <Copy size={13} strokeWidth={2} />
            </Button>
          </div>
        </Frow>
        <p style={{ fontSize: 10, color: "var(--warn)", marginTop: 8 }}>{t("credentialsWarning")}</p>
      </Modal>
    );
  }

  return (
    <Modal
      title={t("title")}
      icon={<UserPlus size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save} disabled={!name.trim() || saving}>
            {saving ? t("savingBtn") : t("saveBtn")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <Frow label={t("nameLabel")}>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Frow>
      <Frow label={t("roleLabel")}>
        <OptGrid columns={2}>
          <Opt selected={role === "sales"} onClick={() => setRole("sales")} icon={<UserRound size={14} strokeWidth={1.8} />}>
            {t("roleSales")}
          </Opt>
          <Opt selected={role === "meetings"} onClick={() => setRole("meetings")} icon={<Users size={14} strokeWidth={1.8} />}>
            {t("roleMeetings")}
          </Opt>
        </OptGrid>
      </Frow>
      <p style={{ fontSize: 10, color: "var(--soft)" }}>{t("hint")}</p>
    </Modal>
  );
}
