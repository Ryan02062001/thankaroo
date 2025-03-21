"use client";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#fefefe] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-[#E0FFF4] px-3 py-1 text-sm text-[#3EB489]">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Manage Your Wedding Thank-Yous            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Thankaroo makes it easy to stay on top of your thank-you notes.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div className="relative flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3EB489] text-white">
              1
            </div>
            <h3 className="text-xl font-semibold">Log Your Gifts</h3>
            <p className="text-center text-muted-foreground">
              Quickly enter gift details and who they&apos;re from as you receive them.
            </p>
          </div>
          <div className="relative flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3EB489] text-white">
              2
            </div>
            <h3 className="text-xl font-semibold">Send Thank-You Notes</h3>
            <p className="text-center text-muted-foreground">
              Use the app to keep track of which thank-you notes you&apos;ve written.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3EB489] text-white">
              3
            </div>
            <h3 className="text-xl font-semibold">Mark as Complete</h3>
            <p className="text-center text-muted-foreground">
              Check off thank-you notes as you send them to ensure no one is forgotten.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

