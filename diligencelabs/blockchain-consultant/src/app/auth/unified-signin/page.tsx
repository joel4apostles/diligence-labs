"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, useSession, getProviders } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
  const [isLoading, setIsLoading] = useState<string | false>(false)
  const [error, setError] = useState<string | null>(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [providers, setProviders] = useState<any>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
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
      router.push('/dashboard/book-consultation')
    } else if (redirect === 'subscription') {
      const pendingForm = localStorage.getItem('pendingSubscriptionForm')
      if (pendingForm && planId) {
        router.push(`/?subscription=${planId}&pending=true`)
      } else if (planId) {
        router.push(`/?subscription=${planId}`)
      } else {
        router.push('/#subscription')
      }
    } else {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    setIsPageLoaded(true)
    
    // Get OAuth providers
    getProviders().then((providers) => {
      setProviders(providers)
    })
  }, [])

  // Authentication check to prevent redirect loops
  useEffect(() => {
    console.log('Login page auth check:', { 
      status, 
      hasSession: !!session, 
      sessionUserId: session?.user?.id
    })
    
    if (status === "loading") {
      return
    }
    
    // Only redirect if we have a valid session
    if (status === "authenticated" && session?.user?.id) {
      console.log('Valid session found, redirecting...', session.user.id)
      sessionStorage.removeItem('justLoggedOut')
      handlePostAuthRedirect()
    } else {
      // Check if user just logged out
      const justLoggedOut = sessionStorage.getItem('justLoggedOut')
      if (justLoggedOut && status === "unauthenticated") {
        console.log('User just logged out, clearing flag and staying on login page')
        sessionStorage.removeItem('justLoggedOut')
        return
      }
      console.log('No valid authentication found, staying on login page')
    }
  }, [session, status, router, searchParams])

  // OAuth sign in handler
  const handleOAuthSignIn = async (providerId: string) => {
    setIsLoading(providerId)
    setError(null)
    
    try {
      const result = await signIn(providerId, {
        redirect: false,
        callbackUrl: '/dashboard'
      })
      
      if (result?.error) {
        setError(`${providerId} authentication failed. Please try again.`)
      }
    } catch (error) {
      console.error(`${providerId} auth error:`, error)
      setError(`Failed to authenticate with ${providerId}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  // Email/password sign in handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading("credentials")
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <DynamicPageBackground variant="auth" opacity={0.3} />
      <PageStructureLines />
      
      <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center min-h-screen">
        <div className={`w-full max-w-md transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader className="text-center space-y-4 pb-8">
                  <CardTitle className="text-3xl font-light">
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      Welcome Back
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Sign in to access your dashboard
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* OAuth Providers */}
                  <div className="space-y-3">
                    {providers && Object.values(providers)
                      .filter((provider: any) => provider.id !== 'credentials')
                      .map((provider: any) => (
                        <Button
                          key={provider.id}
                          onClick={() => handleOAuthSignIn(provider.id)}
                          disabled={!!isLoading}
                          className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-600 hover:border-gray-500 transition-all duration-300"
                        >
                          {isLoading === provider.id ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Connecting...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{getProviderIcon(provider.id)}</span>
                              <span>Continue with {getProviderName(provider.id)}</span>
                            </div>
                          )}
                        </Button>
                      ))
                    }
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-2 text-gray-400">Or</span>
                    </div>
                  </div>

                  {/* Email/Password Toggle */}
                  {!showEmailForm ? (
                    <Button
                      onClick={() => setShowEmailForm(true)}
                      variant="outline"
                      className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📧</span>
                        <span>Continue with Email & Password</span>
                      </div>
                    </Button>
                  ) : (
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
                                  placeholder="your@email.com"
                                  type="email"
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-400"
                                  {...field}
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
                                  type="password"
                                  placeholder="••••••••"
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center justify-between text-sm">
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => setShowEmailForm(false)}
                            className="text-gray-400 hover:text-orange-400 p-0"
                          >
                            ← Back to OAuth
                          </Button>
                          <Link
                            href="/auth/forgot-password"
                            className="text-gray-400 hover:text-orange-400 transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <Button
                          type="submit"
                          disabled={!!isLoading}
                          className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300"
                        >
                          {isLoading === "credentials" ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Signing in...</span>
                            </div>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-gray-400">
                      Don't have an account?{" "}
                      <Link
                        href="/auth/signup"
                        className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ProminentBorder>
        </div>
      </div>
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