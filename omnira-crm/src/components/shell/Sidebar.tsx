"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import clsx from "clsx";
import { MGR_NAV_MAIN, MGR_NAV_MGMT, REP_NAV_DAILY, REP_NAV_REF } from "@/lib/constants";
import { NAV_ICONS } from "@/lib/icons";

export default function Sidebar({ isMgr }: { isMgr: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const sectionA = isMgr ? MGR_NAV_MAIN : REP_NAV_DAILY;
  const sectionB = isMgr ? MGR_NAV_MGMT : REP_NAV_REF;
  const labelA = isMgr ? t("sectionMain") : t("sectionDaily");
  const labelB = isMgr ? t("sectionMgmt") : t("sectionRef");

  const renderItem = (key: string) => {
    const href = `/${key}`;
    const active = pathname === href;
    const IconCmp = NAV_ICONS[key];
    return (
      <Link key={key} href={href} className={clsx("nav-item", active && "active")}>
        <span className="ni">
          <IconCmp size={17} strokeWidth={1.75} />
        </span>
        <span>{t(key)}</span>
      </Link>
    );
  };

  return (
    <div className="sidebar">
      <div className="nav-label">{labelA}</div>
      {sectionA.map(renderItem)}
      <div className="nav-sep" />
      <div className="nav-label">{labelB}</div>
      {sectionB.map(renderItem)}
    </div>
  );
}
