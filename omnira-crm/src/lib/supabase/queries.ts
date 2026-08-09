import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead, ReferralReward, Segment, User } from "@/lib/types";
import type { Database } from "./database.types";
import { mapLead, mapSegment, mapUser, type LeadWithRelations } from "./mappers";

type Client = SupabaseClient<Database>;

const LEAD_SELECT = "*, calls(*), visits(*), meetings(*), quotes(*), contracts(*), activity_log(*)";

export async function fetchLeads(supabase: Client): Promise<Lead[]> {
  const { data, error } = await supabase.from("leads").select(LEAD_SELECT).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as LeadWithRelations[]).map(mapLead);
}

export async function fetchLeadById(supabase: Client, leadId: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select(LEAD_SELECT).eq("id", leadId).maybeSingle();
  if (error) throw error;
  return data ? mapLead(data as unknown as LeadWithRelations) : null;
}

type ProfileWithTarget = Database["public"]["Tables"]["profiles"]["Row"] & {
  targets: Database["public"]["Tables"]["targets"]["Row"] | null;
};

export async function fetchUsers(supabase: Client): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select("*, targets(*)");
  if (error) throw error;
  const profiles = data as unknown as ProfileWithTarget[];

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: statsData, error: statsError } = await supabase.from("daily_stats").select("*").gte("day", sevenDaysAgo);
  if (statsError) throw statsError;
  const stats = statsData ?? [];

  return profiles.map((p) => {
    const history = stats.filter((s) => s.user_id === p.id);
    return mapUser(p, p.targets, history);
  });
}

export async function fetchSegments(supabase: Client): Promise<Segment[]> {
  const { data, error } = await supabase.from("segments").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map(mapSegment);
}

type ReferralRewardRow = Database["public"]["Tables"]["referral_rewards"]["Row"] & {
  referrer: { id: string; name: string; name_en: string | null; phone: string } | null;
  referred: { id: string; name: string; name_en: string | null; phone: string } | null;
};

export async function fetchReferralRewards(supabase: Client): Promise<ReferralReward[]> {
  const { data, error } = await supabase
    .from("referral_rewards")
    .select("*, referrer:referrer_lead_id(id,name,name_en,phone), referred:referred_lead_id(id,name,name_en,phone)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ReferralRewardRow[]).map((row) => ({
    id: row.id,
    referrerLeadId: row.referrer_lead_id,
    referrerName: row.referrer?.name ?? "",
    referrerPhone: row.referrer?.phone ?? "",
    referredLeadId: row.referred_lead_id,
    referredName: row.referred?.name ?? "",
    referredPhone: row.referred?.phone ?? "",
    referralCode: row.referral_code,
    points: row.points,
    status: row.status,
    decidedAt: row.decided_at ? new Date(row.decided_at).getTime() : null,
    createdAt: new Date(row.created_at).getTime(),
  }));
}
