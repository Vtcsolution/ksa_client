import { createTranslator } from "next-intl";

// Kept in sync by <IntlRuntimeSync/> (mounted once near the app root) so that
// store actions outside React (Zustand) can fire locale-correct toast text
// without needing a React context. Persistent data (lead activity logs)
// intentionally does NOT use this — those store translation keys + params
// and are resolved at render time so they stay correct after a locale switch.
let currentLocale = "ar";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentMessages: any = null;

export function setRuntimeIntl(locale: string, messages: unknown) {
  currentLocale = locale;
  currentMessages = messages;
}

export function getRuntimeLocale() {
  return currentLocale;
}

export function rt(namespace?: string) {
  if (!currentMessages) {
    return (key: string) => key;
  }
  return createTranslator({ locale: currentLocale, messages: currentMessages, namespace });
}
