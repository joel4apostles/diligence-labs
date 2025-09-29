"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Logo } from "@/components/ui/logo"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"
import { AuthErrorBoundary } from "@/components/ui/error-boundary"
import { PageLoading, LoadingSpinner } from "@/components/ui/loading-states"
import { 
  PageWrapper, 
  GlassMorphismCard, 
  FloatingOrb,
  theme,
  animations
} from "@/components/ui/consistent-theme"
import { motion } from "framer-motion"
import { formTheme } from "@/lib/form-theme"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SignUp() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [passwordStrengthError, setPasswordStrengthError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setPasswordStrengthError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        
        // Show success message with email verification reminder
        if (data.emailVerificationSent) {
          setError(null)
          // Redirect to login with email verification message
          setTimeout(() => {
            router.push("/auth/unified-signin?message=check-email")
          }, 3000)
        } else {
          setTimeout(() => {
            router.push("/auth/unified-signin")
          }, 2000)
        }
      } else {
        const data = await response.json()
        if (data.passwordStrength && data.failedRequirements) {
          setPasswordStrengthError(`Password security requirements not met: ${data.failedRequirements.join(', ')}`)
        } else if (data.message?.includes('already exists')) {
          setError('An account with this email already exists. Try logging in instead.')
        } else {
          setError(data.message || "Registration failed")
        }
      }
    } catch (error) {
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthErrorBoundary>
        <PageWrapper>
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              {...animations.fadeIn}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md"
            >
              <GlassMorphismCard variant="accent" hover={false}>
                <Card className={`${formTheme.card.base}`}>
                  <CardContent className="pt-8 pb-8 text-center">
                    <motion.div 
                      {...animations.slideUp}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="space-y-4"
                    >
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        className="text-green-400 text-6xl mb-6"
                      >
                        ✓
                      </motion.div>
                      <h2 className="text-2xl font-light mb-2">
                        Account <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Created</span> Successfully!
                      </h2>
                      <p className="text-gray-400 text-lg">
                        Redirecting you to sign in...
                      </p>
                      <div className="flex justify-center mt-6">
                        <LoadingSpinner size="lg" color="primary" />
                      </div>
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
            className="w-full max-w-md"
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
                      Join Our Platform
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      Create your account to get started
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  {error && (
                    <motion.div 
                      {...animations.slideUp}
                      className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-4 rounded-xl backdrop-blur"
                      role="alert"
                      aria-live="polite"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {passwordStrengthError && (
                    <motion.div 
                      {...animations.slideUp}
                      className="bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm p-4 rounded-xl backdrop-blur"
                      role="alert"
                      aria-live="polite"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>{passwordStrengthError}</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    {...animations.slideUp}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formTheme.label.base}>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        className={formTheme.input.base}
                        placeholder="Enter your full name" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className={formTheme.formMessage.error} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formTheme.label.base}>Email</FormLabel>
                    <FormControl>
                      <Input 
                        className={formTheme.input.base}
                        placeholder="Enter your email" 
                        type="email" 
                        {...field} 
                        disabled={isLoading}
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
                        className={formTheme.input.base}
                        placeholder="Create a secure password" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className={formTheme.formMessage.error} />
                    {field.value && (
                      <PasswordStrengthIndicator
                        password={field.value}
                        email={form.watch('email')}
                        className="mt-3"
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formTheme.label.base}>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        className={formTheme.input.base}
                        placeholder="Confirm your password" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
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
                            className={`w-full h-12 ${formTheme.button.primary} rounded-lg disabled:opacity-70 flex items-center justify-center`}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <LoadingSpinner size="sm" color="white" />
                                <span className="ml-2">Creating account...</span>
                              </>
                            ) : (
                              "Create account"
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>

                  <motion.div 
                    {...animations.fadeIn}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    className="text-center text-sm text-gray-400"
                  >
                    Already have an account?{" "}
                    <Link href="/auth/unified-signin" className="text-orange-400 hover:text-orange-300 transition-colors duration-300">
                      Sign in
                    </Link>
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