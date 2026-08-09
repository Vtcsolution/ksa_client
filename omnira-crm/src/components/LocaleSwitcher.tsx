"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "@/lib/icons";

export default function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const next = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      className={className}
      onClick={() => router.replace(pathname, { locale: next })}
      title={next === "ar" ? "العربية" : "English"}
    >
      <Languages size={13} strokeWidth={2} />
      {next === "ar" ? "AR" : "EN"}
    </button>
  );
}
