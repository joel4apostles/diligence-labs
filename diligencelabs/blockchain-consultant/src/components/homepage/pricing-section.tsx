"use client"

import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Zap, Shield, Crown } from "lucide-react"

const PRICING_TIERS = [
  {
    id: "project",
    name: "Project-Based",
    description: "Perfect for one-time consulting needs",
    icon: Zap,
    pricing: {
      display: "Per Project",
      range: "$2,500 - $10,000"
    },
    features: [
      "Strategic advisory sessions",
      "Due diligence reports",
      "Token launch consulting",
      "Technical documentation",
      "30-day follow-up support",
      "Detailed recommendations"
    ],
    popular: true,
    cta: "Start a Project",
    href: "/book-consultation"
  },
  {
    id: "retainer",
    name: "Monthly Retainer",
    description: "Ongoing support for growing projects",
    icon: Shield,
    pricing: {
      display: "$5,000/month",
      range: "Minimum 3 months"
    },
    features: [
      "Unlimited strategic consultations",
      "Priority response time",
      "Monthly progress reviews",
      "Team training sessions",
      "Regulatory update briefings",
      "Emergency support hotline"
    ],
    popular: false,
    cta: "Get Started",
    href: "/auth/signin"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    icon: Crown,
    pricing: {
      display: "Custom",
      range: "Contact for pricing"
    },
    features: [
      "Dedicated consultant team",
      "Custom integration planning",
      "On-site workshops",
      "Multi-project coordination",
      "Executive briefings",
      "24/7 premium support"
    ],
    popular: false,
    cta: "Contact Sales",
    href: "/contact"
  }
]

const PricingSection = memo(function PricingSection() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Simple <span className="font-normal">Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Transparent project-based pricing with no hidden fees. Choose the engagement model that works for your project.
          </p>
          
          {/* Value Proposition */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm">
            <Shield className="h-4 w-4" />
            <span>100% satisfaction guarantee</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier) => {
            const IconComponent = tier.icon
            return (
              <Card 
                key={tier.id}
                className={`relative bg-gray-900/50 backdrop-blur-sm border-gray-800 transition-all duration-300 hover:shadow-xl h-full flex flex-col ${
                  tier.popular 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105 bg-gray-900/80' 
                    : 'hover:border-gray-700 hover:bg-gray-900/70'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1.5 shadow-lg shadow-blue-500/30 font-medium text-xs">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  {/* Icon */}
                  <div className={`mx-auto mb-4 p-3 rounded-xl w-fit transition-all duration-300 ${
                    tier.popular 
                      ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30' 
                      : 'bg-gray-800/50 border border-gray-700/50'
                  }`}>
                    <IconComponent className={`h-8 w-8 ${
                      tier.popular ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  </div>

                  {/* Title & Description */}
                  <CardTitle className="text-2xl text-white mb-2">{tier.name}</CardTitle>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className={`text-3xl font-bold mb-1 ${
                      tier.popular ? 'text-white' : 'text-gray-100'
                    }`}>
                      {tier.pricing.display}
                    </div>
                    <div className={`text-sm ${
                      tier.popular ? 'text-blue-300' : 'text-gray-500'
                    }`}>
                      {tier.pricing.range}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Link href={tier.href} className="w-full block">
                      <Button 
                        size="lg"
                        className={`w-full h-12 font-medium transition-all duration-300 ${
                          tier.popular
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]'
                            : 'bg-transparent border-2 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50 hover:text-white hover:scale-[1.02]'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {tier.cta}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom FAQ/Guarantee */}
        <div className="text-center">
          <div className="inline-flex items-center gap-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 text-green-400">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">NDA protection</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Crown className="h-5 w-5" />
              <span className="text-sm font-medium">Expert-matched</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export { PricingSection }