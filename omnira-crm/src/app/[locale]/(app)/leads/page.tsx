"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Form";
import SearchBar from "@/components/ui/SearchBar";
import { Tbl } from "@/components/ui/Table";
import { Chip, SegmentChip, StatusChip } from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { resolveLeadName, resolveSegmentName, resolveUserNameById } from "@/lib/resolve";
import { formatNumber } from "@/lib/format";
import { Car, ChevronLeft, ChevronRight, Phone, Search } from "@/lib/icons";

export default function LeadsPage() {
  const t = useTranslations("leadsPage");
  const tCommon = useTranslations("common");
  const tSegments = useTranslations("segments");
  const tUsers = useTranslations("users");
  const locale = useLocale();

  const leads = useAppStore((s) => s.leads);
  const segments = useAppStore((s) => s.segments);
  const users = useAppStore((s) => s.users);
  const openModal = useUiStore((s) => s.openModal);

  const [query, setQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const active = useMemo(() => {
    return leads
      .filter((l) => l.status !== "archived")
      .filter((l) => segmentFilter === "all" || l.segment === segmentFilter)
      .filter((l) => !query || l.name.includes(query) || l.nameEn?.toLowerCase().includes(query.toLowerCase()) || l.phone.includes(query))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [leads, segmentFilter, query]);

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub", { n: formatNumber(active.length, locale) })}
        actions={
          <>
            <SearchBar value={query} onChange={setQuery} placeholder={t("searchPlaceholder")} />
            <Select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}>
              <option value="all">{tCommon("allSegments")}</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {resolveSegmentName(s, tSegments)}
                </option>
              ))}
            </Select>
          </>
        }
      />
      {active.length === 0 ? (
        <EmptyState icon={Search} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <Tbl>
          <thead>
            <tr>
              <th>{t("colClient")}</th>
              <th>{t("colSegment")}</th>
              <th>{t("colRep")}</th>
              <th>{t("colStatus")}</th>
              <th>{t("colPhone")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {active.map((l) => (
              <tr key={l.id} onClick={() => openModal({ type: "leadDetail", leadId: l.id })} style={{ cursor: "pointer" }}>
                <td className="name-cell">
                  {resolveLeadName(l, locale)}
                  {l.source === "field" && (
                    <Chip cls="seg" className="field-badge">
                      <Car size={10} strokeWidth={2} />
                      {tCommon("field")}
                    </Chip>
                  )}
                  {l.source === "ziwo" && (
                    <Chip cls="seg" className="field-badge">
                      <Phone size={10} strokeWidth={2} />
                      {tCommon("ziwo")}
                    </Chip>
                  )}
                </td>
                <td>
                  <SegmentChip segmentId={l.segment} />
                </td>
                <td>{l.assignedTo ? resolveUserNameById(l.assignedTo, users, tUsers) : tCommon("unassigned")}</td>
                <td>
                  <StatusChip status={l.status} />
                </td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{l.phone}</td>
                <td className="row-chevron">
                  {locale === "ar" ? <ChevronLeft size={15} strokeWidth={2} /> : <ChevronRight size={15} strokeWidth={2} />}
                </td>
              </tr>
            ))}
          </tbody>
        </Tbl>
      )}
    </>
  );
}
