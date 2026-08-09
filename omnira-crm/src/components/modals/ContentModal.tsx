"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Opt, OptGrid } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveLeadName } from "@/lib/resolve";
import { getContentTypeIcon, Library } from "@/lib/icons";

export default function ContentModal({ leadId }: { leadId: string }) {
  const t = useTranslations("contentModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const currentUserId = useAppStore((s) => s.currentUserId);
  const contentItems = useAppStore((s) => s.contentItems);
  const sendContent = useAppStore((s) => s.sendContent);
  const [selected, setSelected] = useState<string | null>(null);

  if (!lead || !currentUserId) return null;

  const save = () => {
    const item = contentItems.find((c) => c.id === selected);
    if (!item) return;
    sendContent(leadId, currentUserId, item.id, item.name, item.nameEn ?? item.name);
    closeModal();
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<Library size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save} disabled={!selected}>
            {tCommon("send")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <p style={{ fontSize: 12.5, color: "var(--cream2)", marginBottom: 12 }}>{t("intro")}</p>
      {contentItems.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--muted)" }}>{t("noContent")}</p>
      ) : (
        <OptGrid columns={2}>
          {contentItems.map((c) => {
            const IconCmp = getContentTypeIcon(c.fileType);
            return (
              <Opt key={c.id} selected={selected === c.id} onClick={() => setSelected(c.id)} icon={<IconCmp size={15} strokeWidth={1.8} />}>
                {locale === "ar" ? c.name : (c.nameEn ?? c.name)}
              </Opt>
            );
          })}
        </OptGrid>
      )}
      <p style={{ fontSize: 10, color: "var(--soft)", marginTop: 12 }}>{t("hint")}</p>
    </Modal>
  );
}
