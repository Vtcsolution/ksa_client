"use client";

import { useLocale, useMessages } from "next-intl";
import { useEffect } from "react";
import { setRuntimeIntl } from "@/lib/i18n-runtime";

export default function IntlRuntimeSync() {
  const locale = useLocale();
  const messages = useMessages();

  useEffect(() => {
    setRuntimeIntl(locale, messages);
  }, [locale, messages]);

  return null;
}
