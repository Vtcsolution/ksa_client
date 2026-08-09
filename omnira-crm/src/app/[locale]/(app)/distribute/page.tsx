"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import { Frow, Frow2 } from "@/components/ui/Form";
import { useAppStore } from "@/store/useAppStore";
import { useToastStore } from "@/store/useToastStore";
import { parseSpreadsheetFile, type ParsedRow } from "@/lib/excel";
import { isPhoneLike, normPhone } from "@/lib/phone";
import { resolveSegmentName, resolveUserName } from "@/lib/resolve";
import { Download, Lightbulb, Send, Trash2, UploadCloud } from "@/lib/icons";

const DEMO_ROWS: ParsedRow[] = [
  { name: "فندق شاطئ اللؤلؤة", phone: "0561122334", location: "https://maps.google.com/?q=26.4,50.1", segment: "hotels" },
  { name: "مطعم تنور الشام", phone: "0509988776", location: "", segment: "restaurants" },
  { name: "مجمع النور التجاري", phone: "0112223344", location: "", segment: "malls" },
];

export default function DistributePage() {
  const t = useTranslations("distributePage");
  const tSegments = useTranslations("segments");
  const tUsers = useTranslations("users");
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);

  const segments = useAppStore((s) => s.segments);
  const users = useAppStore((s) => s.users);
  const leads = useAppStore((s) => s.leads);
  const importLeads = useAppStore((s) => s.importLeads);
  const pushToast = useToastStore((s) => s.push);
  const reps = users.filter((u) => u.role === "rep");

  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [assignedTo, setAssignedTo] = useState(reps[0]?.id ?? "");
  const [dailyTarget, setDailyTarget] = useState(5);

  const existingPhones = new Set(leads.map((l) => normPhone(l.phone)));
  const segmentOptions = segments.map((s) => ({ id: s.id, label: resolveSegmentName(s, tSegments) }));

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseSpreadsheetFile(file, segmentOptions, segments[0]?.id ?? "");
      if (parsed.length === 0) {
        pushToast("excelEmpty", undefined, "warn");
        return;
      }
      setRows(parsed);
      pushToast("excelRead", { n: parsed.length });
    } catch {
      pushToast("excelError", undefined, "warn");
    }
  };

  const loadDemo = () => {
    setRows(DEMO_ROWS);
    pushToast("demoDataReady");
  };

  const downloadTemplate = () => {
    const headers =
      locale === "ar"
        ? ["اسم الموقع", "رقم الهاتف", "رابط الموقع", "النيش"]
        : ["Location Name", "Phone Number", "Location Link", "Niche"];
    const example =
      locale === "ar"
        ? ["فندق مثال", "0501234567", "https://maps.google.com/?q=24.7,46.6", segments[0]?.id ?? "hotels"]
        : ["Example Hotel", "0501234567", "https://maps.google.com/?q=24.7,46.6", segments[0]?.id ?? "hotels"];
    const csv = [headers, example].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "omnira-client-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRow = (i: number, patch: Partial<ParsedRow>) => {
    setRows((r) => (r ? r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)) : r));
  };
  const deleteRow = (i: number) => {
    setRows((r) => (r ? r.filter((_, idx) => idx !== i) : r));
  };

  const distribute = () => {
    if (!rows || rows.length === 0 || !assignedTo) return;
    importLeads(rows, assignedTo);
    setRows(null);
  };

  return (
    <>
      <PageHeader title={t("header")} sub={t("sub")} />

      {!rows ? (
        <>
          <Panel>
            <div
              className="upload-zone"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <div className="uz-i">
                <UploadCloud size={28} strokeWidth={1.5} />
              </div>
              <div className="uz-t">{t("uploadTitle")}</div>
              <div className="uz-s">{t("uploadHint")}</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <div style={{ textAlign: "center", marginTop: 14, display: "flex", gap: 8, justifyContent: "center" }}>
              <Button onClick={downloadTemplate}>
                <Download size={13} />
                {t("downloadTemplateBtn")}
              </Button>
              <Button onClick={loadDemo}>
                <Download size={13} />
                {t("demoDataBtn")}
              </Button>
            </div>
          </Panel>
          <Panel>
            <PanelHeader icon={Lightbulb} title={t("explainerTitle")} />
            <p style={{ fontSize: 12, color: "var(--cream2)", lineHeight: 1.7 }}>{t("explainerBody")}</p>
          </Panel>
        </>
      ) : (
        <>
          <Panel>
            <PanelHeader
              title={t("previewTitle", { n: rows.length })}
              action={<Button sm onClick={() => setRows(null)}>{t("cancelBtn")}</Button>}
            />
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t("colName")}</th>
                    <th>{t("colPhone")}</th>
                    <th>{t("colLocation")}</th>
                    <th>{t("colSegment")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const invalidPhone = r.phone.trim() !== "" && !isPhoneLike(r.phone);
                    const dup = !invalidPhone && r.phone && existingPhones.has(normPhone(r.phone));
                    return (
                      <tr key={i}>
                        <td>
                          <input className="cell-in" value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
                        </td>
                        <td>
                          <input className="cell-in" value={r.phone} onChange={(e) => updateRow(i, { phone: e.target.value })} />
                          {invalidPhone && <div style={{ fontSize: 9.5, color: "var(--danger-l)", marginTop: 3 }}>{t("invalidPhoneWarning")}</div>}
                          {dup && <div style={{ fontSize: 9.5, color: "var(--warn)", marginTop: 3 }}>{t("duplicateWarning")}</div>}
                        </td>
                        <td>
                          <input className="cell-in" value={r.location} onChange={(e) => updateRow(i, { location: e.target.value })} />
                        </td>
                        <td>
                          <select className="cell-in" value={r.segment} onChange={(e) => updateRow(i, { segment: e.target.value })}>
                            {segments.map((s) => (
                              <option key={s.id} value={s.id}>{resolveSegmentName(s, tSegments)}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button type="button" onClick={() => deleteRow(i)} style={{ color: "var(--danger-l)", display: "flex" }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel>
            <Frow2>
              <Frow label={t("distributeToLabel")}>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  {reps.map((r) => (
                    <option key={r.id} value={r.id}>{resolveUserName(r, tUsers)}</option>
                  ))}
                </select>
              </Frow>
              <Frow label={t("dailyTargetLabel")}>
                <input type="number" min={1} value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value))} />
              </Frow>
            </Frow2>
            <Button variant="gold" onClick={distribute} disabled={!assignedTo || rows.length === 0}>
              <Send size={13} />
              {t("distributeBtn", { n: rows.length })}
            </Button>
          </Panel>
        </>
      )}
    </>
  );
}
