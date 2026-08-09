import "server-only";
import { getOpenAI } from "./client";

/**
 * Meetings have no recording/transcript source the way Ziwo calls do (see
 * ziwo/analysis.ts) — the rep's own free-text notes, jotted down right after
 * marking the meeting done, are the only input. Best-effort: any failure (no
 * API key, network, bad response, or empty notes) returns null instead of
 * throwing, so a broken AI call never blocks the meeting from being marked
 * done — the notes are already saved by that point regardless.
 */
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary_ar: { type: "string" },
    summary_en: { type: "string" },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    next_steps_ar: { type: "string" },
    next_steps_en: { type: "string" },
  },
  required: ["summary_ar", "summary_en", "sentiment", "next_steps_ar", "next_steps_en"],
} as const;

export interface MeetingSummaryResult {
  summaryAr: string;
  summaryEn: string;
  sentiment: "positive" | "neutral" | "negative";
  nextStepsAr: string;
  nextStepsEn: string;
}

const SYSTEM_PROMPT = `You summarize sales meetings for Omnira Valet, a Saudi valet-parking company selling
valet captain staffing (Silver/Gold/Platinum packages) to hotels, restaurants, malls, hospitals,
wedding halls, and office complexes. You'll be given a sales rep's own short notes (Arabic or
English) about a meeting that just happened with a prospective client, plus the meeting type.
Turn those notes into a clean, structured recap in both Arabic and English: a short summary of
what was discussed and how it went, the client's overall sentiment, and a concrete recommended
next step. Be concise — this is read by a busy sales manager, not a report. If the notes are too
thin to say anything concrete, still produce a brief, honest summary rather than inventing detail.`;

export async function analyzeMeetingNotes(notes: string, leadName: string, meetingType: string): Promise<MeetingSummaryResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !notes.trim()) return null;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Client: ${leadName}\nMeeting type: ${meetingType}\nRep's notes:\n${notes}` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "meeting_summary", schema: SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      summary_ar: string;
      summary_en: string;
      sentiment: "positive" | "neutral" | "negative";
      next_steps_ar: string;
      next_steps_en: string;
    };
    return {
      summaryAr: parsed.summary_ar,
      summaryEn: parsed.summary_en,
      sentiment: parsed.sentiment,
      nextStepsAr: parsed.next_steps_ar,
      nextStepsEn: parsed.next_steps_en,
    };
  } catch {
    return null;
  }
}
