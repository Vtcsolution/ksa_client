import 'server-only';
import { buildSmsAudience } from './audience';
import { createSmsSends, updateSmsSend, updateSmsCampaign, getSmsCampaign } from './store';
import { sendSms } from './smsProvider';

export async function sendSmsCampaignNow(campaignId: string): Promise<void> {
  const campaign = await getSmsCampaign(campaignId);
  if (!campaign) return;

  const audience = await buildSmsAudience(campaign.audienceFilter);
  await updateSmsCampaign(campaignId, { status: 'sending', recipientCount: audience.length });

  const sends = await createSmsSends(
    audience.map((a) => ({ campaignId, leadId: a.leadId, phone: a.phone, status: 'queued' as const })),
  );

  let sentCount = 0;
  let queuedCount = 0;
  let failedCount = 0;
  for (const send of sends) {
    const result = await sendSms(send.phone, campaign.message);
    if (result.delivered) {
      sentCount++;
      await updateSmsSend(send.id, { status: 'sent', sentAt: new Date().toISOString() });
    } else if (result.error) {
      failedCount++;
      await updateSmsSend(send.id, { status: 'failed', error: result.error });
    } else {
      queuedCount++;
    }
  }

  await updateSmsCampaign(campaignId, {
    status: sends.length > 0 && failedCount === sends.length ? 'failed' : 'sent',
    sentAt: new Date().toISOString(),
    sentCount,
    queuedCount,
    failedCount,
  });
}
