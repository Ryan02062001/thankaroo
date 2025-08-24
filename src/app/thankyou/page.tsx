import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import { ListSelector } from "@/components/ui/list-selector";
import { Button } from "@/components/ui/button";
import {  Sparkles } from "lucide-react";
import ThankYousClient from "./thankyous-client";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string; error?: string }>;
}) {
  const user = await requireAuth("/thankyou");
  const supabase = await createClient();

  const { data: lists, error: listsErr } = await supabase
    .from("gift_lists")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (listsErr) throw new Error(listsErr.message);

  const params = await searchParams;
  const currentListId = params?.list ?? lists?.[0]?.id ?? null;

  if (!currentListId) {
    return (
          <div className="min-h-screen bg-[#fefefe] pt-10">
      <div className="relative py-10 overflow-x-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#A8E6CF] blur-3xl opacity-30" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-pink-200 blur-3xl opacity-30" />
        </div>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 2xl:px-35">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[260px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 ring-1 ring-black/5 px-3 py-1 backdrop-blur">
                  <Sparkles className="h-4 w-4 text-[#2d2d2d]" />
                  <span className="text-xs font-medium text-[#2d2d2d]">AI-guided thank-you writing</span>
                </div>
                <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-br from-[#2d2d2d] to-[#5b5b5b] bg-clip-text text-transparent">Craft beautiful</span>{" "}
                  <span className="bg-gradient-to-br from-[#38b2ac] via-[#A8E6CF] to-[#ef8455] bg-clip-text text-transparent">thank‑yous</span>
                </h1>
                <p className="mt-2 text-gray-600 max-w-xl">
                  Turn your gift list into heartfelt notes in minutes. Organized, fast, and genuinely you.
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link href="/dashboard">
                  <Button size="sm" variant="ghost" className="text-[#2d2d2d]">Dashboard</Button>
                </Link>
                <Link href="/giftlist">
                  <Button size="sm" variant="ghost" className="text-[#2d2d2d]">Gift List</Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-white/70 backdrop-blur p-6 ring-1 ring-black/5">
              <div className="grid gap-6 sm:grid-cols-1">
                <div>
                  <div className="text-sm text-[#2d2d2d] mb-2 font-medium">Active list</div>
                  <ListSelector lists={lists ?? []} currentListId={null} />
                </div>
              </div>
            </div>
          </main>
        </div>
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
    type: g.gift_type as "non registry" | "monetary" | "registry" | "multiple",
    date: g.date_received ?? new Date().toISOString().slice(0, 10),
    thankYouSent: g.thank_you_sent,
  }));

  // Fetch existing thank-you notes for this list
  const { data: notes, error: notesErr } = await supabase
    .from("thank_you_notes")
    .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, updated_at, sent_at")
    .eq("list_id", currentListId)
    .order("created_at", { ascending: false });

  if (notesErr) throw new Error(notesErr.message);

  return (
    <div className="min-h-screen bg-[#fefefe] pt-10">
      <div className="relative py-10 overflow-x-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#A8E6CF] blur-3xl opacity-30" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-pink-200 blur-3xl opacity-30" />
        </div>
        <main className="mx-auto px-4 sm:px-6 lg:px-10 2xl:px-35">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-[260px]">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 ring-1 ring-black/5 px-3 py-1 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#2d2d2d]" />
                <span className="text-xs font-medium text-[#2d2d2d]">AI-guided thank-you writing</span>
              </div>
              <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-br from-[#2d2d2d] to-[#5b5b5b] bg-clip-text text-transparent">Thank Yous</span>
              </h1>
              <p className="mt-2 text-gray-600 max-w-xl">
                Personalize notes, stay organized, and finish with confidence.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/dashboard">
                <Button size="sm" variant="ghost" className="text-[#2d2d2d]">Dashboard</Button>
              </Link>
              <Link href="/giftlist">
                <Button size="sm" variant="ghost" className="text-[#2d2d2d]">Gift List</Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-white/70 backdrop-blur p-6 ring-1 ring-black/5">
            <div className="grid gap-6">
              <div>
                <div className="text-sm text-[#2d2d2d] mb-2 font-medium">Active list</div>
                <ListSelector lists={lists ?? []} currentListId={currentListId} />
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-hidden">
            <ThankYousClient
              listId={currentListId}
              gifts={uiGifts}
              notes={(notes ?? []).map((n) => ({
                ...n,
                meta: typeof n.meta === "object" && n.meta !== null ? (n.meta as Record<string, unknown>) : null,
              }))}
            />
          </div>
        </main>
      </div>
    </div>
  );
}