"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { CheckCircle2, AlertTriangle, MessageSquareText } from "@/lib/icons";
import type { ToastKind } from "@/store/useToastStore";

function ToastIcon({ kind }: { kind: ToastKind }) {
  if (kind === "warn") return <AlertTriangle size={17} strokeWidth={1.75} />;
  if (kind === "info") return <MessageSquareText size={17} strokeWidth={1.75} />;
  return <CheckCircle2 size={17} strokeWidth={1.75} />;
}

export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast ${t.kind}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <span className="ti"><ToastIcon kind={t.kind} /></span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
