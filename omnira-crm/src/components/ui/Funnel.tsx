"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import type { FunnelStage } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";

export default function Funnel({ stages }: { stages: FunnelStage[] }) {
  const t = useTranslations("funnel");
  const locale = useLocale();
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div>
      {stages.map((s, i) => {
        const widthPct = Math.max(6, Math.round((s.value / max) * 100));
        return (
          <div key={s.key} className={clsx("funnel-row", s.key === "contracts" && "fw")}>
            <div className="fl">{t(s.key)}</div>
            <div className="fbar-track">
              <motion.div
                className="fbar"
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              >
                {formatNumber(s.value, locale)}
              </motion.div>
            </div>
            <div className="fpct">{s.pctOfPrev !== null ? `${formatNumber(s.pctOfPrev, locale)}%` : ""}</div>
          </div>
        );
      })}
    </div>
  );
}
