import type { Permissions, Segment, Target } from "./types";

export const SEED_SEGMENTS: Segment[] = [
  { id: "hotels", nameKey: "hotels" },
  { id: "restaurants", nameKey: "restaurants" },
  { id: "malls", nameKey: "malls" },
  { id: "hospitals", nameKey: "hospitals" },
  { id: "halls", nameKey: "halls" },
  { id: "complexes", nameKey: "complexes" },
];

export const STATUS_KEYS = [
  "new",
  "contacted",
  "interested",
  "followup",
  "meeting",
  "won",
  "archived",
] as const;

export const STATUS_CHIP_CLASS: Record<string, string> = {
  new: "new",
  contacted: "contacted",
  interested: "interested",
  followup: "followup",
  meeting: "meeting",
  won: "won",
  archived: "archived",
};

export const ACCEPT_REASON_KEYS = [
  "price",
  "service",
  "legal",
  "headache",
  "timing",
  "referral",
  "service2",
] as const;

export const REJECT_REASON_KEYS = [
  "priceHigh",
  "hasProvider",
  "badTiming",
  "needsApproval",
  "noNeed",
  "noResponse",
  "wrongNumber",
] as const;

export const TRANSFER_REASON_KEYS = [
  "workload",
  "prefersOther",
  "needsExperience",
] as const;

export const MISSED_REASON_KEYS = [
  "clientCancelled",
  "noShow",
  "emergency",
  "postponed",
] as const;

export const DEFAULT_PERMS: Permissions = {
  transfer: true,
  receive: true,
  addField: true,
  meetings: true,
  quote: true,
  content: true,
};

export const PERM_KEYS: (keyof Permissions)[] = [
  "transfer",
  "receive",
  "addField",
  "meetings",
  "quote",
  "content",
];

export const DEFAULT_TARGET: Target = {
  dailyCalls: 10,
  dailyVisits: 3,
  weeklyMeetings: 8,
  monthlyContracts: 5,
};

export interface PackageDef {
  id: "silver" | "gold" | "platinum";
  price: number;
  hours: number | null; // null = custom
}

export const SOP_IDS = ["daily", "call", "visit", "meeting", "rules"] as const;
export const SOP_STEP_COUNT: Record<(typeof SOP_IDS)[number], number> = {
  daily: 5,
  call: 6,
  visit: 5,
  meeting: 5,
  rules: 5,
};

export const SERVICE_IDS = ["s1", "s2"] as const;

export const QUICK_KEYS = ["hour", "evening", "tomorrow", "3days", "week"] as const;

export const MGR_NAV_MAIN = ["dashboard", "leads", "field", "calls", "distribute", "quotation"] as const;
export const MGR_NAV_MGMT = [
  "staff",
  "targets",
  "report",
  "sops",
  "services",
  "segments",
  "archive",
  "content",
  "finance",
  "referrals",
  "feedback",
  "siteLeads",
  "testimonials",
  "marketing",
] as const;

export const REP_NAV_DAILY = ["myleads", "followups", "calls", "search", "quotation"] as const;
export const REP_NAV_REF = ["mystats", "sops", "services"] as const;

export const DAY_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;
