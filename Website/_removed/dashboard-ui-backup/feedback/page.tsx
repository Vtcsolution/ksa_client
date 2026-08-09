import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isAuthed } from '@/lib/leads/auth';
import { listFeedback, computeFeedbackStats } from '@/lib/feedback/store';
import FeedbackClient from './FeedbackClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ملاحظات العملاء | أومنيرا فاليه',
  robots: { index: false, follow: false, nocache: true },
};

export default async function FeedbackDashboardPage() {
  if (!isAuthed()) redirect('/dashboard/login');
  const feedback = await listFeedback();
  const stats = computeFeedbackStats(feedback);
  return <FeedbackClient initialFeedback={feedback} initialStats={stats} />;
}
