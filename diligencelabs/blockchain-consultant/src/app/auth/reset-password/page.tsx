"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Logo } from "@/components/ui/logo"
import { AuthErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading, LoadingSpinner } from "@/components/ui/loading-states"
import { 
  PageWrapper, 
  GlassMorphismCard,
  theme,
  animations
} from "@/components/ui/consistent-theme"

const formSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess('Password reset successfully! Redirecting to sign in...')
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/auth/unified-signin')
      }, 3000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
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
                <Card className="bg-transparent border-0 shadow-2xl">
                  <CardHeader className="space-y-1 text-center pb-6">
                    <motion.div 
                      {...animations.fadeIn}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="flex justify-center mb-4"
                    >
                      <Logo size="xl" href={null} />
                    </motion.div>
                    
                    <CardTitle className="text-3xl font-light mb-2">
                      <span className="bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent">
                        Invalid Reset Link
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      The password reset link is invalid or has expired.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-8 pb-8">
                    <Link href="/auth/forgot-password">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:brightness-110 mb-4">
                          Request New Reset Link
                        </Button>
                      </motion.div>
                    </Link>
                    
                    <Link href="/auth/unified-signin">
                      <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                        Back to Sign In
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </GlassMorphismCard>
            </motion.div>
          </div>
        </PageWrapper>
      </AuthErrorBoundary>
    )
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
              <Card className="bg-transparent border-0 shadow-2xl">
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
                    <CardTitle className="text-3xl font-light mb-2">
                      <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                        Set New Password
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      Enter your new password below
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

                  {success && (
                    <motion.div 
                      {...animations.slideUp}
                      className="bg-green-500/10 border border-green-500/20 text-green-300 text-sm p-4 rounded-xl backdrop-blur mb-6"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{success}</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    {...animations.slideUp}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">New Password</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your new password"
                                  type="password"
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12 transition-all duration-200 hover:border-gray-500"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Confirm your new password"
                                  type="password"
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12 transition-all duration-200 hover:border-gray-500"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            disabled={isLoading || success !== null}
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:brightness-110 disabled:opacity-70"
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <LoadingSpinner size="sm" color="white" />
                                <span>Resetting Password...</span>
                              </div>
                            ) : success ? (
                              <span>Redirecting...</span>
                            ) : (
                              <span className="font-medium">Reset Password</span>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>

                    <motion.div 
                      {...animations.fadeIn}
                      transition={{ duration: 0.6, delay: 1.1 }}
                      className="flex items-center justify-center text-sm mt-6"
                    >
                      <Link
                        href="/auth/unified-signin"
                        className="text-orange-400 hover:text-orange-300 transition-colors duration-300"
                      >
                        ← Back to Sign In
                      </Link>
                    </motion.div>
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

export default function ResetPassword() {
  return (
    <Suspense fallback={<PageLoading message="Loading reset page..." showLogo={true} />}>
      <ResetPasswordContent />
    </Suspense>
  )
}