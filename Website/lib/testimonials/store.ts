import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Testimonial, CreateTestimonialInput, TestimonialStats, TestimonialAiMeta } from './types';

/** Same JSON-file pattern as lib/leads/store.ts and lib/feedback/store.ts. */

const DATA_DIR = process.env.LEADS_DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'testimonials.json');

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

async function readRaw(): Promise<Testimonial[]> {
  try {
    const buf = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? (parsed as Testimonial[]) : [];
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function writeRaw(items: Testimonial[]) {
  await ensureDir();
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

export async function listTestimonials(): Promise<Testimonial[]> {
  const items = await readRaw();
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listApprovedTestimonials(segment?: string): Promise<Testimonial[]> {
  const items = await listTestimonials();
  return items.filter((t) => t.status === 'approved' && (!segment || t.segment === segment));
}

export async function createTestimonial(input: CreateTestimonialInput): Promise<Testimonial> {
  const item: Testimonial = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: input.name.trim(),
    role: input.role?.trim() || undefined,
    segment: input.segment,
    rating: input.rating,
    quote: input.quote.trim(),
    consentGiven: input.consentGiven,
    status: 'pending',
  };
  await withLock(async () => {
    const items = await readRaw();
    items.push(item);
    await writeRaw(items);
  });
  return item;
}

export async function decideTestimonial(id: string, status: 'approved' | 'rejected'): Promise<Testimonial | null> {
  return withLock(async () => {
    const items = await readRaw();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], status, decidedAt: new Date().toISOString() };
    await writeRaw(items);
    return items[idx];
  });
}

export async function setTestimonialAiMeta(id: string, ai: TestimonialAiMeta): Promise<void> {
  await withLock(async () => {
    const items = await readRaw();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ai };
    await writeRaw(items);
  });
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  return withLock(async () => {
    const items = await readRaw();
    const next = items.filter((t) => t.id !== id);
    if (next.length === items.length) return false;
    await writeRaw(next);
    return true;
  });
}

export function computeTestimonialStats(items: Testimonial[]): TestimonialStats {
  let pending = 0;
  let approved = 0;
  for (const t of items) {
    if (t.status === 'pending') pending++;
    if (t.status === 'approved') approved++;
  }
  return { total: items.length, pending, approved };
}
