import { createClient } from "@/utils/supabase/server";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <HeaderNav isAuthed={!!data.user} />;
}