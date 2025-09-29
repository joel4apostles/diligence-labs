"use client"

import React, { 
  Suspense, 
  lazy, 
  memo, 
  useMemo, 
  useCallback, 
  useState, 
  useEffect,
  useRef 
} from 'react'
import { motion, useInView } from 'framer-motion'

// ==================== VIRTUAL SCROLLING COMPONENT ====================
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length, startIndex + visibleItemCount + overscan * 2)
    const totalHeight = items.length * itemHeight

    return { startIndex, endIndex, totalHeight }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => 
    items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    })),
    [items, startIndex, endIndex]
  )

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="relative"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== INTERSECTION OBSERVER LAZY LOADING ====================
interface LazyLoadProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
  onVisible?: () => void
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder = <div className="w-full h-32 bg-gray-800/50 animate-pulse rounded-lg" />,
  threshold = 0.1,
  rootMargin = "50px",
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          onVisible?.()
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, isVisible, onVisible])

  return (
    <div ref={ref}>
      {isVisible ? children : placeholder}
    </div>
  )
}

// ==================== IMAGE OPTIMIZATION WITH LAZY LOADING ====================
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const isInView = useInView(ref, { once: true, margin: "50px" })

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  if (hasError) {
    return (
      <div 
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-gray-800"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse" />
      )}

      {/* Actual image */}
      {(priority || isInView) && (
        <motion.img
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            absolute inset-0 w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// ==================== DEBOUNCED SEARCH ====================
interface DebouncedSearchProps {
  onSearch: (query: string) => void
  delay?: number
  placeholder?: string
  className?: string
}

export const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  onSearch,
  delay = 300,
  placeholder = "Search...",
  className = ''
}) => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    setIsLoading(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value)
      setIsLoading(false)
    }, delay)
  }, [onSearch, delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
      />
      
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full"
          />
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
    </div>
  )
}

// ==================== MEMOIZED LIST COMPONENT ====================
interface ListItem {
  id: string
  title: string
  description: string
  timestamp: string
}

interface MemoizedListItemProps {
  item: ListItem
  onClick: (id: string) => void
  isSelected: boolean
}

const MemoizedListItem = memo<MemoizedListItemProps>(({ item, onClick, isSelected }) => {
  const handleClick = useCallback(() => {
    onClick(item.id)
  }, [onClick, item.id])

  return (
    <motion.div
      onClick={handleClick}
      className={`
        p-4 border border-gray-600 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800/50 hover:bg-gray-700/50'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="font-medium text-white">{item.title}</h3>
      <p className="text-sm text-gray-400 mt-1">{item.description}</p>
      <span className="text-xs text-gray-500 mt-2 block">{item.timestamp}</span>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && 
         prevProps.isSelected === nextProps.isSelected
})

MemoizedListItem.displayName = 'MemoizedListItem'

export { MemoizedListItem }

// ==================== INFINITE SCROLL HOOK ====================
export const useInfiniteScroll = (
  fetchMore: () => Promise<void>,
  hasNextPage: boolean,
  threshold = 100
) => {
  const [isFetching, setIsFetching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = async () => {
      if (isFetching || !hasNextPage) return

      const container = containerRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setIsFetching(true)
        try {
          await fetchMore()
        } finally {
          setIsFetching(false)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [fetchMore, hasNextPage, isFetching, threshold])

  return { containerRef, isFetching }
}

// ==================== PROGRESSIVE IMAGE ENHANCEMENT ====================
interface ProgressiveImageProps {
  src: string
  lowQualitySrc: string
  alt: string
  className?: string
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  alt,
  className = ''
}) => {
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)
  const [isLowQualityLoaded, setIsLowQualityLoaded] = useState(false)

  useEffect(() => {
    // Preload high quality image
    const img = new Image()
    img.onload = () => setIsHighQualityLoaded(true)
    img.src = src
  }, [src])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Low quality placeholder */}
      <motion.img
        src={lowQualitySrc}
        alt={alt}
        onLoad={() => setIsLowQualityLoaded(true)}
        className={`
          absolute inset-0 w-full h-full object-cover transition-opacity duration-300
          ${isLowQualityLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ filter: 'blur(5px)', transform: 'scale(1.05)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLowQualityLoaded ? 1 : 0 }}
      />

      {/* High quality image */}
      <motion.img
        src={src}
        alt={alt}
        className={`
          absolute inset-0 w-full h-full object-cover transition-opacity duration-500
          ${isHighQualityLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHighQualityLoaded ? 1 : 0 }}
      />

      {/* Loading indicator */}
      {!isHighQualityLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
          />
        </div>
      )}
    </div>
  )
}

// ==================== CODE SPLITTING UTILITIES ====================
// Higher-order component for lazy loading with error boundaries
export const withLazyLoading = <P extends object>(
  componentImport: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(componentImport)
  
  return (props: P) => (
    <Suspense 
      fallback={
        fallback ? React.createElement(fallback) : 
        <div className="flex items-center justify-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  )
}

// ==================== PERFORMANCE MONITORING ====================
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
  })

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current
      
      // Log slow renders (>16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Analytics.track('component_render_time', {
        //   component: componentName,
        //   renderTime
        // })
      }
    }
  })

  return { renderStartTime: renderStartTime.current }
}