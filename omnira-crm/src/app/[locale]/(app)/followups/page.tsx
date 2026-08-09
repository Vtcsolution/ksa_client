"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/Panel";
import EmptyState from "@/components/ui/EmptyState";
import LeadCard from "@/components/LeadCard";
import { useAppStore } from "@/store/useAppStore";
import { leadsForUser } from "@/lib/selectors";
import { Bell } from "@/lib/icons";

export default function FollowupsPage() {
  const t = useTranslations("followupsPage");
  const leads = useAppStore((s) => s.leads);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const myFollowups = currentUserId
    ? leadsForUser(leads, currentUserId)
        .filter((l) => l.status === "followup" && l.followupDt)
        .sort((a, b) => new Date(a.followupDt!).getTime() - new Date(b.followupDt!).getTime())
    : [];

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />
      {myFollowups.length === 0 ? (
        <EmptyState icon={Bell} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        myFollowups.map((l, i) => <LeadCard key={l.id} lead={l} index={i} />)
      )}
    </>
  );
}
