"use client";

import type { LucideIcon } from "@/lib/icons";

export default function EmptyState({
  icon: IconCmp,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <div className="empty">
      <div className="ei">
        <IconCmp size={30} strokeWidth={1.5} />
      </div>
      <h4>{title}</h4>
      {body && <p>{body}</p>}
    </div>
  );
}
