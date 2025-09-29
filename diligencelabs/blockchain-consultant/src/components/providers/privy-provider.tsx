"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { ErrorBoundary } from '@/components/error-boundary'
import { useEffect, useState } from 'react'

export function DiligencePrivyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivyEnabled, setIsPrivyEnabled] = useState(false)
  const [hasError, setHasError] = useState(false)
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  useEffect(() => {
    // Check if Privy should be enabled
    if (!privyAppId || privyAppId === "your-app-id" || privyAppId === "disabled-for-admin") {
      console.log('Privy disabled: No valid app ID configured')
      return
    }

    // Additional validation for the app ID format
    if (!privyAppId.startsWith('cm') || privyAppId.length < 20) {
      console.log('Privy disabled: Invalid app ID format')
      return
    }

    // Enable Privy directly - let the SDK handle its own network requests and errors
    setIsPrivyEnabled(true)
    console.log('Privy enabled with app ID:', privyAppId.substring(0, 8) + '...')
  }, [privyAppId])

  // If Privy is not enabled or has errors, just return children
  if (!isPrivyEnabled || hasError) {
    return <>{children}</>
  }

  try {
    return (
      <ErrorBoundary fallback={<>{children}</>}>
        <PrivyProvider
          appId={privyAppId!}
          config={{
            // Customize Privy's appearance
            appearance: {
              theme: 'dark',
              accentColor: '#6366F1',
              logo: undefined,
            },
            // Configure login methods
            // Note: Google and Twitter require proper OAuth configuration in Privy dashboard
            loginMethods: ['email', 'wallet'],
            // Configure supported wallets
            supportedChains: [mainnet, polygon, optimism, arbitrum, base],
            // Configure embeddedWallets
            embeddedWallets: {
                createOnLogin: 'users-without-wallets',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.warn('PrivyProvider failed to initialize:', error instanceof Error ? error.message : 'Unknown error')
    // Fallback to render children without Privy if initialization fails
    return <>{children}</>
  }
}