"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"

function CreateAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState(false)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (token) {
      validateToken(token)
    } else {
      setValidatingToken(false)
      setError('No invitation token provided')
    }
  }, [token])

  const validateToken = async (inviteToken: string) => {
    try {
      const response = await fetch(`/api/auth/create-from-invitation?token=${inviteToken}`)
      const data = await response.json()

      if (response.ok) {
        setTokenValid(true)
        setInvitationData(data)
        setFormData(prev => ({ ...prev, name: data.guestName || "" }))
      } else {
        setError(data.error || 'Invalid invitation token')
      }
    } catch (error) {
      setError('Failed to validate invitation')
    } finally {
      setValidatingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/create-from-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Account created successfully
        router.push('/verify-email?created=true')
      } else {
        setError(data.error || "Failed to create account")
      }
    } catch (error) {
      setError("An error occurred during account creation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <PageStructureLines />
        <FormGridLines />
        <ParallaxBackground />
        <FloatingElements />

        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <ProminentBorder className="rounded-2xl overflow-hidden" animated={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl">
                <Card className="bg-transparent border-0 relative z-10">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-400">Invalid Invitation</CardTitle>
                    <CardDescription className="text-gray-400 mt-2">{error}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Link href="/">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                          Return to Homepage
                        </Button>
                      </Link>
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader className="text-center pb-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Complete Your Account
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Create your account to manage your consultation
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {invitationData && (
                    <>
                      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="text-center">
                          <p className="text-blue-400 font-medium">Consultation Invitation</p>
                          <p className="text-gray-300 text-sm mt-1">
                            {invitationData.consultationType.replace('_', ' ')} • {invitationData.guestEmail}
                          </p>
                        </div>
                      </div>

                      <HorizontalDivider style="subtle" />
                    </>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-gray-300">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                          placeholder="Create a password (min. 8 characters)"
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? "Creating Account..." : "Create My Account"}
                    </Button>
                  </form>

                  <HorizontalDivider style="subtle" />

                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      Already have an account?{" "}
                      <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Sign in here
                      </Link>
                    </p>
                  </div>

                  <div className="text-center mt-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
                      ← Back to homepage
                    </Link>
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

export default function CreateAccount() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CreateAccountContent />
    </Suspense>
  )
}