"use client";

import type { ReactNode } from "react";

export function Tbl({ children }: { children: ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tbl">{children}</table>
    </div>
  );
}
