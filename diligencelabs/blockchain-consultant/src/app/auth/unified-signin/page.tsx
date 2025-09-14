"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [activeTab, setActiveTab] = useState("web3")
  const [availableProviders, setAvailableProviders] = useState<string[]>([])
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
    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(providers => {
        console.log('Available providers:', providers)
        const providerIds = Object.keys(providers).filter(id => id !== 'credentials')
        console.log('Filtered provider IDs:', providerIds)
        setAvailableProviders(providerIds)
      })
      .catch(err => {
        console.log('Failed to fetch providers:', err)
        setAvailableProviders([])
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
      handlePostAuthRedirect()
    } else if (authenticated && user?.id && status !== "authenticated") {
      // Only Privy authenticated, no NextAuth session - redirect
      console.log('Privy authenticated, no NextAuth session, redirecting...', user.id)
      sessionStorage.removeItem('justLoggedOut')
      handlePostAuthRedirect()
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

  // NextAuth login handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
        setIsLoading(false)
      } else if (result?.ok) {
        // Give NextAuth a moment to set the session
        setTimeout(async () => {
          const session = await getSession()
          if (session?.user?.role === "ADMIN") {
            router.push("/admin/dashboard")
          } else {
            handlePostAuthRedirect()
          }
        }, 100)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during sign in")
      setIsLoading(false)
    }
  }

  // OAuth handler
  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
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
      setIsLoading(false)
    }
  }

  // Privy login handler
  const handlePrivyLogin = () => {
    setError(null)
    login()
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
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Diligence Labs
            </div>
          </div>
          <CardTitle className="text-2xl font-light mb-4">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-4 rounded-lg backdrop-blur mb-6">
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1 mb-8">
              <TabsTrigger 
                value="web3" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                Web3 & Social
              </TabsTrigger>
              <TabsTrigger 
                value="traditional" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                Email & Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="web3" className="space-y-6">
              {!ready && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading Web3 authentication...</p>
                </div>
              )}

              {ready && !authenticated && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-400 text-sm">
                      Connect with your crypto wallet or email
                    </p>
                  </div>

                  <Button 
                    onClick={handlePrivyLogin}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connecting..." : "Connect Wallet or Email"}
                  </Button>

                  {availableProviders.length > 0 && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-gray-900 px-3 text-gray-400">Or continue with</span>
                        </div>
                      </div>

                      <div className={`grid gap-4 ${availableProviders.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {availableProviders.includes('google') && (
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                            onClick={() => handleOAuthSignIn("google")}
                            disabled={isLoading}
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                          </Button>
                        )}
                        {availableProviders.includes('twitter') && (
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                            onClick={() => handleOAuthSignIn("twitter")}
                            disabled={isLoading}
                          >
                            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            X
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                </div>
              )}

              {ready && authenticated && (
                <div className="text-center py-8">
                  <div className="text-green-400 text-4xl mb-4 animate-bounce">✓</div>
                  <p className="text-gray-400">Redirecting to dashboard...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="traditional" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            {...field} 
                            disabled={isLoading}
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
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
                            placeholder="Enter your password" 
                            type="password" 
                            {...field} 
                            disabled={isLoading}
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-gray-400 mt-4">
                <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                  Forgot your password?
                </Link>
              </div>

              {availableProviders.length > 0 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-3 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className={`grid gap-4 ${availableProviders.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {availableProviders.includes('google') && (
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>
                    )}
                    {availableProviders.includes('twitter') && (
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                        onClick={() => handleOAuthSignIn("twitter")}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X
                      </Button>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
        </Card>
      </ProminentBorder>
    </div>
  )
}

export default function UnifiedSignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    }>
      <UnifiedSignInContent />
    </Suspense>
  )
}