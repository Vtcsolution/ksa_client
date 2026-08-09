import type { Lead } from './types';

const SERVICE_LABEL: Record<string, string> = {
  'parking-management': 'إدارة وتشغيل المواقف',
  'valet-parking': 'خدمات الفاليه باركينج',
  'advanced-technology': 'التقنيات المتقدمة',
  'professional-organizers': 'المنظمين المحترفين',
  consultation: 'الاستشارات',
  'golf-cart': 'جولف كار',
  'support-services': 'خدمات مساندة',
  'car-wash': 'غسيل السيارات',
};

/**
 * تنبيه فوري بليد جديد عبر تليجرام — يعمل فقط إذا ضُبط التوكن والمحادثة في البيئة
 * (LEADS_TELEGRAM_BOT_TOKEN / LEADS_TELEGRAM_CHAT_ID). آمن الفشل: لا يوقف حفظ الليد.
 */
export async function notifyNewLead(lead: Lead): Promise<void> {
  const token = process.env.LEADS_TELEGRAM_BOT_TOKEN;
  const chat = process.env.LEADS_TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  const svc = lead.service ? SERVICE_LABEL[lead.service] || lead.service : '—';
  const lines = [
    '🆕 ليد جديد — أومنيرا فاليه',
    '',
    `👤 ${lead.name}`,
    `📱 ${lead.phone}`,
    lead.email ? `✉️ ${lead.email}` : '',
    `🧩 ${svc}`,
    lead.message ? `📝 ${lead.message}` : '',
    lead.source ? `🔗 المصدر: ${lead.source}` : '',
    '',
    '👉 راجعوا الاستفسار من داخل نظام الـCRM.',
  ].filter(Boolean);

  try {
    const ctrl = AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: lines.join('\n'), disable_web_page_preview: true }),
      signal: ctrl,
    });
  } catch {
    // نتجاهل أي خطأ — التنبيه ثانوي بالنسبة لحفظ الليد
  }
}
