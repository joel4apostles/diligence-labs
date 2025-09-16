"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  
  // If no proper WalletConnect project ID is configured, just return children without wallet functionality
  if (!projectId || projectId === "your-project-id" || projectId === "disabled-for-admin") {
    console.log('WalletConnect disabled: No valid project ID configured')
    return <>{children}</>
  }

  // Create config only when we have a valid project ID
  const config = getDefaultConfig({
    appName: "Diligence Labs",
    projectId: projectId,
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true,
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}