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
import { FloatingElements } from "@/components/ui/animated-background"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"

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
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/unified-signin")
        }, 2000)
      } else {
        const data = await response.json()
        if (data.passwordStrength && data.failedRequirements) {
          setPasswordStrengthError(`Password security requirements not met: ${data.failedRequirements.join(', ')}`)
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
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <FloatingElements />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full filter blur-3xl animate-pulse" />
        
        <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border border-gray-700">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-4">
              <div className="text-green-400 text-6xl mb-6 animate-bounce">✓</div>
              <h2 className="text-2xl font-light mb-2">
                Account <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Created</span> Successfully!
              </h2>
              <p className="text-gray-400 text-lg">
                Redirecting you to sign in...
              </p>
              <div className="flex justify-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Auth Background */}
      <DynamicPageBackground variant="auth" opacity={0.25} />
      
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />

      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 sm:p-8">
        <Link href="/" className={`font-bold text-2xl transition-all duration-1000 ${isPageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          Diligence Labs
        </Link>
      </nav>

      <ProminentBorder 
        className={`w-full max-w-md relative z-10 rounded-2xl overflow-hidden transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
        animated={true}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <div className="text-2xl font-bold text-white">
              Diligence Labs
            </div>
          </div>
          <CardTitle className="text-3xl font-light mb-2">
            Join Our Platform
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-4 rounded-lg backdrop-blur">
              {error}
            </div>
          )}
          
          {passwordStrengthError && (
            <div className="bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm p-4 rounded-lg backdrop-blur">
              {passwordStrengthError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        type="email" 
                        {...field} 
                        disabled={isLoading}
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Create a secure password" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Confirm your password" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
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
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
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