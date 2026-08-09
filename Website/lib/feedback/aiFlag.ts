import 'server-only';
import OpenAI from 'openai';
import type { FeedbackAiFlag } from './types';

/**
 * Runs on every submission regardless of star rating — a customer can leave
 * 5 stars out of politeness while the written message describes a real
 * problem, and that must still reach staff (see app/api/feedback/route.ts).
 * Best-effort: any failure (no API key, network, bad response) returns null
 * instead of throwing, so a broken AI call never blocks a feedback submission.
 */
const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    flagged: { type: 'boolean' },
    urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
    severity_pct: { type: 'integer', minimum: 0, maximum: 100 },
    reason_ar: { type: 'string' },
    reason_en: { type: 'string' },
    suggested_action_ar: { type: 'string' },
    suggested_action_en: { type: 'string' },
  },
  required: ['flagged', 'urgency', 'severity_pct', 'reason_ar', 'reason_en', 'suggested_action_ar', 'suggested_action_en'],
} as const;

const SYSTEM_PROMPT = `You triage customer feedback for Omnira Valet, a Saudi valet-parking company.
You'll get a star rating (1-5) and a free-text message, usually in Arabic. Decide whether this
customer is unhappy enough that staff should personally follow up ("flagged"), how urgent that
follow-up is (urgency), a 0-100 severity score (how bad the underlying issue actually is — e.g. a
safety incident or damaged property scores much higher than slow service or a vague complaint), why
(briefly, in Arabic and English), and a concrete suggested next step for staff.

Trust the written message over the star rating whenever they disagree. Customers often leave a high
rating out of politeness, habit, or misreading the scale while the message itself describes a real
complaint, a mistake, wrong information, or a bad suggestion — flag those exactly as you would a low
rating with the same content. A low rating with a vague, empty, or genuinely non-critical message
(e.g. an obvious test entry) may not need flagging even though the number is low. Judge the words,
not the stars. Be concise — this is read by a busy manager, not a report.`;

export async function analyzeFeedback(rating: number, message: string): Promise<FeedbackAiFlag | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-5.5',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Rating: ${rating}/5\nMessage: ${message}` },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'feedback_triage', schema: ANALYSIS_SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      flagged: boolean;
      urgency: 'low' | 'medium' | 'high';
      severity_pct: number;
      reason_ar: string;
      reason_en: string;
      suggested_action_ar: string;
      suggested_action_en: string;
    };
    return {
      flagged: parsed.flagged,
      urgency: parsed.urgency,
      severityPct: parsed.severity_pct,
      reasonAr: parsed.reason_ar,
      reasonEn: parsed.reason_en,
      suggestedActionAr: parsed.suggested_action_ar,
      suggestedActionEn: parsed.suggested_action_en,
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
