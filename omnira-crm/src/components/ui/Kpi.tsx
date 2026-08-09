"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import type { LucideIcon } from "@/lib/icons";

export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="kpi-row">{children}</div>;
}

export type KpiColor = "gold" | "blue" | "green" | "purple" | "teal" | "warn" | "danger";

export function KpiCard({
  icon: IconCmp,
  label,
  value,
  suffix,
  sub,
  highlight,
  color = "gold",
  index = 0,
}: {
  icon: LucideIcon;
  label: ReactNode;
  value: number | string;
  suffix?: string;
  sub?: ReactNode;
  highlight?: boolean;
  color?: KpiColor;
  index?: number;
}) {
  const locale = useLocale();
  const display = typeof value === "number" ? formatNumber(value, locale) : value;
  return (
    <motion.div
      className={clsx("kpi", `c-${color}`, highlight && "hl")}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.04, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="kpi-top">
        <div className="kt">{label}</div>
        <div className="ki">
          <IconCmp size={18} strokeWidth={1.9} />
        </div>
      </div>
      <div className="kv">
        {display}
        {suffix && <small>{suffix}</small>}
      </div>
      <div className={clsx("ksub", !sub && "ksub-empty")}>{sub || " "}</div>
    </motion.div>
  );
}
