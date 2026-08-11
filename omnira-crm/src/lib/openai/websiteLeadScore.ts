import "server-only";
import { getOpenAI } from "./client";

/**
 * Scores a website contact-form message for urgency/buying intent — the
 * message-text equivalent of Ziwo's call analysis (ziwo/analysis.ts), so a
 * website lead enters the tiered follow-up cadence at the right tier
 * immediately, instead of every website lead defaulting to Cold regardless
 * of what they actually wrote. Best-effort: any failure returns null, and
 * the caller falls back to treating the lead as Cold rather than blocking
 * lead creation on an AI call.
 */
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    lead_score: { type: "integer", minimum: 0, maximum: 100 },
    reason_en: { type: "string" },
  },
  required: ["lead_score", "reason_en"],
} as const;

const SYSTEM_PROMPT = `You score inbound website contact-form messages for Omnira Valet, a Saudi
valet-parking company selling valet captain staffing (Silver/Gold/Platinum packages) to hotels,
restaurants, malls, hospitals, wedding halls, and office complexes. You'll get the service they
selected (if any) and their free-text message. Score 0-100 how ready-to-buy and urgent this
inquiry is:

- 0-30: vague, exploratory, no specifics ("just checking prices", "what do you offer")
- 31-60: named a real interest or service but no timeline/budget/urgency
- 61-85: specific requirements stated — how many captains, a location, a rough timeline
- 86-100: explicit urgency or readiness — asked for a quote/contract, gave a start date, said
  things like "need this urgently", "ASAP", "as soon as possible", described an active problem
  needing immediate help

Judge the actual words, not just length. A short message with a real deadline outranks a long
vague one. Be concise in your reasoning — one sentence.`;

export async function analyzeWebsiteLead(message: string, service?: string): Promise<{ leadScore: number; reason: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !message.trim()) return null;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Service selected: ${service || "none stated"}\nMessage: ${message}` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "website_lead_score", schema: SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lead_score: number; reason_en: string };
    return { leadScore: parsed.lead_score, reason: parsed.reason_en };
  } catch {
    return null;
  }
}
