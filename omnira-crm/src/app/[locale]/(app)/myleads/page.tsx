"use client";

import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/Progress";
import EmptyState from "@/components/ui/EmptyState";
import LeadCard from "@/components/LeadCard";
import MeetingsList from "@/components/MeetingsList";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { computeStats, leadsForUser } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import { Plus, Sparkles, Target, Trophy } from "@/lib/icons";

export default function MyLeadsPage() {
  const t = useTranslations("repLeadsPage");
  const locale = useLocale();
  const leads = useAppStore((s) => s.leads);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const me = users.find((u) => u.id === currentUserId);
  const openModal = useUiStore((s) => s.openModal);

  if (!me) return null;

  const myLeads = leadsForUser(leads, me.id);
  const stats = computeStats(myLeads);
  const meetings = stats.mtgInperson + stats.mtgOnline;
  const goal = me.target?.weeklyMeetings ?? 0;
  const goalDone = goal > 0 && meetings >= goal;

  const active = myLeads.filter((l) => l.status !== "archived" && l.status !== "won" && l.status !== "followup");

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub", { n: formatNumber(active.length, locale) })}
        actions={
          me.perms?.addField && (
            <Button variant="gold" onClick={() => openModal({ type: "addField" })}>
              <Plus size={13} />
              {t("addFieldBtn")}
            </Button>
          )
        }
      />

      <div className="goal-banner">
        <div className="gb-top">
          <div className="gb-title">
            <Target size={15} strokeWidth={2} />
            {t("goalTitle")}
          </div>
          <div className="gb-nums">
            {t("goalThisWeek", { val: formatNumber(meetings, locale), goal: formatNumber(goal, locale) })}
            {goalDone && <Trophy size={17} strokeWidth={2} className="gb-trophy" />}
          </div>
        </div>
        <ProgressBar pct={goal ? (meetings / goal) * 100 : 0} ok={goalDone} />
        <div className="gb-sub">{t("goalSub")}</div>
      </div>

      <MeetingsList mine />

      {active.length === 0 ? (
        <EmptyState icon={Sparkles} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        active.map((l, i) => <LeadCard key={l.id} lead={l} index={i} />)
      )}
    </>
  );
}
