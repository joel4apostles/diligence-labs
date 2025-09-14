"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

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

export default function AdminRegister() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: ""
  })

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
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminCode: formData.adminCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after successful registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push("/dashboard/admin")
        } else {
          router.push("/admin/login")
        }
      } else {
        setError(data.error || "Failed to create admin account")
      }
    } catch (error) {
      setError("An error occurred during registration")
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader className="text-center pb-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Admin Registration
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Create a new administrator account
                  </CardDescription>
                </CardHeader>

                <CardContent>
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
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-400"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-400"
                          placeholder="Enter your email"
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
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-400"
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
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-400"
                          placeholder="Confirm your password"
                        />
                      </div>

                      <div>
                        <Label htmlFor="adminCode" className="text-gray-300">Admin Access Code</Label>
                        <Input
                          id="adminCode"
                          name="adminCode"
                          type="password"
                          required
                          value={formData.adminCode}
                          onChange={handleChange}
                          className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-400"
                          placeholder="Enter admin access code"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Contact existing admin for access code
                        </p>
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
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? "Creating Account..." : "Create Admin Account"}
                    </Button>
                  </form>

                  <HorizontalDivider style="subtle" />

                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      Already have an admin account?{" "}
                      <Link href="/admin/login" className="text-red-400 hover:text-red-300 transition-colors">
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