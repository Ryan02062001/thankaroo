"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { GiftType } from "@/app/types/database";

export async function createGift(formData: FormData) {
  const list_id = String(formData.get("list_id") ?? "");
  const guest_name = String(formData.get("guest_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const gift_type = (String(formData.get("gift_type") ?? "non registry") as GiftType);
  const date_received = String(formData.get("date_received") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!list_id || !guest_name || !description) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(list_id)}&error=${encodeURIComponent(
        "Guest, description and list are required"
      )}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("gifts").insert({
    list_id,
    guest_name,
    description,
    gift_type,
    date_received: date_received || undefined,
  });

  if (error) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(list_id)}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?list=${list_id}`);
}

export async function updateGift(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const list_id = String(formData.get("list_id") ?? "");
  const guest_name = String(formData.get("guest_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const gift_type = (String(formData.get("gift_type") ?? "non registry") as GiftType);
  const date_received = String(formData.get("date_received") ?? "");
  const thank_you_sent = String(formData.get("thank_you_sent") ?? "") === "true";
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!id || !list_id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing ids")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gifts")
    .update({
      guest_name,
      description,
      gift_type,
      date_received: date_received || undefined,
      thank_you_sent,
      thank_you_sent_at: thank_you_sent ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(list_id)}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?list=${list_id}`);
}

export async function toggleThankYou(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const list_id = String(formData.get("list_id") ?? "");
  const next = String(formData.get("next") ?? "/giftlist");

  if (!id || !list_id) redirect(next);

  const supabase = await createClient();

  const { data: row, error: fetchErr } = await supabase
    .from("gifts")
    .select("thank_you_sent")
    .eq("id", id)
    .single();

  if (fetchErr || !row) redirect(`${next}?list=${list_id}`);

  const newValue = !row.thank_you_sent;
  const { error } = await supabase
    .from("gifts")
    .update({
      thank_you_sent: newValue,
      thank_you_sent_at: newValue ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    redirect(`${next}?list=${list_id}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(next);
  redirect(`${next}?list=${list_id}`);
}

export async function deleteGift(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const list_id = String(formData.get("list_id") ?? "");
  const next = String(formData.get("next") ?? "/giftlist");

  if (!id || !list_id) {
    redirect(next);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("gifts").delete().eq("id", id);
  if (error) {
    redirect(`${next}?list=${list_id}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(next);
  redirect(`${next}?list=${list_id}`);
}
