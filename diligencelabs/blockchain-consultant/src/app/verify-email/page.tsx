"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('No verification token provided.')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while verifying your email')
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      alert('Please enter your email address')
      return
    }

    setResending(true)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Verification email sent! Please check your inbox.')
      } else {
        alert(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      alert('An error occurred while resending verification email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl">
              {/* Dynamic background gradient */}
              {status === 'success' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
              )}
              {status === 'error' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20" />
              )}
              {status === 'loading' && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              )}
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader className="text-center pb-8">
                  <div className="mb-4">
                    {status === 'loading' && (
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                    {status === 'success' && (
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {status === 'loading' && (
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Verifying Email...
                      </span>
                    )}
                    {status === 'success' && (
                      <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Email Verified!
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                        Verification Failed
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    {message}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {status === 'success' && (
                    <>
                      <div className="text-center">
                        <p className="text-gray-300 mb-4">
                          Your email has been successfully verified. You can now access all features of your account.
                        </p>
                      </div>
                      
                      <Link href="/auth/signin">
                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 hover:scale-105">
                          Sign In to Your Account
                        </Button>
                      </Link>
                    </>
                  )}

                  {status === 'error' && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300">Enter your email to resend verification</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="mt-1 w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-red-400 focus:outline-none"
                          />
                        </div>
                        
                        <Button
                          onClick={handleResendVerification}
                          disabled={resending}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all duration-300 hover:scale-105"
                        >
                          {resending ? "Sending..." : "Resend Verification Email"}
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="text-center">
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

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}