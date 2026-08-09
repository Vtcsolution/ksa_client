import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/openai/client";

/**
 * Drafts the narrative + recommendations section of a rep's printable
 * weekly report — the "drafts reports and recommendations" piece of the
 * proposal's Expanded AI system. Manager-only (session-authed, like
 * /api/ziwo/sync) since this reads into a specific rep's performance data.
 * The report page already computes every number shown here from real store
 * data; this endpoint only turns those numbers into a written paragraph +
 * concrete next steps — it never invents figures itself.
 */
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    narrative_ar: { type: "string" },
    narrative_en: { type: "string" },
    recommendations_ar: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
    recommendations_en: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
  },
  required: ["narrative_ar", "narrative_en", "recommendations_ar", "recommendations_en"],
} as const;

const SYSTEM_PROMPT = `You write the narrative section of a weekly sales performance report for
Omnira Valet, a Saudi valet-parking company. You'll be given one sales rep's real week-over-week
numbers (calls, answer rate, visits, meetings, deals won, contract value, conversion rate, target
compliance days). Write a short, specific paragraph (3-5 sentences) a sales manager would actually
read — call out what's genuinely strong or weak using the actual numbers given, not generic praise.
Then give 2-4 concrete, actionable recommendations for next week. Write in both Arabic and English.
Never invent numbers not given to you.`;

interface ReportInput {
  repName: string;
  calls: number;
  answered: number;
  visits: number;
  mtgInperson: number;
  mtgOnline: number;
  won: number;
  conversion: number;
  targetHits: number;
  targetDays: number;
  totalContract: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "manager") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let input: ReportInput;
  try {
    input = (await request.json()) as ReportInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "report_summary", schema: SCHEMA, strict: true } },
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return NextResponse.json({ error: "empty_response" }, { status: 502 });
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ok: true, ...parsed });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "ai_failed" }, { status: 502 });
  }
}
