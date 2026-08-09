"use client";

import clsx from "clsx";

export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="seg-ctrl">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={clsx(o.value === value && "on")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
