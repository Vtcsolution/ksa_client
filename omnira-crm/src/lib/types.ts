export type Role = "manager" | "rep";
export type LeadSource = "excel" | "field" | "ziwo" | "website";
export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "followup"
  | "meeting"
  | "won"
  | "archived";

export type CallAnswered = "answered" | "noanswer" | "busy";

export interface CallRecord {
  durSec: number;
  answered: CallAnswered;
  at: number; // epoch ms
  note?: string;
}

export interface VisitRecord {
  verified: boolean;
  reviewed?: boolean;
  note: string;
  contact?: string;
  at: number;
}

export type MeetingType = "inperson" | "online";

export interface MeetingRecord {
  id: string;
  type: MeetingType;
  dt: string; // "YYYY-MM-DDTHH:mm"
  done: boolean;
  missed?: boolean;
  missedReasonKey?: string;
  proof?: boolean;
  notes?: string;
  summaryAr?: string;
  summaryEn?: string;
  nextStepsAr?: string;
  nextStepsEn?: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface FollowupMessageRecord {
  id: string;
  tier: "cold" | "warm" | "hot";
  step: number;
  theme: string;
  messageAr: string;
  messageEn: string;
  status: string;
  at: number;
}

export interface DiscountRecord {
  official: number;
  given: number;
}

export interface DecisionMaker {
  name: string;
  nameEn?: string;
  phone?: string;
}

export interface ContractRecord {
  months: number;
  monthly: number;
  total: number;
  via: "meeting" | "direct";
}

export interface PendingQuote {
  count: number;
  price: number;
  total: number;
  status: "pending" | "approved" | "rejected";
}

export interface LogEntry {
  t: number; // epoch ms
  whoId: string; // user id of the actor (resolved to a display name at render time)
  key: string; // translation key under the "log" namespace
  params?: Record<string, string | number | boolean>;
}

export interface Lead {
  id: string;
  name: string;
  nameEn?: string;
  phone: string;
  location: string;
  segment: string; // segment id
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string; // user id
  calls: CallRecord[];
  visit: VisitRecord | null;
  meeting: MeetingRecord | null;
  followupDt: string | null;
  followupEscalated?: boolean;
  followupTier?: "cold" | "warm" | "hot" | "urgent";
  followupDormant?: boolean;
  followupMessages: FollowupMessageRecord[];
  result: "won" | "archived" | null;
  resultReasonKey: string | null; // reason key or free text (prefixed "custom:")
  notes: string;
  createdAt: number;
  updatedAt: number;
  log: LogEntry[];
  discount?: DiscountRecord;
  decisionMaker?: DecisionMaker;
  contract?: ContractRecord;
  referralCode?: string;
  referredByCode?: string;
  pendingQuote?: PendingQuote;
  phoneEdits?: number;
  mtgPostponed?: number;
  transferredFrom?: string; // user id of the rep who transferred this lead
  transferredAt?: number;
}

export interface Permissions {
  transfer: boolean;
  receive: boolean;
  addField: boolean;
  meetings: boolean;
  quote: boolean;
  content: boolean;
}

export interface Target {
  dailyCalls: number;
  dailyVisits: number;
  weeklyMeetings: number;
  monthlyContracts: number;
}

export interface HistoryDay {
  dayKey: string; // e.g. "sat".."fri"
  calls: number;
  visits: number;
  mtg: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  perms: Permissions | null;
  target: Target | null;
  checkedIn: boolean;
  checkInTime: number | null;
  history?: HistoryDay[];
}

export interface ReferralReward {
  id: string;
  referrerLeadId: string;
  referrerName: string;
  referrerPhone: string;
  referredLeadId: string;
  referredName: string;
  referredPhone: string;
  referralCode: string;
  points: number;
  status: "pending" | "approved" | "paid" | "rejected";
  decidedAt: number | null;
  createdAt: number;
}

export interface Segment {
  id: string;
  nameKey: string | null; // translation key for seed segments; null for custom ones
  customName?: string; // free text for manager-added niches
}
