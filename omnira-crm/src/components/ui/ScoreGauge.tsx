"use client";

import { useLocale } from "next-intl";
import { formatNumber } from "@/lib/format";

export default function ScoreGauge({ value, caption }: { value: number; caption: string }) {
  const locale = useLocale();
  const clamped = Math.max(0, Math.min(100, value));
  const color = clamped >= 75 ? "var(--ok)" : clamped >= 50 ? "var(--warn)" : "var(--danger)";
  return (
    <div
      className="score-gauge"
      style={{ background: `conic-gradient(${color} 0% ${clamped}%, var(--bg2) ${clamped}% 100%)` }}
    >
      <div className="score-gauge-hole">
        <div className="score-gauge-val" style={{ color }}>
          {formatNumber(clamped, locale)}
        </div>
        <div className="score-gauge-cap">{caption}</div>
      </div>
    </div>
  );
}
