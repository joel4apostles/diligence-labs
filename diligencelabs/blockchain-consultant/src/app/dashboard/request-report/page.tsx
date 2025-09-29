"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { formatDateForInput } from "@/lib/date-utils"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { StripePayment } from "@/components/stripe-payment"

const reportSchema = z.object({
  type: z.enum(["DUE_DILIGENCE", "ADVISORY_NOTES", "TECHNICAL_ANALYSIS", "MARKET_RESEARCH"], {
    required_error: "Please select a report type",
  }),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  projectName: z.string().min(2, "Project name is required"),
  projectUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  deadline: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    required_error: "Please select priority level",
  }),
  additionalNotes: z.string().optional(),
})

type ReportForm = z.infer<typeof reportSchema>

const reportTypes = [
  {
    value: "DUE_DILIGENCE",
    label: "Due Diligence Report",
    description: "Comprehensive analysis of project viability, team, technology, and market potential",
    icon: "🔍",
    basePrice: 2500,
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "BLOCKCHAIN_INTEGRATION_ADVISORY",
    label: "Blockchain Integration Advisory",
    description: "Strategic guidance on blockchain deployment choices and technical solution providers",
    icon: "🔗",
    basePrice: 2200,
    color: "from-orange-500 to-red-500"
  },
  {
    value: "MARKET_RESEARCH",
    label: "Market Research",
    description: "Market dynamics analysis, competitive landscape, and positioning strategy",
    icon: "📈",
    basePrice: 1200,
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "ADVISORY_NOTES",
    label: "Advisory Notes",
    description: "Strategic recommendations and actionable insights for your project",
    icon: "📋",
    basePrice: 800,
    color: "from-orange-500 to-red-500"
  }
]

const priorityMultipliers = {
  LOW: 1.0,
  MEDIUM: 1.2,
  HIGH: 1.5
}

const getSectionSpecificPlaceholder = (reportType: string) => {
  switch (reportType) {
    case "DUE_DILIGENCE":
      return "Describe your project in detail including: team background, funding status, technical implementation, target market, competitive landscape, regulatory considerations, and any specific concerns or questions you have about the project's viability..."
    case "TECHNICAL_ANALYSIS":
      return "Provide technical details about: smart contract addresses, blockchain platform, architecture design, security considerations, scalability requirements, integration points, current development status, and any specific technical challenges or areas of concern..."
    case "MARKET_RESEARCH":
      return "Describe your project's market positioning including: target audience, competitive analysis needs, market size estimations, go-to-market strategy, pricing models, partnership opportunities, and specific market insights you're seeking..."
    case "ADVISORY_NOTES":
      return "Outline your strategic questions and challenges including: business model concerns, growth strategy, fundraising plans, partnership strategies, regulatory guidance needs, and any specific decisions or strategic direction you need guidance on..."
    default:
      return "Describe your project, what you're building, your goals, and what specific areas you'd like us to focus on..."
  }
}

const getSectionSpecificDescription = (reportType: string) => {
  switch (reportType) {
    case "DUE_DILIGENCE":
      return "For due diligence reports, please provide comprehensive details about team, technology, financials, market opportunity, and risks to help us deliver thorough analysis"
    case "TECHNICAL_ANALYSIS":
      return "For technical analysis, please include architecture details, smart contract information, security requirements, and any specific technical concerns"
    case "MARKET_RESEARCH":
      return "For market research, please include target market details, competitive landscape information, and specific market insights you're seeking"
    case "ADVISORY_NOTES":
      return "For strategic advisory notes, please outline your key challenges, decision points, and areas where you need strategic guidance"
    default:
      return "Please provide comprehensive details to help us deliver the most valuable analysis"
  }
}

function RequestReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedPriority, setSelectedPriority] = useState<string>("MEDIUM")
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const preselectedType = searchParams.get("type") as "DUE_DILIGENCE" | "TECHNICAL_ANALYSIS" | "MARKET_RESEARCH" | "ADVISORY_NOTES" | null

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: preselectedType || undefined,
      priority: "MEDIUM",
    },
  })

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  // Calculate price when report type or priority changes
  useEffect(() => {
    if (selectedType && selectedPriority) {
      const reportType = reportTypes.find(type => type.value === selectedType)
      const priorityMultiplier = priorityMultipliers[selectedPriority as keyof typeof priorityMultipliers]
      
      if (reportType && priorityMultiplier) {
        const price = Math.round(reportType.basePrice * priorityMultiplier)
        setTotalPrice(price)
      }
    }
  }, [selectedType, selectedPriority])

  // Initialize selected values from form
  useEffect(() => {
    if (preselectedType) {
      setSelectedType(preselectedType)
      form.setValue("type", preselectedType)
    }
  }, [preselectedType, form])

  async function onSubmit(data: ReportForm) {
    setIsLoading(true)

    try {
      // Validate that payment amount is calculated
      if (!totalPrice || totalPrice <= 0) {
        alert("Please select both report type and priority to calculate pricing.")
        setIsLoading(false)
        return
      }

      // Show payment modal
      setShowPaymentModal(true)
    } catch (error) {
      console.error("Error requesting report:", error)
      alert("Payment processing failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      setShowPaymentModal(false)
      setIsLoading(true)

      const response = await fetch("/api/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form.getValues(),
          totalPrice,
          selectedType,
          selectedPriority,
          paymentStatus: "completed"
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          router.push("/dashboard/reports")
        }, 3000)
      } else {
        console.error("Failed to request report")
        alert("Failed to request report. Please try again.")
      }
    } catch (error) {
      console.error("Error requesting report:", error)
      alert("Failed to request report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false)
    alert(error)
  }

  const renderSectionSpecificFields = (reportType: string) => {
    switch (reportType) {
      case "DUE_DILIGENCE":
        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">Due Diligence Specific Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Size & Background</label>
                <Textarea 
                  placeholder="Describe your team size, key members' experience, advisors..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[80px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Funding & Financial Status</label>
                <Textarea 
                  placeholder="Current funding status, revenue model, financial projections..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[80px]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key Risk Areas to Analyze</label>
              <Textarea 
                placeholder="Specific risks, concerns, or red flags you want us to investigate..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[80px]" 
              />
            </div>
          </div>
        )
      
      case "BLOCKCHAIN_INTEGRATION_ADVISORY":
        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-xl border border-orange-500/20">
            <h3 className="text-lg font-semibold text-orange-300 mb-4">Blockchain Integration Advisory Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Type & Industry</label>
                <Input 
                  placeholder="DeFi, NFT, Gaming, Enterprise, etc."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Blockchain(s)</label>
                <Input 
                  placeholder="Ethereum, Polygon, Solana, BSC, or need recommendations"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range (USD)</label>
                <Input 
                  placeholder="$10K - $100K, $100K+, etc."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeline Requirements</label>
                <Input 
                  placeholder="3 months, 6 months, flexible, etc."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Integration Requirements</label>
              <Textarea 
                placeholder="Describe your needs: blockchain selection, infrastructure partners, development frameworks, white-label solutions, third-party integrations..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[100px]" 
              />
            </div>
          </div>
        )

      case "MARKET_RESEARCH":
        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/20">
            <h3 className="text-lg font-semibold text-green-300 mb-4">Market Research Focus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Market & Users</label>
                <Textarea 
                  placeholder="Who is your target audience? Demographics, use cases..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 min-h-[80px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Key Competitors</label>
                <Textarea 
                  placeholder="List main competitors and what differentiates you..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 min-h-[80px]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Specific Market Questions</label>
              <Textarea 
                placeholder="Market size, pricing strategy, go-to-market approach, growth potential..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 min-h-[80px]" 
              />
            </div>
          </div>
        )

      case "ADVISORY_NOTES":
        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-xl border border-orange-500/20">
            <h3 className="text-lg font-semibold text-orange-300 mb-4">Strategic Advisory Focus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Key Strategic Decisions</label>
                <Textarea 
                  placeholder="What major decisions or strategic choices are you facing?"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[80px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Model & Growth</label>
                <Textarea 
                  placeholder="Revenue model, growth strategy, scaling challenges..."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[80px]" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Specific Advisory Areas</label>
              <Textarea 
                placeholder="Fundraising, partnerships, regulatory, product strategy, team building..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[80px]" 
              />
            </div>
          </div>
        )

      default:
        return null
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
                Report <span className="font-normal bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Requested</span>!
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                Your report request has been submitted successfully. We'll begin working on it right away and notify you when it's ready.
              </p>
              <div className="text-sm text-gray-500 mb-6">
                Redirecting to your reports...
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
              </div>
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
          <Link href="/dashboard/reports">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-light mb-2">
              Request <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Report</span>
            </h1>
            <p className="text-gray-400 text-lg">Get expert analysis for your blockchain project</p>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10" animated={true} movingBorder={true}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-light text-white">Report Details</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Please provide details about the report you need
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Report Type</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); setSelectedType(value) }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-64">
                            {reportTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value} className="hover:bg-gray-700 py-3">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-start gap-3">
                                    <span className="text-lg">{type.icon}</span>
                                    <div>
                                      <div className="font-medium text-white">{type.label}</div>
                                      <div className="text-sm text-gray-400">
                                        {type.description}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-3 text-sm font-semibold text-green-400">
                                    ${type.basePrice}
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Priority Level</FormLabel>
                          <Select onValueChange={(value) => { field.onChange(value); setSelectedPriority(value) }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="LOW" className="hover:bg-gray-700">
                                <div className="flex items-center justify-between w-full">
                                  <span>Low - Standard timeline</span>
                                  <span className="text-sm text-gray-400 ml-3">Base rate</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="MEDIUM" className="hover:bg-gray-700">
                                <div className="flex items-center justify-between w-full">
                                  <span>Medium - Priority delivery</span>
                                  <span className="text-sm text-green-400 ml-3">+20%</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="HIGH" className="hover:bg-gray-700">
                                <div className="flex items-center justify-between w-full">
                                  <span>High - Urgent delivery</span>
                                  <span className="text-sm text-orange-400 ml-3">+50%</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                        <FormLabel className="text-gray-300 text-lg">Report Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief title for your report" 
                            {...field} 
                            disabled={isLoading}
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          A clear, descriptive title for the report
                        </FormDescription>
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
                            placeholder={getSectionSpecificPlaceholder(selectedType)}
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[120px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          {getSectionSpecificDescription(selectedType)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Section-Specific Questions */}
                  {selectedType && renderSectionSpecificFields(selectedType)}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="projectUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Project URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="url"
                              placeholder="https://your-project.com"
                              {...field} 
                              disabled={isLoading}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 h-12"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Website, GitHub, or documentation link
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-lg">Preferred Deadline (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              min={formatDateForInput(new Date())}
                              {...field} 
                              disabled={isLoading}
                              className="bg-gray-800/50 border-gray-600 text-white focus:border-orange-500 h-12"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            When would you like to receive the report?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-lg">Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific requirements, focus areas, or additional information..."
                            {...field}
                            disabled={isLoading}
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          Share any specific aspects you want us to emphasize or special requirements
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pricing Display */}
                  {selectedType && selectedPriority && totalPrice > 0 && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-green-400 mb-1">Report Price</h3>
                          <p className="text-gray-400 text-sm">
                            {reportTypes.find(t => t.value === selectedType)?.label} • 
                            {selectedPriority} Priority
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-400">${totalPrice}</div>
                          <div className="text-sm text-gray-400">Payment required</div>
                        </div>
                      </div>
                    </div>
                  )}

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
                          This report requires upfront payment of <strong>${totalPrice || '---'}</strong> to secure your request. 
                          Payment will be processed securely via Stripe before we begin working on your report.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !selectedType || !selectedPriority || totalPrice <= 0}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white font-medium py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
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
                          Pay ${totalPrice || '---'} & Request Report
                        </>
                      )}
                    </Button>
                    <Link href="/dashboard/reports">
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

        {/* Stripe Payment Modal */}
        <StripePayment
          amount={totalPrice}
          description={selectedType ? `${reportTypes.find(t => t.value === selectedType)?.label} Report` : "Blockchain Analysis Report"}
          consultationType={selectedType || 'blockchain-analysis'}
          duration={selectedPriority || 'standard'}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      </div>
    </div>
  )
}

export default function RequestReport() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    }>
      <RequestReportContent />
    </Suspense>
  )
}