"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Consistent theme colors and gradients
export const theme = {
  colors: {
    primary: {
      orange: '#f97316', // orange-500
      orangeLight: '#fb923c', // orange-400
      orangeDark: '#ea580c', // orange-600
    },
    secondary: {
      blue: '#3b82f6', // blue-500
      blueLight: '#60a5fa', // blue-400
      blueDark: '#2563eb', // blue-600
    },
    accent: {
      purple: '#8b5cf6', // purple-500
      green: '#10b981', // emerald-500
      cyan: '#06b6d4', // cyan-500
      pink: '#ec4899', // pink-500
      red: '#ef4444', // red-500
    },
    neutral: {
      gray50: '#f9fafb',
      gray100: '#f3f4f6',
      gray200: '#e5e7eb',
      gray300: '#d1d5db',
      gray400: '#9ca3af',
      gray500: '#6b7280',
      gray600: '#4b5563',
      gray700: '#374151',
      gray800: '#1f2937',
      gray900: '#111827',
      black: '#000000',
      white: '#ffffff',
    }
  },
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    primaryLight: 'from-orange-400 to-orange-500',
    secondary: 'from-blue-500 to-cyan-500',
    accent: 'from-purple-500 to-pink-500',
    success: 'from-green-500 to-emerald-500',
    danger: 'from-red-500 to-orange-500',
    dark: 'from-gray-900 to-gray-800',
    rainbow: 'from-blue-500 via-purple-500 to-pink-500',
  },
  shadows: {
    primary: 'shadow-orange-500/25',
    primaryHover: 'shadow-orange-500/40',
    secondary: 'shadow-blue-500/25',
    secondaryHover: 'shadow-blue-500/40',
    accent: 'shadow-purple-500/25',
    accentHover: 'shadow-purple-500/40',
  },
  borders: {
    primary: 'border-orange-500/30',
    secondary: 'border-blue-500/30',
    accent: 'border-purple-500/30',
    neutral: 'border-white/10',
    hover: 'hover:border-orange-500/50',
  }
}

// Animation variants for consistent motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  hover: {
    scale: 1.05,
    y: -2
  },
  tap: {
    scale: 0.95
  },
  float: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  rotate: {
    rotate: [0, 360],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Common background patterns
interface BackgroundPatternProps {
  variant?: 'grid' | 'dots' | 'lines' | 'mesh'
  opacity?: number
  color?: 'blue' | 'purple' | 'orange' | 'white'
  className?: string
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  variant = 'grid',
  opacity = 0.25,
  color = 'blue',
  className
}) => {
  const colorMap = {
    blue: 'rgba(59, 130, 246, ',
    purple: 'rgba(147, 51, 234, ',
    orange: 'rgba(249, 115, 22, ',
    white: 'rgba(255, 255, 255, '
  }

  const patterns = {
    grid: {
      backgroundImage: `linear-gradient(${colorMap[color]}${opacity}) 1px, transparent 1px), linear-gradient(90deg, ${colorMap[color]}${opacity}) 1px, transparent 1px)`,
      backgroundSize: '60px 60px'
    },
    dots: {
      backgroundImage: `radial-gradient(circle, ${colorMap[color]}${opacity}) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    },
    lines: {
      backgroundImage: `linear-gradient(45deg, ${colorMap[color]}${opacity}) 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    },
    mesh: {
      backgroundImage: `linear-gradient(${colorMap[color]}${opacity * 0.3}) 1px, transparent 1px), linear-gradient(90deg, ${colorMap[color]}${opacity * 0.3}) 1px, transparent 1px), linear-gradient(45deg, ${colorMap[color]}${opacity * 0.1}) 1px, transparent 1px)`,
      backgroundSize: '60px 60px, 60px 60px, 20px 20px'
    }
  }

  return (
    <div 
      className={cn('absolute inset-0', className)}
      style={patterns[variant]}
    />
  )
}

// Floating orbs for background decoration
interface FloatingOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'purple' | 'orange' | 'green' | 'pink'
  position?: { top?: string; bottom?: string; left?: string; right?: string }
  delay?: number
  className?: string
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  size = 'md',
  color = 'blue',
  position = { top: '25%', right: '16.666667%' },
  delay = 0,
  className
}) => {
  const sizeMap = {
    sm: 'w-48 h-48',
    md: 'w-64 h-64',
    lg: 'w-80 h-80',
    xl: 'w-96 h-96'
  }

  const colorMap = {
    blue: 'from-blue-500/10 to-purple-500/10',
    purple: 'from-purple-500/10 to-pink-500/10',
    orange: 'from-orange-500/10 to-red-500/10',
    green: 'from-green-500/10 to-emerald-500/10',
    pink: 'from-pink-500/10 to-rose-500/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: [-10, 10, -10],
        y: [-5, 5, -5]
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        x: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay }
      }}
      className={cn(
        'absolute rounded-full bg-gradient-to-r filter blur-3xl',
        sizeMap[size],
        colorMap[color],
        className
      )}
      style={position}
    />
  )
}

// Glass morphism card wrapper
interface GlassMorphismCardProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  hover?: boolean
  className?: string
}

export const GlassMorphismCard: React.FC<GlassMorphismCardProps> = ({
  children,
  variant = 'neutral',
  hover = true,
  className
}) => {
  const variants = {
    primary: 'from-orange-900/60 to-orange-800/30 border-orange-500/30 hover:border-orange-500/50',
    secondary: 'from-blue-900/60 to-blue-800/30 border-blue-500/30 hover:border-blue-500/50',
    accent: 'from-purple-900/60 to-purple-800/30 border-purple-500/30 hover:border-purple-500/50',
    neutral: 'from-gray-900/60 to-gray-800/30 border-white/10 hover:border-white/20'
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative bg-gradient-to-br backdrop-blur-xl border rounded-xl transition-all duration-300',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Consistent page wrapper
interface PageWrapperProps {
  children: React.ReactNode
  showBackground?: boolean
  backgroundVariant?: 'grid' | 'dots' | 'lines' | 'mesh'
  showOrbs?: boolean
  className?: string
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  showBackground = true,
  backgroundVariant = 'grid',
  showOrbs = true,
  className
}) => {
  return (
    <div className={cn('min-h-screen bg-black text-white relative overflow-hidden', className)}>
      {showBackground && (
        <div className="absolute inset-0">
          <BackgroundPattern variant={backgroundVariant} />
          {showOrbs && (
            <>
              <FloatingOrb color="blue" position={{ top: '25%', right: '16%' }} delay={0} />
              <FloatingOrb color="purple" position={{ bottom: '25%', left: '16%' }} delay={1} />
              <FloatingOrb color="orange" position={{ top: '60%', right: '5%' }} delay={2} size="sm" />
            </>
          )}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}