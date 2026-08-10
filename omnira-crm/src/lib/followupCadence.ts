// The 4-tier lead follow-up system: every lead is scored 0-100 (from Ziwo call
// analysis, see ziwo/analysis.ts) and sorted into a tier, then worked through a
// timed sequence of touchpoints relative to when it entered that tier. Urgent
// skips the automated sequence entirely — see src/lib/supabase/followupCadence.ts
// for the sweep that reads this and src/lib/openai/followupMessage.ts for the
// message drafting. Pure data/logic here so both client (tier chips) and
// server (the sweep) import the same source of truth.

export type FollowupTier = "cold" | "warm" | "hot" | "urgent";

export function computeTier(leadScore: number | null | undefined): FollowupTier {
  if (leadScore === null || leadScore === undefined) return "cold";
  if (leadScore >= 86) return "urgent";
  if (leadScore >= 61) return "hot";
  if (leadScore >= 31) return "warm";
  return "cold";
}

export interface Touchpoint {
  day: number;
  theme: string;
}

// Cold/warm/hot each get a real cadence; urgent has none — it's a single
// immediate alert (see runFollowupCadenceSweep), not a message sequence.
export const CADENCE: Record<Exclude<FollowupTier, "urgent">, Touchpoint[]> = {
  cold: [
    { day: 3, theme: "check_in" },
    { day: 10, theme: "share_content" },
    { day: 21, theme: "final_nurture" },
  ],
  warm: [
    { day: 3, theme: "follow_up" },
    { day: 6, theme: "handle_objection" },
    { day: 10, theme: "special_offer" },
  ],
  hot: [
    { day: 1, theme: "same_day_note" },
    { day: 3, theme: "testimonial" },
    { day: 6, theme: "push_to_book" },
  ],
};

export const TIER_ORDER: FollowupTier[] = ["cold", "warm", "hot", "urgent"];
