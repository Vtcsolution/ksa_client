import type { Metadata } from "next";
import { El_Messiri, Tajawal } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import IntlRuntimeSync from "@/components/IntlRuntimeSync";
import "./globals.css";

const fontDisplay = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Omnira Valet · CRM",
    description: "Omnira Valet field sales management system",
  };
}

const DIR: Record<string, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = DIR[locale] ?? "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontDisplay.variable} ${fontBody.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full bg-bg text-cream antialiased overflow-hidden" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <IntlRuntimeSync />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
