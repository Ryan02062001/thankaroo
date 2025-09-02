"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { GiftType, Database } from "@/app/types/database";

type GiftsRow = Database["public"]["Tables"]["gifts"]["Row"];
type GiftsInsert = Database["public"]["Tables"]["gifts"]["Insert"];
type GiftsUpdate = Database["public"]["Tables"]["gifts"]["Update"];
import { getCurrentPlanForUser } from "@/lib/plans";

async function requireUserOrRedirect(supabase: Awaited<ReturnType<typeof createClient>>, nextUrl: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/signin?next=${encodeURIComponent(nextUrl)}`);
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

  if (error || !data) {
    return false;
  }
  return true;
}

async function getGiftListId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  giftId: string
) {
  const { data, error } = await supabase
    .from("gifts")
    .select("list_id")
    .eq("id", giftId)
    .single();
  if (error || !data) return null;
  return (data as Pick<GiftsRow, "list_id">).list_id as string;
}

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
  const user = await requireUserOrRedirect(supabase, redirectTo);

  const ownsList = await assertListOwnership(supabase, list_id, user.id);
  if (!ownsList) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(list_id)}&error=${encodeURIComponent(
        "You do not have permission to modify this list"
      )}`
    );
  }

  // Enforce plan limit: gifts per list (applies to Free; Wedding/Pro unlimited)
  const { limits } = await getCurrentPlanForUser();
  if (typeof limits.maxGiftsPerList === "number") {
    const { count } = await supabase
      .from("gifts")
      .select("id", { count: "exact", head: true })
      .eq("list_id", list_id);
    if ((count ?? 0) >= limits.maxGiftsPerList) {
      redirect(
        `${redirectTo}?list=${encodeURIComponent(list_id)}&error=${encodeURIComponent(
          "Gift limit reached for this list on your plan. Upgrade on the Pricing page to add more."
        )}`
      );
    }
  }

  const { error } = await supabase
    .from("gifts")
    .insert([
      {
        list_id,
        guest_name,
        description,
        gift_type,
        date_received: date_received || undefined,
      } satisfies GiftsInsert,
    ]);

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
  const guest_name = String(formData.get("guest_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const gift_type = (String(formData.get("gift_type") ?? "non registry") as GiftType);
  const date_received = String(formData.get("date_received") ?? "");
  const thank_you_sent = String(formData.get("thank_you_sent") ?? "") === "true";
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing gift id")}`);
  }

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, redirectTo);

  const listId = await getGiftListId(supabase, id);
  if (!listId) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Gift not found")}`);
  }

  const ownsList = await assertListOwnership(supabase, listId!, user.id);
  if (!ownsList) {
    redirect(`${redirectTo}?list=${encodeURIComponent(listId!)}&error=${encodeURIComponent("You do not have permission to modify this gift")}`);
  }

  const { error } = await supabase
    .from("gifts")
    .update({
      guest_name,
      description,
      gift_type,
      date_received: date_received || undefined,
      thank_you_sent,
      thank_you_sent_at: thank_you_sent ? new Date().toISOString() : null,
    } satisfies GiftsUpdate)
    .eq("id", id);

  if (error) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(listId!)}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?list=${listId!}`);
}

export async function toggleThankYou(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "/giftlist");

  if (!id) redirect(next);

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, next);

  const listId = await getGiftListId(supabase, id);
  if (!listId) redirect(next);

  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) {
    redirect(`${next}?list=${encodeURIComponent(listId)}&error=${encodeURIComponent("You do not have permission to modify this gift")}`);
  }

  const { data: row, error: fetchErr } = await supabase
    .from("gifts")
    .select("thank_you_sent")
    .eq("id", id)
    .single();

  if (fetchErr || !row) redirect(`${next}?list=${listId}`);

  const newValue = !(row as Pick<GiftsRow, "thank_you_sent">).thank_you_sent;
  const { error } = await supabase
    .from("gifts")
    .update({
      thank_you_sent: newValue,
      thank_you_sent_at: newValue ? new Date().toISOString() : null,
    } satisfies GiftsUpdate)
    .eq("id", id);

  if (error) {
    redirect(`${next}?list=${listId}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(next);
  redirect(`${next}?list=${listId}`);
}

export async function deleteGift(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "/giftlist");

  if (!id) {
    redirect(next);
  }

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, next);

  const listId = await getGiftListId(supabase, id);
  if (!listId) redirect(next);

  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) {
    redirect(`${next}?list=${encodeURIComponent(listId)}&error=${encodeURIComponent("You do not have permission to delete this gift")}`);
  }

  const { error } = await supabase.from("gifts").delete().eq("id", id);
  if (error) {
    redirect(`${next}?list=${listId}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(next);
  redirect(`${next}?list=${listId}`);
}

// ---------------- New programmatic server actions (no redirects/refresh) ----------------

export type UIGift = {
  id: string;
  guestName: string;
  description: string;
  type: GiftType;
  date: string; // YYYY-MM-DD
  thankYouSent: boolean;
};

export async function createGiftDirect(input: {
  listId: string;
  guestName: string;
  description: string;
  giftType: GiftType;
  dateReceived?: string | null;
}): Promise<UIGift> {
  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");

  const ownsList = await assertListOwnership(supabase, input.listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot modify this list");

  const { limits } = await getCurrentPlanForUser();
  if (typeof limits.maxGiftsPerList === "number") {
    const { count } = await supabase
      .from("gifts")
      .select("id", { count: "exact", head: true })
      .eq("list_id", input.listId);
    if ((count ?? 0) >= limits.maxGiftsPerList) {
      throw new Error(
        "Gift limit reached for this list on your plan. Upgrade on the Pricing page to add more."
      );
    }
  }

  const { data, error } = await supabase
    .from("gifts")
    .insert([
      {
        list_id: input.listId,
        guest_name: input.guestName,
        description: input.description,
        gift_type: input.giftType,
        date_received: input.dateReceived || undefined,
      } satisfies GiftsInsert,
    ])
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create gift");

  const row = data as Pick<GiftsRow, "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent">;
  return {
    id: row.id as string,
    guestName: row.guest_name as string,
    description: row.description as string,
    type: row.gift_type as GiftType,
    date: (row.date_received ?? new Date().toISOString().slice(0, 10)) as string,
    thankYouSent: Boolean(row.thank_you_sent),
  };
}

export async function updateGiftDirect(input: {
  id: string;
  guestName: string;
  description: string;
  giftType: GiftType;
  dateReceived?: string | null;
  thankYouSent?: boolean;
}): Promise<UIGift> {
  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");

  const listId = await getGiftListId(supabase, input.id);
  if (!listId) throw new Error("Gift not found");
  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot modify this gift");

  const { data, error } = await supabase
    .from("gifts")
    .update({
      guest_name: input.guestName,
      description: input.description,
      gift_type: input.giftType,
      date_received: input.dateReceived || undefined,
      ...(typeof input.thankYouSent === "boolean"
        ? {
            thank_you_sent: input.thankYouSent,
            thank_you_sent_at: input.thankYouSent ? new Date().toISOString() : null,
          }
        : {}),
    } satisfies GiftsUpdate)
    .eq("id", input.id)
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update gift");

  const row2 = data as Pick<GiftsRow, "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent">;
  return {
    id: row2.id as string,
    guestName: row2.guest_name as string,
    description: row2.description as string,
    type: row2.gift_type as GiftType,
    date: (row2.date_received ?? new Date().toISOString().slice(0, 10)) as string,
    thankYouSent: Boolean(row2.thank_you_sent),
  };
}

export async function toggleThankYouDirect(input: { id: string }): Promise<{ id: string; thankYouSent: boolean }>
{
  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");

  const listId = await getGiftListId(supabase, input.id);
  if (!listId) throw new Error("Gift not found");
  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot modify this gift");

  const { data: row3, error: fetchErr } = await supabase
    .from("gifts")
    .select("thank_you_sent")
    .eq("id", input.id)
    .single();
  if (fetchErr || !row3) throw new Error(fetchErr?.message ?? "Gift not found");

  const newValue = !(row3 as Pick<GiftsRow, "thank_you_sent">).thank_you_sent;
  const { error } = await supabase
    .from("gifts")
    .update({
      thank_you_sent: newValue,
      thank_you_sent_at: newValue ? new Date().toISOString() : null,
    } satisfies GiftsUpdate)
    .eq("id", input.id);
  if (error) throw new Error(error.message);

  return { id: input.id, thankYouSent: newValue };
}

export async function deleteGiftDirect(input: { id: string }): Promise<{ id: string }> {
  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");

  const listId = await getGiftListId(supabase, input.id);
  if (!listId) throw new Error("Gift not found");
  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot delete this gift");

  const { error } = await supabase.from("gifts").delete().eq("id", input.id);
  if (error) throw new Error(error.message);
  return { id: input.id };
}