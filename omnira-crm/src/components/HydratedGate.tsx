"use client";

import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function HydratedGate({ children }: { children: ReactNode }) {
  const hydrated = useAppStore((s) => s.hasHydrated);
  const initialize = useAppStore((s) => s.initialize);

  // Must live here, not in a child gated behind `hydrated` — a child would
  // never mount to fire this effect in the first place, since nothing would
  // ever flip `hydrated` to true. (This gate always renders regardless of
  // hydration state, so it's the only safe place to kick this off.)
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) {
    return (
      <div className="login-wrap">
        <div className="login-logo">
          <div className="dot" />
          <div className="name">OMNIRA VALET</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
