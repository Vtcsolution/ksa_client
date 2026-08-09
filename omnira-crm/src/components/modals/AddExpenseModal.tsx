"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Frow, Frow2, Select, TextInput } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import { localISO } from "@/lib/format";
import { Wallet } from "@/lib/icons";

const CATEGORIES = ["salaries", "insurance", "equipment", "marketing", "rent", "other"] as const;

export default function AddExpenseModal() {
  const t = useTranslations("addExpenseModal");
  const tCat = useTranslations("expenseCategory");
  const tCommon = useTranslations("common");
  const closeModal = useUiStore((s) => s.closeModal);
  const addExpense = useAppStore((s) => s.addExpense);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("other");
  const [date, setDate] = useState(localISO(new Date()).slice(0, 10));
  const [saving, setSaving] = useState(false);

  const canSave = description.trim() && amount > 0;

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addExpense({ description: description.trim(), amount, category, date });
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
          <Button variant="gold" onClick={save} disabled={!canSave || saving}>
            {saving ? t("savingBtn") : tCommon("save")}
          </Button>
          <Button onClick={closeModal}>{tCommon("cancel")}</Button>
        </>
      }
    >
      <Frow label={t("descriptionLabel")}>
        <TextInput value={description} onChange={(e) => setDescription(e.target.value)} autoFocus placeholder={t("descriptionPlaceholder")} />
      </Frow>
      <Frow2>
        <Frow label={t("amountLabel")}>
          <TextInput type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </Frow>
        <Frow label={t("dateLabel")}>
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Frow>
      </Frow2>
      <Frow label={t("categoryLabel")}>
        <Select value={category} onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tCat(c)}
            </option>
          ))}
        </Select>
      </Frow>
    </Modal>
  );
}
