import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import { ListSelector } from "@/components/ui/list-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UpcomingRemindersCard } from "@/components/UpcomingRemindersCard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string }>;
}) {
  const user = await requireAuth("/dashboard");
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
        <main className="mx-auto w-full px-35 py-10 max-w-none">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="text-4xl font-bold text-[#2d2d2d]">Dashboard</h1>
            <Link href="/giftlist">
              <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
                View Gift List
              </Button>
            </Link>
          </div>
          <ListSelector lists={lists ?? []} currentListId={null} />
          <div className="mt-10 rounded border bg-white p-6 text-[#2d2d2d]">
            Create your first list to see your dashboard insights.
          </div>
        </main>
      </div>
    );
  }

  const [totalRes, thankedRes, nonRegRes, monetaryRes, registryRes, multipleRes, recentRes] =
    await Promise.all([
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("list_id", currentListId),
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("list_id", currentListId).eq("thank_you_sent", true),
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("list_id", currentListId).eq("gift_type", "non registry"),
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("list_id", currentListId).eq("gift_type", "monetary"),
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("list_id", currentListId).eq("gift_type", "registry"),
      supabase.from("gifts").select("id", { count: "exact", head: true }).eq("list_id", currentListId).eq("gift_type", "multiple"),
      supabase.from("gifts").select("id, guest_name, description, thank_you_sent").eq("list_id", currentListId).order("created_at", { ascending: false }).limit(5),
    ]);

  const totalGifts = totalRes.count ?? 0;
  const thankedGifts = thankedRes.count ?? 0;
  const pendingGifts = Math.max(0, totalGifts - thankedGifts);
  const thankYouProgress = totalGifts > 0 ? Math.round((thankedGifts / totalGifts) * 100) : 0;

  const giftsByType = {
    nonRegistry: nonRegRes.count ?? 0,
    monetary: monetaryRes.count ?? 0,
    registry: registryRes.count ?? 0,
    multiple: multipleRes.count ?? 0,
  };

  const recent = (recentRes.data ?? []).map((g) => ({
    id: g.id,
    guestName: g.guest_name,
    description: g.description,
    thankYouSent: g.thank_you_sent,
  }));

  return (
    <div className="min-h-screen bg-[#fefefe] pt-10">
      <main className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 max-w-none">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#2d2d2d]">Dashboard</h1>
            <p className="mt-1 text-sm text-[#2d2d2d]/70">Overview of your gift tracking and thank‑you progress.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/giftlist">
              <Button size="sm" variant="outline">Open Gift List</Button>
            </Link>
          </div>
        </div>

        {/* List selector */}
        <div className="mb-6">
          <ListSelector lists={lists ?? []} currentListId={currentListId} />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Total Gifts</div>
                  <div className="mt-1 text-3xl font-semibold text-[#2d2d2d]">{totalGifts}</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">All time</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Thank‑You Sent</div>
                  <div className="mt-1 text-3xl font-semibold text-[#2d2d2d]">{thankedGifts}</div>
                </div>
                <div className="rounded-xl border border-[#A8E6CF]/60 bg-[#A8E6CF]/20 px-3 py-1 text-xs text-gray-700">Completed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Pending</div>
                  <div className="mt-1 text-3xl font-semibold text-[#2d2d2d]">{pendingGifts}</div>
                </div>
                <div className="rounded-xl border border-amber-300/60 bg-amber-100/40 px-3 py-1 text-xs text-amber-800">Action Needed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Completion</div>
                  <div className="mt-1 text-3xl font-semibold text-[#2d2d2d]">{thankYouProgress}%</div>
                </div>
                <div className="w-24">
                  <Progress value={thankYouProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardContent>
                <h3 className="mb-4 font-semibold text-[#2d2d2d]">Thank‑You Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#2d2d2d]">Overall</span>
                    <span className="text-sm text-[#2d2d2d]">
                      {thankedGifts} of {totalGifts}
                    </span>
                  </div>
                  <Progress value={thankYouProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="mb-4 font-semibold text-[#2d2d2d]">Gifts by Type</h3>
                <div className="space-y-3 text-sm text-[#2d2d2d]">
                  <div className="flex items-center justify-between">
                    <span>Non Registry</span>
                    <Badge variant="outline">{giftsByType.nonRegistry}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monetary</span>
                    <Badge variant="outline">{giftsByType.monetary}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Registry</span>
                    <Badge variant="outline">{giftsByType.registry}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Multiple</span>
                    <Badge variant="outline">{giftsByType.multiple}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardContent className="overflow-x-hidden">
                <h3 className="mb-4 font-semibold text-[#2d2d2d]">Recent Activity</h3>
                <div className="space-y-3">
                  {recent.length === 0 ? (
                    <div className="text-sm text-[#2d2d2d]">No recent gifts yet.</div>
                  ) : (
                    recent.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0 overflow-hidden"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-sm font-medium text-[#2d2d2d] truncate break-words">
                            {g.guestName}
                          </p>
                          <p className="text-xs text-[#2d2d2d] break-words whitespace-normal overflow-hidden [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                            {g.description}
                          </p>
                        </div>
                        <Badge
                          variant={g.thankYouSent ? "outline" : "secondary"}
                          className={
                            g.thankYouSent
                              ? "border-[#A6CFE2] bg-[#A6CFE2]/10 text-[#2d2d2d] shrink-0"
                              : "bg-[#FFC5B2] text-[#2d2d2d] shrink-0"
                          }
                        >
                          {g.thankYouSent ? "Thanked" : "Pending"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <UpcomingRemindersCard listId={currentListId} />
            <div className="flex justify-end">
              <Link href={`/reminders?list=${encodeURIComponent(currentListId)}`}>
                <Button size="sm" variant="outline">Open Reminders</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}