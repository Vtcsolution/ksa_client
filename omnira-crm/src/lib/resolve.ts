import { SEED_USER_NAME_KEYS } from "./demoAccounts";
import type { DecisionMaker, Lead, Segment, User } from "./types";

type T = (key: string, params?: Record<string, string | number>) => string;

/**
 * The 3 seed demo accounts store their translation key ("u_mgr" etc.) as their
 * profile `name` — id is now a real Supabase auth UUID we don't control, so the
 * name field doubles as the well-known lookup key. Real added staff just show
 * their literal typed name.
 */
export function resolveUserName(user: User | undefined, tUsers: T): string {
  if (!user) return "";
  if (SEED_USER_NAME_KEYS.has(user.name)) return tUsers(user.name);
  return user.name;
}

export function resolveUserNameById(
  userId: string | undefined,
  users: User[],
  tUsers: T,
): string {
  if (!userId) return "";
  return resolveUserName(users.find((u) => u.id === userId), tUsers);
}

/** tSegments should be scoped to the "segments" namespace. */
export function resolveSegmentName(segment: Segment | undefined, tSegments: T): string {
  if (!segment) return "";
  if (segment.nameKey) return tSegments(segment.nameKey);
  return segment.customName ?? "";
}

export function resolveSegmentNameById(
  segmentId: string,
  segments: Segment[],
  tSegments: T,
): string {
  return resolveSegmentName(segments.find((s) => s.id === segmentId), tSegments);
}

/** Client/business names carry an optional English variant; Arabic is the source of truth. */
export function resolveLeadName(lead: Pick<Lead, "name" | "nameEn">, locale: string): string {
  return locale === "en" && lead.nameEn ? lead.nameEn : lead.name;
}

export function resolveCallInsightLeadName(
  call: { leadName: string; leadNameEn?: string },
  locale: string,
): string {
  return locale === "en" && call.leadNameEn ? call.leadNameEn : call.leadName;
}

export function resolveDecisionMakerName(dm: DecisionMaker | undefined, locale: string): string {
  if (!dm) return "";
  return locale === "en" && dm.nameEn ? dm.nameEn : dm.name;
}

/**
 * Reason keys may be a plain key (looked up in the given translation function)
 * or "custom:<free text>" for a user-entered reason.
 */
export function resolveReason(key: string | null | undefined, t: T): string {
  if (!key) return "";
  if (key.startsWith("custom:")) return key.slice(7);
  return t(key);
}
