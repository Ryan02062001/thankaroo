import { ArrowRight, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FinalCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#3EB489] to-[#2d9970] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-white mr-3" />
            <Heart className="w-8 h-8 text-white fill-current" />
            <Sparkles className="w-8 h-8 text-white ml-3" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Never Miss a Thank You Note Again?
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of couples who&apos;ve made their wedding thank you process stress-free with Thankaroo. Start your
            free trial today and experience the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-[#3EB489] hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-12 py-6 text-lg font-semibold"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-white/80 text-sm">No credit card required • 30-day free trial • Cancel anytime</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">30 Days</div>
              <div className="text-white/80">Free Trial</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/80">Happy Couples</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">4.9★</div>
              <div className="text-white/80">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
