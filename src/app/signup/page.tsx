import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/lib/auth-schemas";
import { ZodError } from "zod";
import { getSiteUrl, safeNextPath } from "@/lib/utils";

type SearchParams = { next?: string; error?: string; notice?: string };

export default async function SignUpPage({
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
  const notice = params?.notice;

  async function signUp(formData: FormData) {
    "use server";

    const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));

    try {
      const formEntries = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const validated = signUpSchema.parse(formEntries);

      const supabase = await createClient();
      const { error, data } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(nextFromForm)}`,
        },
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "Password does not meet security requirements";
        }
        redirect(
          `/signup?error=${encodeURIComponent(errorMessage)}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }

      if (!data.session) {
        redirect(
          `/auth/verify-email?next=${encodeURIComponent(
            nextFromForm
          )}&notice=${encodeURIComponent("We sent you a confirmation link.")}`
        );
      }

      redirect(nextFromForm);
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.map((i) => i.message).join(", ");
        redirect(
          `/signup?error=${encodeURIComponent(fieldErrors)}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-[#fefefe]">
      <div className=" self-start pt-10 mx-auto flex min-h-screen w-full max-w-5xl items-start justify-start px-4" role="region" aria-labelledby="signup-heading">
        <div className="grid w-full overflow-hidden rounded-2xl border bg-[#fefefe] shadow-xl md:grid-cols-2">
          <Card className="border-0 rounded-none">
            <CardContent className="p-8 md:p-10">
              <div className="mb-8">
                <h1 id="signup-heading" className="text-2xl font-bold text-[#2d2d2d]">Create your account</h1>
                <p className="mt-1 text-sm text-[#2d2d2d]">Join Thankaroo in a few seconds</p>
              </div>

              {notice ? (
                <p className="mb-6 rounded-md border border-[#A6CFE2] bg-[#A6CFE2]/15 px-3 py-2 text-sm text-[#2d2d2d]">
                  {decodeURIComponent(notice)}
                </p>
              ) : null}

              {error ? (
                <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {decodeURIComponent(error)}
                </p>
              ) : null}

              <form aria-labelledby="signup-heading">
                <input type="hidden" name="next" value={next} />

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2d2d2d]">
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required className="text-[#2d2d2d]" />
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="password" className="text-[#2d2d2d]">Password</Label>
                  <Input id="password" name="password" type="password" required className="text-[#2d2d2d]" />
                  <p className="text-xs text-[#2d2d2d] opacity-70">
                    At least 8 characters, incl. upper/lowercase and a number.
                  </p>
                </div>

                <Button className="mt-6 w-full bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" formAction={signUp}>
                  Create account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[#2d2d2d]">
                Already have an account?{" "}
                <Link className="font-medium underline underline-offset-4" href={`/signin?next=${encodeURIComponent(next)}`}>
                  Sign in
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