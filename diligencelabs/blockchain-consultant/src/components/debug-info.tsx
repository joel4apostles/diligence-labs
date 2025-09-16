"use client"

import { useEffect, useState } from 'react'

export function DebugInfo() {
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setMounted(true)
    
    // Collect debug information
    const info = {
      environment: process.env.NODE_ENV,
      walletConnectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.substring(0, 8) + '...',
      privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID?.substring(0, 8) + '...',
      isClient: typeof window !== 'undefined',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      timestamp: new Date().toISOString()
    }
    
    setDebugInfo(info)
    console.log('🔍 Debug Info:', info)
  }, [])

  if (!mounted) {
    return null // Avoid hydration mismatch
  }

  // Only show in development or if there's an error
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Info</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}