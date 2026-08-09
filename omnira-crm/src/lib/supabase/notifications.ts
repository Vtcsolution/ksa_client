import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type Client = SupabaseClient<Database>;

/**
 * `kind`/`params` drive rendering via t(`notif.${kind}`, params) in
 * NotifBell.tsx — same pattern as activity_log/LogLine.tsx — so notification
 * text is bilingual instead of a fixed English string baked in at write time.
 */
export interface NotificationView {
  id: string;
  leadId: string | null;
  kind: string;
  params: Record<string, unknown>;
  urgent: boolean;
  read: boolean;
  at: number;
}

function mapNotification(row: Database["public"]["Tables"]["notifications"]["Row"]): NotificationView {
  return {
    id: row.id,
    leadId: row.lead_id,
    kind: row.kind,
    params: (row.params as Record<string, unknown>) ?? {},
    urgent: row.urgent,
    read: row.read,
    at: new Date(row.created_at).getTime(),
  };
}

/** RLS scopes this to the current user (notifications_select: user_id = auth.uid()). */
export async function fetchNotifications(supabase: Client): Promise<NotificationView[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(supabase: Client, id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}
