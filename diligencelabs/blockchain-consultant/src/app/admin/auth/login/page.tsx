"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { PageStructureLines } from "@/components/ui/page-structure"
import { ProminentBorder } from "@/components/ui/border-effects"
import { Logo } from "@/components/ui/logo"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Store admin session
        localStorage.setItem('adminToken', data.token)
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background network visualization placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.1) 2px, transparent 2px), radial-gradient(circle at 40% 60%, rgba(251, 146, 60, 0.1) 2px, transparent 2px)',
          backgroundSize: '100px 100px, 150px 150px, 200px 200px'
        }} />
      </div>
      
      {/* Gradient overlays matching homepage */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
      
      {/* Dynamic Admin Background */}
      <DynamicPageBackground variant="admin" opacity={0.15} />
      <PageStructureLines />

      <ProminentBorder className="w-full max-w-md relative z-10 rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl border-0 relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="xl" href={null} />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your admin account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="admin@company.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 transition-all duration-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin/auth/signup" className="text-orange-400 hover:text-orange-300 text-sm">
              Need to create an admin account? Sign up here
            </Link>
          </div>
        </CardContent>
        </Card>
      </ProminentBorder>
    </div>
  )
}