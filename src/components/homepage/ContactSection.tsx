export default function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20 text-center">
        <h2 id="contact-heading" className="text-2xl md:text-3xl font-semibold text-gray-900">Contact</h2>
        <p className="mt-3 text-gray-600">Questions or feedback? Reach us anytime.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#A8E6CF]/60 bg-[#F7FFFC] px-4 py-3">
          <span className="text-sm text-gray-700">Email:</span>
          <a href="mailto:thankarootracker@gmail.com" className="font-medium text-[#2f9c79] underline-offset-4 hover:underline">
            thankarootracker@gmail.com
          </a>
        </div>
      </div>
    </section>
  )
}

 