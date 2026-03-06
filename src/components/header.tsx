"use client";

import * as React from "react";
import HeaderNav from "./HeaderNav";
import { supabase } from "@/utils/supabase/client";

export default function Header() {
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const syncAuthState = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        setIsAuthed(!error && !!data.user);
      } catch {
        if (active) setIsAuthed(false);
      }
    };

    void syncAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsAuthed(!!session?.user);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return <HeaderNav isAuthed={isAuthed} />;
}
