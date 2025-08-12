"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function requireAuth(redirectTo = "/dashboard") {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getUser();
  
  if (error || !auth?.user) {
    redirect(`/signin?next=${encodeURIComponent(redirectTo)}`);
  }
  
  return auth.user;
}

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getUser();
  return { user: auth?.user || null, error };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}
