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
import { StripePayment } from "@/components/stripe-payment"
import { ArrowLeft, Calendar, Clock, DollarSign, CheckCircle } from "lucide-react"

const bookingSchema = z.object({
  consultationType: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "BLOCKCHAIN_INTEGRATION_ADVISORY", "TOKEN_LAUNCH"], {
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

type BookingForm = z.infer<typeof bookingSchema>

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
    value: "BLOCKCHAIN_INTEGRATION_ADVISORY",
    label: "Blockchain Integration Advisory",
    description: "Strategic guidance on blockchain deployment choices and technical solution providers for seamless integration.",
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
  const [subscription, setSubscription] = useState<any>(null)
  const [creditBalance, setCreditBalance] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'subscription' | 'payment'>('payment')

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
    if (session) {
      fetchSubscriptionData()
    }
  }, [session])

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionResponse, usageResponse] = await Promise.all([
        fetch('/api/subscriptions/manage'),
        fetch('/api/subscriptions/usage')
      ])

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setSubscription(subscriptionData.subscription)
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setCreditBalance(usageData.creditBalance)
        
        // If user has subscription with available credits, default to subscription payment
        if (usageData.creditBalance && usageData.creditBalance.remainingCredits > 0) {
          setPaymentMethod('subscription')
        }
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error)
    }
  }

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
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
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule Your Meeting
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Click the link below to choose a convenient time for your consultation session with our blockchain experts.
                    </p>
                    
                    <div className="space-y-4">
                      <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-300">
                        <a 
                          href="https://calendly.com/diligence-labs/consultation" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule on Calendly
                        </a>
                      </Button>
                      
                      <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                        <Link href={session ? "/dashboard" : "/"}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={session ? "/dashboard" : "/"}>
            <Button variant="ghost" size="sm" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {session ? "Back to Dashboard" : "Back to Home"}
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light mb-3">
                Book <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Consultation</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Schedule your blockchain advisory session with our experts
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-light text-white flex items-center justify-center">
                <Calendar className="w-8 h-8 mr-3 text-blue-400" />
                Consultation Details
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Select your service, duration, and provide consultation details. Payment is required to secure your session.
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
                          <FormLabel className="text-gray-300 text-lg">Consultation Type</FormLabel>
                          <Select onValueChange={(value) => { field.onChange(value); setSelectedType(value) }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue placeholder="Select consultation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-64">
                              {consultationTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value} className="hover:bg-gray-700 py-3">
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

                  {/* Payment Method Selection */}
                  {selectedType && selectedDuration && subscription && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                      <h3 className="text-xl font-semibold text-blue-400 mb-4">Payment Method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          onClick={() => setPaymentMethod('subscription')}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                            paymentMethod === 'subscription' 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/20'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full mt-1 ${paymentMethod === 'subscription' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                            <div className="flex-1">
                              <h4 className="text-white font-medium">Use Subscription Credit</h4>
                              <p className="text-gray-400 text-sm mt-1">
                                {creditBalance?.isUnlimited 
                                  ? 'Unlimited consultations' 
                                  : `${creditBalance?.remainingCredits || 0} credits remaining`}
                              </p>
                              <p className="text-green-400 text-sm font-semibold mt-1">FREE</p>
                            </div>
                          </div>
                        </div>

                        <div 
                          onClick={() => setPaymentMethod('payment')}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                            paymentMethod === 'payment' 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/20'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full mt-1 ${paymentMethod === 'payment' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                            <div className="flex-1">
                              <h4 className="text-white font-medium">One-time Payment</h4>
                              <p className="text-gray-400 text-sm mt-1">
                                Pay per consultation session
                              </p>
                              <p className="text-blue-400 text-sm font-semibold mt-1">${totalPrice}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {creditBalance && creditBalance.remainingCredits <= 0 && paymentMethod === 'subscription' && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-yellow-400 text-sm">
                            No consultation credits remaining. Credits reset on {new Date(creditBalance.resetDate).toLocaleDateString()}.
                            <Link href="/#subscription" className="text-blue-400 hover:text-blue-300 ml-2">
                              Upgrade plan →
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing Display */}
                  {selectedType && selectedDuration && totalPrice > 0 && (
                    <div className={`rounded-xl p-6 border ${
                      paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20'
                        : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-xl font-semibold mb-1 ${
                            paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                              ? 'text-green-400'
                              : 'text-blue-400'
                          }`}>
                            {paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                              ? 'Using Subscription Credit'
                              : 'Session Price'
                            }
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {consultationTypes.find(t => t.value === selectedType)?.label} • 
                            {durationOptions.find(d => d.value === selectedDuration)?.label}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${
                            paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                              ? 'text-green-400'
                              : 'text-blue-400'
                          }`}>
                            {paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                              ? 'FREE'
                              : `$${totalPrice}`
                            }
                          </div>
                          <div className="text-sm text-gray-400">
                            {paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                              ? 'Subscription credit'
                              : 'Payment required'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Subscription Prompt */}
                  {selectedType && selectedDuration && !subscription && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-purple-400 mb-2">Save with Monthly Plans</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Get multiple consultations each month at a reduced rate with our subscription plans.
                          </p>
                          <Link href="/#subscription">
                            <Button variant="outline" size="sm" className="border-purple-600 text-purple-400 hover:bg-purple-800 hover:border-purple-500">
                              View Plans →
                            </Button>
                          </Link>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-400">${totalPrice}</div>
                          <div className="text-sm text-gray-400">One-time payment</div>
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
                          <FormLabel className="text-gray-300 text-lg">Project Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your project name" 
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
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-12"
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
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[120px]"
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
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Preferred Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-gray-800/50 border-gray-600 text-white focus:border-blue-500 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <DollarSign className="w-6 h-6 text-blue-400 mr-2" />
                          <h4 className="text-lg font-semibold text-blue-300">Session Investment</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                          All consultations require upfront payment to secure your session with our blockchain experts.
                        </p>
                        <div className="text-2xl font-bold text-white">
                          {selectedType && selectedDuration && totalPrice > 0 ? (
                            <span className="text-green-400">${totalPrice}</span>
                          ) : (
                            <span className="text-gray-500">Select service & duration</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Required Notice */}
                  {paymentMethod === 'payment' && (
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
                            Payment will be processed securely via Stripe before scheduling.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Credit Notice */}
                  {paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0 && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-300 mb-1">Using Subscription Credit</h4>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            This consultation will use one of your subscription credits. You'll have <strong>
                            {creditBalance.isUnlimited ? 'unlimited' : (creditBalance.remainingCredits - 1)}
                            </strong> credits remaining after booking.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !selectedType || !selectedDuration || (paymentMethod === 'subscription' && creditBalance?.remainingCredits <= 0)}
                      className={`flex-1 font-medium py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-white disabled:opacity-50 ${
                        paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                            ? 'Booking Session...'
                            : 'Processing Payment...'
                          }
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0 ? (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Book Session with Credit
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Pay ${totalPrice || '---'} & Book Session
                            </>
                          )}
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