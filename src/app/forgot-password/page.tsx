// src/app/forgot-password/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ZodError, z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { getSiteUrl, safeNextPath } from "@/lib/utils";

type SearchParams = { next?: string; error?: string; notice?: string };

const schema = z.object({
  email: z.string().email("Invalid email address").trim(),
});

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params?.next);
  const error = params?.error;
  const notice = params?.notice;

  async function sendReset(formData: FormData) {
    "use server";

    const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));
    try {
      const parsed = schema.parse({ email: formData.get("email") });

      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
        redirectTo: `${getSiteUrl()}/auth/confirm?type=recovery&next=${encodeURIComponent(nextFromForm)}`,
      });

      if (error) {
        redirect(
          `/forgot-password?error=${encodeURIComponent("Unable to send reset email")}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }

      redirect(
        `/auth/verify-email?next=${encodeURIComponent(
          nextFromForm
        )}&notice=${encodeURIComponent("We sent a password reset link to your email.")}`
      );
    } catch (err) {
      const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));
      // Allow Next.js redirects to bubble up
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }
      if (err instanceof ZodError) {
        const fieldErrors = err.issues.map((i) => i.message).join(", ");
        redirect(
          `/forgot-password?error=${encodeURIComponent(fieldErrors)}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }
      redirect(
        `/forgot-password?error=${encodeURIComponent("An unexpected error occurred")}&next=${encodeURIComponent(
          nextFromForm
        )}`
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#fefefe]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <div className="grid w-full overflow-hidden rounded-2xl border bg-[#fefefe] shadow-xl md:grid-cols-1">
          <Card className="border-0 rounded-none">
            <CardContent className="p-8 md:p-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#2d2d2d]">Reset your password</h1>
                <p className="mt-1 text-sm text-[#2d2d2d]">We’ll email you a reset link</p>
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

              <form>
                <input type="hidden" name="next" value={next} />
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2d2d2d]">
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required className="text-[#2d2d2d]" />
                </div>

                <Button className="mt-6 w-full bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" formAction={sendReset}>
                  Send reset link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[#2d2d2d]">
                <Link className="font-medium underline underline-offset-4" href={`/signin?next=${encodeURIComponent(next)}`}>
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}