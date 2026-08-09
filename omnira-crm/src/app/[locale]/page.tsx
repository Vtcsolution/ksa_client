"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/demoAccounts";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ChevronLeft, ChevronRight, UserRoleIcon } from "@/lib/icons";

export default function LoginPage() {
  const t = useTranslations("app");
  const tAuth = useTranslations("auth");
  const tUsers = useTranslations("users");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const handleLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    if (pending) return;
    setPending(account.key);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: account.email, password: account.password });
    if (error) {
      setPending(null);
      return;
    }
    router.push(account.role === "manager" ? "/dashboard" : "/myleads");
    router.refresh();
  };

  return (
    <div className="login-wrap">
      <div style={{ position: "fixed", top: 18, insetInlineEnd: 18 }}>
        <LocaleSwitcher className="btn ghost sm" />
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="dot" />
          <div className="name">{t("wordmark")}</div>
          <div className="sub">{t("tagline")}</div>
        </div>
        <h2>{tAuth("loginTitle")}</h2>
        <div className="hint">{tAuth("loginHint")}</div>
        <div className="demo-accounts">
          <div className="dtitle">{tAuth("demoTitle")}</div>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.key}
              className="demo-btn"
              onClick={() => handleLogin(account)}
              disabled={!!pending}
              type="button"
            >
              <div
                className="av"
                style={{
                  background: account.role === "manager" ? "var(--gold-bg)" : "var(--blue-bg)",
                  color: account.role === "manager" ? "var(--gold-l)" : "var(--blue)",
                }}
              >
                <UserRoleIcon role={account.role} size={16} strokeWidth={1.8} />
              </div>
              <div className="di">
                <b>{tUsers(account.key)}</b>
                <span>{tAuth(account.descKey)}</span>
              </div>
              <div className="dgo">
                {locale === "ar" ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
