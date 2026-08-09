"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import clsx from "clsx";
import { MGR_NAV_MAIN, MGR_NAV_MGMT } from "@/lib/constants";
import { NAV_ICONS } from "@/lib/icons";
import { useUiStore } from "@/store/useUiStore";

export default function MobileDrawer() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const open = useUiStore((s) => s.drawerOpen);
  const close = useUiStore((s) => s.closeDrawer);

  const renderItem = (key: string) => {
    const href = `/${key}`;
    const active = pathname === href;
    const IconCmp = NAV_ICONS[key];
    return (
      <Link key={key} href={href} className={clsx("nav-item", active && "active")} onClick={close}>
        <span className="ni">
          <IconCmp size={17} strokeWidth={1.75} />
        </span>
        <span>{t(key)}</span>
      </Link>
    );
  };

  // Panel sits on the logical "start" edge (CSS inset-inline-start) — slide
  // in from the matching physical side so it isn't mirrored wrong in RTL.
  const offscreenX = locale === "ar" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-bg"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="drawer-panel"
            initial={{ x: offscreenX }}
            animate={{ x: 0 }}
            exit={{ x: offscreenX }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav-label">{t("sectionMain")}</div>
            {MGR_NAV_MAIN.map(renderItem)}
            <div className="nav-sep" />
            <div className="nav-label">{t("sectionMgmt")}</div>
            {MGR_NAV_MGMT.map(renderItem)}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
