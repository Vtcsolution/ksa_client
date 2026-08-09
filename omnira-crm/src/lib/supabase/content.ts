import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type Client = SupabaseClient<Database>;

export type ContentFileType = "pdf" | "image" | "doc" | "link" | "other";

export interface ContentItemView {
  id: string;
  name: string;
  nameEn: string | null;
  fileType: ContentFileType;
  url: string; // resolved: public storage URL for files, external_url for links
  storagePath: string | null; // raw bucket path, needed to delete the file — null for links
  fileSize: number | null;
  uploadedBy: string | null;
  createdAt: number;
}

const BUCKET = "content-library";

function mapContentItem(supabase: Client, row: Database["public"]["Tables"]["content_items"]["Row"]): ContentItemView {
  const url = row.external_url ?? (row.storage_path ? supabase.storage.from(BUCKET).getPublicUrl(row.storage_path).data.publicUrl : "");
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    fileType: (row.file_type as ContentFileType) ?? "other",
    url,
    storagePath: row.storage_path,
    fileSize: row.file_size,
    uploadedBy: row.uploaded_by,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function fetchContentItems(supabase: Client): Promise<ContentItemView[]> {
  const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapContentItem(supabase, row));
}

function fileTypeFromMime(mime: string): ContentFileType {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("application/") || mime.startsWith("text/")) return "doc";
  return "other";
}

export async function uploadContentFile(
  supabase: Client,
  file: File,
  name: string,
  nameEn: string | null,
  actorId: string,
): Promise<void> {
  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (uploadErr) throw uploadErr;

  const { error: insertErr } = await supabase.from("content_items").insert({
    name,
    name_en: nameEn,
    file_type: fileTypeFromMime(file.type),
    storage_path: path,
    file_size: file.size,
    uploaded_by: actorId,
  });
  if (insertErr) {
    await supabase.storage.from(BUCKET).remove([path]); // don't leave an orphaned file if the row insert fails
    throw insertErr;
  }
}

export async function addContentLink(supabase: Client, name: string, nameEn: string | null, url: string, actorId: string): Promise<void> {
  const { error } = await supabase.from("content_items").insert({
    name,
    name_en: nameEn,
    file_type: "link",
    external_url: url,
    uploaded_by: actorId,
  });
  if (error) throw error;
}

export async function deleteContentItem(supabase: Client, id: string, storagePath: string | null): Promise<void> {
  if (storagePath) {
    const { error: removeErr } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (removeErr) throw removeErr;
  }
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) throw error;
}
