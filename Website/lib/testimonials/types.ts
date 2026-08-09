import { z } from 'zod';

/** Same segment ids the CRM uses (src/lib/icons.tsx SEGMENT_ICONS) — kept in sync manually since the two apps don't share a database. */
export const SEGMENTS = ['hotels', 'restaurants', 'malls', 'hospitals', 'halls', 'complexes'] as const;
export type SegmentId = (typeof SEGMENTS)[number];

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type LeadStage = 'cold' | 'warm' | 'hot';

export interface TestimonialAiMeta {
  bestSegments: SegmentId[];
  stage: LeadStage;
  whyAr: string;
  whyEn: string;
  quoteEn: string; // auto-translated if the submitter only wrote Arabic
  classifiedAt: string; // ISO
}

export interface Testimonial {
  id: string;
  createdAt: string; // ISO
  name: string;
  role?: string; // e.g. "General Manager, Al Asala Hotel"
  segment: SegmentId;
  rating: number; // 1-5
  quote: string; // Arabic
  consentGiven: boolean;
  status: TestimonialStatus;
  decidedAt?: string; // ISO
  ai?: TestimonialAiMeta;
}

export const createTestimonialSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جدًا').max(120),
  role: z.string().trim().max(160).optional().or(z.literal('')),
  segment: z.enum(SEGMENTS),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().trim().min(10, 'النص قصير جدًا').max(1200),
  consentGiven: z.literal(true, { errorMap: () => ({ message: 'الموافقة على النشر مطلوبة' }) }),
  // honeypot
  company: z.string().max(200).optional(),
});
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;

export interface TestimonialStats {
  total: number;
  pending: number;
  approved: number;
}
