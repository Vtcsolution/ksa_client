import "server-only";
import { toFile } from "openai";
import { getOpenAI } from "@/lib/openai/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRecordingSignedUrl } from "./callHistory";
import type { DbBuyingIntent, DbCallSentiment } from "@/lib/supabase/database.types";
import { computeTier } from "@/lib/followupCadence";

// Structured output schema the analysis model must return. Kept in lockstep
// with call_insights' columns (src/lib/supabase/database.types.ts) —
// changing one without the other will silently drop fields.
const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary_ar: { type: "string" },
    summary_en: { type: "string" },
    intent_ar: { type: "string" },
    intent_en: { type: "string" },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    sentiment_score: { type: "integer", minimum: 0, maximum: 100 },
    buying_intent: { type: "string", enum: ["low", "medium", "high"] },
    lead_score: { type: "integer", minimum: 0, maximum: 100 },
    objections: { type: "array", items: { type: "object", additionalProperties: false, properties: { ar: { type: "string" }, en: { type: "string" } }, required: ["ar", "en"] } },
    action_items: { type: "array", items: { type: "object", additionalProperties: false, properties: { ar: { type: "string" }, en: { type: "string" } }, required: ["ar", "en"] } },
    ai_notes_ar: { type: "string" },
    ai_notes_en: { type: "string" },
    next_followup_channel: { type: "string", enum: ["call", "whatsapp", "email", "visit"] },
    next_followup_recommendation_ar: { type: "string" },
    next_followup_recommendation_en: { type: "string" },
  },
  required: [
    "summary_ar", "summary_en", "intent_ar", "intent_en", "sentiment", "sentiment_score",
    "buying_intent", "lead_score", "objections", "action_items", "ai_notes_ar", "ai_notes_en",
    "next_followup_channel", "next_followup_recommendation_ar", "next_followup_recommendation_en",
  ],
} as const;

interface AnalysisResult {
  summary_ar: string;
  summary_en: string;
  intent_ar: string;
  intent_en: string;
  sentiment: DbCallSentiment;
  sentiment_score: number;
  buying_intent: DbBuyingIntent;
  lead_score: number;
  objections: { ar: string; en: string }[];
  action_items: { ar: string; en: string }[];
  ai_notes_ar: string;
  ai_notes_en: string;
  next_followup_channel: string;
  next_followup_recommendation_ar: string;
  next_followup_recommendation_en: string;
}

const SYSTEM_PROMPT = `You analyze sales calls for Omnira Valet, a Saudi valet-parking company selling
valet captain staffing (Silver/Gold/Platinum packages) to hotels, restaurants, malls, hospitals,
wedding halls, and office complexes. You'll be given an Arabic call transcript between a sales
rep and a prospective client. Produce a structured analysis in both Arabic and English for the
CRM: a short summary, the client's underlying intent, sentiment, a 0-100 lead score reflecting
how close this lead is to signing, any objections raised, concrete next action items, brief AI
notes for the sales manager, and a recommended follow-up channel + message. Be concise and
concrete — this is read by a busy sales manager between calls, not a report.`;

export async function appendProcessingLog(supabase: ReturnType<typeof createAdminClient>, ziwoCallId: string, stage: string, extra?: Record<string, unknown>) {
  const { data } = await supabase.from("call_insights").select("processing_log").eq("ziwo_call_id", ziwoCallId).maybeSingle();
  const log = Array.isArray(data?.processing_log) ? data.processing_log : [];
  log.push({ stage, at: new Date().toISOString(), ...extra });
  await supabase.from("call_insights").update({ processing_log: log }).eq("ziwo_call_id", ziwoCallId);
}

/**
 * Full pipeline for one call: fetch recording -> transcribe (Arabic) ->
 * structured analysis -> write back to call_insights -> log on the lead's
 * timeline -> notify the assigned rep. Every stage is appended to
 * processing_log so a failure partway through is traceable and this
 * function can simply be called again (each stage re-does its own work;
 * nothing here is itself non-idempotent since it's all "update by
 * ziwo_call_id", not "insert").
 */
export async function analyzeZiwoCall(params: { ziwoCallId: string; leadId: string | null; repId: string | null }): Promise<void> {
  const { ziwoCallId, leadId, repId } = params;
  const supabase = createAdminClient();

  try {
    await appendProcessingLog(supabase, ziwoCallId, "recording_fetch_started");
    const signed = (await getRecordingSignedUrl(ziwoCallId)) as { result?: boolean; content?: { url?: string } };
    const url = signed?.content?.url;
    if (!url) throw new Error("No signed recording URL returned");

    const audioRes = await fetch(url);
    if (!audioRes.ok) throw new Error(`Recording download failed (HTTP ${audioRes.status})`);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    await appendProcessingLog(supabase, ziwoCallId, "recording_fetched", { bytes: audioBuffer.length });

    const openai = getOpenAI();
    const file = await toFile(audioBuffer, `${ziwoCallId}.mp3`, { type: "audio/mpeg" });
    const transcription = await openai.audio.transcriptions.create({ file, model: "gpt-4o-transcribe", language: "ar" });
    const transcriptText = transcription.text;
    await supabase.from("call_insights").update({ transcript: { text: transcriptText } }).eq("ziwo_call_id", ziwoCallId);
    await appendProcessingLog(supabase, ziwoCallId, "transcribed", { chars: transcriptText.length });

    const completion = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Call transcript (Arabic):\n\n${transcriptText}` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "call_analysis", schema: ANALYSIS_SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned no analysis content");
    const analysis = JSON.parse(raw) as AnalysisResult;
    await appendProcessingLog(supabase, ziwoCallId, "analyzed", { leadScore: analysis.lead_score });

    const { error: updateErr } = await supabase
      .from("call_insights")
      .update({
        status: "analyzed",
        summary_ar: analysis.summary_ar,
        summary_en: analysis.summary_en,
        intent_ar: analysis.intent_ar,
        intent_en: analysis.intent_en,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
        buying_intent: analysis.buying_intent,
        lead_score: analysis.lead_score,
        objections: analysis.objections,
        action_items: analysis.action_items,
        ai_notes_ar: analysis.ai_notes_ar,
        ai_notes_en: analysis.ai_notes_en,
        next_followup_channel: analysis.next_followup_channel,
        next_followup_recommendation_ar: analysis.next_followup_recommendation_ar,
        next_followup_recommendation_en: analysis.next_followup_recommendation_en,
      })
      .eq("ziwo_call_id", ziwoCallId);
    if (updateErr) throw updateErr;

    if (leadId) {
      await supabase.from("activity_log").insert({
        lead_id: leadId,
        who_id: null,
        key: "ziwoCallAnalyzed",
        params: { leadScore: analysis.lead_score, sentiment: analysis.sentiment, summaryEn: analysis.summary_en },
      });

      // kind+params (not rendered title/body) so NotifBell can localize via
      // t(`notif.${kind}`, params) — same pattern as activity_log/LogLine.tsx.
      if (repId) {
        await supabase.from("notifications").insert({
          user_id: repId,
          lead_id: leadId,
          kind: "ziwoCallAnalyzed",
          params: { leadScore: analysis.lead_score, sentiment: analysis.sentiment },
          urgent: analysis.lead_score >= 75,
        });
      }

      // Fresh signal on this lead — re-sort into a tier and restart the
      // follow-up cadence from day zero (see followupCadence.ts). A rep's
      // manual notes/status changes don't do this; only a new AI-scored
      // call does, since that's the one signal strong enough to justify
      // throwing away cadence progress.
      const tier = computeTier(analysis.lead_score);
      const now = new Date().toISOString();
      // Urgent has no touchpoint list (see CADENCE) — step is set to 1
      // purely so it never reads as "cadence not started" anywhere else;
      // the sweep skips urgent tier leads outright, see followupCadence.ts.
      await supabase
        .from("leads")
        .update({ followup_tier: tier, followup_tier_updated_at: now, followup_cadence_started_at: now, followup_step: tier === "urgent" ? 1 : 0 })
        .eq("id", leadId);

      // Urgent skips the automated cadence entirely — this is the one place
      // it's triggered, fired immediately rather than waiting for the next
      // cadence sweep, since "urgent" only means something if it's fast.
      if (tier === "urgent") {
        const { data: managers } = await supabase.from("profiles").select("id").eq("role", "manager");
        const recipients = new Set<string>((managers ?? []).map((m) => m.id));
        if (repId) recipients.add(repId);
        if (recipients.size > 0) {
          await supabase.from("notifications").insert(
            Array.from(recipients).map((userId) => ({
              user_id: userId,
              lead_id: leadId,
              kind: "urgentLeadFollowup",
              params: { leadScore: analysis.lead_score },
              urgent: true,
            })),
          );
        }
      }
    }

    await appendProcessingLog(supabase, ziwoCallId, "lead_updated");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await appendProcessingLog(supabase, ziwoCallId, "failed", { error: message });
    throw err;
  } finally {
    // Release the claim (see processZiwoCallEvent) regardless of outcome —
    // on success it's moot (status is now "analyzed", never re-triggered);
    // on failure this is what allows the next sync to retry.
    await supabase.from("call_insights").update({ analysis_claimed_at: null }).eq("ziwo_call_id", ziwoCallId);
  }
}
