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
import { StripePayment } from "@/components/stripe-payment"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { Logo } from "@/components/ui/logo"
import { formTheme } from "@/lib/form-theme"

const bookingSchema = z.object({
  consultationType: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKENOMICS_DESIGN", "TOKEN_LAUNCH"], {
    required_error: "Please select a consultation type",
  }),
  duration: z.enum(["30", "45", "60"], {
    required_error: "Please select consultation duration",
  }),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  projectName: z.string().min(2, "Project name is required"),
  preferredDate: z.string().optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"], {
    required_error: "Please select urgency level",
  }),
  contactEmail: z.string().email("Please enter a valid email"),
})

const guestBookingSchema = z.object({
  consultationType: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKENOMICS_DESIGN", "TOKEN_LAUNCH"], {
    required_error: "Please select a consultation type",
  }),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email"),
  guestPhone: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
})

type BookingForm = z.infer<typeof bookingSchema>
type GuestBookingForm = z.infer<typeof guestBookingSchema>

const consultationTypes = [
  {
    value: "STRATEGIC_ADVISORY",
    label: "Strategic Advisory",
    description: "Navigate complex blockchain landscapes with expert guidance on technology decisions, regulatory compliance, and market positioning strategies.",
    basePricePerHour: 300,
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "DUE_DILIGENCE", 
    label: "Due Diligence",
    description: "Comprehensive analysis of technical architecture, team capabilities, tokenomics, and market potential for investment decisions.",
    basePricePerHour: 400,
    color: "from-purple-500 to-pink-500"
  },
  {
    value: "TOKENOMICS_DESIGN",
    label: "Tokenomics Design",
    description: "Create sustainable token economies with proper incentive alignment, distribution models, and economic sustainability.",
    basePricePerHour: 350,
    color: "from-orange-500 to-red-500"
  },
  {
    value: "TOKEN_LAUNCH",
    label: "Token Launch Consultation",
    description: "End-to-end guidance for successful token launches including regulatory compliance, marketing strategy, and technical implementation.",
    basePricePerHour: 450,
    color: "from-green-500 to-emerald-500"
  }
]

const durationOptions = [
  { value: "30", label: "30 minutes", multiplier: 0.5 },
  { value: "45", label: "45 minutes", multiplier: 0.75 },
  { value: "60", label: "60 minutes", multiplier: 1.0 }
]

export default function BookConsultation() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isGuestBooking, setIsGuestBooking] = useState(!session)
  const [guestFormData, setGuestFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    consultationType: "",
    description: ""
  })

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      consultationType: undefined as any,
      title: "",
      description: "",
      projectName: "",
      contactEmail: session?.user?.email || "",
      urgency: "MEDIUM",
      duration: "60",
      preferredDate: ""
    },
  })

  // Calculate price when consultation type or duration changes
  useEffect(() => {
    if (selectedType && selectedDuration) {
      const consultationType = consultationTypes.find(type => type.value === selectedType)
      const duration = durationOptions.find(dur => dur.value === selectedDuration)
      
      if (consultationType && duration) {
        const price = Math.round(consultationType.basePricePerHour * duration.multiplier)
        setTotalPrice(price)
      }
    }
  }, [selectedType, selectedDuration])

  // Load pending consultation data if available
  useEffect(() => {
    const pendingData = localStorage.getItem('pendingConsultation')
    if (pendingData && !session) {
      try {
        const data = JSON.parse(pendingData)
        Object.keys(data).forEach(key => {
          form.setValue(key as keyof BookingForm, data[key])
        })
        localStorage.removeItem('pendingConsultation')
      } catch (error) {
        console.error('Failed to load pending consultation data:', error)
      }
    }
  }, [form, session])

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  async function onSubmit(data: BookingForm) {
    setIsLoading(true)

    try {
      // Validate that payment amount is calculated
      if (!totalPrice || totalPrice <= 0) {
        alert("Please select both consultation type and duration to calculate pricing.")
        setIsLoading(false)
        return
      }

      // If user is not authenticated, store form data and redirect to login
      if (!session) {
        // Store consultation data in localStorage for after login
        const consultationData = { ...data, totalPrice, selectedType, selectedDuration }
        localStorage.setItem('pendingConsultation', JSON.stringify(consultationData))
        setIsSubmitted(true)
        setTimeout(() => {
          router.push("/auth/unified-signin?redirect=book-consultation")
        }, 3000)
        return
      }

      // Create Stripe payment intent
      console.log("Processing payment for:", totalPrice, "USD")
      
      // Show payment modal instead of processing directly
      setShowPaymentModal(true)
    } catch (error) {
      console.error("Error booking consultation:", error)
      alert("Payment processing failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      setShowPaymentModal(false)
      setIsLoading(true)

      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form.getValues(),
          totalPrice,
          selectedType,
          selectedDuration,
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
        alert("Failed to book consultation. Please try again.")
      }
    } catch (error) {
      console.error("Error booking consultation:", error)
      alert("Failed to book consultation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false)
    alert(error)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <ParallaxBackground />
        <FloatingElements />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-10 animate-pulse" style={{ animationDuration: '8s' }} />
        
        <Card className="w-full max-w-lg relative z-10 bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur border border-gray-700">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-6">
              <div className="text-green-400 text-6xl mb-6 animate-bounce">✓</div>
              <h2 className="text-3xl font-light mb-2">
                Consultation <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Request Submitted</span>!
              </h2>
              
              {!showCalendly ? (
                <>
                  <p className="text-gray-400 text-lg mb-4">
                    {session 
                      ? "Your consultation request has been submitted successfully."
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
                    Now let's schedule your consultation session!
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
                    <h3 className="text-xl font-semibold mb-4 text-blue-300">Schedule Your Meeting</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Click the link below to choose a convenient time for your consultation session with our blockchain experts.
                    </p>
                    
                    <div className="space-y-4">
                      <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105">
                        <a 
                          href="https://calendly.com/diligence-labs/consultation" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          Schedule on Calendly
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
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Logo size="large" href={null} />
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <h1 className="text-4xl font-light mb-2">
                Book <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Consultation</span>
              </h1>
              <p className="text-gray-400 text-lg">Schedule your blockchain advisory session</p>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <HorizontalDivider style="subtle" />

        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10" animated={true} movingBorder={true}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-light text-white">Consultation Details</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Select your service, duration, and provide consultation details. {!session && "You can book without an account - payment is required to secure your session."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="consultationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={formTheme.label.base}>Consultation Type</FormLabel>
                          <Select onValueChange={(value) => { field.onChange(value); setSelectedType(value) }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={`${formTheme.select.trigger} h-12`}>
                                <SelectValue placeholder="Select consultation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={`${formTheme.select.content} max-h-64">
                              {consultationTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value} className={formTheme.select.item} py-3">
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex-1">
                                      <div className="font-medium text-white">{type.label}</div>
                                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">{type.description}</div>
                                    </div>
                                    <div className="ml-3 text-sm font-semibold text-green-400">
                                      ${type.basePricePerHour}/hr
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={formTheme.label.base}>Session Duration</FormLabel>
                          <Select onValueChange={(value) => { field.onChange(value); setSelectedDuration(value) }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={`${formTheme.select.trigger} h-12`}>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={`${formTheme.select.content}">
                              {durationOptions.map((duration) => (
                                <SelectItem key={duration.value} value={duration.value} className={formTheme.select.item}">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{duration.label}</span>
                                    <span className="text-sm text-gray-400 ml-3">
                                      ({Math.round(duration.multiplier * 100)}% rate)
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
                  </div>

                  {/* Pricing Display */}
                  {selectedType && selectedDuration && totalPrice > 0 && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-green-400 mb-1">Session Price</h3>
                          <p className="text-gray-400 text-sm">
                            {consultationTypes.find(t => t.value === selectedType)?.label} • 
                            {durationOptions.find(d => d.value === selectedDuration)?.label}
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
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={formTheme.label.base}>Project Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your project name" 
                              {...field} 
                              disabled={isLoading}
                              className={`${formTheme.input.base} h-12`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={formTheme.label.base}>Contact Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email" 
                              type="email" 
                              {...field} 
                              disabled={isLoading}
                              className={`${formTheme.input.base} h-12`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Consultation Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief title for your consultation" 
                            {...field} 
                            disabled={isLoading}
                            className={`${formTheme.input.base} h-12`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide detailed information about your project, challenges, and what you hope to achieve from this consultation..."
                            className={`${formTheme.input.base} min-h-[120px]`}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Please be as detailed as possible to help us prepare for your consultation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={formTheme.label.base}>Urgency Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={`${formTheme.select.trigger} h-12`}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={`${formTheme.select.content}">
                              <SelectItem value="LOW" className={formTheme.select.item}">Low - Within 2 weeks</SelectItem>
                              <SelectItem value="MEDIUM" className={formTheme.select.item}">Medium - Within 1 week</SelectItem>
                              <SelectItem value="HIGH" className={formTheme.select.item}">High - Within 2-3 days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={formTheme.label.base}>Preferred Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              disabled={isLoading}
                              className={`${formTheme.input.base} h-12`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl p-4 border border-blue-500/10">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Session Investment</h4>
                        <p className="text-sm text-gray-400 mb-3">
                          All consultations require upfront payment to secure your session with our blockchain experts.
                        </p>
                        <div className="text-2xl font-bold text-white">
                          {selectedType && selectedDuration && totalPrice > 0 ? (
                            <span className="text-green-400">${totalPrice}</span>
                          ) : (
                            <span className="text-gray-500">Select service & duration</span>
                          )}
                        </div>
                      </div>
                    </div>
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
                          This consultation requires upfront payment of <strong>${totalPrice || '---'}</strong> to secure your session. 
                          Payment will be processed securely via Stripe before scheduling. {!session && "No account needed - you can book as a guest."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !selectedType || !selectedDuration || totalPrice <= 0}
                      className={`flex-1 ${formTheme.button.primary} py-4 text-lg rounded-lg disabled:opacity-50 hover:scale-105 flex items-center justify-center gap-2`}
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
                    <Link href="/">
                      <Button 
                        type="button" 
                        variant="outline"
                        className={`w-full sm:w-auto ${formTheme.button.secondary} py-4 px-8 text-lg`}
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

        {/* Stripe Payment Modal */}
        <StripePayment
          amount={totalPrice}
          description={selectedType ? `${consultationTypes.find(t => t.value === selectedType)?.label} Consultation` : "Blockchain Consultation"}
          consultationType={selectedType}
          duration={selectedDuration}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    </div>
  )
}