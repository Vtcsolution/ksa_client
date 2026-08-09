import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isAuthed } from '@/lib/leads/auth';
import { listLeads, computeStats } from '@/lib/leads/store';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'لوحة الليدز | أومنيرا فاليه',
  robots: { index: false, follow: false, nocache: true },
};

export default async function DashboardPage() {
  if (!isAuthed()) redirect('/dashboard/login');
  const leads = await listLeads();
  const stats = computeStats(leads);
  return <DashboardClient initialLeads={leads} initialStats={stats} />;
}
