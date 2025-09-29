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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/ui/logo"
import { AuthErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading, LoadingSpinner } from "@/components/ui/loading-states"
import { 
  PageWrapper, 
  GlassMorphismCard, 
  FloatingOrb,
  theme,
  animations
} from "@/components/ui/consistent-theme"
import { formTheme } from "@/lib/form-theme"
import { motion } from "framer-motion"

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
  const [activeTab, setActiveTab] = useState("social")
  const [selectedProvider, setSelectedProvider] = useState<string>("")
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

  // Privy setup with error handling
  let ready = false, authenticated = false, user = null, login = null
  
  try {
    const privyData = usePrivy()
    const loginData = useLogin({
      onComplete: ({ user, isNewUser, wasAlreadyAuthenticated }) => {
        console.log('🔥 Privy user authenticated!', { user, isNewUser, wasAlreadyAuthenticated })
        // Don't redirect immediately - let the useEffect handle it to prevent loops
      },
      onError: (error) => {
        console.error('Privy login error:', error)
        // Provide a more user-friendly error message
        const errorMessage = String(error) || 'Unknown error'
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setError("Network connection error. Please check your internet connection and try again.")
        } else if (errorMessage.includes('configuration') || errorMessage.includes('app')) {
          setError("Authentication service temporarily unavailable. Please try traditional email/password login.")
        } else {
          setError(`Web3 authentication failed: ${errorMessage}`)
        }
      }
    })
    
    ready = privyData.ready
    authenticated = privyData.authenticated
    user = privyData.user
    login = loginData.login
  } catch (error) {
    console.log('Privy hooks not available, wallet login disabled:', error)
    // Privy provider not available - wallet features will be disabled
  }

  useEffect(() => {
    setIsPageLoaded(true)
    
    // Handle URL messages
    const message = searchParams?.get('message')
    const verified = searchParams?.get('verified')
    
    if (message === 'check-email') {
      setError('Registration successful! Please check your email and verify your account before logging in.')
    } else if (verified === 'true') {
      setError('Email verified successfully! You can now log in to your account.')
    }
    
    // Check available OAuth providers
    getProviders().then(providers => {
      console.log('Available OAuth providers:', providers)
      console.log('Provider keys:', providers ? Object.keys(providers) : 'no providers')
      console.log('Non-credential providers:', providers ? Object.keys(providers).filter(key => key !== 'credentials') : 'none')
      setAvailableProviders(providers || {})
    }).catch(err => {
      console.log('Failed to fetch OAuth providers:', err)
      setAvailableProviders({})
    })
  }, [])

  // Unified authentication check to prevent redirect loops
  useEffect(() => {
    const justLoggedOut = sessionStorage.getItem('justLoggedOut')
    
    console.log('Login page auth check:', { 
      status, 
      ready, 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      authenticated, 
      privyUserId: user?.id,
      justLoggedOut: !!justLoggedOut
    })
    
    // If user just logged out, stay on login page regardless of session status
    if (justLoggedOut) {
      console.log('User just logged out, staying on login page and clearing flag')
      sessionStorage.removeItem('justLoggedOut')
      return
    }
    
    if (status === "loading" || !ready) {
      console.log('Still loading, waiting...')
      return
    }
    
    // Only redirect if we have a valid session and we're not currently in a loading state
    if (status === "authenticated" && session?.user?.id) {
      console.log('Valid NextAuth session found, redirecting immediately...', session.user.id)
      // Redirect immediately without delay
      handlePostAuthRedirect()
    } else if (authenticated && user?.id && status !== "authenticated") {
      // Only Privy authenticated, no NextAuth session - redirect
      console.log('Privy authenticated, no NextAuth session, redirecting immediately...', user.id)
      // Redirect immediately without delay  
      handlePostAuthRedirect()
    } else {
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
        // Provide user-friendly error messages
        const errorMessages: Record<string, string> = {
          'CredentialsSignin': 'Invalid email or password. Please check your credentials and try again.',
          'CallbackRouteError': 'Authentication failed. Please try again.',
          'SessionRequired': 'Please log in to continue.',
          'AccessDenied': 'Access denied. Please contact support if this continues.',
          'Verification': 'Please verify your email address before logging in.',
          'Account is temporarily locked': 'Account temporarily locked due to failed attempts. Check your email for a password reset link.',
          'Account locked': 'Account temporarily locked. Check your email for a password reset link.',
          'Please verify your email': 'Please verify your email address before logging in. Check your email for a verification link.'
        }
        
        let userFriendlyError = result.error
        
        // Find matching error message
        for (const [key, message] of Object.entries(errorMessages)) {
          if (result.error.includes(key) || result.error.toLowerCase().includes(key.toLowerCase())) {
            userFriendlyError = message
            break
          }
        }
        
        setError(userFriendlyError)
      } else if (result?.ok) {
        console.log("Credentials sign in successful")
        // Redirect immediately to dashboard
        handlePostAuthRedirect()
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
      console.log('Available providers:', availableProviders)
      
      // Check if provider is actually available
      if (!availableProviders || !availableProviders[provider]) {
        setError(`${provider} authentication is not configured. Please contact support.`)
        setOAuthLoading(false)
        return
      }
      
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

      console.log(`Attempting to sign in with ${provider}, callback: ${callbackUrl}`)

      const result = await signIn(provider, { 
        callbackUrl,
        redirect: false 
      })
      
      console.log(`OAuth result for ${provider}:`, result)
      
      if (result?.error) {
        setError(`OAuth sign in failed: ${result.error}`)
      } else if (result?.ok) {
        // Successful authentication - redirect manually after a brief delay to ensure session is set
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 100)
      } else {
        setError(`${provider} authentication failed. Please try again or use email/password login.`)
      }
    } catch (error) {
      console.error("OAuth error:", error)
      setError(`${provider} authentication failed. Please try again or use email/password login.`)
    } finally {
      setOAuthLoading(false)
    }
  }

  // Privy login handler
  const handlePrivyLogin = () => {
    setError(null)
    if (login) {
      login()
    } else {
      setError("Web3 wallet authentication is temporarily unavailable. Please try email/password login.")
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
      case 'web3-wallet':
        return '🔗'
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
    <AuthErrorBoundary>
      <PageWrapper>
        {/* Navigation */}
        <motion.nav 
          {...animations.slideDown}
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 sm:p-8"
        >
          <Logo size="large" />
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-all duration-300 backdrop-blur-sm"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.nav>

        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            {...animations.fadeIn}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <GlassMorphismCard variant="primary" hover={true}>
              <Card className={`${formTheme.card.base} shadow-2xl`}>
                <CardHeader className="space-y-1 text-center pb-6">
                  <motion.div 
                    {...animations.fadeIn}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex justify-center mb-4"
                  >
                    <Logo size="xl" href={null} />
                  </motion.div>
                  <motion.div 
                    {...animations.slideUp}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <CardTitle className="text-3xl font-light mb-2 text-white">
                      Welcome Back
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      Sign in to continue to your dashboard
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  {error && (
                    <motion.div 
                      {...animations.slideUp}
                      className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-4 rounded-xl backdrop-blur mb-6"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    {...animations.slideUp}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-800/30 border border-gray-700/50 rounded-lg p-1 mb-6 backdrop-blur-sm">
                        <TabsTrigger 
                          value="social" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 transition-all duration-300 hover:text-gray-200"
                        >
                          Social Login
                        </TabsTrigger>
                        <TabsTrigger 
                          value="traditional" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 transition-all duration-300 hover:text-gray-200"
                        >
                          Email & Password
                        </TabsTrigger>
                      </TabsList>

            <TabsContent value="social" className="space-y-6">
              {/* Social Login Dropdown */}
              {availableProviders && Object.keys(availableProviders)
                .filter((key) => key !== 'credentials')
                .length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-400 mb-4">
                    Choose your preferred social login method
                  </div>
                  
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className={`w-full h-12 ${formTheme.select.trigger} focus:border-blue-500 focus:ring-blue-500`}>
                      <SelectValue placeholder="Select a sign-in method" />
                    </SelectTrigger>
                    <SelectContent className={formTheme.select.content}>
                      {Object.entries(availableProviders)
                        .filter(([key, provider]: [string, any]) => key !== 'credentials')
                        .map(([key, provider]: [string, any]) => (
                          <SelectItem 
                            key={provider.id} 
                            value={provider.id}
                            className={formTheme.select.item}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getProviderIcon(provider.id)}</span>
                              <span>Continue with {getProviderName(provider.id)}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                      {ready && (
                        <SelectItem 
                          key="web3-wallet" 
                          value="web3-wallet"
                          className={formTheme.select.item}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🔗</span>
                            <span>Connect Web3 Wallet</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {selectedProvider && (
                    <motion.div
                      {...animations.fadeIn}
                      transition={{ duration: 0.4 }}
                    >
                      <Button
                        onClick={() => selectedProvider === 'web3-wallet' ? handlePrivyLogin() : handleOAuthSignIn(selectedProvider)}
                        disabled={!!oAuthLoading}
                        className={`w-full h-12 ${formTheme.button.primary} transform hover:scale-[1.02] disabled:opacity-70`}
                      >
                        {oAuthLoading === selectedProvider ? (
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="sm" color="white" />
                            <span>Connecting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getProviderIcon(selectedProvider)}</span>
                            <span className="font-medium">
                              {selectedProvider === 'web3-wallet' ? 'Connect Web3 Wallet' : `Sign in with ${getProviderName(selectedProvider)}`}
                            </span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-600/30 bg-gray-800/20 rounded-lg">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="font-semibold mb-2 text-white">Social Login Temporarily Unavailable</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Social login providers are being configured. Please use email/password or Web3 wallet login.
                  </p>
                  <p className="text-xs text-gray-500">
                    For developers: Configure OAuth credentials in your .env file
                  </p>
                </div>
              )}

              {ready && authenticated && selectedProvider === 'web3-wallet' && (
                <div className="text-center py-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
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
            </TabsContent>

            <TabsContent value="traditional" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={formTheme.label.base}>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            className={`${formTheme.input.base} h-12 transition-all duration-200 hover:border-gray-500`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className={formTheme.formMessage.error} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={formTheme.label.base}>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className={`${formTheme.input.base} h-12 transition-all duration-200 hover:border-gray-500`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className={formTheme.formMessage.error} />
                      </FormItem>
                    )}
                  />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full h-12 ${formTheme.button.primary} disabled:opacity-70`}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="sm" color="white" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <span className="font-medium">Sign In</span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>

              <motion.div 
                {...animations.fadeIn}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="flex items-center justify-between text-sm mt-6"
              >
                <Link
                  href="/auth/forgot-password"
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-300"
                >
                  Forgot password?
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-300"
                >
                  Create account
                </Link>
              </motion.div>
                    </TabsContent>
                  </Tabs>
                  </motion.div>
                </CardContent>
              </Card>
            </GlassMorphismCard>
          </motion.div>
        </div>
      </PageWrapper>
    </AuthErrorBoundary>
  )
}

export default function UnifiedSignInPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading sign in..." showLogo={true} />}>
      <UnifiedSignInContent />
    </Suspense>
  )
}