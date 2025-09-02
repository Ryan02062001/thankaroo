import Link from "next/link";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import RemindersClient from "@/app/reminders/reminders-client";
import { Button } from "@/components/ui/button";
import type { Database } from "@/app/types/database";

export default async function RemindersPage({
  searchParams,
}: {
  searchParams?: Promise<{ list?: string; view?: string }>;
}) {
  const user = await requireAuth("/reminders");
  const supabase = await createClient();

  const { data: lists, error: listsErr } = await supabase
    .from("gift_lists")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (listsErr) throw new Error(listsErr.message);

  const params = await searchParams;
  let currentListId = params?.list ?? null;

  // Fallback to cookie (last selected list) if no list param
  if (!currentListId) {
    const cookieHeader = await cookies();
    const cookieVal = cookieHeader.get("thankaroo_last_list_id")?.value ?? null;
    if (cookieVal && (lists ?? []).some((l) => l.id === cookieVal)) {
      currentListId = cookieVal;
    }
  }

  if (!currentListId) currentListId = (lists as Database["public"]["Tables"]["gift_lists"]["Row"][] | null)?.[0]?.id ?? null;

  if (!currentListId) {
    return (
      <div className="min-h-screen bg-[#fefefe] pt-10">
        <section aria-labelledby="reminders-heading" className=" w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 mx-auto">
          <div className="mb-5 flex items-center space-x-7">
            <h1 id="reminders-heading" className="text-4xl font-bold text-[#2d2d2d]">Reminders</h1>
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-[#2d2d2d]">
                View Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-10 rounded border bg-white p-6 text-[#2d2d2d]">
            Create your first list to start scheduling reminders.
          </div>
        </section>
      </div>
    );
  }

  // The client loads reminders via ReminderContext (hydrates from Supabase and persists locally)
  return (
    <div className="min-h-screen bg-[#fefefe] pt-10">
      <section aria-labelledby="reminders-heading" className="mx-auto w-full px-4 sm:px-6 lg:px-10 2xl:px-35 py-10 max-w-none">
        <RemindersClient listId={currentListId} lists={lists ?? []} />
      </section>
    </div>
  );
}


