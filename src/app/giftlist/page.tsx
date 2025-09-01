import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import GiftHubClient, { type ImportGiftItem } from "./gift-hub-client";
import { Button } from "@/components/ui/button";
import { ListSelector } from "@/components/ui/list-selector";
import type { UIGift } from "@/components/giftlist/types";

export default async function GiftListPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string; error?: string }>;
}) {
  const user = await requireAuth("/giftlist");
  const supabase = await createClient();

  const { data: lists, error: listsErr } = await supabase
    .from("gift_lists")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });
  if (listsErr) throw new Error(listsErr.message);

  const params = await searchParams;
  const errorMsg = params?.error ?? "";
  let currentListId = params?.list ?? null;

  // Fallback to cookie (last selected list) if no list param
  if (!currentListId) {
    const cookieHeader = await cookies();
    const cookieVal = cookieHeader.get("thankaroo_last_list_id")?.value ?? null;
    if (cookieVal && (lists ?? []).some((l) => l.id === cookieVal)) {
      currentListId = cookieVal;
    }
  }

  if (!currentListId) currentListId = lists?.[0]?.id ?? null;

  if (!currentListId) {
    return (
      <div className="min-h-screen bg-[#fefefe] pt-10">
        <section aria-labelledby="giftlist-heading" className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 max-w-none">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 id="giftlist-heading" className="text-4xl font-bold text-[#2d2d2d]">Gift Hub</h1>
            <Link href="/giftlist">
              <Button size="sm" variant="outline">Refresh</Button>
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {errorMsg ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorMsg}
              </div>
            ) : null}
            <div className="text-[#2d2d2d]">Create your first list to start adding gifts.</div>
            <div className="mt-4">
              <ListSelector lists={lists ?? []} currentListId={null} />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Gifts
  const { data: gifts, error: giftsErr } = await supabase
    .from("gifts")
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .eq("list_id", currentListId)
    .order("date_received", { ascending: false });
  if (giftsErr) throw new Error(giftsErr.message);

  const uiGifts = (gifts ?? []).map((g) => ({
    id: g.id,
    guestName: g.guest_name as string,
    description: g.description as string,
    type: g.gift_type as "non registry" | "monetary" | "registry" | "multiple",
    date: (g.date_received ?? new Date().toISOString().slice(0, 10)) as string,
    thankYouSent: Boolean(g.thank_you_sent),
  }));

  // Notes (for unified composer + filters)
  const { data: notesRaw, error: notesErr } = await supabase
    .from("thank_you_notes")
    .select(
      "id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at"
    )
    .eq("list_id", currentListId)
    .order("created_at", { ascending: false });
  if (notesErr) throw new Error(notesErr.message);

  const safeNotes = (notesRaw ?? []).map((n) => ({
    ...n,
    meta: typeof n.meta === "object" && n.meta !== null ? (n.meta as Record<string, unknown>) : null,
  }));

  // -------- Server Action: Import gifts (CSV -> rows) and return inserted UI rows --------
  const importGiftsAction = async (items: ImportGiftItem[]): Promise<UIGift[]> => {
    "use server";
    const supabase = await createClient();

    if (!Array.isArray(items) || items.length === 0) return [];

    const rows = items.map((it) => ({
      list_id: currentListId,
      guest_name: it.guestName,
      description: it.description,
      gift_type: it.type,
      date_received: it.date,
      thank_you_sent: it.thankYouSent,
    }));

    const { data, error } = await supabase
      .from("gifts")
      .insert(rows)
      .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
      .order("date_received", { ascending: false });
    if (error) throw new Error(error.message);

    const inserted: UIGift[] = (data ?? []).map((g) => ({
      id: g.id as string,
      guestName: g.guest_name as string,
      description: g.description as string,
      type: g.gift_type as "non registry" | "monetary" | "registry" | "multiple",
      date: (g.date_received ?? new Date().toISOString().slice(0, 10)) as string,
      thankYouSent: Boolean(g.thank_you_sent),
    }));
    return inserted;
  };

  return (
    <div className="min-h-screen bg-fefefe pt-10">
      <section aria-labelledby="giftlist-heading" className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 max-w-none">
        {errorMsg ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMsg}
          </div>
        ) : null}

        <GiftHubClient
          key={currentListId}
          listId={currentListId}
          gifts={uiGifts}
          lists={lists ?? []}
          notes={safeNotes}
          onImportGifts={importGiftsAction}
        />
      </section>
    </div>
  );
}
