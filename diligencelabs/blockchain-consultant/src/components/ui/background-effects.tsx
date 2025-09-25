"use client"

import { memo } from "react"
import dynamic from "next/dynamic"

// Lazy load individual background components
const FloatingElements = dynamic(() => import("./animated-background").then(mod => ({ default: mod.FloatingElements })), {
  loading: () => null,
  ssr: false
})

const ParallaxBackground = dynamic(() => import("./parallax-background").then(mod => ({ default: mod.ParallaxBackground })), {
  loading: () => null,
  ssr: false
})

const PageStructureLines = dynamic(() => import("./page-structure").then(mod => ({ default: mod.PageStructureLines })), {
  loading: () => null,
  ssr: false
})

const BackgroundEffects = memo(function BackgroundEffects() {
  return (
    <>
      {/* Fixed background with lowest priority */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingElements />
        <ParallaxBackground />
        <PageStructureLines />
      </div>
    </>
  )
})

export default BackgroundEffects