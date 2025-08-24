import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListSelector } from "@/components/ui/list-selector";
import Link from "next/link";
import { Mail, MessageSquare, Scroll, Trash2 } from "lucide-react";
import { deleteThankYouNoteAction } from "@/app/actions/thankyous";
import { NotesFilters } from "./NotesFilters";

export const dynamic = "force-dynamic";

export default async function ThankYouNotesPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string; q?: string; status?: string; channel?: string }>;
}) {
  const user = await requireAuth("/thankyou/notes");
  const supabase = await createClient();

  const { data: lists } = await supabase
    .from("gift_lists")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const params = await searchParams;
  const currentListId = params?.list ?? lists?.[0]?.id ?? null;
  const query = (params?.q ?? "").trim();
  const status = (params?.status ?? "all") as "all" | "draft" | "sent";
  const channel = (params?.channel ?? "all") as "all" | "email" | "text" | "card";

  if (!currentListId) {
    return (
      <div className="min-h-screen bg-[#fefefe] pt-10">
        <div className="relative py-10 overflow-x-hidden">
          <main className="mx-auto px-35">
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 ring-1 ring-black/5">
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

  let notesQuery = supabase
    .from("thank_you_notes")
    .select("id, gift_id, channel, relationship, tone, status, content, meta, created_at, sent_at")
    .eq("list_id", currentListId)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    notesQuery = notesQuery.eq("status", status);
  }
  if (channel !== "all") {
    notesQuery = notesQuery.eq("channel", channel);
  }
  const { data: notes } = await notesQuery;

  const { data: gifts } = await supabase
    .from("gifts")
    .select("id, guest_name, description, date_received")
    .eq("list_id", currentListId);

  const giftById = new Map((gifts ?? []).map((g) => [g.id, g] as const));

  const filteredNotes = (notes ?? []).filter((n) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const g = giftById.get(n.gift_id);
    const name = (g?.guest_name ?? "").toLowerCase();
    const content = (n.content ?? "").toLowerCase();
    return name.includes(q) || content.includes(q);
  });

  const ChannelIcon = ({ c }: { c: string }) => (c === "email" ? <Mail className="h-4 w-4" /> : c === "text" ? <MessageSquare className="h-4 w-4" /> : <Scroll className="h-4 w-4" />);

  return (
    <div className="min-h-screen bg-[#fefefe] pt-10">
      <div className="relative py-10 overflow-x-hidden">
        <main className="mx-auto px-4 sm:px-6 lg:px-10 2xl:px-35">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2d2d2d]">All Notes</h1>
              <p className="text-gray-600">View drafts and sent thank-you notes.</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/thankyou?list=${currentListId}`}>
                <Button variant="outline">Back to composer</Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-white/70 backdrop-blur p-4 sm:p-6 ring-1 ring-black/5">
            <div className="grid gap-6">
              <div>
                <div className="text-sm text-[#2d2d2d] mb-2 font-medium">Active list</div>
                <ListSelector lists={lists ?? []} currentListId={currentListId} />
              </div>

            <NotesFilters listId={currentListId} initialQuery={query} initialStatus={status} initialChannel={channel} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(filteredNotes ?? []).map((n) => {
                const g = giftById.get(n.gift_id);
                return (
                  <Card key={n.id} className="bg-white/80 border border-gray-200/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="truncate max-w-[70%] text-[#2d2d2d]">{g?.guest_name ?? "Unknown"}</span>
                        <span className={`text-xs rounded-full px-2 py-0.5 ${n.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{n.status}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <ChannelIcon c={n.channel} />
                        <span className="capitalize">{n.channel}</span>
                        <span>•</span>
                        <span>{new Date(n.sent_at ?? n.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-[#2d2d2d] whitespace-pre-wrap break-words break-all line-clamp-6 min-h-[6lh]">
                        {n.content}
                      </div>
                      <div className="flex items-center justify-between">
                        <Link href={`/thankyou?list=${currentListId}`} className="text-xs underline text-gray-600">Open in composer</Link>
                        <form action={deleteThankYouNoteAction}>
                          <input type="hidden" name="note_id" value={n.id} />
                          <input type="hidden" name="list_id" value={currentListId} />
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}


