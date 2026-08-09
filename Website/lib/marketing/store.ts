import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { EmailCampaign, EmailSend, SendStatus, SmsCampaign, SmsSend } from './types';

/** Same JSON-file pattern as lib/leads/store.ts, lib/feedback/store.ts, lib/testimonials/store.ts. */

const DATA_DIR = process.env.LEADS_DATA_DIR || path.join(process.cwd(), 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'email_campaigns.json');
const SENDS_FILE = path.join(DATA_DIR, 'email_sends.json');
const SMS_CAMPAIGNS_FILE = path.join(DATA_DIR, 'sms_campaigns.json');
const SMS_SENDS_FILE = path.join(DATA_DIR, 'sms_sends.json');

let writeChain: Promise<unknown> = Promise.resolve();
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

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const buf = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function writeJson<T>(file: string, items: T[]) {
  await ensureDir();
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export async function listCampaigns(): Promise<EmailCampaign[]> {
  const items = await readJson<EmailCampaign>(CAMPAIGNS_FILE);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getCampaign(id: string): Promise<EmailCampaign | null> {
  const items = await readJson<EmailCampaign>(CAMPAIGNS_FILE);
  return items.find((c) => c.id === id) ?? null;
}

export async function createCampaign(input: Omit<EmailCampaign, 'id' | 'createdAt' | 'status' | 'sentCount' | 'queuedCount' | 'failedCount' | 'openCount' | 'clickCount'>): Promise<EmailCampaign> {
  const campaign: EmailCampaign = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'draft',
    sentCount: 0,
    queuedCount: 0,
    failedCount: 0,
    openCount: 0,
    clickCount: 0,
  };
  await withLock(async () => {
    const items = await readJson<EmailCampaign>(CAMPAIGNS_FILE);
    items.push(campaign);
    await writeJson(CAMPAIGNS_FILE, items);
  });
  return campaign;
}

export async function updateCampaign(id: string, patch: Partial<EmailCampaign>): Promise<void> {
  await withLock(async () => {
    const items = await readJson<EmailCampaign>(CAMPAIGNS_FILE);
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...patch };
    await writeJson(CAMPAIGNS_FILE, items);
  });
}

export async function deleteCampaign(id: string): Promise<boolean> {
  return withLock(async () => {
    const items = await readJson<EmailCampaign>(CAMPAIGNS_FILE);
    const next = items.filter((c) => c.id !== id);
    if (next.length === items.length) return false;
    await writeJson(CAMPAIGNS_FILE, next);
    return true;
  });
}

export async function createSends(sends: Omit<EmailSend, 'id' | 'createdAt'>[]): Promise<EmailSend[]> {
  const created = sends.map((s) => ({ ...s, id: crypto.randomUUID(), createdAt: new Date().toISOString() }));
  await withLock(async () => {
    const items = await readJson<EmailSend>(SENDS_FILE);
    items.push(...created);
    await writeJson(SENDS_FILE, items);
  });
  return created;
}

export async function updateSend(id: string, patch: Partial<EmailSend>): Promise<void> {
  await withLock(async () => {
    const items = await readJson<EmailSend>(SENDS_FILE);
    const idx = items.findIndex((s) => s.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...patch };
    await writeJson(SENDS_FILE, items);
  });
}

/** Only sets a status transition forward (queued→sent→opened→clicked never regresses), and stamps the matching *At field. Used by the tracking pixel/link routes. */
export async function markSendEvent(id: string, status: Extract<SendStatus, 'opened' | 'clicked'>): Promise<void> {
  const RANK: Record<SendStatus, number> = { queued: 0, sent: 1, failed: 1, opened: 2, clicked: 3 };
  await withLock(async () => {
    const items = await readJson<EmailSend>(SENDS_FILE);
    const idx = items.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const current = items[idx];
    if (RANK[status] <= RANK[current.status]) return;
    const stampField = status === 'opened' ? 'openedAt' : 'clickedAt';
    items[idx] = { ...current, status, [stampField]: new Date().toISOString() };
    await writeJson(SENDS_FILE, items);
  });
}

export async function listSendsByCampaign(campaignId: string): Promise<EmailSend[]> {
  const items = await readJson<EmailSend>(SENDS_FILE);
  return items.filter((s) => s.campaignId === campaignId);
}

// ===== SMS — mirrors the email functions above exactly =====

export async function listSmsCampaigns(): Promise<SmsCampaign[]> {
  const items = await readJson<SmsCampaign>(SMS_CAMPAIGNS_FILE);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getSmsCampaign(id: string): Promise<SmsCampaign | null> {
  const items = await readJson<SmsCampaign>(SMS_CAMPAIGNS_FILE);
  return items.find((c) => c.id === id) ?? null;
}

export async function createSmsCampaign(
  input: Omit<SmsCampaign, 'id' | 'createdAt' | 'status' | 'sentCount' | 'queuedCount' | 'failedCount'>,
): Promise<SmsCampaign> {
  const campaign: SmsCampaign = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'draft',
    sentCount: 0,
    queuedCount: 0,
    failedCount: 0,
  };
  await withLock(async () => {
    const items = await readJson<SmsCampaign>(SMS_CAMPAIGNS_FILE);
    items.push(campaign);
    await writeJson(SMS_CAMPAIGNS_FILE, items);
  });
  return campaign;
}

export async function updateSmsCampaign(id: string, patch: Partial<SmsCampaign>): Promise<void> {
  await withLock(async () => {
    const items = await readJson<SmsCampaign>(SMS_CAMPAIGNS_FILE);
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...patch };
    await writeJson(SMS_CAMPAIGNS_FILE, items);
  });
}

export async function deleteSmsCampaign(id: string): Promise<boolean> {
  return withLock(async () => {
    const items = await readJson<SmsCampaign>(SMS_CAMPAIGNS_FILE);
    const next = items.filter((c) => c.id !== id);
    if (next.length === items.length) return false;
    await writeJson(SMS_CAMPAIGNS_FILE, next);
    return true;
  });
}

export async function createSmsSends(sends: Omit<SmsSend, 'id' | 'createdAt'>[]): Promise<SmsSend[]> {
  const created = sends.map((s) => ({ ...s, id: crypto.randomUUID(), createdAt: new Date().toISOString() }));
  await withLock(async () => {
    const items = await readJson<SmsSend>(SMS_SENDS_FILE);
    items.push(...created);
    await writeJson(SMS_SENDS_FILE, items);
  });
  return created;
}

export async function updateSmsSend(id: string, patch: Partial<SmsSend>): Promise<void> {
  await withLock(async () => {
    const items = await readJson<SmsSend>(SMS_SENDS_FILE);
    const idx = items.findIndex((s) => s.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...patch };
    await writeJson(SMS_SENDS_FILE, items);
  });
}
