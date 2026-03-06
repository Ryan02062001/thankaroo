"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { GiftType, Database } from "@/app/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeYmd, todayYmd } from "@/lib/date";
import { sanitizeGiftFields } from "@/lib/gifts";

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

async function getGiftMeta(
  supabase: Awaited<ReturnType<typeof createClient>>,
  giftId: string
) {
  const { data, error } = await supabase
    .from("gifts")
    .select("list_id, thank_you_sent")
    .eq("id", giftId)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as Pick<GiftsRow, "list_id" | "thank_you_sent">;
  return {
    listId: row.list_id as string,
    thankYouSent: Boolean(row.thank_you_sent),
  };
}

function getThankYouTimestampPatch(currentValue: boolean, nextValue: boolean): Partial<GiftsUpdate> {
  if (currentValue === nextValue) {
    return {};
  }

  return {
    thank_you_sent_at: nextValue ? new Date().toISOString() : null,
  };
}

function revalidateGiftPages() {
  revalidatePath("/giftlist");
  revalidatePath("/reminders");
}

export async function createGift(formData: FormData) {
  const list_id = String(formData.get("list_id") ?? "");
  const {
    guestName,
    description,
    giftType,
    dateReceived,
  } = sanitizeGiftFields({
    guestName: String(formData.get("guest_name") ?? ""),
    description: String(formData.get("description") ?? ""),
    giftType: String(formData.get("gift_type") ?? "non registry"),
    dateReceived: String(formData.get("date_received") ?? ""),
  });
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!list_id || !guestName || !description) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(list_id)}&error=${encodeURIComponent(
        "Guest, description and list are required"
      )}`
    );
  }

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, redirectTo);
  const supa = supabase as unknown as SupabaseClient<Database>;

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

  const { error } = await supa
    .from("gifts")
    .insert([
      {
        list_id,
        guest_name: guestName,
        description,
        gift_type: giftType,
        date_received: dateReceived,
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
  const {
    guestName,
    description,
    giftType,
    dateReceived,
  } = sanitizeGiftFields({
    guestName: String(formData.get("guest_name") ?? ""),
    description: String(formData.get("description") ?? ""),
    giftType: String(formData.get("gift_type") ?? "non registry"),
    dateReceived: String(formData.get("date_received") ?? ""),
  });
  const thank_you_sent = String(formData.get("thank_you_sent") ?? "") === "true";
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing gift id")}`);
  }

  if (!guestName || !description) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Guest and description are required")}`);
  }

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, redirectTo);
  const supa = supabase as unknown as SupabaseClient<Database>;

  const giftMeta = await getGiftMeta(supabase, id);
  if (!giftMeta) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Gift not found")}`);
  }

  const ownsList = await assertListOwnership(supabase, giftMeta!.listId, user.id);
  if (!ownsList) {
    redirect(`${redirectTo}?list=${encodeURIComponent(giftMeta!.listId)}&error=${encodeURIComponent("You do not have permission to modify this gift")}`);
  }

  const { error } = await supa
    .from("gifts")
    .update({
      guest_name: guestName,
      description,
      gift_type: giftType,
      date_received: dateReceived,
      thank_you_sent,
      ...getThankYouTimestampPatch(giftMeta!.thankYouSent, thank_you_sent),
    } satisfies GiftsUpdate)
    .eq("id", id);

  if (error) {
    redirect(
      `${redirectTo}?list=${encodeURIComponent(giftMeta!.listId)}&error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?list=${giftMeta!.listId}`);
}

export async function toggleThankYou(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "/giftlist");

  if (!id) redirect(next);

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, next);
  const supa = supabase as unknown as SupabaseClient<Database>;

  const listId = await getGiftListId(supabase, id);
  if (!listId) redirect(next);

  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) {
    redirect(`${next}?list=${encodeURIComponent(listId)}&error=${encodeURIComponent("You do not have permission to modify this gift")}`);
  }

  const { data: row, error: fetchErr } = await supa
    .from("gifts")
    .select("thank_you_sent")
    .eq("id", id)
    .single();

  if (fetchErr || !row) redirect(`${next}?list=${listId}`);

  const newValue = !(row as Pick<GiftsRow, "thank_you_sent">).thank_you_sent;
  const { error } = await supa
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
  const safeInput = sanitizeGiftFields({
    guestName: input.guestName,
    description: input.description,
    giftType: input.giftType,
    dateReceived: input.dateReceived,
  });

  if (!safeInput.guestName || !safeInput.description) {
    throw new Error("Guest and description are required");
  }

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");
  const supa = supabase as unknown as SupabaseClient<Database>;

  const ownsList = await assertListOwnership(supabase, input.listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot modify this list");

  const { limits } = await getCurrentPlanForUser();
  if (typeof limits.maxGiftsPerList === "number") {
    const { count } = await supa
      .from("gifts")
      .select("id", { count: "exact", head: true })
      .eq("list_id", input.listId);
    if ((count ?? 0) >= limits.maxGiftsPerList) {
      throw new Error(
        "Gift limit reached for this list on your plan. Upgrade on the Pricing page to add more."
      );
    }
  }

  const { data, error } = await supa
    .from("gifts")
    .insert([
      {
        list_id: input.listId,
        guest_name: safeInput.guestName,
        description: safeInput.description,
        gift_type: safeInput.giftType,
        date_received: safeInput.dateReceived,
      } satisfies GiftsInsert,
    ])
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create gift");

  revalidateGiftPages();

  const row = data as Pick<GiftsRow, "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent">;
  return {
    id: row.id as string,
    guestName: row.guest_name as string,
    description: row.description as string,
    type: row.gift_type as GiftType,
    date: normalizeYmd(row.date_received, todayYmd()),
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
  const safeInput = sanitizeGiftFields({
    guestName: input.guestName,
    description: input.description,
    giftType: input.giftType,
    dateReceived: input.dateReceived,
    thankYouSent: input.thankYouSent,
  });

  if (!safeInput.guestName || !safeInput.description) {
    throw new Error("Guest and description are required");
  }

  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");
  const supa = supabase as unknown as SupabaseClient<Database>;

  const giftMeta = await getGiftMeta(supabase, input.id);
  if (!giftMeta) throw new Error("Gift not found");
  const ownsList = await assertListOwnership(supabase, giftMeta.listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot modify this gift");

  const { data, error } = await supa
    .from("gifts")
    .update({
      guest_name: safeInput.guestName,
      description: safeInput.description,
      gift_type: safeInput.giftType,
      date_received: safeInput.dateReceived,
      ...(typeof input.thankYouSent === "boolean"
        ? {
            thank_you_sent: safeInput.thankYouSent,
            ...getThankYouTimestampPatch(giftMeta.thankYouSent, safeInput.thankYouSent),
          }
        : {}),
    } satisfies GiftsUpdate)
    .eq("id", input.id)
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update gift");

  revalidateGiftPages();

  const row2 = data as Pick<GiftsRow, "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent">;
  return {
    id: row2.id as string,
    guestName: row2.guest_name as string,
    description: row2.description as string,
    type: row2.gift_type as GiftType,
    date: normalizeYmd(row2.date_received, todayYmd()),
    thankYouSent: Boolean(row2.thank_you_sent),
  };
}

export async function toggleThankYouDirect(input: { id: string }): Promise<{ id: string; thankYouSent: boolean }>
{
  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");
  const supa = supabase as unknown as SupabaseClient<Database>;

  const listId = await getGiftListId(supabase, input.id);
  if (!listId) throw new Error("Gift not found");
  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot modify this gift");

  const { data: row3, error: fetchErr } = await supa
    .from("gifts")
    .select("thank_you_sent")
    .eq("id", input.id)
    .single();
  if (fetchErr || !row3) throw new Error(fetchErr?.message ?? "Gift not found");

  const newValue = !(row3 as Pick<GiftsRow, "thank_you_sent">).thank_you_sent;
  const { error } = await supa
    .from("gifts")
    .update({
      thank_you_sent: newValue,
      thank_you_sent_at: newValue ? new Date().toISOString() : null,
    } satisfies GiftsUpdate)
    .eq("id", input.id);
  if (error) throw new Error(error.message);

  revalidateGiftPages();

  return { id: input.id, thankYouSent: newValue };
}

export async function deleteGiftDirect(input: { id: string }): Promise<{ id: string }> {
  const supabase = await createClient();
  const user = await requireUserOrRedirect(supabase, "/giftlist");
  const supa = supabase as unknown as SupabaseClient<Database>;

  const listId = await getGiftListId(supabase, input.id);
  if (!listId) throw new Error("Gift not found");
  const ownsList = await assertListOwnership(supabase, listId, user.id);
  if (!ownsList) throw new Error("Forbidden: cannot delete this gift");

  const { error } = await supa.from("gifts").delete().eq("id", input.id);
  if (error) throw new Error(error.message);

  revalidateGiftPages();
  return { id: input.id };
}
