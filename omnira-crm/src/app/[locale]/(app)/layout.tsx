"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/store/useAppStore";
import HydratedGate from "@/components/HydratedGate";
import Topbar from "@/components/shell/Topbar";
import Sidebar from "@/components/shell/Sidebar";
import MobileNav from "@/components/shell/MobileNav";
import MobileDrawer from "@/components/shell/MobileDrawer";
import ToastHost from "@/components/ToastHost";
import ModalRouter from "@/components/modals/ModalRouter";

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);
  const me = users.find((u) => u.id === currentUserId);

  useEffect(() => {
    // proxy.ts already blocks unauthenticated requests server-side; this only
    // covers the client-side edge case of a session expiring mid-visit.
    if (hasHydrated && !currentUserId) router.replace("/");
  }, [hasHydrated, currentUserId, router]);

  if (!me) return null;
  const isMgr = me.role === "manager";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Topbar />
      <div className="body-area">
        {isMgr && <Sidebar isMgr />}
        {!isMgr && <Sidebar isMgr={false} />}
        <div className="main">
          <div className="main-narrow">{children}</div>
        </div>
      </div>
      {!isMgr && <MobileNav />}
      {isMgr && <MobileDrawer />}
      <ToastHost />
      <ModalRouter />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydratedGate>
      <AppShell>{children}</AppShell>
    </HydratedGate>
  );
}
