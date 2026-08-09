import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type Client = SupabaseClient<Database>;

export interface Bi18n {
  ar: string;
  en: string;
}

/**
 * View model for the real call_insights table, shaped to match the fields
 * the existing UI (CallInsightCard / CallInsightModal, originally built
 * against the mock src/lib/callInsights.ts) already expects — so those
 * components need minimal changes, just a different data source.
 *
 * One real difference from the mock: `transcriptText` is a single string
 * (whatever Whisper returned), not a per-speaker, per-line, dual-language
 * array. The real pipeline doesn't do speaker diarization or per-line
 * translation — only the summary/intent/notes get a full ar/en pair. The
 * modal's transcript panel is adjusted accordingly (one block of text, not
 * chat bubbles).
 */
export interface CallInsightView {
  id: string;
  leadId: string | null;
  leadName: string;
  leadNameEn?: string;
  leadPhone: string;
  segment: string;
  repId: string | null;
  at: number;
  durSec: number;
  answered: boolean;
  status: "processing" | "analyzed" | "failed";
  failureReason: string | null;
  transcriptText: string;
  summary: Bi18n;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  intent: Bi18n;
  buyingIntent: "low" | "medium" | "high";
  leadScore: number;
  objections: Bi18n[];
  actionItems: Bi18n[];
  aiNotes: Bi18n;
  nextFollowup: { channel: string; at: number | null; recommendation: Bi18n };
  whatsappSent: boolean;
  recordingUrl: string | null;
}

type CallInsightRow = Database["public"]["Tables"]["call_insights"]["Row"] & {
  leads: { name: string; name_en: string | null; segment_id: string | null } | null;
};

function asBi18nArray(v: unknown): Bi18n[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is Bi18n => !!x && typeof x === "object" && "ar" in x && "en" in x);
}

/** processing_log entries are appended as { stage, at, ...extra } — see appendProcessingLog in src/lib/ziwo/analysis.ts. */
function findFailure(processingLog: unknown): string | null {
  if (!Array.isArray(processingLog)) return null;
  const failed = [...processingLog].reverse().find((e) => e && typeof e === "object" && (e as { stage?: string }).stage === "failed");
  if (!failed) return null;
  return typeof (failed as { error?: unknown }).error === "string" ? (failed as { error: string }).error : "Unknown error";
}

function mapCallInsight(row: CallInsightRow): CallInsightView {
  const lead = row.leads;
  const transcript = row.transcript as { text?: string } | null;
  const failureReason = row.status === "processing" ? findFailure(row.processing_log) : null;
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: lead?.name ?? row.lead_phone ?? "",
    leadNameEn: lead?.name_en ?? undefined,
    leadPhone: row.lead_phone ?? "",
    segment: lead?.segment_id ?? "",
    repId: row.rep_id,
    at: row.at ? new Date(row.at).getTime() : new Date(row.created_at).getTime(),
    durSec: row.dur_sec ?? 0,
    answered: row.result === "answered",
    status: failureReason ? "failed" : row.status,
    failureReason,
    transcriptText: transcript?.text ?? "",
    summary: { ar: row.summary_ar ?? "", en: row.summary_en ?? "" },
    sentiment: row.sentiment ?? "neutral",
    sentimentScore: row.sentiment_score ?? 0,
    intent: { ar: row.intent_ar ?? "", en: row.intent_en ?? "" },
    buyingIntent: row.buying_intent ?? "low",
    leadScore: row.lead_score ?? 0,
    objections: asBi18nArray(row.objections),
    actionItems: asBi18nArray(row.action_items),
    aiNotes: { ar: row.ai_notes_ar ?? "", en: row.ai_notes_en ?? "" },
    nextFollowup: {
      channel: row.next_followup_channel ?? "call",
      at: row.next_followup_at ? new Date(row.next_followup_at).getTime() : null,
      recommendation: { ar: row.next_followup_recommendation_ar ?? "", en: row.next_followup_recommendation_en ?? "" },
    },
    whatsappSent: row.whatsapp_sent,
    recordingUrl: row.recording_url,
  };
}

const CALL_INSIGHT_SELECT = "*, leads(name, name_en, segment_id)";

export async function fetchCallInsights(supabase: Client): Promise<CallInsightView[]> {
  const { data, error } = await supabase
    .from("call_insights")
    .select(CALL_INSIGHT_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as CallInsightRow[]).map(mapCallInsight);
}
