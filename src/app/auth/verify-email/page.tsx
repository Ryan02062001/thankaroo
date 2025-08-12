import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/dashboard";
  const notice =
    params?.notice ??
    "Check your inbox and click the link to finish creating your account.";

  return (
    <div className="min-h-screen bg-[#fefefe] pt-20">
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="mb-3 text-2xl font-bold text-[#2d2d2d]">Verify your email</h1>
          <p className="text-[#2d2d2d]">{decodeURIComponent(notice)}</p>
          <p className="mt-4 text-sm text-[#2d2d2d]">Once confirmed, you&apos;ll be redirected to your dashboard.</p>
          <div className="mt-6">
            <Link href={`/signin?next=${encodeURIComponent(next)}`} className="underline">
              Return to sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

