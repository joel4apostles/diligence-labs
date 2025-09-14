"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'
import { ErrorBoundary } from '@/components/error-boundary'

export function DiligencePrivyProvider({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  // If no proper Privy app ID is configured, just return children without Privy
  if (!privyAppId || privyAppId === "your-app-id" || privyAppId === "disabled-for-admin") {
    console.log('Privy disabled: No valid app ID configured')
    return <>{children}</>
  }

  try {
    return (
      <ErrorBoundary fallback={<>{children}</>}>
        <PrivyProvider
          appId={privyAppId}
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
            // Configure embeddedWallet
            embeddedWallet: {
                createOnLogin: 'users-without-wallets',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('PrivyProvider failed to initialize:', error)
    // Fallback to render children without Privy if initialization fails
    return <>{children}</>
  }
}