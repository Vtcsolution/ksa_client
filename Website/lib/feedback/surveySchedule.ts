import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Post-deal feedback surveys — the CRM schedules one of these the moment a
 * lead is marked won (see mutations.ts:setResultWon on the CRM side); a
 * scheduler (see app/api/feedback/surveys/due) sends the actual SMS once
 * scheduledAt passes. Same JSON-file pattern as lib/leads/store.ts.
 */

export interface ScheduledSurvey {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  scheduledAt: string;
  sentAt?: string;
}

const DATA_DIR = process.env.LEADS_DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'survey_schedule.json');

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

async function readRaw(): Promise<ScheduledSurvey[]> {
  try {
    const buf = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? (parsed as ScheduledSurvey[]) : [];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function writeRaw(items: ScheduledSurvey[]) {
  await ensureDir();
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

export async function scheduleSurvey(name: string, phone: string, delayDays: number): Promise<ScheduledSurvey> {
  const survey: ScheduledSurvey = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    scheduledAt: new Date(Date.now() + delayDays * 86400000).toISOString(),
  };
  await withLock(async () => {
    const items = await readRaw();
    items.push(survey);
    await writeRaw(items);
  });
  return survey;
}

export async function listDueSurveys(): Promise<ScheduledSurvey[]> {
  const items = await readRaw();
  const now = Date.now();
  return items.filter((s) => !s.sentAt && new Date(s.scheduledAt).getTime() <= now);
}

export async function markSurveySent(id: string): Promise<void> {
  await withLock(async () => {
    const items = await readRaw();
    const idx = items.findIndex((s) => s.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], sentAt: new Date().toISOString() };
    await writeRaw(items);
  });
}
