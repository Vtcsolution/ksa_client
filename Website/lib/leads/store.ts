import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Lead, LeadStatus, LeadStats, CreateLeadInput, UpdateLeadInput } from './types';

/**
 * مخزن ليدز بسيط ومتين قائم على ملف JSON (بدون قاعدة بيانات).
 * آمن مع نسخة pm2 واحدة (fork mode): كل الكتابات متسلسلة عبر mutex،
 * والحفظ ذرّي (كتابة ملف مؤقت ثم rename). البيانات تعيش خارج شجرة git
 * (data/) فلا يمسحها الـdeploy (git reset --hard لا يمسّ الملفات غير المتعقَّبة).
 */

const DATA_DIR = process.env.LEADS_DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'leads.json');

let writeChain: Promise<unknown> = Promise.resolve();
/** يسلسل الكتابات لمنع تعارض القراءة/التعديل/الحفظ */
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readRaw(): Promise<Lead[]> {
  try {
    const buf = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function writeRaw(leads: Lead[]) {
  await ensureDir();
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(leads, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

export async function listLeads(): Promise<Lead[]> {
  const leads = await readRaw();
  // الأحدث أولًا
  return leads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getLead(id: string): Promise<Lead | null> {
  const leads = await readRaw();
  return leads.find((l) => l.id === id) ?? null;
}

export async function createLead(
  input: CreateLeadInput,
  meta: { referrer?: string; userAgent?: string; ip?: string } = {},
): Promise<Lead> {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    service: input.service?.trim() || undefined,
    message: input.message?.trim() || undefined,
    status: 'new',
    priority: 'normal',
    starred: false,
    notes: [],
    source: input.source?.trim() || undefined,
    pagePath: input.pagePath?.trim() || undefined,
    utm: input.utm && Object.keys(input.utm).length ? input.utm : undefined,
    referralCode: input.referralCode?.trim().toUpperCase() || undefined,
    referrer: meta.referrer,
    userAgent: meta.userAgent,
    ip: meta.ip,
  };
  await withLock(async () => {
    const leads = await readRaw();
    leads.push(lead);
    await writeRaw(leads);
  });
  return lead;
}

export async function updateLead(id: string, patch: UpdateLeadInput): Promise<Lead | null> {
  return withLock(async () => {
    const leads = await readRaw();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    const lead = leads[idx];
    if (patch.status) lead.status = patch.status;
    if (patch.priority) lead.priority = patch.priority;
    if (typeof patch.starred === 'boolean') lead.starred = patch.starred;
    if (patch.assignee !== undefined) lead.assignee = patch.assignee.trim() || undefined;
    if (patch.addNote) {
      lead.notes = lead.notes || [];
      lead.notes.push({ at: new Date().toISOString(), text: patch.addNote.trim() });
    }
    lead.updatedAt = new Date().toISOString();
    leads[idx] = lead;
    await writeRaw(leads);
    return lead;
  });
}

export async function deleteLead(id: string): Promise<boolean> {
  return withLock(async () => {
    const leads = await readRaw();
    const next = leads.filter((l) => l.id !== id);
    if (next.length === leads.length) return false;
    await writeRaw(next);
    return true;
  });
}

export function computeStats(leads: Lead[]): LeadStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const byStatus = {
    new: 0,
    contacted: 0,
    qualified: 0,
    won: 0,
    lost: 0,
    archived: 0,
  } as Record<LeadStatus, number>;
  let today = 0;
  let week = 0;
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    const t = new Date(l.createdAt).getTime();
    if (t >= startOfToday) today++;
    if (t >= weekAgo) week++;
  }
  return { total: leads.length, today, week, byStatus };
}
