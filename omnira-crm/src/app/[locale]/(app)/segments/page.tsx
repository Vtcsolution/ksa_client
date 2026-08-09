"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Form";
import { Tbl } from "@/components/ui/Table";
import { useAppStore } from "@/store/useAppStore";
import { resolveSegmentName } from "@/lib/resolve";
import { formatNumber } from "@/lib/format";
import { Plus, SegmentIcon, Trophy } from "@/lib/icons";

export default function SegmentsPage() {
  const t = useTranslations("segmentsPage");
  const tSegments = useTranslations("segments");
  const locale = useLocale();

  const leads = useAppStore((s) => s.leads);
  const segments = useAppStore((s) => s.segments);
  const addSegment = useAppStore((s) => s.addSegment);
  const [newName, setNewName] = useState("");

  const rows = useMemo(() => {
    return segments
      .map((s) => {
        const segLeads = leads.filter((l) => l.segment === s.id);
        const won = segLeads.filter((l) => l.status === "won").length;
        const conv = segLeads.length ? Math.round((won / segLeads.length) * 100) : 0;
        return { segment: s, count: segLeads.length, won, conv };
      })
      .sort((a, b) => b.won - a.won || b.count - a.count);
  }, [segments, leads]);

  const maxCount = Math.max(...rows.map((r) => r.count), 1);
  const top = rows.find((r) => r.won >= 1);

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <>
            <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("newNichePlaceholder")} />
            <Button
              variant="gold"
              onClick={() => {
                addSegment(newName);
                setNewName("");
              }}
            >
              <Plus size={13} />
              {t("addBtn")}
            </Button>
          </>
        }
      />

      {top && (
        <Panel style={{ borderColor: "var(--gold-d)", background: "var(--gold-bg)" }}>
          <div className="top-performer-title">
            <Trophy size={16} strokeWidth={2} />
            {t("topPerformer", { name: resolveSegmentName(top.segment, tSegments) })}
          </div>
          <div style={{ fontSize: 12, color: "var(--cream2)" }}>
            {t("topPerformerSub", { won: formatNumber(top.won, locale), count: formatNumber(top.count, locale), conv: formatNumber(top.conv, locale) })}
          </div>
        </Panel>
      )}

      <Tbl>
        <thead>
          <tr>
            <th>{t("colSegment")}</th>
            <th>{t("colClients")}</th>
            <th>{t("colContracts")}</th>
            <th>{t("colConversion")}</th>
            <th>{t("colSize")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            return (
              <tr key={r.segment.id}>
                <td className="name-cell">
                  <span className="segment-name-cell">
                    <SegmentIcon segmentId={r.segment.id} size={14} strokeWidth={1.8} />
                    {resolveSegmentName(r.segment, tSegments)}
                  </span>
                </td>
                <td>{formatNumber(r.count, locale)}</td>
                <td style={{ color: "var(--ok)" }}>{formatNumber(r.won, locale)}</td>
                <td>{formatNumber(r.conv, locale)}%</td>
                <td style={{ minWidth: 100 }}>
                  <div className="prog" style={{ margin: 0 }}>
                    <div className="bar" style={{ width: `${Math.round((r.count / maxCount) * 100)}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Tbl>
    </>
  );
}
