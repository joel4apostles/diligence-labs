"use client"

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Logo } from './logo'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <DefaultErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReload = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-red-500/30 backdrop-blur-xl">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                className="w-16 h-16 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </motion.div>
              
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
                Something went wrong
              </CardTitle>
              
              <div className="space-y-4">
                <p className="text-gray-300 text-lg">
                  We encountered an unexpected error. Our team has been notified and is working on a fix.
                </p>
                
                {process.env.NODE_ENV === 'development' && error && (
                  <details className="text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <summary className="cursor-pointer text-red-400 font-medium mb-2">
                      Error Details (Development Mode)
                    </summary>
                    <pre className="text-xs text-gray-300 overflow-auto">
                      {error.message}
                      {error.stack && (
                        <>
                          {'\n\nStack Trace:\n'}
                          {error.stack}
                        </>
                      )}
                    </pre>
                  </details>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button 
                    onClick={handleReload}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  >
                    Try Again
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  >
                    Go to Homepage
                  </Button>
                </motion.div>
              </div>

              <div className="text-center pt-4 border-t border-gray-700">
                <Logo size="medium" />
                <p className="text-gray-400 text-sm mt-2">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@diligencelabs.xyz" className="text-blue-400 hover:text-blue-300">
                    support@diligencelabs.xyz
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Specialized error boundaries for different contexts
export const DashboardErrorBoundary: React.FC<Props> = ({ children, ...props }) => (
  <ErrorBoundary {...props}>
    {children}
  </ErrorBoundary>
)

export const AuthErrorBoundary: React.FC<Props> = ({ children, ...props }) => (
  <ErrorBoundary {...props}>
    {children}
  </ErrorBoundary>
)

export const APIErrorBoundary: React.FC<Props> = ({ children, ...props }) => (
  <ErrorBoundary {...props}>
    {children}
  </ErrorBoundary>
)