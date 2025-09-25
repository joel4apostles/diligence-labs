"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

// Simplified user interface
interface DiligenceUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role?: string
  walletAddress?: string | null
  provider: 'email' | 'google' | 'wallet'
}

interface DiligenceAuthContextType {
  user: DiligenceUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  connectWallet?: () => Promise<void>
  error: string | null
}

const DiligenceAuthContext = createContext<DiligenceAuthContextType | undefined>(undefined)

interface DiligenceAuthProviderProps {
  children: React.ReactNode
  providers?: ('email' | 'google' | 'wallet')[]
  fallbackStrategy?: 'email' | 'redirect'
}

export function DiligenceAuthProvider({ 
  children, 
  providers = ['email', 'google'], 
  fallbackStrategy = 'email' 
}: DiligenceAuthProviderProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [user, setUser] = useState<DiligenceUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simplified user state management
  useEffect(() => {
    console.log('DiligenceAuth: Session state change', { 
      status, 
      hasSession: !!session, 
      userId: session?.user?.id 
    })

    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || null,
        name: session.user.name || null,
        image: session.user.image || null,
        role: session.user.role,
        walletAddress: session.user.walletAddress,
        provider: session.user.email ? 'email' : 'google'
      })
      setIsLoading(false)
      setError(null)
    } else if (status === 'unauthenticated') {
      setUser(null)
      setIsLoading(false)
      setError(null)
    }
  }, [session, status])

  // Simplified login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, callbackUrl: '/dashboard' })
      })

      if (response.ok) {
        // NextAuth will handle the session update
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Login failed')
        return false
      }
    } catch (error: any) {
      setError(error.message || 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Simplified logout function
  const logout = useCallback(async () => {
    try {
      setError(null)
      setUser(null)
      
      // Clear local storage
      localStorage.clear()
      sessionStorage.setItem('justLoggedOut', 'true')
      
      // Use NextAuth signOut
      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      })
      
      // Call our complete signout endpoint
      try {
        await fetch('/api/auth/signout-complete', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.warn('Complete signout endpoint failed:', error)
      }
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error: any) {
      console.error('Logout error:', error)
      setError(error.message || 'Logout failed')
      
      // Fallback: Force reload
      localStorage.clear()
      sessionStorage.clear()
      sessionStorage.setItem('justLoggedOut', 'true')
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }, [])

  // Optional wallet connection (if enabled)
  const connectWallet = useCallback(async () => {
    if (!providers.includes('wallet')) {
      setError('Wallet authentication not enabled')
      return
    }
    
    try {
      setError(null)
      // Implementation would go here for wallet connection
      // For now, just log that it's not implemented
      console.log('Wallet connection not implemented in simplified provider')
      setError('Wallet connection coming soon')
    } catch (error: any) {
      setError(error.message || 'Wallet connection failed')
    }
  }, [providers])

  const value: DiligenceAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    connectWallet: providers.includes('wallet') ? connectWallet : undefined,
    error
  }

  return (
    <DiligenceAuthContext.Provider value={value}>
      {children}
    </DiligenceAuthContext.Provider>
  )
}

// Hook to use the auth context
export function useDiligenceAuth() {
  const context = useContext(DiligenceAuthContext)
  if (context === undefined) {
    throw new Error('useDiligenceAuth must be used within a DiligenceAuthProvider')
  }
  return context
}

// Backwards compatibility hook that mimics the old unified auth
export function useUnifiedAuth() {
  const context = useDiligenceAuth()
  return {
    user: context.user,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    logout: context.logout
  }
}