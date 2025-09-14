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
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"

export default function AdminSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrengthError, setPasswordStrengthError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    setPasswordStrengthError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }


    try {
      const response = await fetch('/api/admin/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminKey: formData.adminKey
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Admin account created successfully!')
        setTimeout(() => {
          router.push('/admin/auth/login')
        }, 2000)
      } else {
        if (data.passwordStrength && data.failedRequirements) {
          setPasswordStrengthError(`Password security requirements not met: ${data.failedRequirements.join(', ')}`)
        } else {
          setError(data.error || 'Registration failed')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Admin Background */}
      <DynamicPageBackground variant="admin" opacity={0.25} />
      <PageStructureLines />

      <ProminentBorder className="w-full max-w-md relative z-10 rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl border-0 relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Diligence Labs
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Create Admin Account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Register a new admin user
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {passwordStrengthError && (
            <div className="bg-orange-900/20 border border-orange-600 text-orange-400 p-3 rounded-lg mb-4 text-sm">
              {passwordStrengthError}
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-600 text-green-400 p-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="John Doe"
                required
              />
            </div>

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
                placeholder="Create a secure password"
                required
              />
              {formData.password && (
                <div className="mt-3">
                  <PasswordStrengthIndicator
                    password={formData.password}
                    email={formData.email}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Confirm your password"
                required
              />
            </div>

            <div>
              <Label htmlFor="adminKey" className="text-white">Admin Registration Key</Label>
              <Input
                id="adminKey"
                type="password"
                value={formData.adminKey}
                onChange={(e) => setFormData(prev => ({ ...prev, adminKey: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Secret key required for admin registration"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Contact your system administrator for the registration key</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 transition-all duration-300"
            >
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin/auth/login" className="text-orange-400 hover:text-orange-300 text-sm">
              Already have an account? Sign in here
            </Link>
          </div>
        </CardContent>
        </Card>
      </ProminentBorder>
    </div>
  )
}