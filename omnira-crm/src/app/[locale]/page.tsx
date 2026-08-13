"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS } from "@/lib/demoAccounts";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ChevronLeft, ChevronRight, UserRoleIcon } from "@/lib/icons";

const SHOW_DEMO_LOGIN = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "true";

export default function LoginPage() {
  const t = useTranslations("app");
  const tAuth = useTranslations("auth");
  const tUsers = useTranslations("users");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(false);

  const afterLogin = async (userId: string, fallbackRole?: "manager" | "rep") => {
    let role = fallbackRole;
    if (!role) {
      const supabase = createClient();
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      role = profile?.role === "manager" ? "manager" : "rep";
    }
    router.push(role === "manager" ? "/dashboard" : "/myleads");
    router.refresh();
  };

  const handleLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    if (pending) return;
    setPending(account.key);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: account.email, password: account.password });
    if (error) {
      setPending(null);
      return;
    }
    await afterLogin(account.key, account.role);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setFormError(false);
    setPending("manual");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setPending(null);
      setFormError(true);
      return;
    }
    await afterLogin(data.user.id);
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

        <form onSubmit={handleManualLogin} className="login-form">
          <div className="field">
            <label htmlFor="login-email">{tAuth("emailLabel")}</label>
            <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!pending} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="login-password">{tAuth("passwordLabel")}</label>
            <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={!!pending} autoComplete="current-password" />
          </div>
          {formError && <div className="form-error">{tAuth("invalidCredentials")}</div>}
          <button type="submit" className="btn-primary" disabled={!!pending}>
            {tAuth("loginButton")}
          </button>
        </form>

        {SHOW_DEMO_LOGIN && (
          <>
            <div className="login-divider">{tAuth("orDivider")}</div>
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
          </>
        )}
      </div>
    </div>
  );
}
