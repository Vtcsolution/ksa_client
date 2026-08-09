"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/Panel";
import SearchBar from "@/components/ui/SearchBar";
import EmptyState from "@/components/ui/EmptyState";
import LeadCard from "@/components/LeadCard";
import { useAppStore } from "@/store/useAppStore";
import { leadsForUser } from "@/lib/selectors";
import { Search, SearchX } from "@/lib/icons";

export default function SearchPage() {
  const t = useTranslations("searchPage");
  const leads = useAppStore((s) => s.leads);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const [query, setQuery] = useState("");

  const mine = currentUserId ? leadsForUser(leads, currentUserId) : [];
  const q = query.trim();
  const results = q ? mine.filter((l) => l.name.includes(q) || l.nameEn?.toLowerCase().includes(q.toLowerCase()) || l.phone.includes(q)) : [];

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />
      <SearchBar value={query} onChange={setQuery} placeholder={t("placeholder")} autoFocus />
      <div style={{ marginTop: 18 }}>
        {!q && <EmptyState icon={Search} title={t("idleTitle")} body={t("idleBody")} />}
        {q && results.length === 0 && <EmptyState icon={SearchX} title={t("noResultsTitle", { q })} body={t("noResultsBody")} />}
        {results.map((l, i) => (
          <LeadCard key={l.id} lead={l} index={i} />
        ))}
      </div>
    </>
  );
}
