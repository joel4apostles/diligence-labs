"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { HeroSection } from "@/components/homepage/hero-section"

// Lazy load sections with proper loading states
const ServicesSection = dynamic(() => import("@/components/homepage/services-section").then(mod => ({ default: mod.ServicesSection })), {
  loading: () => (
    <div className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mx-auto mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-gray-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
})

const PricingSection = dynamic(() => import("@/components/homepage/pricing-section").then(mod => ({ default: mod.PricingSection })), {
  loading: () => (
    <div className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mx-auto mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
})

const AboutSection = dynamic(() => import("@/components/homepage/about-section").then(mod => ({ default: mod.AboutSection })), {
  loading: () => (
    <div className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-4">
              <div className="h-8 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-900 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
})

// Background effects loaded with lower priority
const BackgroundEffects = dynamic(() => import("@/components/ui/background-effects"), {
  loading: () => null,
  ssr: false
})

export default function OptimizedHomepage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Critical above-the-fold content */}
      <HeroSection />
      
      {/* Progressive loading for below-the-fold content */}
      <Suspense fallback={<div className="h-20 bg-black" />}>
        <ServicesSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-20 bg-gray-950" />}>
        <PricingSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-20 bg-black" />}>
        <AboutSection />
      </Suspense>

      {/* Background effects loaded last with lowest priority */}
      <Suspense fallback={null}>
        <BackgroundEffects />
      </Suspense>
    </main>
  )
}