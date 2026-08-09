import { z } from 'zod';

export interface FeedbackAiFlag {
  flagged: boolean;
  urgency: 'low' | 'medium' | 'high';
  severityPct: number; // 0-100, how serious the AI judges the issue to be
  reasonAr: string;
  reasonEn: string;
  suggestedActionAr: string;
  suggestedActionEn: string;
  analyzedAt: string; // ISO
}

export interface Feedback {
  id: string;
  createdAt: string; // ISO
  name: string;
  email?: string;
  rating: number; // 1-5
  message: string;
  pagePath?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  aiFlag?: FeedbackAiFlag;
  resolved?: boolean;
  resolvedAt?: string; // ISO
  lastNotifiedAt?: string; // ISO — last time the team was alerted about this
  notifyCount?: number; // how many times the recurring escalation sweep has alerted the team
}

export const createFeedbackSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جدًا').max(120),
  email: z.string().trim().email('بريد غير صحيح').max(160).optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().trim().min(3, 'الرسالة قصيرة جدًا').max(2000),
  pagePath: z.string().trim().max(300).optional(),
  // honeypot — humans leave it empty; if a bot fills it we silently accept + drop
  company: z.string().max(200).optional(),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export interface FeedbackStats {
  total: number;
  avgRating: number;
  today: number;
  flagged: number;
}
