"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, TextInput } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { useToastStore } from "@/store/useToastStore";
import { resolveLeadName } from "@/lib/resolve";
import { IdCard } from "@/lib/icons";

export default function FixDataModal({ leadId }: { leadId: string }) {
  const t = useTranslations("fixDataModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const fixLeadContact = useAppStore((s) => s.fixLeadContact);
  const pushToast = useToastStore((s) => s.push);

  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [dmName, setDmName] = useState(lead?.decisionMaker?.name ?? "");
  const [dmPhone, setDmPhone] = useState(lead?.decisionMaker?.phone ?? "");

  if (!lead) return null;

  const save = async () => {
    if (!phone.trim()) {
      pushToast("phoneRequired", undefined, "warn");
      return;
    }
    const res = await fixLeadContact(leadId, { newPhone: phone, decisionMakerName: dmName, decisionMakerPhone: dmPhone });
    if (!res.ok) {
      if (res.error === "duplicate") pushToast("phoneDuplicate", { name: res.existingName ?? "" }, "warn");
      return;
    }
    closeModal();
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<IdCard size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save}>
            {t("saveBtn")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <p style={{ fontSize: 12.5, color: "var(--cream2)", marginBottom: 12 }}>{t("intro")}</p>
      <Frow
        label={t("phoneLabel")}
        hint={phone !== lead.phone ? t("phoneChangeWarning", { old: lead.phone, new: phone }) : undefined}
      >
        <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Frow>
      <Frow label={t("decisionMakerName")}>
        <TextInput
          value={dmName}
          onChange={(e) => setDmName(e.target.value)}
          placeholder={t("decisionMakerNamePlaceholder")}
        />
      </Frow>
      <Frow label={t("decisionMakerPhone")}>
        <TextInput value={dmPhone} onChange={(e) => setDmPhone(e.target.value)} />
      </Frow>
    </Modal>
  );
}
