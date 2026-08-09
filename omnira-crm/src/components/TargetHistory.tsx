"use client";

import { useLocale, useTranslations } from "next-intl";
import type { HistoryDay, Target } from "@/lib/types";
import { Tbl } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Chip";
import { dayAchievement, historyHits } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";

export default function TargetHistory({ history, target }: { history: HistoryDay[]; target: Target }) {
  const t = useTranslations("targetsPage");
  const tWeekdays = useTranslations("weekdays");
  const locale = useLocale();

  const hits = historyHits(history, target);

  return (
    <div>
      <div className="panel-h">
        <h3 style={{ fontSize: 13 }}>{t("historyTitle")}</h3>
        <Chip cls={hits >= 4 ? "verified" : "review"}>
          {t("historyChip", { hits: formatNumber(hits, locale), total: formatNumber(history.length, locale) })}
        </Chip>
      </div>
      <Tbl>
        <thead>
          <tr>
            <th>{t("colDay")}</th>
            <th>{t("colCalls")}</th>
            <th>{t("colVisits")}</th>
            <th>{t("colMeetings")}</th>
            <th>{t("colResult")}</th>
          </tr>
        </thead>
        <tbody>
          {history.map((d) => {
            const a = dayAchievement(d, target);
            return (
              <tr key={d.dayKey}>
                <td className="name-cell">{tWeekdays(d.dayKey)}</td>
                <td>{formatNumber(d.calls, locale)}</td>
                <td>{formatNumber(d.visits, locale)}</td>
                <td>{formatNumber(d.mtg, locale)}</td>
                <td style={{ color: a === "full" ? "var(--ok)" : a === "part" ? "var(--warn)" : "var(--danger-l)" }}>
                  {a === "full" ? t("achieved") : a === "part" ? t("partial") : t("notAchieved")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Tbl>
    </div>
  );
}
