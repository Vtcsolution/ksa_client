export type DateHelperT = (key: string, params?: Record<string, string | number>) => string;

export function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-arab" : "en-US").format(n);
}

export function formatMoney(n: number, locale: string): string {
  return formatNumber(Math.round(n), locale);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(totalSec: number, locale: string): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${formatNumber(m, locale)}:${formatNumber(s, locale).padStart(2, locale === "ar" ? "٠" : "0")}`;
}

function ampm(hours: number, locale: string, t: DateHelperT): string {
  return hours < 12 ? t("am") : t("pm");
}

export function formatClock(date: Date, locale: string, t: DateHelperT): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ap = ampm(h, locale, t);
  h = h % 12 || 12;
  return `${formatNumber(h, locale)}:${formatNumber(m, locale).padStart(2, locale === "ar" ? "٠" : "0")} ${ap}`;
}

/** Mirrors the original fmtDT() helper: relative day label + time. Accepts epoch ms or "YYYY-MM-DDTHH:mm". */
export function formatDT(value: string | number | null | undefined, locale: string, t: DateHelperT): string {
  if (!value) return "";
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const now = new Date();
  const dayDiff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
      86400000,
  );
  let dayLabel: string;
  if (dayDiff === 0) dayLabel = t("today");
  else if (dayDiff === 1) dayLabel = t("tomorrow");
  else if (dayDiff === -1) dayLabel = t("yesterday");
  else if (dayDiff > 1 && dayDiff < 7) dayLabel = t("inNDays", { n: formatNumber(dayDiff, locale) });
  else dayLabel = `${formatNumber(d.getDate(), locale)}/${formatNumber(d.getMonth() + 1, locale)}`;
  return `${dayLabel} ${formatClock(d, locale, t)}`;
}

export function localISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function quickDT(key: string): string {
  const n = new Date();
  if (key === "hour") return localISO(new Date(Date.now() + 3600000));
  if (key === "evening") {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    if (d <= n) d.setDate(d.getDate() + 1);
    return localISO(d);
  }
  if (key === "tomorrow") {
    const d = new Date(Date.now() + 86400000);
    d.setHours(9, 30, 0, 0);
    return localISO(d);
  }
  if (key === "3days") {
    const d = new Date(Date.now() + 3 * 86400000);
    d.setHours(10, 0, 0, 0);
    return localISO(d);
  }
  if (key === "week") {
    const d = new Date(Date.now() + 7 * 86400000);
    d.setHours(10, 0, 0, 0);
    return localISO(d);
  }
  return "";
}
