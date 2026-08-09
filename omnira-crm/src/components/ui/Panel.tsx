"use client";

import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "@/lib/icons";

export function Panel({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={clsx("panel", className)} style={style}>
      {children}
    </div>
  );
}

export function PanelHeader({
  icon: IconCmp,
  title,
  action,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="panel-h">
      <h3>
        {IconCmp && (
          <span className="pi">
            <IconCmp size={17} strokeWidth={1.75} />
          </span>
        )}
        {title}
      </h3>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="ph">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
