"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatClock } from "@/lib/format";
import { resolveUserName } from "@/lib/resolve";
import { Clock, LogOut, Menu, UserRoleIcon } from "@/lib/icons";
import NotifBell from "./NotifBell";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Topbar() {
  const t = useTranslations("app");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tDate = useTranslations("dateHelpers");
  const locale = useLocale();
  const router = useRouter();
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const logout = useAppStore((s) => s.logout);
  const me = users.find((u) => u.id === currentUserId);
  const toggleDrawer = useUiStore((s) => s.toggleDrawer);

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!me) return null;

  return (
    <div className="topbar">
      <div className="brand">
        {me.role === "manager" && (
          <button type="button" className="hamburger-btn" onClick={toggleDrawer} aria-label="menu">
            <Menu size={18} />
          </button>
        )}
        <div className="dot" />
        <div className="bn">{t("wordmark")}</div>
        <span className={`role-pill ${me.role === "manager" ? "mgr" : "rep"}`}>
          {me.role === "manager" ? tCommon("manager") : tCommon("rep")}
        </span>
      </div>
      <div className="user-area">
        <div className="clock">
          <Clock size={13} strokeWidth={2} />
          {formatClock(now, locale, tDate)}
        </div>
        <LocaleSwitcher className="btn ghost sm" />
        <NotifBell />
        <div className="uname">
          <div className="ua">
            <UserRoleIcon role={me.role} size={16} strokeWidth={1.8} />
          </div>
          <div className="un">{resolveUserName(me, tUsers)}</div>
        </div>
        <button
          className="logout"
          type="button"
          onClick={async () => {
            await logout();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut size={14} strokeWidth={2} />
          <span className="logout-txt">{tCommon("logout")}</span>
        </button>
      </div>
    </div>
  );
}
