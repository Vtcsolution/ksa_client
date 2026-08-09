import 'server-only';
import { buildAudience } from './audience';
import { createSends, updateSend, updateCampaign, getCampaign } from './store';
import { sendEmail } from './emailProvider';

/** Wraps every link through the click tracker and appends an invisible open-tracking pixel — real tracking infrastructure regardless of whether a provider key is configured yet. */
function injectTracking(html: string, sendId: string, baseUrl: string): string {
  const wrapped = html.replace(/href="([^"]+)"/g, (_m, url: string) => `href="${baseUrl}/api/marketing/track/click/${sendId}?url=${encodeURIComponent(url)}"`);
  return `${wrapped}<img src="${baseUrl}/api/marketing/track/open/${sendId}" width="1" height="1" alt="" style="display:none" />`;
}

export async function sendCampaignNow(campaignId: string, baseUrl: string): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) return;

  const audience = await buildAudience(campaign.audienceFilter);
  await updateCampaign(campaignId, { status: 'sending', recipientCount: audience.length });

  const sends = await createSends(
    audience.map((a) => ({ campaignId, leadId: a.leadId, email: a.email, status: 'queued' as const })),
  );

  let sentCount = 0;
  let queuedCount = 0;
  let failedCount = 0;
  for (const send of sends) {
    const html = injectTracking(campaign.bodyHtml, send.id, baseUrl);
    const result = await sendEmail(send.email, campaign.subject, html);
    if (result.delivered) {
      sentCount++;
      await updateSend(send.id, { status: 'sent', sentAt: new Date().toISOString(), providerMessageId: result.providerMessageId });
    } else if (result.error) {
      failedCount++;
      await updateSend(send.id, { status: 'failed', error: result.error });
    } else {
      queuedCount++; // no RESEND_API_KEY configured — stays genuinely "queued", same pattern as WhatsApp
    }
  }

  await updateCampaign(campaignId, {
    status: sends.length > 0 && failedCount === sends.length ? 'failed' : 'sent',
    sentAt: new Date().toISOString(),
    sentCount,
    queuedCount,
    failedCount,
  });
}
