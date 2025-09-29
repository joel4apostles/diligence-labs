"use client"

import { memo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useUnifiedAuth } from "@/components/providers/unified-auth-provider"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ArrowRight, Shield, Users, TrendingUp } from "lucide-react"

const HeroSection = memo(function HeroSection() {
  const { data: session } = useSession()
  const { isAuthenticated } = useUnifiedAuth()

  const userIsAuthenticated = session || isAuthenticated

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements - Lazy loaded */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="xl" href={null} />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-light mb-6 text-white leading-tight">
            Expert <span className="font-normal">Blockchain</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-normal">
              Consulting
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Strategic advisory and due diligence for token projects, DeFi protocols, and enterprise blockchain initiatives
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mb-12 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>$50M+ Projects Advised</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span>200+ Clients Served</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>95% Success Rate</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {userIsAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/book-consultation">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                    Book Free Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm mb-4">Trusted by leading blockchain projects</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              {/* Placeholder for client logos */}
              <div className="h-8 w-24 bg-gray-700 rounded"></div>
              <div className="h-8 w-24 bg-gray-700 rounded"></div>
              <div className="h-8 w-24 bg-gray-700 rounded"></div>
              <div className="h-8 w-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export { HeroSection }