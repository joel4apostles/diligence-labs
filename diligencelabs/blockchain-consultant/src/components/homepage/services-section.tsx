"use client"

import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Search, 
  Rocket, 
  Building2, 
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react"

const SERVICES = [
  {
    id: "strategic-advisory",
    title: "Strategic Advisory",
    description: "Navigate complex blockchain decisions with expert guidance on technology strategy and market positioning.",
    icon: Target,
    features: [
      "Technology roadmap planning",
      "Tokenomics design & review",
      "Go-to-market strategy",
      "Regulatory compliance guidance"
    ],
    pricing: "Starting at $2,500",
    duration: "1-2 weeks",
    popular: false,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "due-diligence",
    title: "Due Diligence",
    description: "Comprehensive technical and business analysis for investors and project stakeholders.",
    icon: Search,
    features: [
      "Smart contract auditing",
      "Team background verification",
      "Market analysis & positioning",
      "Risk assessment report"
    ],
    pricing: "Starting at $5,000",
    duration: "2-3 weeks",
    popular: true,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "token-launch",
    title: "Token Launch",
    description: "End-to-end support for successful token launches from planning to post-launch optimization.",
    icon: Rocket,
    features: [
      "Launch strategy development",
      "Legal structure guidance",
      "Marketing & community building",
      "Post-launch monitoring"
    ],
    pricing: "Starting at $10,000",
    duration: "4-6 weeks",
    popular: false,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "enterprise-integration",
    title: "Enterprise Integration",
    description: "Help enterprises adopt blockchain technology with custom integration strategies.",
    icon: Building2,
    features: [
      "Blockchain integration planning",
      "Vendor selection guidance",
      "Implementation roadmap",
      "Training & support"
    ],
    pricing: "Custom pricing",
    duration: "6-12 weeks",
    popular: false,
    gradient: "from-orange-500 to-red-500"
  }
]

const ServicesSection = memo(function ServicesSection() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Our <span className="font-normal">Services</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive blockchain consulting services tailored to your project's needs and stage of development
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {SERVICES.map((service) => {
            const IconComponent = service.icon
            return (
              <Card 
                key={service.id}
                className="relative bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden group"
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${service.gradient} bg-opacity-20`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <DollarSign className="h-4 w-4" />
                          {service.pricing}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Clock className="h-4 w-4" />
                          {service.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-300">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={`/services/${service.id}`}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white`}
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            Not sure which service you need? Let's discuss your project.
          </p>
          <Link href="/book-consultation">
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Schedule Free Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
})

export { ServicesSection }