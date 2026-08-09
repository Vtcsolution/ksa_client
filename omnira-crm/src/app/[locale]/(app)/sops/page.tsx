"use client";

import { useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { Chip } from "@/components/ui/Chip";
import { useAppStore } from "@/store/useAppStore";
import { SOP_IDS } from "@/lib/constants";
import { SOP_ICONS } from "@/lib/icons";

export default function SopsPage() {
  const t = useTranslations("sops");
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />

      {SOP_IDS.map((id) => (
        <Panel key={id}>
          <PanelHeader icon={SOP_ICONS[id]} title={t(`${id}.title`)} action={<Chip cls="seg">{t(`${id}.goal`)}</Chip>} />
          <ol style={{ display: "flex", flexDirection: "column", gap: 10, paddingInlineStart: 0, listStyle: "none" }}>
            {t.raw(`${id}.steps`).map((step: string, i: number) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  style={{
                    flex: "0 0 auto",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--gold-bg)",
                    color: "var(--gold-l)",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--cream2)", lineHeight: 1.6 }}>{step}</span>
              </li>
            ))}
          </ol>
        </Panel>
      ))}

      {!isMgr && (
        <Panel style={{ borderColor: "var(--gold-d)" }}>
          <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("repFooter")}</p>
        </Panel>
      )}
    </>
  );
}
