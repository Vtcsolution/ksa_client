import { z } from 'zod';
import type { LeadStatus } from '@/lib/leads/types';

export interface AudienceFilter {
  status?: LeadStatus;
  service?: string;
}

export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface EmailCampaign {
  id: string;
  createdAt: string; // ISO
  name: string;
  subject: string;
  bodyHtml: string;
  audienceFilter: AudienceFilter;
  status: CampaignStatus;
  scheduledAt?: string; // ISO — set when "send later" is used instead of "send now"
  sentAt?: string;
  recipientCount: number;
  sentCount: number;
  queuedCount: number; // sent successfully to the provider vs. only queued because no provider key is configured
  failedCount: number;
  openCount: number;
  clickCount: number;
}

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جدًا').max(160),
  subject: z.string().trim().min(2, 'العنوان قصير جدًا').max(200),
  bodyHtml: z.string().trim().min(10, 'نص الرسالة قصير جدًا').max(20000),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost', 'archived']).optional(),
  service: z.string().trim().max(80).optional(),
  scheduledAt: z.string().trim().optional(),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export type SendStatus = 'queued' | 'sent' | 'failed' | 'opened' | 'clicked';

export interface EmailSend {
  id: string;
  campaignId: string;
  leadId: string;
  email: string;
  status: SendStatus;
  providerMessageId?: string;
  error?: string;
  createdAt: string; // ISO
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

// ===== SMS — same shape as email campaigns, minus HTML body and open/click
// tracking (a carrier SMS has no equivalent to a tracking pixel) =====

export interface SmsCampaign {
  id: string;
  createdAt: string; // ISO
  name: string;
  message: string; // plain text
  audienceFilter: AudienceFilter;
  status: CampaignStatus;
  sentAt?: string;
  recipientCount: number;
  sentCount: number;
  queuedCount: number;
  failedCount: number;
}

export const createSmsCampaignSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جدًا').max(160),
  message: z.string().trim().min(2, 'نص الرسالة قصير جدًا').max(600),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost', 'archived']).optional(),
  service: z.string().trim().max(80).optional(),
});
export type CreateSmsCampaignInput = z.infer<typeof createSmsCampaignSchema>;

export type SmsSendStatus = 'queued' | 'sent' | 'failed';

export interface SmsSend {
  id: string;
  campaignId: string;
  leadId: string;
  phone: string;
  status: SmsSendStatus;
  error?: string;
  createdAt: string; // ISO
  sentAt?: string;
}
