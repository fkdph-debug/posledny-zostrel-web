"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { emailToUsername } from "@/lib/username";
import type { EventKind } from "@/lib/types";

const BUCKET = "media";

const str = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? "").trim();
  return v.length ? v : null;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Neprihlásený.");
  return { supabase, user, who: emailToUsername(user.email) || null };
}

function revalidateAll(eventId?: string | null) {
  revalidatePath("/");
  revalidatePath("/media-kit");
  if (eventId) revalidatePath(`/udalosti/${eventId}`);
}

// ---------- Udalosti ----------
function eventFields(fd: FormData) {
  const kind = (str(fd, "kind") ?? "nazivo") as EventKind;
  let url = str(fd, "url");
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  return {
    date: str(fd, "date") ?? new Date().toISOString().slice(0, 10),
    title: str(fd, "title") ?? "Bez názvu",
    kind,
    place: str(fd, "place"),
    url,
    description: str(fd, "description"),
  };
}

export async function createEvent(fd: FormData) {
  const { supabase, who } = await requireUser();
  const { data, error } = await supabase
    .from("events")
    .insert({ ...eventFields(fd), created_by: who })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidateAll();
  return data.id as string;
}

export async function updateEvent(fd: FormData) {
  const { supabase } = await requireUser();
  const id = String(fd.get("id"));
  const { error } = await supabase.from("events").update(eventFields(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll(id);
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireUser();
  const { data: assets } = await supabase
    .from("assets")
    .select("path, thumb_path")
    .eq("event_id", id);
  const paths = (assets ?? []).flatMap((a) => [a.path, a.thumb_path].filter(Boolean) as string[]);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---------- Súbory ----------
// Upload do Storage ide priamo z prehliadača (supabase-js); sem sa ukladá len záznam.
export async function registerAsset(input: {
  event_id: string | null;
  kit_category: string | null;
  name: string;
  path: string;
  thumb_path: string | null;
  size: number;
  mime: string | null;
  width: number | null;
  height: number | null;
}) {
  const { supabase, who } = await requireUser();
  const { error } = await supabase.from("assets").insert({ ...input, uploaded_by: who });
  if (error) throw new Error(error.message);
  revalidateAll(input.event_id);
}

export async function updateCaption(id: string, caption: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("assets")
    .update({ caption: caption.trim() || null })
    .eq("id", id)
    .select("event_id")
    .single();
  if (error) throw new Error(error.message);
  revalidateAll(data?.event_id);
}

export async function deleteAsset(id: string) {
  const { supabase } = await requireUser();
  const { data: a } = await supabase
    .from("assets")
    .select("path, thumb_path, event_id")
    .eq("id", id)
    .single();
  if (a) {
    await supabase.storage
      .from(BUCKET)
      .remove([a.path, a.thumb_path].filter(Boolean) as string[]);
  }
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll(a?.event_id);
}

/** Podpísaná adresa na stiahnutie (s pôvodným názvom súboru) alebo na prehratie. */
export async function getFileUrl(path: string, downloadName?: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60, downloadName ? { download: downloadName } : undefined);
  if (error || !data) throw new Error(error?.message ?? "Nepodarilo sa.");
  return data.signedUrl;
}

export async function getFileUrls(paths: string[]) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
  if (error || !data) throw new Error(error?.message ?? "Nepodarilo sa.");
  return data.map((d) => d.signedUrl);
}

// ---------- Texty ----------
export async function saveSnippet(fd: FormData) {
  const { supabase, who } = await requireUser();
  const id = str(fd, "id");
  const row = {
    title: str(fd, "title") ?? "Text",
    body: str(fd, "body") ?? "",
    lang: str(fd, "lang") ?? "sk",
    updated_by: who,
  };
  if (id) {
    const { error } = await supabase.from("snippets").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data: last } = await supabase
      .from("snippets")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);
    const position = (last?.[0]?.position ?? 0) + 1;
    const { error } = await supabase.from("snippets").insert({ ...row, position });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/media-kit");
}

export async function deleteSnippet(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("snippets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/media-kit");
}
