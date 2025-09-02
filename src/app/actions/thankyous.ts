"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types/database";

type Channel = "email" | "text" | "card";
type Relationship = "friend" | "family" | "coworker" | "other";
type Tone = "warm" | "formal" | "playful";

async function requireUserOrThrow(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Not authenticated");
  return auth.user;
}

async function assertListOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("gift_lists")
    .select("id")
    .eq("id", listId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export async function saveThankYouDraft(input: {
  id?: string;
  listId: string;
  giftId: string;
  channel: Channel;
  relationship: Relationship;
  tone: Tone;
  content: string;
  occasion?: string;
  personalTouch?: string;
}) {
  const supabase = await createClient();
  const supa = supabase as unknown as SupabaseClient<Database>;
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const meta = {
    occasion: input.occasion ?? null,
    personalTouch: input.personalTouch ?? null,
  } as const;

  if (input.id) {
    const { data, error } = await supa
      .from("thank_you_notes")
      .update({
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "draft",
      } satisfies Database["public"]["Tables"]["thank_you_notes"]["Update"])
      .eq("id", input.id)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to save draft");
    revalidatePath(`/thankyou?list=${input.listId}`);
    return { id: data.id };
  }

  const { data, error } = await supa
    .from("thank_you_notes")
    .insert({
      list_id: input.listId,
      gift_id: input.giftId,
      channel: input.channel,
      relationship: input.relationship,
      tone: input.tone,
      content: input.content,
      meta,
      status: "draft",
    } satisfies Database["public"]["Tables"]["thank_you_notes"]["Insert"])
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create draft");
  revalidatePath(`/thankyou?list=${input.listId}`);
  return { id: data.id };
}

export async function sendThankYouNote(input: {
  id?: string;
  listId: string;
  giftId: string;
  channel: Channel;
  relationship: Relationship;
  tone: Tone;
  content: string;
  occasion?: string;
  personalTouch?: string;
}) {
  const supabase = await createClient();
  const supa = supabase as unknown as SupabaseClient<Database>;
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const now = new Date().toISOString();
  const meta = {
    occasion: input.occasion ?? null,
    personalTouch: input.personalTouch ?? null,
  } as const;

  let noteId = input.id ?? null;

  if (noteId) {
    const { error } = await supa
      .from("thank_you_notes")
      .update({
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "sent",
        sent_at: now,
      } satisfies Database["public"]["Tables"]["thank_you_notes"]["Update"])
      .eq("id", noteId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supa
      .from("thank_you_notes")
      .insert({
        list_id: input.listId,
        gift_id: input.giftId,
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "sent",
        sent_at: now,
      } satisfies Database["public"]["Tables"]["thank_you_notes"]["Insert"])
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create note");
    noteId = data.id;
  }

  // Mark gift as thanked
  const { error: giftErr } = await supa
    .from("gifts")
    .update({ thank_you_sent: true, thank_you_sent_at: now } satisfies Database["public"]["Tables"]["gifts"]["Update"])
    .eq("id", input.giftId);
  if (giftErr) throw new Error(giftErr.message);

  revalidatePath(`/thankyou?list=${input.listId}`);
  return { id: noteId };
}

export async function deleteThankYouNote(input: { id: string; listId: string }) {
  const supabase = await createClient();
  const supa = supabase as unknown as SupabaseClient<Database>;
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const { error } = await supa.from("thank_you_notes").delete().eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/thankyou?list=${input.listId}`);
  return { ok: true };
}

// FormData-friendly server actions for use in <form action={...}>
export async function saveThankYouDraftAction(formData: FormData) {
  const id = String(formData.get("note_id") ?? "").trim() || undefined;
  const listId = String(formData.get("list_id") ?? "");
  const giftId = String(formData.get("gift_id") ?? "");
  const channel = String(formData.get("channel") ?? "email") as Channel;
  const relationship = String(formData.get("relationship") ?? "friend") as Relationship;
  const tone = String(formData.get("tone") ?? "warm") as Tone;
  const content = String(formData.get("content") ?? "");
  const occasion = String(formData.get("occasion") ?? "");
  const personalTouch = String(formData.get("personal_touch") ?? "");

  if (!listId || !giftId) throw new Error("Missing list or gift");

  await saveThankYouDraft({ id, listId, giftId, channel, relationship, tone, content, occasion, personalTouch });
  revalidatePath(`/thankyou?list=${listId}`);
}

export async function sendThankYouNoteAction(formData: FormData) {
  const id = String(formData.get("note_id") ?? "").trim() || undefined;
  const listId = String(formData.get("list_id") ?? "");
  const giftId = String(formData.get("gift_id") ?? "");
  const channel = String(formData.get("channel") ?? "email") as Channel;
  const relationship = String(formData.get("relationship") ?? "friend") as Relationship;
  const tone = String(formData.get("tone") ?? "warm") as Tone;
  const content = String(formData.get("content") ?? "");
  const occasion = String(formData.get("occasion") ?? "");
  const personalTouch = String(formData.get("personal_touch") ?? "");

  if (!listId || !giftId) throw new Error("Missing list or gift");

  await sendThankYouNote({ id, listId, giftId, channel, relationship, tone, content, occasion, personalTouch });
  revalidatePath(`/thankyou?list=${listId}`);
}

export async function deleteThankYouNoteAction(formData: FormData) {
  const id = String(formData.get("note_id") ?? "");
  const listId = String(formData.get("list_id") ?? "");
  if (!id || !listId) throw new Error("Missing note id or list id");
  await deleteThankYouNote({ id, listId });
  revalidatePath(`/thankyou?list=${listId}`);
}

// ---------------- New programmatic server actions (no revalidate/redirect) ----------------

export type UINote = {
  id: string;
  gift_id: string;
  channel: Channel;
  relationship: Relationship;
  tone: Tone;
  status: "draft" | "sent";
  content: string;
  meta: { occasion?: string | null; personalTouch?: string | null } | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
};

export async function saveThankYouDraftDirect(input: {
  id?: string;
  listId: string;
  giftId: string;
  channel: Channel;
  relationship: Relationship;
  tone: Tone;
  content: string;
  occasion?: string;
  personalTouch?: string;
}): Promise<UINote> {
  const supabase = await createClient();
  const supa = supabase as unknown as SupabaseClient<Database>;
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const meta = {
    occasion: input.occasion ?? null,
    personalTouch: input.personalTouch ?? null,
  } as const;

  if (input.id) {
    const { data, error } = await supa
      .from("thank_you_notes")
      .update({
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "draft",
      } satisfies Database["public"]["Tables"]["thank_you_notes"]["Update"])
      .eq("id", input.id)
      .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to save draft");
    return data as unknown as UINote;
  }

  const { data, error } = await supa
    .from("thank_you_notes")
    .insert({
      list_id: input.listId,
      gift_id: input.giftId,
      channel: input.channel,
      relationship: input.relationship,
      tone: input.tone,
      content: input.content,
      meta,
      status: "draft",
    } satisfies Database["public"]["Tables"]["thank_you_notes"]["Insert"])
    .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create draft");
  return data as unknown as UINote;
}

export async function sendThankYouNoteDirect(input: {
  id?: string;
  listId: string;
  giftId: string;
  channel: Channel;
  relationship: Relationship;
  tone: Tone;
  content: string;
  occasion?: string;
  personalTouch?: string;
}): Promise<{ note: UINote; gift: { id: string; thankYouSent: boolean } }> {
  const supabase = await createClient();
  const supa = supabase as unknown as SupabaseClient<Database>;
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const now = new Date().toISOString();
  const meta = {
    occasion: input.occasion ?? null,
    personalTouch: input.personalTouch ?? null,
  } as const;

  let noteRow: UINote | null = null;
  if (input.id) {
    const { data, error } = await supa
      .from("thank_you_notes")
      .update({
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "sent",
        sent_at: now,
      } satisfies Database["public"]["Tables"]["thank_you_notes"]["Update"])
      .eq("id", input.id)
      .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to update note");
    noteRow = data as unknown as UINote;
  } else {
    const { data, error } = await supa
      .from("thank_you_notes")
      .insert({
        list_id: input.listId,
        gift_id: input.giftId,
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "sent",
        sent_at: now,
      } satisfies Database["public"]["Tables"]["thank_you_notes"]["Insert"])
      .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create note");
    noteRow = data as unknown as UINote;
  }

  const { error: giftErr } = await supa
    .from("gifts")
    .update({ thank_you_sent: true, thank_you_sent_at: now } satisfies Database["public"]["Tables"]["gifts"]["Update"])
    .eq("id", input.giftId);
  if (giftErr) throw new Error(giftErr.message);

  return { note: noteRow!, gift: { id: input.giftId, thankYouSent: true } };
}

export async function deleteThankYouNoteDirect(input: { id: string; listId: string }): Promise<{ id: string }>
{
  const supabase = await createClient();
  const supa = supabase as unknown as SupabaseClient<Database>;
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const { error } = await supa.from("thank_you_notes").delete().eq("id", input.id);
  if (error) throw new Error(error.message);
  return { id: input.id };
}
