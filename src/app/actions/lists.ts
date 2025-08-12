"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createList(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!name) {
    redirect(`${redirectTo}?error=${encodeURIComponent("List name is required")}`);
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/signin?next=${encodeURIComponent(redirectTo)}`);

  const { data, error } = await supabase
    .from("gift_lists")
    .insert({ name, owner_id: auth.user.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error?.message ?? "Failed to create list")}`);
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?list=${data.id}`);
}

export async function renameList(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!id || !name) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing id or name")}`);
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/signin');
  
  // ✅ Verify ownership before allowing updates
  const { error } = await supabase
    .from("gift_lists")
    .update({ name })
    .eq("id", id)
    .eq("owner_id", auth.user.id); // Critical: Only update if user owns it

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?list=${id}`);
}

export async function deleteList(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/giftlist");

  if (!id) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Missing list id")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("gift_lists").delete().eq("id", id);
  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}
