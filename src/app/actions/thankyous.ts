"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

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
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const meta = {
    occasion: input.occasion ?? null,
    personalTouch: input.personalTouch ?? null,
  } as const;

  if (input.id) {
    const { data, error } = await supabase
      .from("thank_you_notes")
      .update({
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "draft",
      })
      .eq("id", input.id)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to save draft");
    revalidatePath(`/thankyou?list=${input.listId}`);
    return { id: data.id };
  }

  const { data, error } = await supabase
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
    })
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
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const now = new Date().toISOString();
  const meta = {
    occasion: input.occasion ?? null,
    personalTouch: input.personalTouch ?? null,
  } as const;

  let noteId = input.id ?? null;

  if (noteId) {
    const { error } = await supabase
      .from("thank_you_notes")
      .update({
        channel: input.channel,
        relationship: input.relationship,
        tone: input.tone,
        content: input.content,
        meta,
        status: "sent",
        sent_at: now,
      })
      .eq("id", noteId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
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
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create note");
    noteId = data.id;
  }

  // Mark gift as thanked
  const { error: giftErr } = await supabase
    .from("gifts")
    .update({ thank_you_sent: true, thank_you_sent_at: now })
    .eq("id", input.giftId);
  if (giftErr) throw new Error(giftErr.message);

  revalidatePath(`/thankyou?list=${input.listId}`);
  return { id: noteId };
}

export async function deleteThankYouNote(input: { id: string; listId: string }) {
  const supabase = await createClient();
  const user = await requireUserOrThrow(supabase);
  await assertListOwnership(supabase, input.listId, user.id);

  const { error } = await supabase.from("thank_you_notes").delete().eq("id", input.id);
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


