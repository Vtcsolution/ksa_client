import 'server-only';
import OpenAI from 'openai';

export interface DraftedCampaign {
  subject: string;
  bodyHtml: string;
  suggestedSendTime: string;
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    subject: { type: 'string' },
    body_html: { type: 'string' },
    suggested_send_time: { type: 'string' },
  },
  required: ['subject', 'body_html', 'suggested_send_time'],
} as const;

const SYSTEM_PROMPT = `You write marketing emails for Omnira Valet, a Saudi valet-parking company that
staffs professional valet captains for hotels, restaurants, malls, hospitals, wedding halls, and office
complexes in Saudi Arabia. Given a short brief from a manager, write: a compelling subject line in
Arabic, a complete HTML email body in Arabic (use simple tags: <p>, <strong>, <a href="...">, <ul>/<li> —
no external CSS or images), and a suggested send day/time in Arabic (e.g. "الثلاثاء الساعة 10 صباحًا")
based on general B2B email marketing best practice for the Gulf region (avoid Friday/Saturday weekend,
avoid very early/late hours). Keep the email concise and professional, with a clear call to action.`;

/** Folds in both "writes content" and "times sends" from the Expanded-AI proposal line — one call drafts the whole campaign. Best-effort: returns null on any failure so the compose form just falls back to a blank draft. */
export async function draftCampaign(brief: string): Promise<DraftedCampaign | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-5.5',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: brief },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'campaign_draft', schema: SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { subject: string; body_html: string; suggested_send_time: string };
    return { subject: parsed.subject, bodyHtml: parsed.body_html, suggestedSendTime: parsed.suggested_send_time };
  } catch {
    return null;
  }
}
