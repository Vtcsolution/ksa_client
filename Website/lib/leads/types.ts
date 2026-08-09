import { z } from 'zod';

/** دورة حياة الليد في خطّ المبيعات */
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'archived'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL_AR: Record<LeadStatus, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  qualified: 'مؤهّل',
  won: 'صفقة ناجحة',
  lost: 'مغلق',
  archived: 'مؤرشف',
};

export type LeadPriority = 'normal' | 'high';

export interface LeadNote {
  at: string; // ISO
  text: string;
}

export interface Lead {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
  // sales pipeline
  status: LeadStatus;
  priority: LeadPriority;
  starred: boolean;
  assignee?: string;
  notes: LeadNote[];
  // acquisition metadata
  source?: string; // form key: contact | hero | pricing | ...
  pagePath?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  utm?: Record<string, string>;
  // referral program — code the visitor says they were given by an existing
  // Omnira client. Codes are issued in the CRM (not this system), so this is
  // captured for the team to manually cross-check and reward, not auto-verified.
  referralCode?: string;
}

/** حمولة الإنشاء القادمة من الموقع العام */
export const createLeadSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جدًا').max(120),
  phone: z
    .string()
    .trim()
    .min(6, 'رقم غير صحيح')
    .max(24)
    .regex(/^[0-9+()\-\s]+$/, 'رقم غير صحيح'),
  email: z.string().trim().email('بريد غير صحيح').max(160).optional().or(z.literal('')),
  service: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  source: z.string().trim().max(40).optional(),
  pagePath: z.string().trim().max(300).optional(),
  utm: z.record(z.string().max(200)).optional(),
  referralCode: z.string().trim().max(40).optional().or(z.literal('')),
  // honeypot — humans leave it empty; if a bot fills it we silently accept + drop
  company: z.string().max(200).optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

/** حمولة التعديل من الداشبورد */
export const updateLeadSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(['normal', 'high']).optional(),
  starred: z.boolean().optional(),
  assignee: z.string().trim().max(80).optional(),
  addNote: z.string().trim().min(1).max(2000).optional(),
});
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export interface LeadStats {
  total: number;
  today: number;
  week: number;
  byStatus: Record<LeadStatus, number>;
}
