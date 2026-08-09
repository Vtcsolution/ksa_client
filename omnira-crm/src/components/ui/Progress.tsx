"use client";

import clsx from "clsx";
import { motion } from "framer-motion";

export default function ProgressBar({ pct, ok }: { pct: number; ok?: boolean }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={clsx("prog", ok && "ok")}>
      <motion.div
        className="bar"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
