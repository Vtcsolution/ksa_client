"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import { Frow } from "@/components/ui/Form";
import TargetHistory from "@/components/TargetHistory";
import { useAppStore } from "@/store/useAppStore";
import type { Target } from "@/lib/types";
import { resolveUserName } from "@/lib/resolve";
import { Save, Target as TargetIcon, UserRoleIcon } from "@/lib/icons";

export default function TargetsPage() {
  const t = useTranslations("targetsPage");
  const tUsers = useTranslations("users");
  const users = useAppStore((s) => s.users);
  const updateTarget = useAppStore((s) => s.updateTarget);
  const reps = users.filter((u) => u.role === "rep");
  const [edits, setEdits] = useState<Record<string, Target>>({});

  const fieldFor = (repId: string, base: Target) => edits[repId] ?? base;
  const setField = (repId: string, base: Target, key: keyof Target, value: number) => {
    setEdits((e) => ({ ...e, [repId]: { ...fieldFor(repId, base), [key]: value } }));
  };
  const isDirty = (repId: string, base: Target) => {
    const cur = edits[repId];
    if (!cur) return false;
    return (Object.keys(cur) as (keyof Target)[]).some((k) => cur[k] !== base[k]);
  };

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />
      {reps.map((rep) => {
        const base = rep.target!;
        const cur = fieldFor(rep.id, base);
        const dirty = isDirty(rep.id, base);
        return (
          <Panel key={rep.id}>
            <PanelHeader
              title={
                <span className="staff-panel-title">
                  <span className="staff-panel-avatar">
                    <UserRoleIcon role={rep.role} size={15} strokeWidth={1.8} />
                  </span>
                  {resolveUserName(rep, tUsers)}
                </span>
              }
              action={
                dirty && (
                  <Button
                    variant="gold"
                    sm
                    onClick={() => {
                      updateTarget(rep.id, cur);
                      setEdits((e) => {
                        const n = { ...e };
                        delete n[rep.id];
                        return n;
                      });
                    }}
                  >
                    <Save size={12} />
                    {t("saveBtn")}
                  </Button>
                )
              }
            />
            <div className="grid-4">
              <Frow label={t("dailyCalls")}>
                <input type="number" min={0} value={cur.dailyCalls} onChange={(e) => setField(rep.id, base, "dailyCalls", Number(e.target.value))} />
              </Frow>
              <Frow label={t("dailyVisits")}>
                <input type="number" min={0} value={cur.dailyVisits} onChange={(e) => setField(rep.id, base, "dailyVisits", Number(e.target.value))} />
              </Frow>
              <Frow label={t("weeklyMeetings")}>
                <input type="number" min={0} value={cur.weeklyMeetings} onChange={(e) => setField(rep.id, base, "weeklyMeetings", Number(e.target.value))} />
              </Frow>
              <Frow label={t("monthlyContracts")}>
                <input type="number" min={0} value={cur.monthlyContracts} onChange={(e) => setField(rep.id, base, "monthlyContracts", Number(e.target.value))} />
              </Frow>
            </div>
            <TargetHistory history={rep.history ?? []} target={base} />
          </Panel>
        );
      })}
      <Panel style={{ borderColor: "var(--gold-d)" }}>
        <PanelHeader icon={TargetIcon} title={t("salaryTitle")} />
        <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("salaryBody")}</p>
      </Panel>
    </>
  );
}
