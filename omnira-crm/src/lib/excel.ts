import { isPhoneLike, isUrlLike, normPhone } from "./phone";

export interface ParsedRow {
  name: string;
  phone: string;
  location: string;
  segment: string;
}

const HEADER_KEYWORDS = ["اسم", "رقم", "جوال", "لوكيشن", "موقع", "نيش", "قطاع", "name", "phone", "location"];

function classifyRows(
  raw: unknown[][],
  segmentOptions: { id: string; label: string }[],
  defaultSegment: string,
): ParsedRow[] {
  const rows = raw
    .map((r) => r.map((c) => String(c ?? "").trim()).filter(Boolean))
    .filter((r) => r.length > 0);

  if (rows.length === 0) return [];

  const first = rows[0];
  const joined = first.join(" ").toLowerCase();
  const looksLikeHeader =
    HEADER_KEYWORDS.some((k) => joined.includes(k.toLowerCase())) && !first.some((c) => isPhoneLike(c));
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  const out: ParsedRow[] = [];
  for (const row of dataRows) {
    let phone = "";
    let location = "";
    let segment = "";
    const nameParts: string[] = [];

    for (const cell of row) {
      if (!phone && isPhoneLike(cell)) {
        phone = normPhone(cell);
        continue;
      }
      if (!location && isUrlLike(cell)) {
        location = cell;
        continue;
      }
      if (!segment) {
        const match = segmentOptions.find((s) => s.label === cell);
        if (match) {
          segment = match.id;
          continue;
        }
      }
      nameParts.push(cell);
    }

    out.push({
      name: nameParts.join(" "),
      phone,
      location,
      segment: segment || defaultSegment,
    });
  }

  return out.filter((r) => r.name || r.phone);
}

export async function parseSpreadsheetFile(
  file: File,
  segmentOptions: { id: string; label: string }[],
  defaultSegment: string,
): Promise<ParsedRow[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  return classifyRows(raw, segmentOptions, defaultSegment);
}
