// src/app/auth/reset-password/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ZodError, z } from "zod";
import { safeNextPath } from "@/lib/utils";

type SearchParams = { next?: string; error?: string; notice?: string };

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params?.next);
  const error = params?.error;
  const notice = params?.notice;

  async function updatePassword(formData: FormData) {
    "use server";

    const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));
    try {
      const parsed = schema.parse({
        password: formData.get("password"),
        confirm: formData.get("confirm"),
      });

      const supabase = await createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        redirect(
          `/signin?error=${encodeURIComponent("Your reset link is invalid or has expired")}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }

      const { error } = await supabase.auth.updateUser({ password: parsed.password });
      if (error) {
        redirect(
          `/auth/reset-password?error=${encodeURIComponent("Could not update password")}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }

      redirect(`/signin?notice=${encodeURIComponent("Password updated. Please sign in.")}&next=${encodeURIComponent(nextFromForm)}`);
    } catch (err) {
      const nextFromForm = safeNextPath(String(formData.get("next") ?? ""));
      // Allow Next.js redirects to bubble up
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }
      if (err instanceof ZodError) {
        const fieldErrors = err.issues.map((i) => i.message).join(", ");
        redirect(
          `/auth/reset-password?error=${encodeURIComponent(fieldErrors)}&next=${encodeURIComponent(
            nextFromForm
          )}`
        );
      }
      redirect(
        `/auth/reset-password?error=${encodeURIComponent("An unexpected error occurred")}&next=${encodeURIComponent(
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
                <h1 className="text-2xl font-bold text-[#2d2d2d]">Choose a new password</h1>
                <p className="mt-1 text-sm text-[#2d2d2d]">You’re signed in via recovery link.</p>
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
                  <Label htmlFor="password" className="text-[#2d2d2d]">
                    New password
                  </Label>
                  <Input id="password" name="password" type="password" required className="text-[#2d2d2d]" />
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="confirm" className="text-[#2d2d2d]">
                    Confirm password
                  </Label>
                  <Input id="confirm" name="confirm" type="password" required className="text-[#2d2d2d]" />
                </div>

                <Button className="mt-6 w-full bg-[#A8E6CF] text-[#2d2d2d] hover:bg-[#98CFBA]" formAction={updatePassword}>
                  Update password
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