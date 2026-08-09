"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatBytes } from "@/lib/format";
import { getContentTypeIcon, Library, Send, Trash2, UploadCloud } from "@/lib/icons";

export default function ContentPage() {
  const t = useTranslations("contentPage");
  const locale = useLocale();
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const contentItems = useAppStore((s) => s.contentItems);
  const deleteContentItem = useAppStore((s) => s.deleteContentItem);
  const openModal = useUiStore((s) => s.openModal);
  const me = users.find((u) => u.id === currentUserId);
  const isMgr = me?.role === "manager";

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          isMgr && (
            <Button variant="gold" onClick={() => openModal({ type: "addContent" })}>
              <UploadCloud size={13} />
              {t("uploadBtn")}
            </Button>
          )
        }
      />

      {contentItems.length === 0 ? (
        <EmptyState icon={Library} title={t("emptyTitle")} body={isMgr ? t("emptyBodyMgr") : t("emptyBodyRep")} />
      ) : (
        <div className="staff-grid">
          {contentItems.map((c) => {
            const IconCmp = getContentTypeIcon(c.fileType);
            return (
              <div key={c.id} className="staff-card content-card">
                <div className="content-card-icon">
                  <IconCmp size={24} strokeWidth={1.6} />
                </div>
                <div className="st-name" style={{ marginBottom: 4 }}>{locale === "ar" ? c.name : (c.nameEn ?? c.name)}</div>
                <div className="st-role" style={{ marginBottom: 10 }}>
                  {t(`fileType.${c.fileType}`)}
                  {c.fileSize ? ` · ${formatBytes(c.fileSize)}` : ""}
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    <Button sm>
                      <Send size={12} strokeWidth={2} />
                      {t("openBtn")}
                    </Button>
                  </a>
                  {isMgr && (
                    <Button sm variant="danger" onClick={() => deleteContentItem(c.id)}>
                      <Trash2 size={12} strokeWidth={2} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Panel style={{ marginTop: 18 }}>
        <PanelHeader icon={Send} title={t("footerTitle")} />
        <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("footerBody")}</p>
      </Panel>
    </>
  );
}
