"use client"

import { useEffect, useState } from 'react'

interface SectionDividerProps {
  variant?: 'horizontal' | 'vertical' | 'cross'
  animated?: boolean
  className?: string
  style?: 'subtle' | 'prominent' | 'accent'
}

export function SectionDivider({ 
  variant = 'horizontal', 
  animated = true, 
  className = '', 
  style = 'subtle' 
}: SectionDividerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getStyleConfig = () => {
    switch (style) {
      case 'subtle':
        return {
          lineColor: 'rgba(255, 255, 255, 0.17)',
          glowColor: 'rgba(59, 130, 246, 0.1)',
          shadowColor: 'rgba(59, 130, 246, 0.05)'
        }
      case 'prominent':
        return {
          lineColor: 'rgba(255, 255, 255, 0.25)',
          glowColor: 'rgba(59, 130, 246, 0.15)',
          shadowColor: 'rgba(59, 130, 246, 0.08)'
        }
      case 'accent':
        return {
          lineColor: 'rgba(59, 130, 246, 0.4)',
          glowColor: 'rgba(59, 130, 246, 0.2)',
          shadowColor: 'rgba(59, 130, 246, 0.1)'
        }
      default:
        return {
          lineColor: 'rgba(255, 255, 255, 0.17)',
          glowColor: 'rgba(59, 130, 246, 0.1)',
          shadowColor: 'rgba(59, 130, 246, 0.05)'
        }
    }
  }

  const config = getStyleConfig()

  if (variant === 'horizontal') {
    return (
      <div className={`relative w-full flex items-center justify-center py-8 ${className}`}>
        {/* Main horizontal line */}
        <div 
          className={`h-px bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-1000 ${
            isVisible ? 'w-full opacity-100' : 'w-0 opacity-0'
          } ${animated ? 'animate-pulse' : ''}`}
          style={{
            color: config.lineColor,
            boxShadow: `0 0 20px ${config.glowColor}, 0 0 40px ${config.shadowColor}`,
            animationDuration: animated ? '3s' : undefined
          }}
        />
        
        {/* Center accent dot */}
        <div 
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
          style={{
            boxShadow: `0 0 10px ${config.glowColor}`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 0.5s'
          }}
        />
        
        {/* Side accent lines */}
        <div className="absolute left-0 w-16 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
        <div className="absolute right-0 w-16 h-px bg-gradient-to-l from-purple-500/30 to-transparent" />
      </div>
    )
  }

  if (variant === 'vertical') {
    return (
      <div className={`relative h-full flex flex-col items-center justify-center px-8 ${className}`}>
        {/* Main vertical line */}
        <div 
          className={`w-px bg-gradient-to-b from-transparent via-current to-transparent transition-all duration-1000 ${
            isVisible ? 'h-full opacity-100' : 'h-0 opacity-0'
          } ${animated ? 'animate-pulse' : ''}`}
          style={{
            color: config.lineColor,
            boxShadow: `0 0 20px ${config.glowColor}`,
            animationDuration: animated ? '3s' : undefined
          }}
        />
        
        {/* Center accent dot */}
        <div 
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
          style={{
            boxShadow: `0 0 10px ${config.glowColor}`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 0.5s'
          }}
        />
      </div>
    )
  }

  if (variant === 'cross') {
    return (
      <div className={`relative w-full h-20 flex items-center justify-center ${className}`}>
        {/* Horizontal line */}
        <div 
          className={`absolute h-px w-full bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${animated ? 'animate-pulse' : ''}`}
          style={{
            color: config.lineColor,
            boxShadow: `0 0 20px ${config.glowColor}`,
            animationDuration: animated ? '3s' : undefined
          }}
        />
        
        {/* Vertical line */}
        <div 
          className={`absolute w-px h-full bg-gradient-to-b from-transparent via-current to-transparent transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${animated ? 'animate-pulse' : ''}`}
          style={{
            color: config.lineColor,
            boxShadow: `0 0 20px ${config.glowColor}`,
            animationDuration: animated ? '3s' : undefined,
            animationDelay: '0.5s'
          }}
        />
        
        {/* Center intersection accent */}
        <div 
          className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
          style={{
            boxShadow: `0 0 15px ${config.glowColor}`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 1s'
          }}
        />
      </div>
    )
  }

  return null
}

// Preset variants for common use cases
export function HorizontalDivider({ className = '', animated = true, style = 'subtle' }: Omit<SectionDividerProps, 'variant'>) {
  return <SectionDivider variant="horizontal" className={className} animated={animated} style={style} />
}

export function VerticalDivider({ className = '', animated = true, style = 'subtle' }: Omit<SectionDividerProps, 'variant'>) {
  return <SectionDivider variant="vertical" className={className} animated={animated} style={style} />
}

export function CrossDivider({ className = '', animated = true, style = 'subtle' }: Omit<SectionDividerProps, 'variant'>) {
  return <SectionDivider variant="cross" className={className} animated={animated} style={style} />
}