"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Accessibility Context
interface AccessibilityContextType {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large' | 'xl'
  screenReader: boolean
  keyboardNavigation: boolean
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  setFontSize: (size: 'small' | 'medium' | 'large' | 'xl') => void
  announceToScreenReader: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Accessibility Provider
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xl'>('medium')
  const [screenReader, setScreenReader] = useState(false)
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    if (prefersReducedMotion) setReducedMotion(true)
    if (prefersHighContrast) setHighContrast(true)

    // Detect screen reader usage
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') || 
                           window.navigator.userAgent.includes('JAWS') || 
                           !!window.speechSynthesis || 
                           'speechSynthesis' in window

    setScreenReader(hasScreenReader)

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true)
      }
    }

    const handleMouseDown = () => {
      setKeyboardNavigation(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  useEffect(() => {
    // Apply accessibility classes to document
    const classes = []
    
    if (highContrast) classes.push('high-contrast')
    if (reducedMotion) classes.push('reduced-motion')
    if (keyboardNavigation) classes.push('keyboard-navigation')
    classes.push(`font-size-${fontSize}`)

    document.documentElement.className = classes.join(' ')
  }, [highContrast, reducedMotion, fontSize, keyboardNavigation])

  const toggleHighContrast = () => setHighContrast(!highContrast)
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion)

  const announceToScreenReader = (message: string) => {
    if (screenReader && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.volume = 0.8
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
    
    // Also add to live region for screen readers
    const liveRegion = document.getElementById('accessibility-live-region')
    if (liveRegion) {
      liveRegion.textContent = message
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 3000)
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        reducedMotion,
        fontSize,
        screenReader,
        keyboardNavigation,
        toggleHighContrast,
        toggleReducedMotion,
        setFontSize,
        announceToScreenReader,
      }}
    >
      {children}
      {/* Live region for screen reader announcements */}
      <div
        id="accessibility-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  )
}

// Skip to Content Link
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
    >
      Skip to main content
    </a>
  )
}

// Accessibility Menu
export const AccessibilityMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    highContrast, 
    reducedMotion, 
    fontSize, 
    toggleHighContrast, 
    toggleReducedMotion, 
    setFontSize,
    announceToScreenReader 
  } = useAccessibility()

  const handleToggleMenu = () => {
    setIsOpen(!isOpen)
    announceToScreenReader(isOpen ? 'Accessibility menu closed' : 'Accessibility menu opened')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleToggleMenu}
        className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
        aria-label="Open accessibility menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" 
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-80"
            role="dialog"
            aria-label="Accessibility options"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Accessibility Options
            </h3>

            <div className="space-y-4">
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="high-contrast" className="text-sm text-gray-700 dark:text-gray-300">
                  High Contrast
                </label>
                <button
                  id="high-contrast"
                  onClick={() => {
                    toggleHighContrast()
                    announceToScreenReader(`High contrast ${!highContrast ? 'enabled' : 'disabled'}`)
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    highContrast ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={highContrast}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="reduced-motion" className="text-sm text-gray-700 dark:text-gray-300">
                  Reduced Motion
                </label>
                <button
                  id="reduced-motion"
                  onClick={() => {
                    toggleReducedMotion()
                    announceToScreenReader(`Reduced motion ${!reducedMotion ? 'enabled' : 'disabled'}`)
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    reducedMotion ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={reducedMotion}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size Controls */}
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300 block mb-2">
                  Font Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setFontSize(size)
                        announceToScreenReader(`Font size set to ${size}`)
                      }}
                      className={`px-3 py-2 text-xs rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        fontSize === size
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      aria-pressed={fontSize === size}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  announceToScreenReader('Accessibility menu closed')
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                Close Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Focus Trap Component
export const FocusTrap: React.FC<{
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
}> = ({ children, active, onEscape }) => {
  const trapRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !trapRef.current) return

    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    // Focus first element when activated
    firstElement?.focus()

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])

  return (
    <div ref={trapRef} className={active ? '' : 'pointer-events-none'}>
      {children}
    </div>
  )
}

// Accessible Heading Component
export const AccessibleHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
  id?: string
}> = ({ level, children, className = '', id }) => {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements

  return (
    <Tag 
      id={id}
      className={`focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-sm ${className}`}
      tabIndex={-1}
    >
      {children}
    </Tag>
  )
}

// Accessible Button Component with Loading State
export const AccessibleButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}> = ({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  ariaLabel,
  ariaDescribedBy
}) => {
  const { announceToScreenReader } = useAccessibility()

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    outline: "border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  }

  const handleClick = () => {
    if (loading || disabled) return
    
    if (loading && onClick) {
      announceToScreenReader('Loading...')
    }
    
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={loading ? 'sr-only' : ''}>{children}</span>
      {loading && <span aria-live="polite">Loading...</span>}
    </button>
  )
}