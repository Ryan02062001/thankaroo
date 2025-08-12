"use client"

import { ArrowRight, GiftIcon as Gift2, PenTool, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Gift2,
      title: "Log Your Gifts",
      description:
        "Quickly capture gift details as you receive them. Add photos, notes, and guest information with our streamlined interface.",
      features: ["Quick entry form", "Photo attachments", "Guest details"],
    },
    {
      number: "02",
      icon: PenTool,
      title: "Write Thank-You Notes",
      description:
        "Use our guided templates and personal touch suggestions to craft heartfelt thank-you messages that truly express your gratitude.",
      features: ["Message templates", "Personal suggestions", "Custom notes"],
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Track & Complete",
      description:
        "Mark notes as sent and track your progress. Never worry about forgetting someone or sending duplicate thank-yous.",
      features: ["Progress tracking", "Completion status", "Reminder system"],
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDFB]/30 via-transparent to-[#E0FFF4]/20"></div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge
            variant="secondary"
            className="bg-[#E0FFF4] text-[#3EB489] hover:bg-[#E0FFF4] border-[#A8E6CF]/50 mb-6"
          >
            🎯 How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Three simple steps to
            <span className="block text-[#3EB489]">thank-you success</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Our streamlined process makes managing wedding thank-yous feel effortless and enjoyable.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 top-32 w-px h-32 bg-gradient-to-b from-[#A8E6CF] to-[#E0FFF4] transform -translate-x-1/2 z-0"></div>
              )}

              <div
                className={`flex flex-col lg:flex-row items-center gap-12 mb-20 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-bold text-[#E0FFF4]">{step.number}</span>
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3EB489] to-[#A8E6CF] flex items-center justify-center`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">{step.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">{step.description}</p>

                    <div className="flex flex-wrap gap-3">
                      {step.features.map((feature, featureIndex) => (
                        <Badge
                          key={featureIndex}
                          variant="outline"
                          className="border-[#A8E6CF] text-[#3EB489] bg-[#E0FFF4]/30"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className="flex-1 flex justify-center">
                  <Card className="w-full max-w-sm shadow-2xl border-0 bg-gradient-to-br from-white to-[#F0FDFB] transform hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-8">
                      <div className="text-center space-y-4">
                        <div
                          className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#3EB489] to-[#A8E6CF] flex items-center justify-center`}
                        >
                          <step.icon className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900">{step.title}</h4>
                        <div className="space-y-2">
                          {step.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-[#3EB489]" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-[#3EB489] font-semibold">
            <span>Ready to get started?</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  )
}