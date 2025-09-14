"use client"

interface MinimalBackgroundProps {
  variant?: 'default' | 'admin' | 'auth' | 'dashboard'
  opacity?: number
}

export function MinimalBackground({ variant = 'default', opacity = 0.1 }: MinimalBackgroundProps) {
  const getVariantColors = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/10'
      case 'auth':
        return 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10'
      case 'dashboard':
        return 'bg-gradient-to-br from-green-500/10 via-blue-500/10 to-green-500/10'
      default:
        return 'bg-gradient-to-br from-gray-500/10 via-gray-600/10 to-gray-500/10'
    }
  }

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 ${getVariantColors()}`}
      style={{ opacity }}
    />
  )
}