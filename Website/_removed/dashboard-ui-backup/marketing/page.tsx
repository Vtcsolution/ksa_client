import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isAuthed } from '@/lib/leads/auth';
import { listCampaigns, listSendsByCampaign } from '@/lib/marketing/store';
import MarketingClient from './MarketingClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'التسويق عبر البريد | أومنيرا فاليه',
  robots: { index: false, follow: false, nocache: true },
};

export default async function MarketingDashboardPage() {
  if (!isAuthed()) redirect('/dashboard/login');
  const campaigns = await listCampaigns();
  const withStats = await Promise.all(
    campaigns.map(async (c) => {
      if (c.status === 'draft') return c;
      const sends = await listSendsByCampaign(c.id);
      const openCount = sends.filter((s) => s.status === 'opened' || s.status === 'clicked').length;
      const clickCount = sends.filter((s) => s.status === 'clicked').length;
      return { ...c, openCount, clickCount };
    }),
  );
  return <MarketingClient initialCampaigns={withStats} hasResendKey={!!process.env.RESEND_API_KEY} />;
}
