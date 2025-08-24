import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import GiftListClient from "./giftlist-client";
import { Button } from "@/components/ui/button";
import { ListSelector } from "@/components/ui/list-selector";

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
  const currentListId = params?.list ?? lists?.[0]?.id ?? null;

  if (!currentListId) {
    return (
      <div className="min-h-screen bg-[#fefefe] pt-20">
        <main className=" w-full px-20 py-10 mx-auto">
          <div className="mb-5 flex items-center space-x-7">
            <h1 className="text-4xl font-bold text-[#2d2d2d]">Gift List</h1>
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
                View Dashboard
              </Button>
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
        </main>
      </div>
    );
  }

  const { data: gifts, error: giftsErr } = await supabase
    .from("gifts")
    .select("id, guest_name, description, gift_type, date_received, thank_you_sent")
    .eq("list_id", currentListId)
    .order("date_received", { ascending: false });

  if (giftsErr) throw new Error(giftsErr.message);

  const uiGifts = (gifts ?? []).map((g) => ({
    id: g.id,
    guestName: g.guest_name,
    description: g.description,
    type: g.gift_type,
    date: g.date_received ?? new Date().toISOString().slice(0, 10),
    thankYouSent: g.thank_you_sent,
  }));

  return (
    <div className="min-h-screen bg-[#fefefe] pt-10">
      <main className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10">
        {errorMsg ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMsg}
          </div>
        ) : null}
        <GiftListClient listId={currentListId} gifts={uiGifts} lists={lists ?? []} />
      </main>
    </div>
  );
}