"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Frow2, Opt, OptGrid } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { formatNumber } from "@/lib/format";
import { resolveLeadName } from "@/lib/resolve";
import { Calculator } from "@/lib/icons";

export default function QuoteModal({ leadId }: { leadId: string }) {
  const t = useTranslations("quoteModal");
  const tPkg = useTranslations("packages");
  const locale = useLocale();
  const closeModal = useUiStore((s) => s.closeModal);
  const lead = useAppStore((s) => s.leads.find((l) => l.id === leadId));
  const currentUserId = useAppStore((s) => s.currentUserId);
  const sendQuote = useAppStore((s) => s.sendQuote);
  const packages = useAppStore((s) => s.packages);
  const minPrice = useAppStore((s) => s.minPrice);

  const [packageId, setPackageId] = useState<"silver" | "gold" | "platinum">("silver");
  const [count, setCount] = useState(1);
  const pkg = packages.find((p) => p.id === packageId);
  const [price, setPrice] = useState(pkg?.price ?? 0);

  const selectPackage = (id: "silver" | "gold" | "platinum") => {
    setPackageId(id);
    setPrice(packages.find((p) => p.id === id)?.price ?? 0);
  };

  if (!lead || !currentUserId || !pkg) return null;

  const total = price * count;
  const belowMin = packageId !== "platinum" && price < minPrice;
  const negotiated = packageId !== "platinum" && price < pkg.price;

  const save = async () => {
    if (belowMin) return;
    const res = await sendQuote(leadId, currentUserId, { packageId, count, price });
    if (res.ok) closeModal();
  };

  return (
    <Modal
      title={t("title", { name: resolveLeadName(lead, locale) })}
      icon={<Calculator size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <Button variant="gold" onClick={save} disabled={belowMin}>
          {packageId === "platinum" ? t("sendPlatinumBtn") : t("sendBtn")}
        </Button>
      }
    >
      <p style={{ fontSize: 12.5, color: "var(--cream2)", marginBottom: 12 }}>{t("intro")}</p>
      <Frow label={t("packageLabel")}>
        <OptGrid columns={3}>
          {packages.map((p) => (
            <Opt key={p.id} selected={packageId === p.id} onClick={() => selectPackage(p.id)}>
              {tPkg(p.id)}
            </Opt>
          ))}
        </OptGrid>
      </Frow>
      {packageId !== "platinum" && (
        <Frow2>
          <Frow label={t("captainCountLabel")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button sm onClick={() => setCount((c) => Math.max(1, c - 1))} type="button">
                −
              </Button>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, minWidth: 24, textAlign: "center" }}>
                {formatNumber(count, locale)}
              </span>
              <Button sm onClick={() => setCount((c) => c + 1)} type="button">
                +
              </Button>
            </div>
          </Frow>
          <Frow
            label={t("priceLabel")}
            hint={t("officialPriceHint", { price: formatNumber(pkg.price, locale), min: formatNumber(minPrice, locale) })}
          >
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </Frow>
        </Frow2>
      )}
      {packageId === "platinum" && (
        <Frow label={t("captainCountLabel")}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button sm onClick={() => setCount((c) => Math.max(1, c - 1))} type="button">
              −
            </Button>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, minWidth: 24, textAlign: "center" }}>
              {formatNumber(count, locale)}
            </span>
            <Button sm onClick={() => setCount((c) => c + 1)} type="button">
              +
            </Button>
          </div>
        </Frow>
      )}
      {belowMin && <p style={{ fontSize: 11.5, color: "var(--danger-l)", marginBottom: 10 }}>{t("belowMinError", { min: formatNumber(minPrice, locale) })}</p>}
      <div className="kpi" style={{ marginBottom: 0 }}>
        <div className="kt">{t("totalLabel")}</div>
        <div className="kv">
          {formatNumber(total, locale)} <small>{negotiated ? t("negotiatedTag", { official: formatNumber(pkg.price, locale) }) : ""}</small>
        </div>
      </div>
    </Modal>
  );
}
