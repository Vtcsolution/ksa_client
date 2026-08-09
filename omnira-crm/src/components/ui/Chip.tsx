"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { LeadStatus } from "@/lib/types";
import { STATUS_CHIP_CLASS } from "@/lib/constants";
import { SegmentIcon } from "@/lib/icons";
import { useAppStore } from "@/store/useAppStore";
import { resolveSegmentNameById } from "@/lib/resolve";

export function Chip({
  cls,
  children,
  className,
}: {
  cls: string;
  children: ReactNode;
  className?: string;
}) {
  return <span className={clsx("chip", cls, className)}>{children}</span>;
}

export function StatusChip({ status }: { status: LeadStatus }) {
  const t = useTranslations("status");
  return <Chip cls={STATUS_CHIP_CLASS[status]}>{t(status)}</Chip>;
}

export function SegmentChip({ segmentId, className }: { segmentId: string; className?: string }) {
  const tSegments = useTranslations("segments");
  const segments = useAppStore((s) => s.segments);
  return (
    <Chip cls="seg" className={className}>
      <SegmentIcon segmentId={segmentId} size={12} strokeWidth={2} />
      {resolveSegmentNameById(segmentId, segments, tSegments)}
    </Chip>
  );
}
