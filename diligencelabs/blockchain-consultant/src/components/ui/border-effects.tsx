"use client"

import { useEffect, useState } from 'react'

interface BorderEffectsProps {
  variant?: 'subtle' | 'prominent' | 'accent'
  children: React.ReactNode
  className?: string
  animated?: boolean
  movingBorder?: boolean
}

export function BorderEffects({ 
  variant = 'subtle', 
  children, 
  className = '', 
  animated = false,
  movingBorder = false
}: BorderEffectsProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (movingBorder) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 1) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [movingBorder])
  const getBorderConfig = () => {
    switch (variant) {
      case 'subtle':
        return {
          borderColor: 'rgba(255, 255, 255, 0.17)',
          shadowColor: 'rgba(59, 130, 246, 0.05)',
          glowColor: 'rgba(59, 130, 246, 0.02)'
        }
      case 'prominent':
        return {
          borderColor: 'rgba(255, 255, 255, 0.25)',
          shadowColor: 'rgba(59, 130, 246, 0.1)',
          glowColor: 'rgba(59, 130, 246, 0.05)'
        }
      case 'accent':
        return {
          borderColor: 'rgba(59, 130, 246, 0.3)',
          shadowColor: 'rgba(59, 130, 246, 0.15)',
          glowColor: 'rgba(59, 130, 246, 0.08)'
        }
      default:
        return {
          borderColor: 'rgba(255, 255, 255, 0.17)',
          shadowColor: 'rgba(59, 130, 246, 0.05)',
          glowColor: 'rgba(59, 130, 246, 0.02)'
        }
    }
  }

  const config = getBorderConfig()

  return (
    <div 
      className={`relative ${className} ${animated ? 'group' : ''} ${movingBorder ? 'overflow-hidden' : ''}`}
      style={{
        border: `1px solid ${config.borderColor}`,
        boxShadow: `
          0 0 20px ${config.shadowColor},
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(255, 255, 255, 0.05)
        `,
        background: `
          linear-gradient(135deg, ${config.glowColor} 0%, transparent 50%),
          linear-gradient(225deg, ${config.glowColor} 0%, transparent 50%)
        `
      }}
    >
      {/* Moving border gradient overlay */}
      {movingBorder && (
        <div 
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background: `conic-gradient(from ${rotation}deg, transparent 70%, ${config.borderColor} 100%, transparent 130%)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            padding: '1px'
          }}
        />
      )}

      {/* Animated light sweep */}
      {movingBorder && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(${rotation}deg, transparent 30%, ${config.glowColor} 50%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-8 h-px"
          style={{ background: `linear-gradient(90deg, ${config.borderColor}, transparent)` }}
        />
        <div 
          className="absolute top-0 left-0 w-px h-8"
          style={{ background: `linear-gradient(180deg, ${config.borderColor}, transparent)` }}
        />
      </div>
      
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-8 h-px"
          style={{ background: `linear-gradient(270deg, ${config.borderColor}, transparent)` }}
        />
        <div 
          className="absolute top-0 right-0 w-px h-8"
          style={{ background: `linear-gradient(180deg, ${config.borderColor}, transparent)` }}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none">
        <div 
          className="absolute bottom-0 left-0 w-8 h-px"
          style={{ background: `linear-gradient(90deg, ${config.borderColor}, transparent)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-px h-8"
          style={{ background: `linear-gradient(0deg, ${config.borderColor}, transparent)` }}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
        <div 
          className="absolute bottom-0 right-0 w-8 h-px"
          style={{ background: `linear-gradient(270deg, ${config.borderColor}, transparent)` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-px h-8"
          style={{ background: `linear-gradient(0deg, ${config.borderColor}, transparent)` }}
        />
      </div>

      {/* Animated glow effect */}
      {animated && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, ${config.glowColor} 0%, transparent 30%),
              linear-gradient(225deg, ${config.glowColor} 0%, transparent 30%),
              linear-gradient(315deg, ${config.glowColor} 0%, transparent 30%),
              linear-gradient(45deg, ${config.glowColor} 0%, transparent 30%)
            `,
            filter: 'blur(1px)'
          }}
        />
      )}

      {children}
    </div>
  )
}

// Specialized border variants
export function SubtleBorder({ children, className = '', animated = false, movingBorder = false }: Omit<BorderEffectsProps, 'variant'>) {
  return (
    <BorderEffects variant="subtle" className={className} animated={animated} movingBorder={movingBorder}>
      {children}
    </BorderEffects>
  )
}

export function ProminentBorder({ children, className = '', animated = false, movingBorder = false }: Omit<BorderEffectsProps, 'variant'>) {
  return (
    <BorderEffects variant="prominent" className={className} animated={animated} movingBorder={movingBorder}>
      {children}
    </BorderEffects>
  )
}

export function AccentBorder({ children, className = '', animated = false, movingBorder = false }: Omit<BorderEffectsProps, 'variant'>) {
  return (
    <BorderEffects variant="accent" className={className} animated={animated} movingBorder={movingBorder}>
      {children}
    </BorderEffects>
  )
}