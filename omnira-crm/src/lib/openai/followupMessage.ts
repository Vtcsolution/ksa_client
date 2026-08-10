import "server-only";
import { getOpenAI } from "./client";
import type { FollowupTier } from "@/lib/followupCadence";

/**
 * Drafts one WhatsApp touchpoint for the lead-tier cadence (see
 * followupCadence.ts for the schedule this feeds). Best-effort: any failure
 * returns null, and the sweep simply skips that touchpoint this cycle rather
 * than blocking the whole run — it'll be picked up again next sweep since
 * lead.followup_step only advances after a message is successfully drafted.
 */
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    message_ar: { type: "string" },
    message_en: { type: "string" },
  },
  required: ["message_ar", "message_en"],
} as const;

const TIER_TONE: Record<FollowupTier, string> = {
  cold: "Light and educational — no hard sell. This person has shown only vague interest so far.",
  warm: "Warmer and more specific — reference their stated interest directly and gently address the most likely objection (price, timing, or trust).",
  hot: "Fast, personal, and concrete — this person has stated real requirements and is close to deciding. Reference their exact stated needs.",
  urgent: "N/A — urgent leads get a human phone call, not an automated message.",
};

const THEME_INSTRUCTION: Record<string, string> = {
  check_in: "A brief, friendly check-in — no pressure, just staying present.",
  share_content: "Share a short piece of useful information about the relevant service, positioned as helpful, not salesy.",
  final_nurture: "A last, low-pressure touch — invite them to reach out whenever they're ready, without sounding like you're giving up on them.",
  follow_up: "A specific follow-up referencing what they showed interest in.",
  handle_objection: "Gently address the objection most likely holding them back (price, timing, or needing approval) without being asked.",
  special_offer: "Mention a time-limited incentive or offer to create gentle urgency.",
  same_day_note: "A same-day personal note referencing exactly what was discussed or requested.",
  testimonial: "Include a short client testimonial (provided below) matched to their business type, to build trust.",
  push_to_book: "A direct, confident call-to-action to book a meeting or get final pricing.",
};

export async function draftFollowupMessage(params: {
  leadName: string;
  segmentLabel?: string;
  notes?: string;
  tier: FollowupTier;
  theme: string;
  testimonialQuote?: string;
}): Promise<{ ar: string; en: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const themeInstruction = THEME_INSTRUCTION[params.theme] ?? "A relevant follow-up touchpoint.";
  const systemPrompt = `You draft short WhatsApp follow-up messages for Omnira Valet, a Saudi valet-parking
company selling valet captain staffing (Silver/Gold/Platinum packages) to hotels, restaurants, malls,
hospitals, wedding halls, and office complexes. Write in both Arabic (primary) and English, addressed
to a specific real prospect by name. Keep it short — 2-4 sentences, WhatsApp length, not an email.
Never invent facts about the prospect beyond what's given below. Sign off naturally as the Omnira Valet team.

Tone for this stage: ${TIER_TONE[params.tier]}
This specific touchpoint: ${themeInstruction}`;

  const userContent = [
    `Client name: ${params.leadName}`,
    params.segmentLabel ? `Business type: ${params.segmentLabel}` : "",
    params.notes ? `What we know so far: ${params.notes}` : "",
    params.testimonialQuote ? `Testimonial to weave in naturally: "${params.testimonialQuote}"` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_schema", json_schema: { name: "followup_message", schema: SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { message_ar: string; message_en: string };
    return { ar: parsed.message_ar, en: parsed.message_en };
  } catch {
    return null;
  }
}
