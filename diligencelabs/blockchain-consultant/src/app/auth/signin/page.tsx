"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
import { Logo } from "@/components/ui/logo"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

function SignInContent() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

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
    
    if (redirect === 'book-consultation') {
      router.push('/dashboard/book-consultation')
    } else if (redirect === 'subscription') {
      if (planId) {
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
  }, [])

  // Check if user is already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      handlePostAuthRedirect()
    }
  }, [session, status, router, searchParams])

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

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Redirect will be handled by useEffect when session updates
        handlePostAuthRedirect()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth sign in
  const handleGoogleSignIn = async () => {
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

      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error("Google sign in error:", error)
      setError("Google sign in failed. Please try again.")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      <DynamicPageBackground variant="auth" opacity={0.25} />
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 sm:p-8">
        <div className={`transition-all duration-1000 ${isPageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <Logo size="large" />
        </div>
      </nav>

      <ProminentBorder 
        className={`w-full max-w-lg relative z-10 rounded-2xl overflow-hidden transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
        animated={true}
      >
        <Card className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-4">
              <Logo size="xl" href={null} />
            </div>
            <CardTitle className="text-3xl font-light mb-2 text-white">
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

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full mb-6 h-12 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">🌐</span>
                <span className="font-medium">Continue with Google</span>
              </div>
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

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
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12 transition-all duration-200 hover:border-gray-500"
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
                          className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12 transition-all duration-200 hover:border-gray-500"
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
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
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
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </ProminentBorder>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}