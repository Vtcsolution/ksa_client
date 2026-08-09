"use client";

import { useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { PERM_KEYS } from "@/lib/constants";
import { resolveUserName } from "@/lib/resolve";
import { Lock, UserPlus, UserRoleIcon } from "@/lib/icons";

export default function StaffPage() {
  const t = useTranslations("staffPage");
  const tUsers = useTranslations("users");
  const tPerms = useTranslations("perms");

  const users = useAppStore((s) => s.users);
  const updatePerm = useAppStore((s) => s.updatePerm);
  const openModal = useUiStore((s) => s.openModal);
  const reps = users.filter((u) => u.role === "rep");

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <Button variant="gold" onClick={() => openModal({ type: "addStaff" })}>
            <UserPlus size={13} />
            {t("addStaffBtn")}
          </Button>
        }
      />

      {reps.map((rep) => {
        return (
          <Panel key={rep.id}>
            <PanelHeader
              title={
                <span className="staff-panel-title">
                  <span className="staff-panel-avatar">
                    <UserRoleIcon role={rep.role} size={15} strokeWidth={1.8} />
                  </span>
                  {resolveUserName(rep, tUsers)}
                  <span className={`att-dot ${rep.checkedIn ? "on" : "off"}`} />
                </span>
              }
              action={
                <span className="role-pill rep">{rep.id === "u_azza" ? t("roleMeetings") : t("roleSales")}</span>
              }
            />
            <div className="grid-2">
              {PERM_KEYS.map((key) => (
                <div key={key} className="perm-item">
                  <div>
                    <div className="pn">{tPerms(`${key}.name`)}</div>
                    <div className="pd">{tPerms(`${key}.desc`)}</div>
                  </div>
                  <Toggle on={!!rep.perms?.[key]} onClick={() => updatePerm(rep.id, key, !rep.perms?.[key])} />
                </div>
              ))}
            </div>
          </Panel>
        );
      })}

      <Panel style={{ borderColor: "var(--gold-d)" }}>
        <PanelHeader icon={Lock} title={t("exclusiveTitle")} />
        <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("exclusiveBody")}</p>
      </Panel>
    </>
  );
}
