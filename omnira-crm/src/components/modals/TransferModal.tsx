"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Select, TextInput } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveLeadName, resolveUserName } from "@/lib/resolve";
import { TRANSFER_REASON_KEYS } from "@/lib/constants";
import { ArrowLeftRight } from "@/lib/icons";

export default function TransferModal({ leadId }: { leadId: string }) {
  const t = useTranslations("transferModal");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tReasons = useTranslations("reasons.transfer");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const transferLead = useAppStore((s) => s.transferLead);

  const targets = useMemo(
    () => users.filter((u) => u.role === "rep" && u.id !== currentUserId && u.perms?.receive),
    [users, currentUserId],
  );

  const [toUserId, setToUserId] = useState(targets[0]?.id ?? "");
  const [reasonKey, setReasonKey] = useState<string>(TRANSFER_REASON_KEYS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!lead || !currentUserId) return null;

  const save = () => {
    if (!toUserId) return;
    const finalReasonKey = reasonKey === "custom" ? `custom:${customReason}` : reasonKey;
    transferLead(leadId, currentUserId, toUserId, finalReasonKey);
    closeModal();
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<ArrowLeftRight size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        targets.length > 0 && (
          <>
            <Button variant="gold" onClick={save}>
              {t("saveBtn")}
            </Button>
            <Button onClick={closeModal}>{tCommon("cancel")}</Button>
          </>
        )
      }
    >
      {targets.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--muted)" }}>{t("noTargets")}</p>
      ) : (
        <>
          <Frow label={t("targetLabel")}>
            <Select value={toUserId} onChange={(e) => setToUserId(e.target.value)}>
              {targets.map((u) => (
                <option key={u.id} value={u.id}>
                  {resolveUserName(u, tUsers)}
                </option>
              ))}
            </Select>
          </Frow>
          <Frow label={t("reasonLabel")}>
            <Select value={reasonKey} onChange={(e) => setReasonKey(e.target.value)}>
              {TRANSFER_REASON_KEYS.map((k) => (
                <option key={k} value={k}>
                  {tReasons(k)}
                </option>
              ))}
              <option value="custom">{tCommon("otherReason")}</option>
            </Select>
          </Frow>
          {reasonKey === "custom" && (
            <Frow>
              <TextInput
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={tCommon("writeReasonPlaceholder")}
              />
            </Frow>
          )}
          <p style={{ fontSize: 11, color: "var(--soft)" }}>{t("hint")}</p>
        </>
      )}
    </Modal>
  );
}
