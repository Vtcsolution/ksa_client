import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type Client = SupabaseClient<Database>;

export interface ExpenseView {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: number;
  createdBy: string | null;
  createdAt: number;
}

export interface RevenueEntry {
  leadId: string;
  leadName: string;
  leadNameEn: string | null;
  months: number | null;
  monthly: number;
  total: number;
  via: string | null;
  at: number;
}

function mapExpense(row: Database["public"]["Tables"]["expenses"]["Row"]): ExpenseView {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    category: row.category,
    date: new Date(row.expense_date).getTime(),
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function fetchExpenses(supabase: Client): Promise<ExpenseView[]> {
  const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapExpense);
}

export async function addExpense(
  supabase: Client,
  input: { description: string; amount: number; category: string; date: string },
  actorId: string,
) {
  const { error } = await supabase.from("expenses").insert({
    description: input.description,
    amount: input.amount,
    category: input.category,
    expense_date: input.date,
    created_by: actorId,
  });
  if (error) throw error;
}

export async function deleteExpense(supabase: Client, id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"] & {
  leads: { id: string; name: string; name_en: string | null; status: string } | null;
};

/** Only leads currently 'won' — matches computeStats' revenue filter (a reopened lead's old contract shouldn't count). */
export async function fetchRevenue(supabase: Client): Promise<RevenueEntry[]> {
  const { data, error } = await supabase
    .from("contracts")
    .select("*, leads!inner(id, name, name_en, status)")
    .eq("leads.status", "won")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ContractRow[])
    .filter((row) => row.leads)
    .map((row) => ({
      leadId: row.leads!.id,
      leadName: row.leads!.name,
      leadNameEn: row.leads!.name_en,
      months: row.months,
      monthly: row.monthly ?? 0,
      total: row.total ?? 0,
      via: row.via,
      at: new Date(row.created_at).getTime(),
    }));
}
