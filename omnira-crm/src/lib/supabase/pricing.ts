import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { PackageDef } from "@/lib/constants";

type Client = SupabaseClient<Database>;

const PACKAGE_ORDER: PackageDef["id"][] = ["silver", "gold", "platinum"];

export async function fetchPackages(supabase: Client): Promise<PackageDef[]> {
  const { data, error } = await supabase.from("pricing_packages").select("*");
  if (error) throw error;
  return (data ?? [])
    .map((r) => ({ id: r.id as PackageDef["id"], price: r.price ?? 0, hours: r.hours }))
    .sort((a, b) => PACKAGE_ORDER.indexOf(a.id) - PACKAGE_ORDER.indexOf(b.id));
}

export async function fetchMinPrice(supabase: Client): Promise<number> {
  const { data, error } = await supabase.from("pricing_settings").select("min_price").eq("id", true).single();
  if (error) throw error;
  return data.min_price;
}

export async function updatePackage(supabase: Client, id: PackageDef["id"], price: number | null, hours: number | null) {
  const { error } = await supabase.from("pricing_packages").update({ price, hours, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function updateMinPrice(supabase: Client, minPrice: number) {
  const { error } = await supabase.from("pricing_settings").update({ min_price: minPrice }).eq("id", true);
  if (error) throw error;
}
