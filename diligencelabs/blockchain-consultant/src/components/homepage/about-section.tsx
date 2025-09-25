"use client"

import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowRight, 
  Users, 
  Award, 
  TrendingUp,
  Mail,
  Calendar,
  MessageSquare
} from "lucide-react"

const STATS = [
  {
    icon: Users,
    value: "200+",
    label: "Projects Completed",
    description: "Successful blockchain implementations"
  },
  {
    icon: Award,
    value: "$50M+",
    label: "Value Created",
    description: "Total market value of advised projects"
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Success Rate",
    description: "Client satisfaction and project success"
  }
]

const CONTACT_OPTIONS = [
  {
    icon: Calendar,
    title: "Book Consultation",
    description: "Schedule a free 30-minute strategy call",
    cta: "Book Now",
    href: "/book-consultation",
    primary: true
  },
  {
    icon: MessageSquare,
    title: "Start a Project",
    description: "Get started with a custom project proposal",
    cta: "Get Quote",
    href: "/contact",
    primary: false
  },
  {
    icon: Mail,
    title: "General Inquiries",
    description: "Questions about our services or partnerships",
    cta: "Contact Us",
    href: "/contact",
    primary: false
  }
]

const AboutSection = memo(function AboutSection() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Why Choose <span className="font-normal">Diligence Labs</span>
            </h2>
            <div className="space-y-6 text-gray-300">
              <p className="text-lg leading-relaxed">
                We're a team of blockchain experts with deep technical knowledge and real-world experience 
                building and scaling cryptocurrency projects from inception to billion-dollar valuations.
              </p>
              <p className="text-lg leading-relaxed">
                Our consultants have worked at leading blockchain companies, DeFi protocols, and 
                venture capital firms. We understand both the technical complexities and business 
                challenges of the blockchain ecosystem.
              </p>
              <p className="text-lg leading-relaxed">
                Every engagement is tailored to your specific needs, whether you're a startup 
                preparing for token launch or an enterprise exploring blockchain integration.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Certified Blockchain Experts</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Fortune 500 Experience</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6">
            {STATS.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card key={index} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-20 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-gray-300 font-medium mb-1">{stat.label}</div>
                        <div className="text-sm text-gray-500">{stat.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Contact Options */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-light text-white mb-4">
            Ready to Get <span className="font-normal">Started?</span>
          </h3>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Choose the best way to engage with our team based on your project needs and timeline.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_OPTIONS.map((option, index) => {
              const IconComponent = option.icon
              return (
                <Card 
                  key={index} 
                  className={`bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300 ${
                    option.primary ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-4 p-3 rounded-lg w-fit ${
                      option.primary 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-20' 
                        : 'bg-gray-800'
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        option.primary ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{option.title}</h4>
                    <p className="text-gray-400 text-sm mb-6">{option.description}</p>
                    <Link href={option.href}>
                      <Button 
                        className={`w-full ${
                          option.primary
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                        }`}
                      >
                        {option.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-8">
          <h4 className="text-2xl font-light text-white mb-4">
            Have Questions? <span className="font-normal">Let's Talk</span>
          </h4>
          <p className="text-gray-400 mb-6">
            Our team is here to help you navigate the blockchain landscape with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-consultation">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Schedule Free Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Send Message
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
})

export { AboutSection }