"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import clsx from "clsx";
import { NAV_ICONS } from "@/lib/icons";

const ITEMS: { key: string; shortKey: string }[] = [
  { key: "myleads", shortKey: "myleadsShort" },
  { key: "followups", shortKey: "followups" },
  { key: "calls", shortKey: "callsShort" },
  { key: "search", shortKey: "searchShort" },
  { key: "mystats", shortKey: "mystatsShort" },
  { key: "sops", shortKey: "sopsShort" },
  { key: "services", shortKey: "servicesShort" },
];

export default function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="mobile-nav">
      {ITEMS.map((item) => {
        const href = `/${item.key}`;
        const active = pathname === href;
        const IconCmp = NAV_ICONS[item.key];
        return (
          <Link key={item.key} href={href} className={clsx(active && "on")}>
            <span className="mi">
              <IconCmp size={19} strokeWidth={1.75} />
            </span>
            <span>{t(item.shortKey)}</span>
          </Link>
        );
      })}
    </div>
  );
}
