"use client";

import clsx from "clsx";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Frow({
  label,
  hint,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="frow">
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="hintline">{hint}</div>}
    </div>
  );
}

export function Frow2({ children }: { children: ReactNode }) {
  return <div className="frow-2">{children}</div>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />;
}

export function OptGrid({
  children,
  columns,
}: {
  children: ReactNode;
  columns?: number;
}) {
  return (
    <div className="opt-grid" style={columns ? { gridTemplateColumns: `repeat(${columns},1fr)` } : undefined}>
      {children}
    </div>
  );
}

export function Opt({
  selected,
  onClick,
  icon,
  children,
  type = "button",
}: {
  selected?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={clsx("opt", selected && "sel")} onClick={onClick}>
      {icon && <span className="oi">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={clsx("toggle", on && "on")}
      onClick={onClick}
      role="switch"
      aria-checked={on}
    />
  );
}
