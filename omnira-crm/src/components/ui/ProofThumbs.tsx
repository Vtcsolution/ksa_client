"use client";

import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Loader2 } from "@/lib/icons";
import type { LucideIcon } from "@/lib/icons";

export interface ProofTile {
  key: string;
  icon: LucideIcon;
  label: string;
  state: "empty" | "loading" | "filled" | "review";
}

function ProofTileIcon({ tile }: { tile: ProofTile }) {
  if (tile.state === "loading") return <Loader2 size={22} strokeWidth={1.6} className="animate-spin" />;
  if (tile.state === "filled") return <CheckCircle2 size={22} strokeWidth={1.6} />;
  if (tile.state === "review") return <AlertTriangle size={22} strokeWidth={1.6} />;
  const Icon = tile.icon;
  return <Icon size={22} strokeWidth={1.6} />;
}

export default function ProofThumbs({
  tiles,
  onTap,
}: {
  tiles: ProofTile[];
  onTap: (key: string) => void;
}) {
  return (
    <div className="proof-thumbs">
      {tiles.map((tile) => (
        <button
          key={tile.key}
          type="button"
          className={clsx("pthumb", (tile.state === "filled" || tile.state === "review") && "filled")}
          style={tile.state === "review" ? { borderColor: "var(--warn)", background: "var(--warn-bg)" } : undefined}
          onClick={() => onTap(tile.key)}
        >
          <span className="pei">
            <ProofTileIcon tile={tile} />
          </span>
          <span className="pel">{tile.label}</span>
        </button>
      ))}
    </div>
  );
}
