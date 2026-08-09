"use client";

import type { LogEntry } from "@/lib/types";
import LogLine from "@/components/LogLine";

export default function Timeline({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="timeline">
      {entries.map((e, i) => (
        <LogLine key={i} entry={e} />
      ))}
    </div>
  );
}
