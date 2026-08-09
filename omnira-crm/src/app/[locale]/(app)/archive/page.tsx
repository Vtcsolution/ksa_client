"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { Tbl } from "@/components/ui/Table";
import { Chip, SegmentChip } from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveLeadName, resolveReason } from "@/lib/resolve";
import { formatNumber } from "@/lib/format";
import { Archive, RefreshCw } from "@/lib/icons";

export default function ArchivePage() {
  const t = useTranslations("archivePage");
  const tCommon = useTranslations("common");
  const tReject = useTranslations("reasons.reject");
  const locale = useLocale();

  const leads = useAppStore((s) => s.leads);
  const reopenLead = useAppStore((s) => s.reopenLead);
  const openModal = useUiStore((s) => s.openModal);

  const archived = leads.filter((l) => l.status === "archived");
  const reasonLabels = useMemo(() => {
    const set = new Set(archived.map((l) => l.resultReasonKey).filter(Boolean) as string[]);
    return Array.from(set);
  }, [archived]);

  const [reasonFilter, setReasonFilter] = useState<string>("all");

  const filtered = reasonFilter === "all" ? archived : archived.filter((l) => l.resultReasonKey === reasonFilter);

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub", { n: formatNumber(archived.length, locale) })}
        actions={
          reasonLabels.length > 0 && (
            <SegmentedControl
              value={reasonFilter}
              onChange={setReasonFilter}
              options={[
                { value: "all", label: tCommon("all") },
                ...reasonLabels.map((k) => ({ value: k, label: resolveReason(k, tReject) })),
              ]}
            />
          )
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Archive} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <Tbl>
          <thead>
            <tr>
              <th>{t("colClient")}</th>
              <th>{t("colSegment")}</th>
              <th>{t("colReason")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td
                  className="name-cell"
                  style={{ cursor: "pointer" }}
                  onClick={() => openModal({ type: "leadDetail", leadId: l.id })}
                >
                  {resolveLeadName(l, locale)}
                </td>
                <td>
                  <SegmentChip segmentId={l.segment} />
                </td>
                <td>
                  <Chip cls="archived">{l.resultReasonKey ? resolveReason(l.resultReasonKey, tReject) : ""}</Chip>
                </td>
                <td>
                  <Button variant="green" sm onClick={() => reopenLead(l.id)}>
                    <RefreshCw size={13} />
                    {t("reopenBtn")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Tbl>
      )}

      <Panel style={{ marginTop: 18 }}>
        <PanelHeader icon={RefreshCw} title={t("smartRetargetTitle")} />
        <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("smartRetargetBody")}</p>
      </Panel>
    </>
  );
}
