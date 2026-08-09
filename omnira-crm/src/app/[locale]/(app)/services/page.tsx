"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import { Tbl } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatNumber } from "@/lib/format";
import { Car, Check, Lightbulb, Lock, MapPinned, Pencil } from "@/lib/icons";

export default function ServicesPage() {
  const t = useTranslations("servicesPage");
  const tServices = useTranslations("services");
  const tPkg = useTranslations("packages");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const isMgr = users.find((u) => u.id === currentUserId)?.role === "manager";
  const packages = useAppStore((s) => s.packages);
  const openModal = useUiStore((s) => s.openModal);

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          isMgr && (
            <Button onClick={() => openModal({ type: "editPricing" })}>
              <Pencil size={13} />
              {t("editAction")}
            </Button>
          )
        }
      />

      <Panel>
        <PanelHeader icon={Car} title={tServices("s1.name")} />
        <p style={{ fontSize: 12.5, color: "var(--cream2)", lineHeight: 1.7, marginBottom: 14 }}>{tServices("s1.desc")}</p>
        <Tbl>
          <thead>
            <tr>
              <th>{t("packageCol")}</th>
              <th>{t("hoursCol")}</th>
              <th>{t("priceCol")}</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id}>
                <td className="name-cell">{tPkg(p.id)}</td>
                <td>{p.hours ? tPkg("hoursLabel", { n: formatNumber(p.hours, locale) }) : tPkg("custom")}</td>
                <td>{p.price ? `${formatNumber(p.price, locale)} ${tCommon("sar")}` : tPkg("custom")}</td>
              </tr>
            ))}
          </tbody>
        </Tbl>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gold-l)", marginBottom: 8 }}>{t("includesTitle")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {tServices.raw("s1.includes").map((inc: string, i: number) => (
              <div key={i} className="include-row">
                <Check size={13} strokeWidth={2.5} />
                {inc}
              </div>
            ))}
          </div>
        </div>
        {isMgr && (
          <div className="script-hint internal-note">
            <Lock size={13} strokeWidth={2} />
            {tServices("s1.internal")}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader icon={MapPinned} title={tServices("s2.name")} />
        <p style={{ fontSize: 12.5, color: "var(--cream2)", lineHeight: 1.7, marginBottom: 14 }}>{tServices("s2.desc")}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {tServices.raw("s2.includes").map((inc: string, i: number) => (
            <div key={i} className="include-row">
              <Check size={13} strokeWidth={2.5} />
              {inc}
            </div>
          ))}
        </div>
        {isMgr && (
          <div className="script-hint internal-note">
            <Lock size={13} strokeWidth={2} />
            {tServices("s2.internal")}
          </div>
        )}
      </Panel>

      <Panel style={{ borderColor: "var(--gold-d)" }}>
        <p className="tip-line">
          <Lightbulb size={13} strokeWidth={1.8} />
          {t("footerTip")}
        </p>
      </Panel>
    </>
  );
}
