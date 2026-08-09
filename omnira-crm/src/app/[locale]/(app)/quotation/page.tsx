"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel } from "@/components/ui/Panel";
import { Frow, Frow2, Opt, OptGrid, Select, TextInput, Textarea } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { resolveLeadName } from "@/lib/resolve";
import { formatNumber } from "@/lib/format";
import { Check, Printer } from "@/lib/icons";

type PackageId = "silver" | "gold" | "platinum";

export default function QuotationPage() {
  const t = useTranslations("quotationPage");
  const tPkg = useTranslations("packages");
  const tServices = useTranslations("services");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const packages = useAppStore((s) => s.packages);
  const leads = useAppStore((s) => s.leads);
  const clientOptions = [...leads]
    .filter((l) => l.status !== "archived")
    .sort((a, b) => resolveLeadName(a, locale).localeCompare(resolveLeadName(b, locale)));

  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [packageId, setPackageId] = useState<PackageId>("silver");
  const [count, setCount] = useState(1);
  const [price, setPrice] = useState<number>(packages.find((p) => p.id === "silver")?.price ?? 0);
  const [notes, setNotes] = useState("");
  // Generated once on mount, not on every render — a quote number that changed on
  // re-render (e.g. while typing) would be actively misleading on a printed document.
  const [quoteNo] = useState(() => {
    const d = new Date();
    return `Q-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`;
  });

  const pkg = packages.find((p) => p.id === packageId);
  const total = price * count;
  const today = new Date();
  const validUntil = new Date(today.getTime() + 30 * 86400000);

  const selectPackage = (id: PackageId) => {
    setPackageId(id);
    setPrice(packages.find((p) => p.id === id)?.price ?? 0);
  };

  const applyLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setCompanyName(resolveLeadName(lead, locale));
    setContactName(lead.decisionMaker ? (locale === "ar" ? lead.decisionMaker.name : (lead.decisionMaker.nameEn ?? lead.decisionMaker.name)) : "");
    setContactPhone(lead.decisionMaker?.phone || lead.phone);
  };

  const fmtDate = (d: Date) => d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <>
      <PageHeader
        title={t("header")}
        sub={t("sub")}
        actions={
          <div className="no-print" style={{ display: "flex", gap: 10 }}>
            <Button variant="gold" onClick={() => window.print()} disabled={!companyName.trim()}>
              <Printer size={13} />
              {t("printBtn")}
            </Button>
          </div>
        }
      />

      <Panel className="no-print">
        <Frow label={t("selectClientLabel")}>
          <Select value={selectedLeadId} onChange={(e) => applyLead(e.target.value)}>
            <option value="">{t("newCompanyOption")}</option>
            {clientOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {resolveLeadName(l, locale)}
              </option>
            ))}
          </Select>
        </Frow>
        <Frow2>
          <Frow label={t("companyNameLabel")}>
            <TextInput
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setSelectedLeadId("");
              }}
              placeholder={t("companyNamePlaceholder")}
            />
          </Frow>
          <Frow label={t("contactNameLabel")}>
            <TextInput value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Frow>
        </Frow2>
        <Frow label={t("contactPhoneLabel")}>
          <TextInput value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </Frow>
        <Frow label={t("packageLabel")}>
          <OptGrid columns={3}>
            {packages.map((p) => (
              <Opt key={p.id} selected={packageId === p.id} onClick={() => selectPackage(p.id)}>
                {tPkg(p.id)}
              </Opt>
            ))}
          </OptGrid>
        </Frow>
        <Frow2>
          <Frow label={t("countLabel")}>
            <TextInput type="number" min={1} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} />
          </Frow>
          <Frow label={t("priceLabel")}>
            <TextInput type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </Frow>
        </Frow2>
        <Frow label={t("notesLabel")}>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={t("notesPlaceholder")} />
        </Frow>
        {!companyName.trim() && <p style={{ fontSize: 11, color: "var(--warn)" }}>{t("companyNameRequired")}</p>}
      </Panel>

      <div className="paper">
        <div className="p-brand">
          <div className="pb-l">
            <div>{t("quoteNo", { no: quoteNo })}</div>
            <div>{t("issueDate", { date: fmtDate(today) })}</div>
            <div>{t("validUntil", { date: fmtDate(validUntil) })}</div>
          </div>
          <div className="pb-r">
            <div className="pb-logo">OMNIRA VALET</div>
            <h2>{t("docTitle")}</h2>
          </div>
        </div>

        <div className="p-emp">
          <div>{t("toLabel")} <b>{companyName || t("companyNamePlaceholder")}</b></div>
          {contactName && <div>{t("attnLabel")} <b>{contactName}</b></div>}
          {contactPhone && <div>{t("phoneLabel")} <b>{contactPhone}</b></div>}
        </div>

        <h3 className="p-sec">{tServices("s1.name")}</h3>
        <table className="p-tbl">
          <thead>
            <tr>
              <th>{t("colPackage")}</th>
              <th>{t("colHours")}</th>
              <th>{t("colCount")}</th>
              <th>{t("colUnitPrice")}</th>
              <th>{t("colTotal")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tPkg(packageId)}</td>
              <td>{pkg?.hours ? tPkg("hoursLabel", { n: formatNumber(pkg.hours, locale) }) : tPkg("custom")}</td>
              <td>{formatNumber(count, locale)}</td>
              <td>{formatNumber(price, locale)} {tCommon("sar")}</td>
              <td><b>{formatNumber(total, locale)} {tCommon("sar")}</b></td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gold-l)", marginBottom: 8 }}>{t("includesTitle")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {tServices.raw("s1.includes").map((inc: string, i: number) => (
              <div key={i} className="include-row">
                <Check size={13} strokeWidth={2.5} />
                {inc}
              </div>
            ))}
          </div>
        </div>

        {notes && (
          <div className="p-notes">
            <h3 className="p-sec">{t("notesTitle")}</h3>
            <p style={{ fontSize: 12, color: "var(--cream2)", whiteSpace: "pre-wrap" }}>{notes}</p>
          </div>
        )}

        <div className="p-summary">{t("footerNote", { date: fmtDate(validUntil) })}</div>

        <div className="p-sign">
          <div className="sg">
            <div className="line" />
            {t("signOmnira")}
          </div>
          <div className="sg">
            <div className="line" />
            {t("signClient")}
          </div>
        </div>
      </div>
    </>
  );
}
