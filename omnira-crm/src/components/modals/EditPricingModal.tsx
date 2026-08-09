"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, TextInput } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { Wallet } from "@/lib/icons";

export default function EditPricingModal() {
  const t = useTranslations("editPricingModal");
  const tPkg = useTranslations("packages");
  const tCommon = useTranslations("common");
  const closeModal = useUiStore((s) => s.closeModal);
  const packages = useAppStore((s) => s.packages);
  const minPrice = useAppStore((s) => s.minPrice);
  const updatePackage = useAppStore((s) => s.updatePackage);
  const updateMinPrice = useAppStore((s) => s.updateMinPrice);

  const [values, setValues] = useState(() => Object.fromEntries(packages.map((p) => [p.id, { price: p.price, hours: p.hours }])));
  const [min, setMin] = useState(minPrice);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([
        ...packages
          .filter((p) => p.id !== "platinum")
          .map((p) => updatePackage(p.id, values[p.id].price, values[p.id].hours)),
        updateMinPrice(min),
      ]);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t("title")}
      icon={<Wallet size={17} strokeWidth={1.75} />}
      onClose={closeModal}
      footer={
        <>
          <Button variant="gold" onClick={save} disabled={saving}>
            {saving ? t("savingBtn") : tCommon("save")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      {packages
        .filter((p) => p.id !== "platinum")
        .map((p) => (
          <div key={p.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Frow label={`${tPkg(p.id)} — ${t("priceLabel")}`}>
              <TextInput
                type="number"
                value={values[p.id].price ?? 0}
                onChange={(e) => setValues((v) => ({ ...v, [p.id]: { ...v[p.id], price: Number(e.target.value) } }))}
              />
            </Frow>
            <Frow label={t("hoursLabel")}>
              <TextInput
                type="number"
                value={values[p.id].hours ?? 0}
                onChange={(e) => setValues((v) => ({ ...v, [p.id]: { ...v[p.id], hours: Number(e.target.value) } }))}
              />
            </Frow>
          </div>
        ))}
      <Frow label={t("minPriceLabel")}>
        <TextInput type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
      </Frow>
      <p style={{ fontSize: 10, color: "var(--soft)", marginTop: 8 }}>{t("hint")}</p>
    </Modal>
  );
}
