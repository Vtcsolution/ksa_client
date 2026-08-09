"use client";

import { useLocale, useTranslations } from "next-intl";
import type { User } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { computeStats, leadsForUser } from "@/lib/selectors";
import { resolveUserName } from "@/lib/resolve";
import { formatClock, formatNumber } from "@/lib/format";
import { CheckCircle2, Handshake, Phone, Car, UserRoleIcon } from "@/lib/icons";

export default function StaffCard({ user }: { user: User }) {
  const tUsers = useTranslations("users");
  const tStaff = useTranslations("staffPage");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();
  const leads = useAppStore((s) => s.leads);
  const stats = computeStats(leadsForUser(leads, user.id));

  return (
    <div className="staff-card">
      <div className="st-top">
        <div className="st-av">
          <UserRoleIcon role={user.role} size={19} strokeWidth={1.7} />
        </div>
        <div>
          <div className="st-name">
            {resolveUserName(user, tUsers)}
            <span className={`att-dot ${user.checkedIn ? "on" : "off"}`} />
          </div>
          <div className="st-role">
            {user.id === "u_azza" ? tStaff("roleMeetings") : tStaff("roleSales")}
            {" · "}
            {user.checkedIn && user.checkInTime
              ? tStaff("checkedInAt", { time: formatClock(new Date(user.checkInTime), locale, tDate) })
              : tStaff("notCheckedIn")}
          </div>
        </div>
      </div>
      <div className="st-stats">
        <div className="st-stat">
          <div className="v">{formatNumber(stats.calls, locale)}</div>
          <div className="l">
            <Phone size={11} strokeWidth={2} />
          </div>
        </div>
        <div className="st-stat">
          <div className="v">{formatNumber(stats.visits, locale)}</div>
          <div className="l">
            <Car size={11} strokeWidth={2} />
          </div>
        </div>
        <div className="st-stat">
          <div className="v">{formatNumber(stats.mtgInperson + stats.mtgOnline, locale)}</div>
          <div className="l">
            <Handshake size={11} strokeWidth={2} />
          </div>
        </div>
        <div className="st-stat">
          <div className="v">{formatNumber(stats.won, locale)}</div>
          <div className="l">
            <CheckCircle2 size={11} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
