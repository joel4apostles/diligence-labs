"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePrivy } from "@privy-io/react-auth"

interface UnifiedUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  role?: string
  walletAddress?: string | null
  authProvider: 'nextauth' | 'privy'
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined)

export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession()
  const { ready: privyReady, authenticated: privyAuthenticated, user: privyUser, logout: privyLogout } = usePrivy()
  const [user, setUser] = useState<UnifiedUser | null>(null)

  useEffect(() => {
    console.log('UnifiedAuth state update:', {
      nextAuthStatus,
      hasNextAuthSession: !!nextAuthSession,
      nextAuthUserId: nextAuthSession?.user?.id,
      privyReady,
      privyAuthenticated,
      privyUserId: privyUser?.id,
      currentUser: user?.id
    })

    // Priority: NextAuth first (more reliable for traditional login), then Privy for Web3
    if (nextAuthStatus === 'authenticated' && nextAuthSession?.user) {
      console.log('Setting NextAuth user:', nextAuthSession.user.id)
      setUser({
        id: nextAuthSession.user.id,
        email: nextAuthSession.user.email || null,
        name: nextAuthSession.user.name || null,
        image: nextAuthSession.user.image || null,
        role: nextAuthSession.user.role,
        walletAddress: nextAuthSession.user.walletAddress,
        authProvider: 'nextauth'
      })
    } else if (privyReady && privyAuthenticated && privyUser && nextAuthStatus !== 'authenticated') {
      console.log('Setting Privy user:', privyUser.id)
      setUser({
        id: privyUser.id,
        email: privyUser.email?.address || null,
        name: privyUser.email?.address || privyUser.wallet?.address || null,
        image: null,
        walletAddress: privyUser.wallet?.address || null,
        authProvider: 'privy'
      })
    } else if (nextAuthStatus === 'unauthenticated' && (!privyReady || !privyAuthenticated)) {
      console.log('No authentication found, clearing user')
      setUser(null)
    }
  }, [nextAuthSession, nextAuthStatus, privyReady, privyAuthenticated, privyUser])

  const logout = async () => {
    console.log('Starting logout process...')
    
    // Clear user state immediately
    setUser(null)
    
    if (user?.authProvider === 'privy') {
      console.log('Logging out Privy user...')
      privyLogout()
      // For Privy, also clear storage and redirect
      localStorage.clear()
      sessionStorage.setItem('justLoggedOut', 'true')
      window.location.href = '/'
    } else {
      try {
        // Clear localStorage and set logout flag
        console.log('Clearing storage...')
        localStorage.clear()
        
        // Clear all cookies related to authentication first
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
          // Clear all possible NextAuth cookies
          if (name.includes('next-auth') || name.includes('session') || name.includes('csrf')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname};`
          }
        })
        
        // Set flag to prevent immediate redirect on login page
        sessionStorage.setItem('justLoggedOut', 'true')
        
        // Use NextAuth signOut to ensure server-side session is cleared
        console.log('Signing out NextAuth session...')
        await signOut({ 
          redirect: false,
          callbackUrl: '/'
        })
        
        // Call our complete signout endpoint to ensure all cookies are cleared
        try {
          await fetch('/api/auth/signout-complete', {
            method: 'POST',
            credentials: 'include'
          })
          console.log('Complete signout endpoint called')
        } catch (error) {
          console.error('Complete signout endpoint failed:', error)
        }
        
        // Force a complete page reload to ensure clean state
        console.log('Force reloading page to ensure clean state...')
        // Add a small delay to ensure all async operations complete
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
        
      } catch (error) {
        console.error('Logout error:', error)
        
        // Fallback: Force complete reload with cleared storage
        localStorage.clear()
        sessionStorage.clear()
        sessionStorage.setItem('justLoggedOut', 'true')
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
      }
    }
  }

  const isLoading = nextAuthStatus === 'loading' || !privyReady
  const isAuthenticated = Boolean(user)

  return (
    <UnifiedAuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      logout
    }}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider')
  }
  return context
}