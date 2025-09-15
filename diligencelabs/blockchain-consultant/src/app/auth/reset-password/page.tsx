"use client"

import { useState, useEffect, Suspense } from "react"
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
  const [isPageLoaded, setIsPageLoaded] = useState(false)
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
    setIsPageLoaded(true)
    
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

      setSuccess('Password reset successfully! You can now sign in with your new password.')
      
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
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <DynamicPageBackground variant="auth" opacity={0.25} />
        <PageStructureLines />
        <FormGridLines />
        <ParallaxBackground />
        <FloatingElements />

        <ProminentBorder 
          className={`w-full max-w-lg relative z-10 rounded-2xl overflow-hidden transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
          animated={true}
        >
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border-0">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-light mb-4 text-red-400">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-gray-400">
                The password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Link href="/auth/unified-signin">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </ProminentBorder>
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
              <div className="text-2xl font-bold text-white">
                Diligence Labs
              </div>
            </div>
            <CardTitle className="text-2xl font-light mb-4">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-4 rounded-lg backdrop-blur mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 text-sm p-4 rounded-lg backdrop-blur mb-6">
                {success}
              </div>
            )}

            {!success && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Confirm your new password" 
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
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="text-center text-sm text-gray-400 mt-6">
              Remember your password?{" "}
              <Link href="/auth/unified-signin" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </ProminentBorder>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}