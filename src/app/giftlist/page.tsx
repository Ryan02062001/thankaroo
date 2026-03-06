import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
// import { requireAuth } from "@/lib/auth";
import GiftHubClient, { type ImportGiftItem } from "./gift-hub-client";
import type { UIGift } from "@/components/giftlist/types";
import type { Database } from "@/app/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeYmd, todayYmd } from "@/lib/date";
import { buildGiftSignature, dedupeImportGiftItems } from "@/lib/gifts";

function mapGiftRowToUi(
  gift: Pick<
    Database["public"]["Tables"]["gifts"]["Row"],
    "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent"
  >
): UIGift {
  return {
    id: gift.id as string,
    guestName: gift.guest_name as string,
    description: gift.description as string,
    type: gift.gift_type as UIGift["type"],
    date: normalizeYmd(gift.date_received, todayYmd()),
    thankYouSent: Boolean(gift.thank_you_sent),
  };
}

export default async function GiftListPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user ?? null;

  // ---------- GUEST BRANCH (no DB) ----------
  if (!user) {
    async function importGiftsGuest(items: ImportGiftItem[]): Promise<UIGift[]> {
      "use server";
      const uid = () => Math.random().toString(36).slice(2);
      return dedupeImportGiftItems(items).map((it) => ({
        id: uid(),
        guestName: it.guestName,
        description: it.description,
        type: it.type,
        date: it.date,
        thankYouSent: !!it.thankYouSent,
      }));
    }

    return (
      <div className="min-h-screen bg-[#fefefe] pt-10">
        <section className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 max-w-none">
          <GiftHubClient
            key="guest"
            guestMode
            listId="guest-list-1"
            gifts={[]}
            lists={[{ id: "guest-list-1", name: "List 1" }]}
            notes={[]}
            onImportGifts={importGiftsGuest}
          />
        </section>
      </div>
    );
  }

  const { data: listsData, error: listsErr } = await supabase
    .from("gift_lists")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });
  if (listsErr) throw new Error(listsErr.message);
  let lists: Pick<Database["public"]["Tables"]["gift_lists"]["Row"], "id" | "name">[] | null =
    (listsData as Pick<Database["public"]["Tables"]["gift_lists"]["Row"], "id" | "name">[] | null);

  // Brand-new account: create "List 1" automatically
  if (!lists || lists.length === 0) {
    const supaMain = supabase as unknown as SupabaseClient<Database>;
    const { data: created, error: createErr } = await supaMain
      .from("gift_lists")
      .insert({ name: "List 1", owner_id: user.id } as Database["public"]["Tables"]["gift_lists"]["Insert"])
      .select("id, name")
      .single();
    if (createErr) throw new Error(createErr.message);
    lists = [created as Pick<Database["public"]["Tables"]["gift_lists"]["Row"], "id" | "name">];
  }

  const params = await searchParams;
  const errorMsg = params?.error ?? "";
  let currentListId = params?.list ?? null;

  // Fallback to cookie (last selected list) if no list param
  if (!currentListId) {
    const cookieHeader = await cookies();
    const cookieVal = cookieHeader.get("thankaroo_last_list_id")?.value ?? null;
    if (
      cookieVal &&
      ((lists ?? []) as Pick<Database["public"]["Tables"]["gift_lists"]["Row"], "id">[]).some((l) => l.id === cookieVal)
    ) {
      currentListId = cookieVal;
    }
  }

  const availableListIds = new Set((lists ?? []).map((list) => list.id));
  if (!currentListId || !availableListIds.has(currentListId)) {
    currentListId =
      (lists as Database["public"]["Tables"]["gift_lists"]["Row"][] | null)?.[0]?.id ?? null;
  }

  // After auto-create above, we should always have at least one list

  // Gifts
  const { data: gifts, error: giftsErr } = await supabase
    .from("gifts")
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .eq("list_id", currentListId as string)
    .order("date_received", { ascending: false });
  if (giftsErr) throw new Error(giftsErr.message);

  const uiGifts: UIGift[] = (
    (gifts ?? []) as Pick<
      Database["public"]["Tables"]["gifts"]["Row"],
      "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent"
    >[]
  ).map(mapGiftRowToUi);

  // Notes (for unified composer + filters)
  const { data: notesRaw, error: notesErr } = await supabase
    .from("thank_you_notes")
    .select(
      "id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at"
    )
    .eq("list_id", currentListId as string)
    .order("created_at", { ascending: false });
  if (notesErr) throw new Error(notesErr.message);

  const safeNotes = ((notesRaw ?? []) as Database["public"]["Tables"]["thank_you_notes"]["Row"][]).map((n) => ({
    ...n,
    meta: typeof n.meta === "object" && n.meta !== null ? (n.meta as Record<string, unknown>) : null,
  }));

  // -------- Server Action: Import gifts (CSV -> rows) and return inserted UI rows --------
  const importGiftsAction = async (items: ImportGiftItem[]): Promise<UIGift[]> => {
    "use server";
    const supabase = await createClient();
    const supa = supabase as unknown as SupabaseClient<Database>;
    const normalizedItems = dedupeImportGiftItems(items);

    if (!normalizedItems.length) return [];

    // Safety: ensure target list id exists and belongs to user
    let targetListId = currentListId as string | null;
    if (!targetListId) {
      const { data: auth } = await supa.auth.getUser();
      const userId = auth?.user?.id || null;
      if (!userId) return [];
      const { data: listsCheck } = await supa
        .from("gift_lists")
        .select("id")
        .eq("owner_id", userId);
      if (!listsCheck || listsCheck.length === 0) {
        const { data: created, error: createErr } = await supa
          .from("gift_lists")
          .insert({ name: "List 1", owner_id: userId } as Database["public"]["Tables"]["gift_lists"]["Insert"])
          .select("id")
          .single();
        if (createErr || !created) return [];
        targetListId = created.id as string;
      } else {
        targetListId = listsCheck[0].id as string;
      }
    }

    // Fetch existing gifts in target list for dedupe
    const { data: existing } = await supa
      .from("gifts")
      .select("guest_name, description, gift_type, date_received")
      .eq("list_id", targetListId);

    const existingSet = new Set<string>(
      (existing ?? []).map((gift) =>
        buildGiftSignature({
          guestName: gift.guest_name ?? "",
          description: gift.description ?? "",
          type: gift.gift_type,
          date: normalizeYmd(gift.date_received, todayYmd()),
        })
      )
    );

    const rows = normalizedItems.map((it) => ({
      list_id: targetListId as string,
      guest_name: it.guestName,
      description: it.description,
      gift_type: it.type,
      date_received: it.date,
      thank_you_sent: it.thankYouSent,
    })) as Database["public"]["Tables"]["gifts"]["Insert"][];

    const batchSeen = new Set<string>();
    const uniqueRows = rows.filter((row) => {
      const signature = buildGiftSignature({
        guestName: row.guest_name ?? "",
        description: row.description ?? "",
        type: row.gift_type!,
        date: row.date_received ?? todayYmd(),
      });

      if (existingSet.has(signature) || batchSeen.has(signature)) {
        return false;
      }

      batchSeen.add(signature);
      return true;
    });

    if (uniqueRows.length === 0) return [];

    const { data, error } = await supa
      .from("gifts")
      .insert(uniqueRows)
      .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
      .order("date_received", { ascending: false });
    if (error) throw new Error(error.message);

    const inserted: UIGift[] = (
      (data ?? []) as Pick<
        Database["public"]["Tables"]["gifts"]["Row"],
        "id" | "guest_name" | "description" | "gift_type" | "date_received" | "thank_you_sent"
      >[]
    ).map(mapGiftRowToUi);
    return inserted;
  };

  return (
    <div className="min-h-screen bg-[#fefefe] pt-10">
      <section aria-labelledby="giftlist-heading" className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 max-w-none">
        {errorMsg ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMsg}
          </div>
        ) : null}

        <GiftHubClient
          key={currentListId as string}
          listId={currentListId as string}
          gifts={uiGifts}
          lists={lists ?? []}
          notes={safeNotes}
          onImportGifts={importGiftsAction}
        />
      </section>
    </div>
  );
}
