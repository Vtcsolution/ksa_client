import { listLeads } from '@/lib/leads/store';
import type { AudienceFilter } from './types';

export interface AudienceMember {
  leadId: string;
  email: string;
  name: string;
}

/** Every Website lead with an email on file, optionally narrowed by pipeline status and/or requested service — the only two dimensions the lead capture form actually records. */
export async function buildAudience(filter: AudienceFilter): Promise<AudienceMember[]> {
  const leads = await listLeads();
  const seen = new Set<string>();
  const out: AudienceMember[] = [];
  for (const lead of leads) {
    const email = lead.email?.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    if (filter.status && lead.status !== filter.status) continue;
    if (filter.service && lead.service !== filter.service) continue;
    seen.add(email);
    out.push({ leadId: lead.id, email, name: lead.name });
  }
  return out;
}

export interface SmsAudienceMember {
  leadId: string;
  phone: string;
  name: string;
}

/** Every lead has a phone (it's required on the contact form), so this audience is always the full filtered lead list — no "has this field" gate like email needs. */
export async function buildSmsAudience(filter: AudienceFilter): Promise<SmsAudienceMember[]> {
  const leads = await listLeads();
  const seen = new Set<string>();
  const out: SmsAudienceMember[] = [];
  for (const lead of leads) {
    const phone = lead.phone.trim();
    if (!phone || seen.has(phone)) continue;
    if (filter.status && lead.status !== filter.status) continue;
    if (filter.service && lead.service !== filter.service) continue;
    seen.add(phone);
    out.push({ leadId: lead.id, phone, name: lead.name });
  }
  return out;
}
