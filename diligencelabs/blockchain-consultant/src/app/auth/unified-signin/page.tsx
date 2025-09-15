"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession, useSession, getProviders } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { usePrivy, useLogin } from "@privy-io/react-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FloatingElements } from "@/components/ui/animated-background"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

function UnifiedSignInContent() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [availableProviders, setAvailableProviders] = useState<any>(null)
  const [oAuthLoading, setOAuthLoading] = useState<string | false>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // NextAuth form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Helper function to handle post-auth redirect
  const handlePostAuthRedirect = () => {
    const redirect = searchParams?.get('redirect')
    const planId = searchParams?.get('plan')
    
    console.log('Handling post-auth redirect:', { redirect, planId })
    
    if (redirect === 'book-consultation') {
      console.log('Redirecting to book consultation')
      router.push('/dashboard/book-consultation')
    } else if (redirect === 'subscription') {
      // Check if there's a pending subscription form
      const pendingForm = localStorage.getItem('pendingSubscriptionForm')
      if (pendingForm && planId) {
        // Redirect back to home with subscription form
        console.log('Redirecting to home with subscription form')
        router.push(`/?subscription=${planId}&pending=true`)
      } else if (planId) {
        console.log('Redirecting to home with plan ID')
        router.push(`/?subscription=${planId}`)
      } else {
        console.log('Redirecting to subscription section')
        router.push('/#subscription')
      }
    } else {
      console.log('Redirecting to dashboard (default)')
      router.push('/dashboard')
    }
  }

  // Privy setup
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log('🔥 Privy user authenticated!', { user, isNewUser, wasAlreadyAuthenticated })
      // Don't redirect immediately - let the useEffect handle it to prevent loops
    },
    onError: (error) => {
      console.error('Privy login error:', error)
      // Provide a more user-friendly error message
      const errorMessage = error?.message || 'Unknown error'
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError("Network connection error. Please check your internet connection and try again.")
      } else if (errorMessage.includes('configuration') || errorMessage.includes('app')) {
        setError("Authentication service temporarily unavailable. Please try traditional email/password login.")
      } else {
        setError(`Web3 authentication failed: ${errorMessage}`)
      }
    }
  })

  useEffect(() => {
    setIsPageLoaded(true)
    
    // Check available OAuth providers
    getProviders().then(providers => {
      console.log('Available OAuth providers:', providers)
      setAvailableProviders(providers)
    }).catch(err => {
      console.log('Failed to fetch OAuth providers:', err)
      setAvailableProviders({})
    })
  }, [])

  // Unified authentication check to prevent redirect loops
  useEffect(() => {
    console.log('Login page auth check:', { 
      status, 
      ready, 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      authenticated, 
      privyUserId: user?.id 
    })
    
    if (status === "loading" || !ready) {
      console.log('Still loading, waiting...')
      return
    }
    
    // Only redirect if we have a valid session and we're not currently in a loading state
    if (status === "authenticated" && session?.user?.id) {
      console.log('Valid NextAuth session found, redirecting...', session.user.id)
      // Clear any logout flags since we have a valid session
      sessionStorage.removeItem('justLoggedOut')
      // Add a small delay to show the success state before redirecting
      setTimeout(() => handlePostAuthRedirect(), 1000)
    } else if (authenticated && user?.id && status !== "authenticated") {
      // Only Privy authenticated, no NextAuth session - redirect
      console.log('Privy authenticated, no NextAuth session, redirecting...', user.id)
      sessionStorage.removeItem('justLoggedOut')
      // Add a small delay to show the success state before redirecting
      setTimeout(() => handlePostAuthRedirect(), 1000)
    } else {
      // Check if user just logged out (prevent immediate redirect only when no valid session)
      const justLoggedOut = sessionStorage.getItem('justLoggedOut')
      if (justLoggedOut && status === "unauthenticated") {
        console.log('User just logged out and has no valid session, clearing flag and staying on login page')
        sessionStorage.removeItem('justLoggedOut')
        return
      }
      console.log('No valid authentication found, staying on login page')
    }
  }, [session, status, ready, authenticated, user, router, searchParams])

  // Email/password form submit
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      console.log("Credentials sign in result:", result)

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        console.log("Credentials sign in successful")
        // The useEffect will handle the redirect when the session updates
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // OAuth sign in handler
  const handleOAuthSignIn = async (provider: string) => {
    setOAuthLoading(provider)
    setError(null)

    try {
      console.log(`Starting ${provider} OAuth sign in...`)
      
      const redirect = searchParams?.get('redirect')
      const planId = searchParams?.get('plan')
      
      let callbackUrl = '/dashboard'
      
      if (redirect === 'book-consultation') {
        callbackUrl = '/dashboard/book-consultation'
      } else if (redirect === 'subscription' && planId) {
        callbackUrl = `/?subscription=${planId}`
      } else if (redirect === 'subscription') {
        callbackUrl = '/#subscription'
      }

      const result = await signIn(provider, { 
        callbackUrl,
        redirect: false 
      })
      
      if (result?.error) {
        setError(`OAuth sign in failed: ${result.error}`)
      } else if (result?.ok) {
        // Successful authentication - redirect manually after a brief delay to ensure session is set
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 100)
      }
    } catch (error) {
      console.error("OAuth error:", error)
      setError("OAuth sign in failed")
    } finally {
      setOAuthLoading(false)
    }
  }

  // Privy login handler
  const handlePrivyLogin = () => {
    setError(null)
    login()
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return '🌐'
      case 'twitter':
        return '🐦'
      case 'github':
        return '👨‍💻'
      default:
        return '🔑'
    }
  }

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'Google'
      case 'twitter':
        return 'X (Twitter)'
      case 'github':
        return 'GitHub'
      default:
        return providerId.charAt(0).toUpperCase() + providerId.slice(1)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Auth Background */}
      <DynamicPageBackground variant="auth" opacity={0.25} />
      
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 sm:p-8">
        <Link href="/" className={`font-bold text-2xl transition-all duration-1000 ${isPageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          Diligence Labs
        </Link>
      </nav>

      <ProminentBorder 
        className={`w-full max-w-lg relative z-10 rounded-2xl overflow-hidden transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
        animated={true}
      >
        <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-white">
              Diligence Labs
            </div>
          </div>
          <CardTitle className="text-3xl font-light mb-2">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-4 rounded-xl backdrop-blur mb-6 animate-in slide-in-from-top-2">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Single Dropdown for All Sign-in Options */}
          <div className="space-y-4">

            {/* OAuth Providers */}
            {availableProviders && Object.values(availableProviders)
              .filter((provider: any) => provider.id !== 'credentials')
              .length > 0 && (
              <div className="space-y-3">
                {Object.values(availableProviders)
                  .filter((provider: any) => provider.id !== 'credentials')
                  .map((provider: any) => (
                    <Button
                      key={provider.id}
                      onClick={() => handleOAuthSignIn(provider.id)}
                      disabled={!!oAuthLoading}
                      className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                    >
                      {oAuthLoading === provider.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getProviderIcon(provider.id)}</span>
                          <span className="font-medium">Continue with {getProviderName(provider.id)}</span>
                        </div>
                      )}
                    </Button>
                  ))
                }
              </div>
            )}

              {/* Web3 Wallet Sign-In */}
              {!ready && (
                <div className="flex items-center justify-center py-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-400">Initializing Web3...</span>
                  </div>
                </div>
              )}

            {ready && !authenticated && (
              <div className="space-y-3">
                {/* Divider if OAuth providers exist */}
                {availableProviders && Object.values(availableProviders).filter((provider: any) => provider.id !== 'credentials').length > 0 && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-3 text-gray-500">or</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handlePrivyLogin}
                  className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔗</span>
                    <span className="font-medium">Connect Web3 Wallet</span>
                  </div>
                </Button>
              </div>
            )}

            {ready && authenticated && (
              <div className="text-center py-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-green-400 font-medium">Wallet Connected</div>
                  <div className="text-sm text-gray-400 font-mono bg-gray-800/50 px-3 py-1 rounded-lg">
                    {user?.wallet?.address ? 
                      `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
                      'Connected'
                    }
                  </div>
                  <div className="text-xs text-gray-500">Redirecting to dashboard...</div>
                </div>
              </div>
            )}
            
            {/* Email/Password Form */}
            <div className="relative">
              {availableProviders && Object.values(availableProviders).filter((provider: any) => provider.id !== 'credentials').length > 0 && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-3 text-gray-500">or continue with email</span>
                  </div>
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400 h-12 transition-all duration-200 hover:border-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400 h-12 transition-all duration-200 hover:border-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="font-medium">Sign In</span>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="flex items-center justify-between text-sm mt-6">
                <Link
                  href="/auth/forgot-password"
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Forgot password?
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      </ProminentBorder>
    </div>
  )
}

export default function UnifiedSignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <UnifiedSignInContent />
    </Suspense>
  )
}