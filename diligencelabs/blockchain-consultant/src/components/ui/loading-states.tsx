"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-orange-500',
    secondary: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        'rounded-full border-2 border-transparent border-t-current',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

interface LoadingDotsProps {
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  color = 'primary',
  className 
}) => {
  const colorClasses = {
    primary: 'bg-orange-500',
    secondary: 'bg-blue-500',
    white: 'bg-white',
    gray: 'bg-gray-400'
  }

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className={cn('w-2 h-2 rounded-full', colorClasses[color])}
        />
      ))}
    </div>
  )
}

interface LoadingPulseProps {
  className?: string
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({ className }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn('bg-gray-800/50 rounded-xl', className)}
    />
  )
}

interface PageLoadingProps {
  message?: string
  showLogo?: boolean
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = "Loading...",
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {showLogo && (
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Logo size="xl" />
            </motion.div>
          )}
          
          <div className="space-y-3">
            <LoadingSpinner size="lg" color="primary" />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-gray-300 text-lg"
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  animated?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className,
  animated = true 
}) => {
  return (
    <motion.div
      animate={animated ? {
        opacity: [0.4, 0.8, 0.4]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn('bg-gray-800/60 rounded-lg', className)}
    />
  )
}

interface CardSkeletonProps {
  showHeader?: boolean
  lines?: number
  className?: string
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  showHeader = true,
  lines = 3,
  className 
}) => {
  return (
    <div className={cn('bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4', className)}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-4',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )} 
          />
        ))}
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5,
  columns = 4,
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                'h-4',
                colIndex === 0 ? 'w-full' : 'w-3/4'
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}