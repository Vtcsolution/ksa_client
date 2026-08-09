import { create } from "zustand";
import type { CallAnswered, Lead, MeetingType, Permissions, ReferralReward, Segment, Target, User } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { fetchLeadById, fetchLeads, fetchReferralRewards, fetchSegments, fetchUsers } from "@/lib/supabase/queries";
import { fetchCallInsights, type CallInsightView } from "@/lib/supabase/callInsights";
import { fetchNotifications, markNotificationRead, type NotificationView } from "@/lib/supabase/notifications";
import {
  addContentLink,
  deleteContentItem,
  fetchContentItems,
  uploadContentFile,
  type ContentItemView,
} from "@/lib/supabase/content";
import { fetchMinPrice, fetchPackages, updateMinPrice, updatePackage } from "@/lib/supabase/pricing";
import {
  addExpense,
  deleteExpense,
  fetchExpenses,
  fetchRevenue,
  type ExpenseView,
  type RevenueEntry,
} from "@/lib/supabase/finance";
import * as mut from "@/lib/supabase/mutations";
import type { PackageDef } from "@/lib/constants";
import { getRuntimeLocale, rt } from "@/lib/i18n-runtime";
import { formatDT, formatDuration } from "@/lib/format";
import { resolveLeadName, resolveReason } from "@/lib/resolve";
import { SEED_USER_NAME_KEYS } from "@/lib/demoAccounts";
import { useToastStore } from "./useToastStore";

const push = (key: string, params?: Record<string, string | number>, kind?: "ok" | "warn" | "info") =>
  useToastStore.getState().push(key, params, kind);

const fmtDate = (v: string | number) => formatDT(v, getRuntimeLocale(), rt("dateHelpers"));
const fmtDur = (sec: number) => formatDuration(sec, getRuntimeLocale());
const typeLabel = (type: MeetingType) => rt("leadCard")(type);

interface AppState {
  hasHydrated: boolean;
  currentUserId: string | null;
  users: User[];
  leads: Lead[];
  segments: Segment[];
  callInsights: CallInsightView[];
  notifications: NotificationView[];
  contentItems: ContentItemView[];
  packages: PackageDef[];
  minPrice: number;
  expenses: ExpenseView[];
  revenue: RevenueEntry[];
  referralRewards: ReferralReward[];

  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  refreshLead: (leadId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updatePackage: (id: PackageDef["id"], price: number | null, hours: number | null) => Promise<void>;
  updateMinPrice: (minPrice: number) => Promise<void>;
  addExpense: (input: { description: string; amount: number; category: string; date: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setReferredByCode: (leadId: string, code: string) => Promise<void>;
  decideReferralReward: (rewardId: string, status: "approved" | "paid" | "rejected") => Promise<void>;

  userDisplayName: (userId: string | undefined) => string;

  addStaff: (
    name: string,
    roleChoice: "sales" | "meetings",
  ) => Promise<{ email: string; password: string } | null>;
  updatePerm: (userId: string, key: keyof Permissions, value: boolean) => Promise<void>;
  updateTarget: (userId: string, target: Target) => Promise<void>;

  addSegment: (name: string) => Promise<void>;

  importLeads: (
    rows: { name: string; phone: string; location: string; segment: string }[],
    assignedTo: string,
  ) => Promise<{ added: number; skipped: number }>;
  addFieldLead: (
    input: { name: string; phone: string; segment: string },
    actorId: string,
  ) => Promise<{ ok: true } | { ok: false; error: "duplicate" | "invalid"; existingName?: string }>;
  updateLeadCore: (leadId: string, patch: { name: string; phone: string; segment: string; location: string }) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  reopenLead: (leadId: string) => Promise<void>;

  recordCall: (
    leadId: string,
    actorId: string,
    input: {
      answered: CallAnswered;
      durSec: number;
      note: string;
      outcome?: "inperson" | "online" | "followup" | "reject";
      meetingDt?: string;
      followupDt?: string;
      rejectReasonKey?: string;
      cancelExistingMeeting?: boolean;
      retryDt?: string;
    },
  ) => Promise<void>;
  logVisit: (
    leadId: string,
    actorId: string,
    input: { name: string; phone: string; contact: string; segment: string; note: string; verified: boolean },
  ) => Promise<void>;
  bookMeeting: (leadId: string, actorId: string, type: MeetingType, dt: string) => Promise<void>;
  transferLead: (leadId: string, fromUserId: string, toUserId: string, reasonKey: string) => Promise<void>;
  sendQuote: (
    leadId: string,
    actorId: string,
    input: { packageId: "silver" | "gold" | "platinum"; count: number; price: number },
  ) => Promise<{ ok: true } | { ok: false; error: "belowMin" }>;
  approveQuote: (leadId: string) => Promise<void>;
  rejectQuote: (leadId: string) => Promise<void>;
  fixLeadContact: (
    leadId: string,
    input: { newPhone: string; decisionMakerName: string; decisionMakerPhone: string },
  ) => Promise<{ ok: true } | { ok: false; error: "duplicate"; existingName?: string }>;
  sendContent: (leadId: string, actorId: string, contentId: string, nameAr: string, nameEn: string) => Promise<void>;
  uploadContentFile: (file: File, name: string, nameEn: string) => Promise<void>;
  addContentLink: (name: string, nameEn: string, url: string) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  setResultWon: (leadId: string, actorId: string, input: { reasonKey: string; months: number; monthly: number }) => Promise<void>;
  setResultArchived: (leadId: string, actorId: string, reasonKey: string) => Promise<void>;
  setFollowup: (leadId: string, actorId: string, dt: string, cancelMeeting: boolean) => Promise<void>;
  markMeetingDone: (leadId: string, actorId: string, proof: boolean, notes?: string) => Promise<void>;
  markMeetingMissed: (leadId: string, actorId: string, reasonKey: string, rescheduleDt?: string) => Promise<void>;
  queueWhatsappFollowup: (callId: string, leadId: string, messageAr: string, messageEn: string) => Promise<void>;
}

/** Wraps a mutation: runs it, surfaces a generic toast on failure instead of throwing into an onClick handler. */
async function guarded<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(err);
    push("genericError", undefined, "warn");
    return fallback;
  }
}

let realtimeChannelsBound = false;

export const useAppStore = create<AppState>()((set, get) => ({
  hasHydrated: false,
  currentUserId: null,
  users: [],
  leads: [],
  segments: [],
  callInsights: [],
  notifications: [],
  contentItems: [],
  packages: [],
  minPrice: 4000,
  expenses: [],
  revenue: [],
  referralRewards: [],

  initialize: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ hasHydrated: true, currentUserId: null });
      return;
    }

    const [users, leads, segments, callInsights, notifications, contentItems, packages, minPrice, expenses, revenue, referralRewards] =
      await Promise.all([
        fetchUsers(supabase),
        fetchLeads(supabase),
        fetchSegments(supabase),
        fetchCallInsights(supabase),
        fetchNotifications(supabase),
        fetchContentItems(supabase),
        fetchPackages(supabase),
        fetchMinPrice(supabase),
        fetchExpenses(supabase),
        fetchRevenue(supabase),
        fetchReferralRewards(supabase),
      ]);
    set({
      currentUserId: user.id,
      users,
      leads,
      segments,
      callInsights,
      notifications,
      contentItems,
      packages,
      minPrice,
      expenses,
      revenue,
      referralRewards,
      hasHydrated: true,
    });

    const me = users.find((u) => u.id === user.id);
    if (me && me.role === "rep" && !me.checkedIn) {
      const time = Date.now();
      await supabase.from("profiles").update({ checked_in: true, check_in_time: new Date(time).toISOString() }).eq("id", user.id);
      set((s) => ({ users: s.users.map((u) => (u.id === user.id ? { ...u, checkedIn: true, checkInTime: time } : u)) }));
      push("welcomeCheckIn", { name: get().userDisplayName(user.id), time: fmtDate(time) });
    }

    if (!realtimeChannelsBound) {
      realtimeChannelsBound = true;
      const refresh = (leadId: string | undefined) => {
        if (leadId) get().refreshLead(leadId);
      };
      supabase
        .channel("leads-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
          const row = (payload.new ?? payload.old) as { id?: string } | null;
          if (payload.eventType === "DELETE" && row?.id) {
            set((s) => ({ leads: s.leads.filter((l) => l.id !== row.id) }));
          } else {
            refresh(row?.id);
          }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "calls" }, (p) => refresh((p.new as { lead_id?: string } | null)?.lead_id ?? (p.old as { lead_id?: string } | null)?.lead_id))
        .on("postgres_changes", { event: "*", schema: "public", table: "visits" }, (p) => refresh((p.new as { lead_id?: string } | null)?.lead_id ?? (p.old as { lead_id?: string } | null)?.lead_id))
        .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, (p) => refresh((p.new as { lead_id?: string } | null)?.lead_id ?? (p.old as { lead_id?: string } | null)?.lead_id))
        .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, (p) => refresh((p.new as { lead_id?: string } | null)?.lead_id ?? (p.old as { lead_id?: string } | null)?.lead_id))
        .on("postgres_changes", { event: "*", schema: "public", table: "contracts" }, (p) => refresh((p.new as { lead_id?: string } | null)?.lead_id ?? (p.old as { lead_id?: string } | null)?.lead_id))
        .on("postgres_changes", { event: "*", schema: "public", table: "activity_log" }, (p) => refresh((p.new as { lead_id?: string } | null)?.lead_id ?? (p.old as { lead_id?: string } | null)?.lead_id))
        .subscribe();

      supabase
        .channel("profiles-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, async () => {
          set({ users: await fetchUsers(supabase) });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "targets" }, async () => {
          set({ users: await fetchUsers(supabase) });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "segments" }, async () => {
          set({ segments: await fetchSegments(supabase) });
        })
        .subscribe();

      // Refetches the whole list on any change (insert/update/delete) — simplest
      // correct option while this list stays small; the Ziwo pipeline runs
      // async in the background (poll job / webhook), so this is what makes a
      // call's status flip from "processing" to "analyzed" show up live on the
      // Call Intelligence page without a manual refresh.
      supabase
        .channel("call-insights-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "call_insights" }, async () => {
          set({ callInsights: await fetchCallInsights(supabase) });
        })
        .subscribe();

      // RLS already scopes reads to the current user (notifications_select:
      // user_id = auth.uid()), so no per-user filter needed here.
      supabase
        .channel("notifications-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, async () => {
          set({ notifications: await fetchNotifications(supabase) });
        })
        .subscribe();

      supabase
        .channel("content-items-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "content_items" }, async () => {
          set({ contentItems: await fetchContentItems(supabase) });
        })
        .subscribe();

      supabase
        .channel("pricing-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "pricing_packages" }, async () => {
          set({ packages: await fetchPackages(supabase) });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "pricing_settings" }, async () => {
          set({ minPrice: await fetchMinPrice(supabase) });
        })
        .subscribe();

      supabase
        .channel("finance-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, async () => {
          set({ expenses: await fetchExpenses(supabase) });
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "contracts" }, async () => {
          set({ revenue: await fetchRevenue(supabase) });
        })
        .subscribe();

      supabase
        .channel("referral-rewards-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "referral_rewards" }, async () => {
          set({ referralRewards: await fetchReferralRewards(supabase) });
        })
        .subscribe();
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({
      currentUserId: null,
      users: [],
      leads: [],
      segments: [],
      callInsights: [],
      notifications: [],
      contentItems: [],
      hasHydrated: true,
    });
  },

  markNotificationRead: async (id) => {
    const supabase = createClient();
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
    await guarded(() => markNotificationRead(supabase, id), undefined);
  },

  updatePackage: async (id, price, hours) => {
    await guarded(async () => {
      const supabase = createClient();
      await updatePackage(supabase, id, price, hours);
      set({ packages: await fetchPackages(supabase) });
      push("pricingUpdated");
    }, undefined);
  },

  updateMinPrice: async (minPrice) => {
    await guarded(async () => {
      const supabase = createClient();
      await updateMinPrice(supabase, minPrice);
      set({ minPrice: await fetchMinPrice(supabase) });
      push("pricingUpdated");
    }, undefined);
  },

  addExpense: async (input) => {
    const actorId = get().currentUserId;
    if (!actorId) return;
    await guarded(async () => {
      const supabase = createClient();
      await addExpense(supabase, input, actorId);
      set({ expenses: await fetchExpenses(supabase) });
      push("expenseAdded");
    }, undefined);
  },

  deleteExpense: async (id) => {
    await guarded(async () => {
      const supabase = createClient();
      await deleteExpense(supabase, id);
      set({ expenses: await fetchExpenses(supabase) });
      push("expenseDeleted");
    }, undefined);
  },

  setReferredByCode: async (leadId, code) => {
    const actorId = get().currentUserId;
    if (!actorId) return;
    await guarded(async () => {
      const supabase = createClient();
      await mut.setReferredByCode(supabase, leadId, actorId, code);
      await get().refreshLead(leadId);
    }, undefined);
  },

  decideReferralReward: async (rewardId, status) => {
    const actorId = get().currentUserId;
    if (!actorId) return;
    await guarded(async () => {
      const supabase = createClient();
      await mut.decideReferralReward(supabase, rewardId, actorId, status);
      set({ referralRewards: await fetchReferralRewards(supabase) });
      push("rewardUpdated");
    }, undefined);
  },

  refreshLead: async (leadId) => {
    const supabase = createClient();
    const lead = await fetchLeadById(supabase, leadId);
    set((s) => {
      if (!lead) return { leads: s.leads.filter((l) => l.id !== leadId) };
      const exists = s.leads.some((l) => l.id === leadId);
      return { leads: exists ? s.leads.map((l) => (l.id === leadId ? lead : l)) : [lead, ...s.leads] };
    });
  },

  userDisplayName: (userId) => {
    if (!userId) return "";
    const u = get().users.find((x) => x.id === userId);
    if (!u) return "";
    return SEED_USER_NAME_KEYS.has(u.name) ? rt("users")(u.name) : u.name;
  },

  addStaff: async (name, roleChoice) => {
    if (!name.trim()) {
      push("enterStaffName", undefined, "warn");
      return null;
    }
    return guarded(async () => {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), roleChoice }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = (await res.json()) as { email: string; password: string };
      set({ users: await fetchUsers(createClient()) });
      push("staffAdded", { name: name.trim() });
      return created;
    }, null);
  },

  updatePerm: async (userId, key, value) => {
    set((s) => ({ users: s.users.map((u) => (u.id === userId && u.perms ? { ...u, perms: { ...u.perms, [key]: value } } : u)) }));
    await guarded(() => mut.updatePerm(createClient(), userId, key, value), undefined);
  },

  updateTarget: async (userId, target) => {
    set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, target } : u)) }));
    await guarded(async () => {
      await mut.updateTarget(createClient(), userId, target);
      push("targetsUpdated", { name: get().userDisplayName(userId) });
    }, undefined);
  },

  addSegment: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      push("nicheNameRequired", undefined, "warn");
      return;
    }
    await guarded(async () => {
      const supabase = createClient();
      await mut.addSegment(supabase, trimmed);
      set({ segments: await fetchSegments(supabase) });
      push("nicheAdded", { name: trimmed });
    }, undefined);
  },

  importLeads: async (rows, assignedTo) => {
    return guarded(async () => {
      const supabase = createClient();
      const actorId = get().currentUserId ?? "";
      const result = await mut.importLeads(supabase, rows, assignedTo, actorId);
      if (result.added > 0) set({ leads: await fetchLeads(supabase) });
      if (result.added === 0) push("noValidRows", undefined, "warn");
      else if (result.skipped > 0) push("distributedWithSkipped", { added: result.added, skipped: result.skipped });
      else push("distributed", { added: result.added });
      return result;
    }, { added: 0, skipped: 0 });
  },

  addFieldLead: async (input, actorId) => {
    return guarded(async () => {
      const supabase = createClient();
      const res = await mut.addFieldLead(supabase, input, actorId);
      if (res.ok) {
        set({ leads: await fetchLeads(supabase) });
        push("fieldClientAdded", { name: input.name.trim() });
      }
      return res;
    }, { ok: false, error: "invalid" } as const);
  },

  updateLeadCore: async (leadId, patch) => {
    await guarded(async () => {
      const supabase = createClient();
      await mut.updateLeadCore(supabase, leadId, patch, get().currentUserId ?? "");
      await get().refreshLead(leadId);
      push("dataUpdated");
    }, undefined);
  },

  deleteLead: async (leadId) => {
    const lead = get().leads.find((l) => l.id === leadId);
    await guarded(async () => {
      await mut.deleteLead(createClient(), leadId);
      set((s) => ({ leads: s.leads.filter((l) => l.id !== leadId) }));
      if (lead) push("deletedPermanently", { name: resolveLeadName(lead, getRuntimeLocale()) });
    }, undefined);
  },

  reopenLead: async (leadId) => {
    const lead = get().leads.find((l) => l.id === leadId);
    await guarded(async () => {
      await mut.reopenLead(createClient(), leadId, get().currentUserId ?? "");
      await get().refreshLead(leadId);
      if (lead) push("reopened", { name: resolveLeadName(lead, getRuntimeLocale()) });
    }, undefined);
  },

  recordCall: async (leadId, actorId, input) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;
    const hasActiveMeeting = !!(lead.meeting && !lead.meeting.done && !lead.meeting.missed);

    await guarded(async () => {
      await mut.recordCall(createClient(), leadId, actorId, input);
      await get().refreshLead(leadId);

      if (input.answered === "answered") {
        if (input.outcome === "inperson" || input.outcome === "online") {
          push("goalAchievedMeeting", { type: typeLabel(input.outcome), dt: fmtDate(input.meetingDt!) });
        } else if (input.outcome === "followup") {
          if (hasActiveMeeting && !input.cancelExistingMeeting) push("contactTimeLoggedMeetingKept", { dt: fmtDate(input.followupDt!) });
          else if (hasActiveMeeting) push("followupScheduledMeetingCancelled", { dt: fmtDate(input.followupDt!) });
          else push("followupScheduled", { dt: fmtDate(input.followupDt!) });
        } else if (input.outcome === "reject") {
          push("archivedWithReason", { reason: resolveReason(input.rejectReasonKey!, rt("reasons.reject")) });
        }
      } else {
        push("attemptLogged", { dt: fmtDate(input.retryDt!) });
      }
    }, undefined);
  },

  logVisit: async (leadId, actorId, input) => {
    await guarded(async () => {
      await mut.logVisit(createClient(), leadId, actorId, input);
      await get().refreshLead(leadId);
      push(input.verified ? "visitLoggedVerified" : "visitLoggedReview");
    }, undefined);
  },

  bookMeeting: async (leadId, actorId, type, dt) => {
    await guarded(async () => {
      await mut.bookMeeting(createClient(), leadId, actorId, type, dt);
      await get().refreshLead(leadId);
      push("meetingBooked", { type: typeLabel(type), dt: fmtDate(dt) });
    }, undefined);
  },

  transferLead: async (leadId, fromUserId, toUserId, reasonKey) => {
    const lead = get().leads.find((l) => l.id === leadId);
    await guarded(async () => {
      await mut.transferLead(createClient(), leadId, fromUserId, toUserId, reasonKey);
      await get().refreshLead(leadId);
      if (lead) push("transferred", { name: resolveLeadName(lead, getRuntimeLocale()), toName: get().userDisplayName(toUserId) });
    }, undefined);
  },

  sendQuote: async (leadId, actorId, input) => {
    return guarded(async () => {
      const pkg = get().packages.find((p) => p.id === input.packageId)!;
      const res = await mut.sendQuote(createClient(), leadId, actorId, input, get().minPrice, pkg.price);
      if (res.ok) {
        await get().refreshLead(leadId);
        push(input.packageId === "platinum" ? "platinumSentToManager" : "quoteSent");
      }
      return res;
    }, { ok: false, error: "belowMin" } as const);
  },

  approveQuote: async (leadId) => {
    await guarded(async () => {
      await mut.approveQuote(createClient(), leadId, get().currentUserId ?? "");
      await get().refreshLead(leadId);
    }, undefined);
  },
  rejectQuote: async (leadId) => {
    await guarded(async () => {
      await mut.rejectQuote(createClient(), leadId, get().currentUserId ?? "");
      await get().refreshLead(leadId);
    }, undefined);
  },

  fixLeadContact: async (leadId, input) => {
    return guarded(async () => {
      const res = await mut.fixLeadContact(createClient(), leadId, input, get().currentUserId ?? "");
      if (res.ok) {
        await get().refreshLead(leadId);
        if (input.newPhone || input.decisionMakerName.trim()) push("contactInfoUpdated");
        else push("noChange", undefined, "info");
      }
      return res;
    }, { ok: false, error: "duplicate" } as const);
  },

  sendContent: async (leadId, actorId, contentId, nameAr, nameEn) => {
    await guarded(async () => {
      await mut.sendContent(createClient(), leadId, actorId, contentId, nameAr, nameEn);
      await get().refreshLead(leadId);
      push("contentSent", { name: getRuntimeLocale() === "ar" ? nameAr : nameEn || nameAr });
    }, undefined);
  },

  uploadContentFile: async (file, name, nameEn) => {
    const actorId = get().currentUserId;
    if (!actorId) return;
    await guarded(async () => {
      const supabase = createClient();
      await uploadContentFile(supabase, file, name, nameEn || null, actorId);
      set({ contentItems: await fetchContentItems(supabase) });
      push("contentUploaded", { name });
    }, undefined);
  },

  addContentLink: async (name, nameEn, url) => {
    const actorId = get().currentUserId;
    if (!actorId) return;
    await guarded(async () => {
      const supabase = createClient();
      await addContentLink(supabase, name, nameEn || null, url, actorId);
      set({ contentItems: await fetchContentItems(supabase) });
      push("contentUploaded", { name });
    }, undefined);
  },

  deleteContentItem: async (id) => {
    const item = get().contentItems.find((c) => c.id === id);
    await guarded(async () => {
      const supabase = createClient();
      await deleteContentItem(supabase, id, item?.storagePath ?? null);
      set({ contentItems: await fetchContentItems(supabase) });
      push("contentDeleted");
    }, undefined);
  },

  setResultWon: async (leadId, actorId, input) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;
    await guarded(async () => {
      await mut.setResultWon(createClient(), leadId, actorId, input);
      await get().refreshLead(leadId);
      push("wonToast", { total: input.months * input.monthly, name: resolveLeadName(lead, getRuntimeLocale()) });

      // Best-effort — schedules a post-deal feedback survey on the Website
      // side a few days out. Never blocks or surfaces an error: the win
      // itself already succeeded above regardless of this call's outcome.
      fetch("/api/leads/won-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lead.name, phone: lead.phone }),
      }).catch(() => {});
    }, undefined);
  },

  setResultArchived: async (leadId, actorId, reasonKey) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;
    await guarded(async () => {
      await mut.setResultArchived(createClient(), leadId, actorId, reasonKey);
      await get().refreshLead(leadId);
      push("archivedToast", { name: resolveLeadName(lead, getRuntimeLocale()), reason: resolveReason(reasonKey, rt("reasons.reject")) });
    }, undefined);
  },

  setFollowup: async (leadId, actorId, dt, cancelMeeting) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;
    const hadMeeting = !!(lead.meeting && !lead.meeting.done && !lead.meeting.missed);
    await guarded(async () => {
      await mut.setFollowup(createClient(), leadId, actorId, dt, cancelMeeting);
      await get().refreshLead(leadId);
      if (hadMeeting && !cancelMeeting) push("contactTimeLoggedMeetingKept", { dt: fmtDate(dt) });
      else push("followupToast", { dt: fmtDate(dt) });
    }, undefined);
  },

  markMeetingDone: async (leadId, actorId, proof, notes) => {
    await guarded(async () => {
      const meetingId = await mut.markMeetingDone(createClient(), leadId, actorId, proof, notes);
      await get().refreshLead(leadId);
      push("meetingHappenedNext");

      // AI recap runs after the meeting is already safely marked done and
      // notes saved — fired in the background so the rep isn't stuck waiting
      // on an OpenAI call; refreshLead again once it resolves so the summary
      // appears without a manual page refresh.
      if (meetingId && notes?.trim()) {
        fetch(`/api/meetings/${meetingId}/summarize`, { method: "POST" })
          .then(() => get().refreshLead(leadId))
          .catch(() => {});
      }
    }, undefined);
  },

  markMeetingMissed: async (leadId, actorId, reasonKey, rescheduleDt) => {
    await guarded(async () => {
      await mut.markMeetingMissed(createClient(), leadId, actorId, reasonKey, rescheduleDt);
      await get().refreshLead(leadId);
      if (reasonKey === "postponed" && rescheduleDt) push("rescheduled", { dt: fmtDate(rescheduleDt) });
      else push("reasonLoggedBookOrFollowup");
    }, undefined);
  },

  queueWhatsappFollowup: async (callId, leadId, messageAr, messageEn) => {
    const actorId = get().currentUserId;
    if (!actorId) return;
    await guarded(async () => {
      await mut.queueWhatsappFollowup(createClient(), callId, leadId, actorId, messageAr, messageEn);
      set((s) => ({ callInsights: s.callInsights.map((c) => (c.id === callId ? { ...c, whatsappSent: true } : c)) }));
      await get().refreshLead(leadId);
      push("whatsappFollowupQueuedToast");
    }, undefined);
  },
}));

export { fmtDur };
