"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";

export function MiniRow({ children }: { children: ReactNode }) {
  return <div className="mini-row">{children}</div>;
}

export function MiniStat({ value, label }: { value: number; label: string }) {
  const locale = useLocale();
  return (
    <div className="mini">
      <div className="mv">{formatNumber(value, locale)}</div>
      <div className="ml">{label}</div>
    </div>
  );
}
