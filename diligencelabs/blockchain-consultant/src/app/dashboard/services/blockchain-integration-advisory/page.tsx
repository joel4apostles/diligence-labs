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
  projectName: z.string().min(2, "Project name is required"),
  blockchainType: z.enum(["ETHEREUM", "BITCOIN", "SOLANA", "POLYGON", "BINANCE_SMART_CHAIN", "CARDANO", "AVALANCHE", "OTHER"], {
    required_error: "Please select blockchain type",
  }),
  description: z.string().min(50, "Please provide detailed information (minimum 50 characters)"),
  integrationGoals: z.string().min(20, "Please describe integration goals"),
  technicalRequirements: z.string().min(20, "Please describe technical requirements"),
  currentInfrastructure: z.string().min(10, "Please describe current infrastructure"),
  deploymentModel: z.enum(["MAINNET", "TESTNET", "PRIVATE_BLOCKCHAIN", "HYBRID", "SIDECHAIN", "LAYER2", "OTHER"], {
    required_error: "Please select deployment model",
  }),
  stakeholders: z.string().min(10, "Please describe key stakeholders"),
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
  title: "Blockchain Integration Advisory",
  description: "Strategic guidance on blockchain deployment choices and technical solution providers for seamless integration.",
  basePricePerHour: 350,
  color: "from-orange-500 to-red-500"
}

export default function BlockchainIntegrationAdvisory() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [subscription, setSubscription] = useState<any>(null)
  const [creditBalance, setCreditBalance] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'subscription' | 'payment'>('payment')

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: "60",
      projectName: "",
      blockchainType: undefined as any,
      description: "",
      integrationGoals: "",
      technicalRequirements: "",
      currentInfrastructure: "",
      deploymentModel: undefined as any,
      stakeholders: "",
      urgency: "MEDIUM",
      contactEmail: session?.user?.email || "",
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
      // Validate that payment amount is calculated or subscription credit is available
      if (paymentMethod === 'payment' && (!totalPrice || totalPrice <= 0)) {
        alert("Please select consultation duration to calculate pricing.")
        setIsLoading(false)
        return
      }

      if (paymentMethod === 'subscription' && (!creditBalance || creditBalance.remainingCredits <= 0)) {
        alert("No subscription credits available. Please upgrade your plan or use payment method.")
        setIsLoading(false)
        return
      }

      // If user is not authenticated, store form data and redirect to login
      if (!session) {
        const consultationData = { ...data, totalPrice, serviceType: "BLOCKCHAIN_INTEGRATION_ADVISORY" }
        localStorage.setItem('pendingConsultation', JSON.stringify(consultationData))
        setIsSubmitted(true)
        setTimeout(() => {
          router.push("/auth/unified-signin?redirect=book-consultation")
        }, 3000)
        return
      }

      if (paymentMethod === 'subscription') {
        // Book with subscription credit
        console.log("Booking Blockchain Integration Advisory consultation with subscription credit")
      } else {
        // For demo purposes, simulate payment processing
        console.log("Processing Blockchain Integration Advisory consultation payment for:", totalPrice, "USD")
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          consultationType: "BLOCKCHAIN_INTEGRATION_ADVISORY",
          totalPrice: paymentMethod === 'subscription' ? 0 : totalPrice,
          paymentMethod,
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
      alert("Processing failed. Please try again.")
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
                Blockchain Integration Advisory <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Consultation Booked</span>!
              </h2>
              
              {!showCalendly ? (
                <>
                  <p className="text-gray-400 text-lg mb-4">
                    {session 
                      ? paymentMethod === 'subscription' 
                        ? "Subscription credit used successfully! Your blockchain integration advisory consultation has been booked."
                        : `Payment of $${totalPrice} processed successfully! Your blockchain integration advisory consultation has been booked.`
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
                    Now let's schedule your blockchain integration advisory consultation!
                  </p>
                  
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-6 border border-orange-500/20">
                    <h3 className="text-xl font-semibold mb-4 text-orange-300">Schedule Your Meeting</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Click the link below to choose a convenient time for your blockchain integration advisory consultation with our experts.
                    </p>
                    
                    <div className="space-y-4">
                      <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105">
                        <a 
                          href="https://calendly.com/diligence-labs/blockchain-integration" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          Schedule Integration Session
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
              <span className={`font-normal bg-gradient-to-r ${serviceDetails.color} bg-clip-text text-transparent`}>Blockchain Integration Advisory</span> Consultation
            </h1>
            <p className="text-gray-400 text-lg">Strategic blockchain deployment guidance and technical solution advisory</p>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10" animated={true}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-light text-white">Integration Advisory Details</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Provide comprehensive information for blockchain integration strategy and technical guidance
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

                    <div className="bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-xl p-4 border border-orange-500/10">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-orange-300 mb-2">Session Investment</h4>
                        <p className="text-sm text-gray-400 mb-3">
                          Blockchain integration advisory with strategic deployment guidance and technical recommendations.
                        </p>
                        <div className="text-2xl font-bold text-white">
                          {selectedDuration && totalPrice > 0 ? (
                            <span className="text-orange-400">${totalPrice}</span>
                          ) : (
                            <span className="text-gray-500">Select duration</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  {selectedDuration && subscription && (
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
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="blockchainType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Preferred Blockchain</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue placeholder="Select blockchain type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="ETHEREUM" className="hover:bg-gray-700">Ethereum</SelectItem>
                              <SelectItem value="BITCOIN" className="hover:bg-gray-700">Bitcoin</SelectItem>
                              <SelectItem value="SOLANA" className="hover:bg-gray-700">Solana</SelectItem>
                              <SelectItem value="POLYGON" className="hover:bg-gray-700">Polygon</SelectItem>
                              <SelectItem value="BINANCE_SMART_CHAIN" className="hover:bg-gray-700">Binance Smart Chain</SelectItem>
                              <SelectItem value="CARDANO" className="hover:bg-gray-700">Cardano</SelectItem>
                              <SelectItem value="AVALANCHE" className="hover:bg-gray-700">Avalanche</SelectItem>
                              <SelectItem value="OTHER" className="hover:bg-gray-700">Other / Undecided</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <FormLabel className="text-gray-300 text-lg">Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide detailed information about your project, including the problem it solves, target users, business model, and blockchain integration requirements..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[120px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Include project vision, business requirements, and integration scope
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="integrationGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Integration Goals</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you want to achieve with blockchain integration - smart contracts, payments, data storage, identity management, tokenization..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[100px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Define specific blockchain functionalities needed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="currentInfrastructure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Current Infrastructure</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your current technical stack, hosting, databases, APIs..."
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[100px]"
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
                      name="deploymentModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Deployment Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue placeholder="Select deployment model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="MAINNET" className="hover:bg-gray-700">Mainnet</SelectItem>
                              <SelectItem value="TESTNET" className="hover:bg-gray-700">Testnet</SelectItem>
                              <SelectItem value="PRIVATE_BLOCKCHAIN" className="hover:bg-gray-700">Private Blockchain</SelectItem>
                              <SelectItem value="HYBRID" className="hover:bg-gray-700">Hybrid</SelectItem>
                              <SelectItem value="SIDECHAIN" className="hover:bg-gray-700">Sidechain</SelectItem>
                              <SelectItem value="LAYER2" className="hover:bg-gray-700">Layer 2 Solution</SelectItem>
                              <SelectItem value="OTHER" className="hover:bg-gray-700">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="technicalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Technical Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe specific technical requirements - performance, scalability, security, compliance, development frameworks..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[100px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Include performance, scalability, and security requirements
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
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !selectedDuration || (paymentMethod === 'subscription' && creditBalance?.remainingCredits <= 0)}
                      className={`flex-1 font-medium py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-white disabled:opacity-50 ${
                        paymentMethod === 'subscription' && creditBalance?.remainingCredits > 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600'
                          : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600'
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
          </ProminentBorder>
        </div>
      </div>
    </div>
  )
}