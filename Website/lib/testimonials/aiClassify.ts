import 'server-only';
import OpenAI from 'openai';
import type { TestimonialAiMeta, SegmentId } from './types';
import { SEGMENTS } from './types';

/**
 * Runs once, right after a manager approves a testimonial (see
 * app/api/testimonials/[id]/route.ts PATCH). Decides which client segments
 * this testimonial is most persuasive for (it may fit more than its own
 * segment — e.g. a hotel testimonial about punctuality can also land with
 * malls) and which point in the Cold→Warm→Hot journey it fits best, plus an
 * English translation. Best-effort — a failure just leaves the testimonial
 * without `ai` metadata; approval itself never depends on this succeeding.
 */
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    best_segments: { type: 'array', items: { type: 'string', enum: SEGMENTS } },
    stage: { type: 'string', enum: ['cold', 'warm', 'hot'] },
    why_ar: { type: 'string' },
    why_en: { type: 'string' },
    quote_en: { type: 'string' },
  },
  required: ['best_segments', 'stage', 'why_ar', 'why_en', 'quote_en'],
} as const;

const SYSTEM_PROMPT = `You help distribute customer testimonials for Omnira Valet, a Saudi valet-parking
company selling valet captain staffing to hotels, restaurants, malls, hospitals, wedding halls, and
office complexes. Given one approved testimonial (its client segment, star rating, and quote), decide:
1) best_segments — which client segments (from the fixed list) this testimonial would most persuade,
   which may include segments beyond its own if the theme generalizes (e.g. punctuality, professionalism).
2) stage — is this testimonial strongest for breaking the ice with a Cold lead, nurturing a Warm one,
   or closing a Hot one about to sign?
3) why_ar / why_en — one short sentence each explaining the fit, for a sales rep to skim.
4) quote_en — a natural English translation of the Arabic quote.`;

export async function classifyTestimonial(segment: SegmentId, rating: number, quote: string): Promise<TestimonialAiMeta | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-5.5',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Segment: ${segment}\nRating: ${rating}/5\nQuote (Arabic): ${quote}` },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'testimonial_classification', schema: SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      best_segments: SegmentId[];
      stage: 'cold' | 'warm' | 'hot';
      why_ar: string;
      why_en: string;
      quote_en: string;
    };
    return {
      bestSegments: parsed.best_segments,
      stage: parsed.stage,
      whyAr: parsed.why_ar,
      whyEn: parsed.why_en,
      quoteEn: parsed.quote_en,
      classifiedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
