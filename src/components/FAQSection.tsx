"use client"

export default function FAQSection() {
  return (
    <section id="faq" className="bg-[#fefefe] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-[#E0FFF4] px-3 py-1 text-sm text-[#3EB489]">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know about Thankaroo.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-6">
            <h3 className="text-lg font-semibold">Is Thankaroo free to use?</h3>
            <p className="mt-2 text-muted-foreground">
              Yes! Basic tracking is completely free. We offer premium features like PDF exports for a small one-time
              fee.
            </p>
          </div>
          <div className="rounded-lg border bg-background p-6">
            <h3 className="text-lg font-semibold">Can I use Thankaroo on my phone?</h3>
            <p className="mt-2 text-muted-foreground">
              Thankaroo is designed as a Progressive Web App that works on any device with a browser.
            </p>
          </div>
          <div className="rounded-lg border bg-background p-6">
            <h3 className="text-lg font-semibold">Does it work with my registry?</h3>
            <p className="mt-2 text-muted-foreground">
              Thankaroo is designed to complement your existing registries by tracking all gifts in one place,
              regardless of source.
            </p>
          </div>
          <div className="rounded-lg border bg-background p-6">
            <h3 className="text-lg font-semibold">What happens to my data?</h3>
            <p className="mt-2 text-muted-foreground">
              Your data stays on your device by default. We never share your information with third parties.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}