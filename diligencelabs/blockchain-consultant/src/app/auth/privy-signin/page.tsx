"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FloatingElements } from "@/components/ui/animated-background"

// Component that uses Privy hooks
function PrivySignInContent() {
  // Dynamically import Privy hooks to ensure they only run client-side
  const [PrivyHooks, setPrivyHooks] = useState<any>(null)

  useEffect(() => {
    import("@privy-io/react-auth").then((module) => {
      setPrivyHooks(module)
    })
  }, [])

  const router = useRouter()
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Only use Privy hooks once they're loaded
  const { ready, authenticated, user } = PrivyHooks?.usePrivy() || { ready: false, authenticated: false, user: null }
  const { login } = PrivyHooks?.useLogin({
    onComplete: (user: any, isNewUser: boolean, wasAlreadyAuthenticated: boolean) => {
      console.log('🔥 User authenticated!', { user, isNewUser, wasAlreadyAuthenticated })
      router.push('/dashboard')
    },
    onError: (error: any) => {
      console.error('Login error:', error)
    }
  }) || { login: () => {} }

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard')
    }
  }, [ready, authenticated, router])

  const handlePrivyLogin = () => {
    login()
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Floating Elements */}
      <FloatingElements />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Animated Background Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 sm:p-8">
        <Link href="/" className={`font-bold text-2xl transition-all duration-1000 ${isPageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          Diligence Labs
        </Link>
      </nav>

      <Card className={`w-full max-w-md relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border border-gray-700 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-light mb-2">
            Welcome <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Back</span>
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Sign in with your preferred method
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-8">
          {!PrivyHooks && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading authentication...</p>
            </div>
          )}

          {PrivyHooks && !ready && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading authentication...</p>
            </div>
          )}

          {PrivyHooks && ready && !authenticated && (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">
                  Connect with email, social accounts, or your crypto wallet
                </p>
              </div>

              <Button 
                onClick={handlePrivyLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105" 
                size="lg"
              >
                Sign in with Privy
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-3 text-gray-400">
                    Or use traditional login
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <Link href="/auth/unified-signin">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                    size="lg"
                  >
                    Email & Password
                  </Button>
                </Link>
              </div>
            </>
          )}

          {PrivyHooks && ready && authenticated && (
            <div className="text-center py-4">
              <div className="text-green-400 text-4xl mb-4 animate-bounce">✓</div>
              <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export the main component using dynamic import with no SSR
const PrivySignInPage = dynamic(() => Promise.resolve(PrivySignInContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading...</p>
      </div>
    </div>
  )
})

export default function PrivySignIn() {
  return <PrivySignInPage />
}