"use client"

import { Gift, Mail, Calendar, Heart, Users, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FeaturesSection() {
  const features = [
    {
      icon: Gift,
      title: "Smart Gift Tracking",
      description: "Effortlessly log gifts from your registry and surprise presents with our intuitive interface.",
      color: "from-[#3EB489] to-[#A8E6CF]",
    },
    {
      icon: Mail,
      title: "Thank-You Management",
      description: "Never miss sending a thank-you note with our elegant tracking and reminder system.",
      color: "from-[#A8E6CF] to-[#E0FFF4]",
    },
    {
      icon: Calendar,
      title: "Timeline Organization",
      description: "Organize gifts by event date and priority to stay on top of your thank-you schedule.",
      color: "from-[#E0FFF4] to-[#3EB489]",
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Keep track of all your wedding guests and their generous gifts in one beautiful place.",
      color: "from-[#3EB489] to-[#A8E6CF]",
    },
    {
      icon: Heart,
      title: "Personal Touch",
      description: "Add personal notes and memories to make each thank-you note truly heartfelt.",
      color: "from-[#A8E6CF] to-[#E0FFF4]",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your special moments stay private with our secure, privacy-focused platform.",
      color: "from-[#E0FFF4] to-[#3EB489]",
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-[#F0FDFB]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge
            variant="secondary"
            className="bg-[#E0FFF4] text-[#3EB489] hover:bg-[#E0FFF4] border-[#A8E6CF]/50 mb-6"
          >
            ✨ Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Everything you need for
            <span className="block text-[#3EB489]">perfect thank-you notes</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Thankaroo combines elegant design with powerful features to make gift tracking and thank-you management
            effortless.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-8">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-[#3EB489] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">Ready to make thank-you notes effortless?</p>
          <div className="flex items-center justify-center gap-2 text-[#3EB489]">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
            <span className="font-semibold">Join thousands of happy couples</span>
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}