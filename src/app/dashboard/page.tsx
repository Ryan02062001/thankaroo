import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { requireAuth } from "@/lib/auth";
import { ListSelector } from "@/components/ui/list-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string }>;
}) {
  // Use the centralized auth utility
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
      <div className="min-h-screen bg-[#fefefe] pt-20">
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-5 flex items-center space-x-7">
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
    <div className="min-h-screen bg-[#fefefe] pt-20">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex items-center space-x-7">
          <h1 className="text-4xl font-bold text-[#2d2d2d]">Dashboard</h1>
          <Link href="/giftlist">
            <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
              View Gift List
            </Button>
          </Link>
        </div>

        <ListSelector lists={lists ?? []} currentListId={currentListId} />

        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent><div className="text-center"><div className="text-2xl font-bold text-[#2d2d2d]">{totalGifts}</div><p className="text-xs text-[#2d2d2d]">Total Gifts</p></div></CardContent></Card>
          <Card><CardContent><div className="text-center"><div className="text-2xl font-bold text-[#2d2d2d]">{thankedGifts}</div><p className="text-xs text-[#2d2d2d]">Thank You Notes Sent</p></div></CardContent></Card>
          <Card><CardContent><div className="text-center"><div className="text-2xl font-bold text-[#2d2d2d]">{Math.max(0, totalGifts - thankedGifts)}</div><p className="text-xs text-[#2d2d2d]">Thank You Notes Pending</p></div></CardContent></Card>
          <Card><CardContent><div className="text-center"><div className="text-2xl font-bold text-[#2d2d2d]">{thankYouProgress}%</div><p className="text-xs text-[#2d2d2d]">Completion Rate</p></div></CardContent></Card>
        </div>

        <Card className="mb-6">
          <CardContent>
            <h3 className="mb-4 font-semibold text-[#2d2d2d]">Thank You Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#2d2d2d]">Overall Progress</span>
                <span className="text-sm text-[#2d2d2d]">{thankedGifts} of {totalGifts}</span>
              </div>
              <Progress value={thankYouProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent>
              <h3 className="mb-4 font-semibold text-[#2d2d2d]">Gifts by Type</h3>
              <div className="space-y-2 text-sm text-[#2d2d2d]">
                <div className="flex items-center justify-between"><span>Non Registry</span><Badge variant="outline">{giftsByType.nonRegistry}</Badge></div>
                <div className="flex items-center justify-between"><span>Monetary</span><Badge variant="outline">{giftsByType.monetary}</Badge></div>
                <div className="flex items-center justify-between"><span>Registry</span><Badge variant="outline">{giftsByType.registry}</Badge></div>
                <div className="flex items-center justify-between"><span>Multiple</span><Badge variant="outline">{giftsByType.multiple}</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-4 font-semibold text-[#2d2d2d]">Recent Activity</h3>
              <div className="space-y-3">
                {recent.length === 0 ? (
                  <div className="text-sm text-[#2d2d2d]">No recent gifts yet.</div>
                ) : recent.map((g) => (
                  <div key={g.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#2d2d2d]">{g.guestName}</p>
                      <p className="text-xs text-[#2d2d2d]">{g.description}</p>
                    </div>
                    <Badge
                      variant={g.thankYouSent ? "outline" : "secondary"}
                      className={
                        g.thankYouSent
                          ? "border-[#A6CFE2] bg-[#A6CFE2]/10 text-[#2d2d2d]"
                          : "bg-[#FFC5B2] text-[#2d2d2d]"
                      }
                    >
                      {g.thankYouSent ? "Thanked" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
