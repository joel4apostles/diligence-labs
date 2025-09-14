"use client"

import { useEffect, useState } from 'react'

interface GridLinesProps {
  density?: 'light' | 'medium' | 'dense'
  animated?: boolean
  className?: string
}

export function GridLines({ density = 'medium', animated = true, className = '' }: GridLinesProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const getDensityConfig = () => {
    switch (density) {
      case 'light':
        return { size: '120px', opacity: '0.05' }
      case 'medium':
        return { size: '80px', opacity: '0.08' }
      case 'dense':
        return { size: '40px', opacity: '0.12' }
      default:
        return { size: '80px', opacity: '0.08' }
    }
  }

  const config = getDensityConfig()

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* Main grid lines */}
      <div 
        className={`absolute inset-0 ${animated ? 'animate-pulse' : ''}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, ${config.opacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, ${config.opacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${config.size} ${config.size}`,
          animationDuration: animated ? '12s' : undefined,
          animationTimingFunction: 'ease-in-out',
          transform: isLoaded ? 'translateZ(0)' : 'translateZ(0) scale(0.98)',
          transition: 'transform 2s ease-out'
        }}
      />

      {/* Diagonal accent lines */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, rgba(59, 130, 246, 0.03) 50%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, rgba(147, 51, 234, 0.03) 50%, transparent 51%)
          `,
          backgroundSize: '200px 200px',
          opacity: animated ? (isLoaded ? 1 : 0) : 1,
          transition: 'opacity 3s ease-out'
        }}
      />

      {/* Border accent lines */}
      <div className="absolute inset-0">
        {/* Top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.17) 50%, transparent)'
          }}
        />
        
        {/* Bottom border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.17) 50%, transparent)'
          }}
        />
        
        {/* Left border */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-px"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.17) 50%, transparent)'
          }}
        />
        
        {/* Right border */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-px"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.17) 50%, transparent)'
          }}
        />
      </div>

      {/* Radial gradient masks for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 70%)
          `
        }}
      />

      {/* Subtle animated overlay */}
      {animated && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.01) 50%, transparent 52%)',
            backgroundSize: '100px 100px',
            animationDuration: '20s',
            animationDirection: 'alternate'
          }}
        />
      )}
    </div>
  )
}

// Specialized grid variants
export function HeroGridLines() {
  return (
    <GridLines 
      density="medium" 
      animated={true}
      className="opacity-90"
    />
  )
}

export function SectionGridLines() {
  return (
    <GridLines 
      density="light" 
      animated={false}
      className="opacity-60"
    />
  )
}

export function FormGridLines() {
  return (
    <GridLines 
      density="dense" 
      animated={true}
      className="opacity-40"
    />
  )
}