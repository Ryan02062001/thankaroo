// app/signin/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/lib/auth-schemas";
import { ZodError } from "zod";
import { safeNextPath } from "@/lib/utils";

type SearchParams = { next?: string; error?: string };

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/giftlist");

  const params = await searchParams;
  const next = safeNextPath(params?.next);
  const error = params?.error;

  async function signIn(formData: FormData) {
    "use server";

    try {
      const formEntries = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const validatedData = signInSchema.parse(formEntries);
      const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));

      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword(validatedData);

      if (error) {
        let errorMessage = "Invalid email or password";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many attempts. Please try again later";
        }
        redirect(
          `/signin?error=${encodeURIComponent(errorMessage)}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }

      redirect(nextFromForm);
    } catch (error) {
      const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error;
      }
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.map((i) => i.message).join(", ");
        redirect(
          `/signin?error=${encodeURIComponent(fieldErrors)}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }
      redirect(
        `/signin?error=${encodeURIComponent("An unexpected error occurred")}&next=${encodeURIComponent(
          nextFromForm
        )}`
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#fefefe]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <div className="grid w-full overflow-hidden rounded-2xl border bg-[#fefefe] shadow-xl md:grid-cols-2">
          <Card className="border-0 rounded-none">
            <CardContent className="p-8 md:p-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#2d2d2d]">Welcome back</h1>
                <p className="mt-1 text-sm text-[#2d2d2d]">Login to your Thankaroo account</p>
              </div>

              {error ? (
                <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </p>
              ) : null}

              <form>
                <input type="hidden" name="next" value={next} />

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2d2d2d]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="text-[#2d2d2d]"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[#2d2d2d]">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#2d2d2d] underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input id="password" name="password" type="password" required className="text-[#2d2d2d]" />
                </div>

                <Button className="mt-6 w-full bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" formAction={signIn}>
                  Login
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[#2d2d2d]">
                Don&apos;t have an account?{" "}
                <Link className="font-medium underline underline-offset-4" href={`/signup?next=${encodeURIComponent(next)}`}>
                  Sign up
                </Link>
              </p>

              <p className="mt-8 text-center text-[11px] leading-relaxed text-[#2d2d2d]">
                By clicking continue, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
          <div className="hidden items-center justify-center bg-[#A6CFE2]/15 md:flex" />
        </div>
      </div>
    </div>
  );
}