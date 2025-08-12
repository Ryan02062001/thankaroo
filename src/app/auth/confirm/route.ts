import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate required parameters
  if (!token_hash || !type) {
    redirect("/signin?error=Missing%20confirmation%20parameters");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  
  if (error) {
    // Provide more specific error messages
    let errorMessage = "Invalid%20or%20expired%20confirmation%20link";
    
    if (error.message.includes('expired')) {
      errorMessage = "Confirmation%20link%20has%20expired.%20Please%20request%20a%20new%20one";
    } else if (error.message.includes('invalid')) {
      errorMessage = "Invalid%20confirmation%20link";
    } else if (error.message.includes('already')) {
      errorMessage = "Email%20already%20confirmed.%20Please%20sign%20in";
    }
    
    redirect(`/signin?error=${errorMessage}`);
  }

  redirect(next);
}
