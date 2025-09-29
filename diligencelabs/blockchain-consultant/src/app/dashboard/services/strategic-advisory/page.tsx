"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"

const bookingSchema = z.object({
  duration: z.enum(["30", "45", "60"], {
    required_error: "Please select consultation duration",
  }),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["STARTUP", "ENTERPRISE", "DEFI_PROTOCOL", "DAO", "INVESTMENT_FUND", "OTHER"], {
    required_error: "Please select business type",
  }),
  description: z.string().min(50, "Please provide detailed information (minimum 50 characters)"),
  currentChallenges: z.string().min(20, "Please describe current challenges"),
  strategicGoals: z.string().min(20, "Please describe strategic goals"),
  timeline: z.enum(["IMMEDIATE", "ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "YEAR_PLUS"], {
    required_error: "Please select timeline",
  }),
  marketFocus: z.string().min(10, "Please specify market focus"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"], {
    required_error: "Please select urgency level",
  }),
  contactEmail: z.string().email("Please enter a valid email"),
})

type BookingForm = z.infer<typeof bookingSchema>

const durationOptions = [
  { value: "30", label: "30 minutes", multiplier: 0.5 },
  { value: "45", label: "45 minutes", multiplier: 0.75 },
  { value: "60", label: "60 minutes", multiplier: 1.0 }
]

const serviceDetails = {
  title: "Strategic Advisory",
  description: "Comprehensive strategic planning, market analysis, competitive positioning, and business development guidance.",
  basePricePerHour: 300,
  color: "from-blue-500 to-cyan-500"
}

export default function StrategicAdvisoryConsultation() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState<number>(0)

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: "60",
      businessName: "",
      businessType: undefined as any,
      description: "",
      currentChallenges: "",
      strategicGoals: "",
      timeline: undefined as any,
      marketFocus: "",
      urgency: "MEDIUM",
      contactEmail: session?.user?.email || ""
    },
  })

  // Calculate price when duration changes
  useEffect(() => {
    if (selectedDuration) {
      const duration = durationOptions.find(dur => dur.value === selectedDuration)
      if (duration) {
        const price = Math.round(serviceDetails.basePricePerHour * duration.multiplier)
        setTotalPrice(price)
      }
    }
  }, [selectedDuration])

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  async function onSubmit(data: BookingForm) {
    setIsLoading(true)

    try {
      // Validate that payment amount is calculated
      if (!totalPrice || totalPrice <= 0) {
        alert("Please select consultation duration to calculate pricing.")
        setIsLoading(false)
        return
      }

      // If user is not authenticated, store form data and redirect to login
      if (!session) {
        const consultationData = { ...data, totalPrice, serviceType: "STRATEGIC_ADVISORY" }
        localStorage.setItem('pendingConsultation', JSON.stringify(consultationData))
        setIsSubmitted(true)
        setTimeout(() => {
          router.push("/auth/unified-signin?redirect=book-consultation")
        }, 3000)
        return
      }

      // For demo purposes, simulate payment processing
      console.log("Processing Strategic Advisory consultation payment for:", totalPrice, "USD")
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          consultationType: "STRATEGIC_ADVISORY",
          totalPrice,
          paymentStatus: "completed"
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          setShowCalendly(true)
        }, 2000)
      } else {
        console.error("Failed to book consultation")
      }
    } catch (error) {
      console.error("Error booking consultation:", error)
      alert("Payment processing failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <ParallaxBackground />
        <FloatingElements />
        
        <Card className="w-full max-w-lg relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border border-gray-700">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-6">
              <div className="text-green-400 text-6xl mb-6 animate-bounce">✓</div>
              <h2 className="text-3xl font-light mb-2">
                Strategic Advisory <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Consultation Booked</span>!
              </h2>
              
              {!showCalendly ? (
                <>
                  <p className="text-gray-400 text-lg mb-4">
                    {session 
                      ? `Payment of $${totalPrice} processed successfully! Your strategic advisory consultation has been booked.`
                      : "Your consultation request has been saved! Please sign in to complete the booking."
                    }
                  </p>
                  <div className="text-sm text-gray-500 mb-6">
                    {session 
                      ? "Preparing your scheduling link..."
                      : "Redirecting to sign in..."
                    }
                  </div>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-300 text-lg">
                    Now let's schedule your strategic advisory consultation!
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20">
                    <h3 className="text-xl font-semibold mb-4 text-blue-300">Schedule Your Meeting</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Click the link below to choose a convenient time for your strategic advisory consultation with our experts.
                    </p>
                    
                    <div className="space-y-4">
                      <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105">
                        <a 
                          href="https://calendly.com/diligence-labs/strategic-advisory" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          Schedule Strategic Session
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </Button>
                      
                      <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                        <Link href={session ? "/dashboard" : "/"}>
                          {session ? "Back to Dashboard" : "Back to Home"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className={`flex items-center gap-4 mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <Link href={session ? "/dashboard" : "/"}>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← {session ? "Back to Dashboard" : "Back to Home"}
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-light mb-2">
              <span className={`font-normal bg-gradient-to-r ${serviceDetails.color} bg-clip-text text-transparent`}>Strategic Advisory</span> Consultation
            </h1>
            <p className="text-gray-400 text-lg">Comprehensive strategic planning and business guidance</p>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10" animated={true}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-light text-white">Strategic Advisory Details</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Provide detailed information for strategic planning and business development guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Session Duration</FormLabel>
                          <Select onValueChange={(value) => { field.onChange(value); setSelectedDuration(value) }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              {durationOptions.map((duration) => (
                                <SelectItem key={duration.value} value={duration.value} className="hover:bg-gray-700">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{duration.label}</span>
                                    <span className="text-sm text-gray-400 ml-3">
                                      ${Math.round(serviceDetails.basePricePerHour * duration.multiplier)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl p-4 border border-blue-500/10">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Session Investment</h4>
                        <p className="text-sm text-gray-400 mb-3">
                          Strategic advisory consultation with comprehensive business analysis and strategic guidance.
                        </p>
                        <div className="text-2xl font-bold text-white">
                          {selectedDuration && totalPrice > 0 ? (
                            <span className="text-green-400">${totalPrice}</span>
                          ) : (
                            <span className="text-gray-500">Select duration</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  {selectedDuration && totalPrice > 0 && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-green-400 mb-1">Session Price</h3>
                          <p className="text-gray-400 text-sm">
                            Strategic Advisory • {durationOptions.find(d => d.value === selectedDuration)?.label}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-400">${totalPrice}</div>
                          <div className="text-sm text-gray-400">Payment required</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Business Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your business/project name" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Business Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="STARTUP" className="hover:bg-gray-700">Early-stage Startup</SelectItem>
                              <SelectItem value="ENTERPRISE" className="hover:bg-gray-700">Enterprise/Corporation</SelectItem>
                              <SelectItem value="DEFI_PROTOCOL" className="hover:bg-gray-700">DeFi Protocol</SelectItem>
                              <SelectItem value="DAO" className="hover:bg-gray-700">DAO/Community</SelectItem>
                              <SelectItem value="INVESTMENT_FUND" className="hover:bg-gray-700">Investment Fund</SelectItem>
                              <SelectItem value="OTHER" className="hover:bg-gray-700">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Implementation Timeline</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="IMMEDIATE" className="hover:bg-gray-700">Immediate - Within 2 weeks</SelectItem>
                              <SelectItem value="ONE_MONTH" className="hover:bg-gray-700">1 Month</SelectItem>
                              <SelectItem value="THREE_MONTHS" className="hover:bg-gray-700">3 Months</SelectItem>
                              <SelectItem value="SIX_MONTHS" className="hover:bg-gray-700">6 Months</SelectItem>
                              <SelectItem value="YEAR_PLUS" className="hover:bg-gray-700">1 Year+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marketFocus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Market Focus</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., DeFi, NFTs, Enterprise, Global" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Business Overview</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed overview of your business, including current status, target market, competitive landscape, and key stakeholders..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[120px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Include business model, revenue streams, and market positioning
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Current Challenges</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the main challenges your business is facing - market entry, competition, funding, technical limitations, regulatory concerns..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[100px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Help us understand your pain points and obstacles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="strategicGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Strategic Goals</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What are your key strategic objectives? Growth targets, market expansion, partnerships, product development, fundraising goals..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[100px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Define your vision and measurable objectives
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Urgency Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="LOW" className="hover:bg-gray-700">Low - Within 2 weeks</SelectItem>
                              <SelectItem value="MEDIUM" className="hover:bg-gray-700">Medium - Within 1 week</SelectItem>
                              <SelectItem value="HIGH" className="hover:bg-gray-700">High - Within 2-3 days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email" 
                              type="email" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Payment Required Notice */}
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-300 mb-1">Payment Required</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          This strategic advisory consultation requires upfront payment of <strong>${totalPrice || '---'}</strong> to secure your session. 
                          Payment will be processed securely before scheduling.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !selectedDuration || totalPrice <= 0}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white font-medium py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay ${totalPrice || '---'} & Book Session
                        </>
                      )}
                    </Button>
                    <Link href={session ? "/dashboard" : "/"}>
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 py-4 px-8 text-lg transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
            </Card>
          </ProminentBorder>
        </div>
      </div>
    </div>
  )
}