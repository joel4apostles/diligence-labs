"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder, SubtleBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"

const consultationTypes = [
  {
    value: "STRATEGIC_ADVISORY",
    label: "Strategic Advisory",
    description: "Navigate complex blockchain landscapes with expert guidance",
    color: "from-blue-500 to-cyan-500",
    price: "$300"
  },
  {
    value: "DUE_DILIGENCE",
    label: "Due Diligence",
    description: "Comprehensive analysis of technical architecture and market potential",
    color: "from-purple-500 to-pink-500",
    price: "$400"
  },
  {
    value: "TOKEN_LAUNCH",
    label: "Token Launch Consultation",
    description: "End-to-end guidance for successful token launches",
    color: "from-green-500 to-emerald-500",
    price: "$450"
  },
  {
    value: "BLOCKCHAIN_INTEGRATION_ADVISORY",
    label: "Blockchain Integration Advisory",
    description: "Strategic guidance on blockchain deployment choices and technical solution providers",
    color: "from-orange-500 to-red-500",
    price: "$350"
  }
]

export default function GuestBooking() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    consultationType: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.guestName || !formData.guestEmail || !formData.consultationType || !formData.description) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (formData.description.length < 20) {
      setError("Description must be at least 20 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/guest/book-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sendAccountInvite: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || "Failed to book consultation")
      }
    } catch (error) {
      setError("An error occurred while booking your consultation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      consultationType: value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <PageStructureLines />
        <FormGridLines />
        <ParallaxBackground />
        <FloatingElements />

        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-2xl">
            <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                
                <Card className="bg-transparent border-0 relative z-10">
                  <CardHeader className="text-center pb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Free Consultation Confirmed!
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-2">
                      Your complimentary blockchain consultation worth $300+ has been secured
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                      <p className="text-gray-300">
                        🎉 Congratulations! Your free blockchain consultation (valued at $300+) has been confirmed. 
                        We'll contact you within 24 hours to schedule your complimentary session.
                      </p>
                      
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 font-medium mb-2">✨ What's Included in Your Free Consultation:</p>
                        <ul className="text-gray-300 text-sm mt-2 text-left">
                          <li>• Expert blockchain strategy assessment</li>
                          <li>• Technology recommendations tailored to your project</li>
                          <li>• Market analysis and competitive insights</li>
                          <li>• Implementation roadmap and next steps</li>
                          <li>• Direct access to our senior consultants</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 font-medium mb-2">Account Creation Invitation Sent!</p>
                        <p className="text-gray-300 text-sm">
                          We've sent an invitation to your email address to create an account. This will help you:
                        </p>
                        <ul className="text-gray-300 text-sm mt-2 text-left">
                          <li>• Track your consultation progress</li>
                          <li>• Access your personalized dashboard</li>
                          <li>• View and download reports</li>
                          <li>• Book additional consultations with member pricing</li>
                        </ul>
                      </div>
                    </div>

                    <HorizontalDivider style="subtle" />

                    <div className="flex gap-4">
                      <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                          Return to Homepage
                        </Button>
                      </Link>
                      <Link href="/auth/signin" className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 hover:scale-105">
                          Sign In
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to Homepage Link */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                ← Back to Homepage
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🎉 FREE CONSULTATION - Limited Time
              </span>
            </div>
            <h1 className="text-4xl font-light mb-4">
              <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Claim Your Free</span>
              <br />
              <span className="text-white">Blockchain Consultation</span>
            </h1>
            <p className="text-gray-400 text-lg mb-4">
              Get expert blockchain consulting worth $300 - completely free for first-time clients
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No payment required
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No account needed
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                One per client
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Consultation Types */}
            <div>
              <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
                <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                  
                  <Card className="bg-transparent border-0 relative z-10">
                    <CardHeader>
                      <CardTitle className="text-xl text-white">Choose Your Consultation</CardTitle>
                      <CardDescription className="text-gray-400">
                        Select the type of consultation that best fits your needs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {consultationTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => handleSelectChange(type.value)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
                              formData.consultationType === type.value
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-600 hover:border-gray-500 bg-gray-800/20'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-4 h-4 rounded-full mt-1 bg-gradient-to-r ${type.color}`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-white font-medium">{type.label}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm line-through">{type.price}</span>
                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">FREE</span>
                                  </div>
                                </div>
                                <p className="text-gray-400 text-sm">{type.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ProminentBorder>
            </div>

            {/* Contact Form */}
            <div>
              <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
                <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                  
                  <Card className="bg-transparent border-0 relative z-10">
                    <CardHeader>
                      <CardTitle className="text-xl text-white">Your Information</CardTitle>
                      <CardDescription className="text-gray-400">
                        Tell us about your project and how we can help
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guestName" className="text-gray-300">Full Name *</Label>
                            <Input
                              id="guestName"
                              name="guestName"
                              type="text"
                              required
                              value={formData.guestName}
                              onChange={handleChange}
                              className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                              placeholder="Your full name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="guestEmail" className="text-gray-300">Email Address *</Label>
                            <Input
                              id="guestEmail"
                              name="guestEmail"
                              type="email"
                              required
                              value={formData.guestEmail}
                              onChange={handleChange}
                              className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="guestPhone" className="text-gray-300">Phone Number (Optional)</Label>
                          <Input
                            id="guestPhone"
                            name="guestPhone"
                            type="tel"
                            value={formData.guestPhone}
                            onChange={handleChange}
                            className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                            placeholder="Your phone number"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-gray-300">Project Description *</Label>
                          <Textarea
                            id="description"
                            name="description"
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 min-h-[120px]"
                            placeholder="Tell us about your project, goals, and how we can help you (minimum 20 characters)..."
                          />
                        </div>

                        {error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isLoading || !formData.consultationType}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 hover:scale-105"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Claiming Your Free Consultation...
                            </>
                          ) : (
                            <>
                              🎉 Claim My FREE Consultation (Worth $300+)
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </>
                          )}
                        </Button>

                        <div className="text-center text-sm text-gray-500 space-y-2">
                          <p>Already have an account? <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">Sign in</Link></p>
                          <div className="border-t border-gray-700 pt-4">
                            <p className="text-gray-400 mb-2">Want ongoing blockchain consulting?</p>
                            <Link href="/#subscription">
                              <Button variant="outline" size="sm" className="border-blue-600 text-blue-400 hover:bg-blue-800 hover:border-blue-500 transition-all duration-300">
                                View Monthly Plans
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </ProminentBorder>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}