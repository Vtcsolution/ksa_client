import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Feedback, CreateFeedbackInput, FeedbackStats, FeedbackAiFlag } from './types';

/**
 * مخزن ملاحظات العملاء — نفس نمط lib/leads/store.ts بالضبط (ملف JSON،
 * كتابات متسلسلة عبر mutex، حفظ ذرّي). يعيش خارج شجرة git فلا يمسحه الـdeploy.
 */

const DATA_DIR = process.env.LEADS_DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'feedback.json');

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

async function readRaw(): Promise<Feedback[]> {
  try {
    const buf = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? (parsed as Feedback[]) : [];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function writeRaw(items: Feedback[]) {
  await ensureDir();
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

export async function listFeedback(): Promise<Feedback[]> {
  const items = await readRaw();
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createFeedback(
  input: CreateFeedbackInput,
  meta: { referrer?: string; userAgent?: string; ip?: string } = {},
): Promise<Feedback> {
  const now = new Date().toISOString();
  const item: Feedback = {
    id: crypto.randomUUID(),
    createdAt: now,
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    rating: input.rating,
    message: input.message.trim(),
    pagePath: input.pagePath?.trim() || undefined,
    referrer: meta.referrer,
    userAgent: meta.userAgent,
    ip: meta.ip,
  };
  await withLock(async () => {
    const items = await readRaw();
    items.push(item);
    await writeRaw(items);
  });
  return item;
}

export async function updateFeedbackAiFlag(id: string, aiFlag: FeedbackAiFlag): Promise<void> {
  await withLock(async () => {
    const items = await readRaw();
    const idx = items.findIndex((f) => f.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], aiFlag };
    await writeRaw(items);
  });
}

export async function setFeedbackResolved(id: string, resolved: boolean): Promise<Feedback | null> {
  return withLock(async () => {
    const items = await readRaw();
    const idx = items.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], resolved, resolvedAt: resolved ? new Date().toISOString() : undefined };
    await writeRaw(items);
    return items[idx];
  });
}

/** Called by the recurring escalation sweep right after it successfully alerts the team — stamps when and how many times, so the sweep can decide when the next nudge is due. */
export async function markFeedbackNotified(id: string): Promise<void> {
  await withLock(async () => {
    const items = await readRaw();
    const idx = items.findIndex((f) => f.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], lastNotifiedAt: new Date().toISOString(), notifyCount: (items[idx].notifyCount ?? 0) + 1 };
    await writeRaw(items);
  });
}

export async function deleteFeedback(id: string): Promise<boolean> {
  return withLock(async () => {
    const items = await readRaw();
    const next = items.filter((f) => f.id !== id);
    if (next.length === items.length) return false;
    await writeRaw(next);
    return true;
  });
}

export function computeFeedbackStats(items: Feedback[]): FeedbackStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  let today = 0;
  let sum = 0;
  let flagged = 0;
  for (const f of items) {
    if (new Date(f.createdAt).getTime() >= startOfToday) today++;
    if (f.aiFlag?.flagged && !f.resolved) flagged++;
    sum += f.rating;
  }
  return {
    total: items.length,
    avgRating: items.length ? Math.round((sum / items.length) * 10) / 10 : 0,
    today,
    flagged,
  };
}
