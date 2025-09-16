"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ProminentBorder } from "@/components/ui/border-effects"
import { SubscriptionPlanConfig } from "@/lib/subscription-plans"

const subscriptionFormSchema = z.object({
  // Account Information (for non-authenticated users)
  fullName: z.string().optional(),
  email: z.string().optional(), 
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  company: z.string().optional(),
  
  // Service Selection
  primaryService: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKEN_LAUNCH", "BLOCKCHAIN_INTEGRATION_ADVISORY"], {
    required_error: "Please select your primary service need",
  }),
  additionalServices: z.array(z.string()).optional(),
  
  // Project Information
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(10, "Please provide details about your project"),
  primaryGoals: z.string().min(5, "Please describe your primary goals"),
  timeline: z.enum(["IMMEDIATE", "1_MONTH", "3_MONTHS", "6_MONTHS"], {
    required_error: "Please select your timeline",
  }),
  budgetRange: z.enum(["UNDER_10K", "10K_50K", "50K_100K", "100K_PLUS"], {
    required_error: "Please select your budget range",
  }),
  teamSize: z.enum(["SOLO", "2_5", "6_10", "11_PLUS"], {
    required_error: "Please select your team size",
  }),
  industryFocus: z.string().min(1, "Please specify your industry focus"),
  specificChallenges: z.string().optional(),
  
  // Consultation Preferences
  preferredSchedule: z.enum(["MORNING", "AFTERNOON", "EVENING", "FLEXIBLE"]).optional(),
  communicationPreference: z.enum(["EMAIL", "PHONE", "SLACK", "VIDEO_CALL"]).optional(),
}).superRefine((data, ctx) => {
  // Only validate account fields if user is actually trying to create an account
  // This happens when fullName AND email AND password are all provided (indicating account creation intent)
  if (data.fullName && data.email && data.password) {
    // Validate account creation fields
    if (data.fullName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name must be at least 2 characters",
        path: ["fullName"]
      })
    }
    if (!z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address",
        path: ["email"]
      })
    }
    if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 6 characters",
        path: ["password"]
      })
    }
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"]
      })
    }
    if (!data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please confirm your password",
        path: ["confirmPassword"]
      })
    }
  }
})

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

interface SubscriptionFormProps {
  plan: SubscriptionPlanConfig
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  context?: 'homepage' | 'dashboard' // Added context prop
}

export function SubscriptionForm({ plan, isOpen, onClose, onSuccess, context = 'homepage' }: SubscriptionFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      fullName: session?.user?.name || undefined,
      email: session?.user?.email || undefined,
      password: undefined,
      confirmPassword: undefined,
      company: undefined,
      primaryService: "STRATEGIC_ADVISORY",
      additionalServices: [],
      projectName: "",
      projectDescription: "",
      primaryGoals: "",
      timeline: "3_MONTHS",
      budgetRange: "10K_50K",
      teamSize: "2_5",
      industryFocus: "",
      specificChallenges: "",
      preferredSchedule: "FLEXIBLE",
      communicationPreference: "EMAIL",
    },
  })

  const serviceOptions = [
    {
      value: "STRATEGIC_ADVISORY",
      label: "Strategic Advisory",
      description: "Navigate complex blockchain landscapes with expert guidance",
      color: "from-blue-500 to-cyan-500"
    },
    {
      value: "DUE_DILIGENCE",
      label: "Due Diligence",
      description: "Comprehensive analysis of technical architecture and market potential",
      color: "from-purple-500 to-pink-500"
    },
    {
      value: "TOKEN_LAUNCH",
      label: "Token Launch Consultation",
      description: "End-to-end guidance for successful token launches",
      color: "from-green-500 to-emerald-500"
    },
    {
      value: "BLOCKCHAIN_INTEGRATION_ADVISORY",
      label: "Blockchain Integration Advisory",
      description: "Strategic guidance on blockchain deployment and solution providers",
      color: "from-orange-500 to-red-500"
    }
  ]

  const handleSubmit = async (data: SubscriptionFormData) => {
    console.log("Form submitted with data:", data)
    console.log("Current session:", session)
    setIsLoading(true)
    
    try {
      // If user is not authenticated and has provided account details, create account first
      if (!session && data.fullName && data.email && data.password) {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.fullName,
            email: data.email,
            password: data.password
          })
        })

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json()
          console.error("Registration failed:", errorData.message)
          alert(`Registration failed: ${errorData.message || 'Unknown error'}`)
          return
        }

        // Sign in the newly created user
        const { signIn } = await import("next-auth/react")
        const signInResponse = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (signInResponse?.error) {
          console.error("Auto sign-in failed after registration")
          // Store form data and redirect to login
          localStorage.setItem('pendingSubscriptionForm', JSON.stringify({ 
            ...data, 
            planId: plan.id,
            planName: plan.name 
          }))
          router.push('/auth/unified-signin?redirect=subscription&plan=' + plan.id)
          return
        }

        // Wait a moment for session to update and refresh session
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Get updated session
        const { getSession } = await import("next-auth/react")
        const updatedSession = await getSession()
        console.log("Updated session after registration:", updatedSession)
      }

      // If still no session, handle based on context
      if (!session) {
        if (context === 'dashboard') {
          // This shouldn't happen in dashboard context, but handle gracefully
          console.error('No session in dashboard context')
          return
        }
        
        // Homepage context - redirect to auth if no account details provided
        if (!data.fullName || !data.email) {
          localStorage.setItem('pendingSubscriptionForm', JSON.stringify({ 
            ...data, 
            planId: plan.id,
            planName: plan.name 
          }))
          router.push('/auth/unified-signin?redirect=subscription&plan=' + plan.id)
          return
        }
      }

      // Submit subscription form data
      const response = await fetch('/api/subscriptions/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          planId: plan.id,
          planName: plan.name
        })
      })

      if (response.ok) {
        // Proceed to Stripe checkout
        const checkoutResponse = await fetch('/api/subscriptions/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            billingCycle: 'MONTHLY'
          })
        })

        const checkoutData = await checkoutResponse.json()

        if (checkoutResponse.ok && checkoutData.url) {
          window.location.href = checkoutData.url
        } else {
          console.error("Failed to create checkout session:", checkoutData.error)
          alert(`Failed to create checkout session: ${checkoutData.error || 'Unknown error'}`)
        }
      } else {
        const errorData = await response.json()
        console.error("Failed to submit form:", errorData.error)
        alert(`Failed to submit form: ${errorData.error || 'Unknown error'}`)
        return
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      // Show error to user
      alert("There was an error processing your subscription. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto my-2 sm:my-4">
        <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
          <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-0">
            <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                } text-white px-3 py-1 text-sm`}>
                  {plan.name} Plan
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <CardTitle className="text-2xl text-white">
                Let&apos;s Get Started with {plan.name}
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Tell us about your project so we can provide the best consultation experience
              </CardDescription>
              <div className="text-center mt-4">
                <span className="text-3xl font-bold text-white">
                  ${plan.price.monthly}
                </span>
                <span className="text-gray-400 ml-2">per month</span>
              </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                  console.log("Form validation errors:", errors)
                  const errorList = Object.entries(errors).map(([field, error]) => `${field}: ${error.message}`).join('\n')
                  alert(`Please fix these errors:\n\n${errorList}`)
                })} className="space-y-6 sm:space-y-8">
                  {/* Account Information Section (for non-authenticated users on homepage only) */}
                  {!session && context === 'homepage' && (
                    <div className="space-y-6">
                      <div className="border-b border-gray-700 pb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                        <p className="text-sm text-gray-400">Create your account to get started with your subscription</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Full Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your full name" 
                                  {...field} 
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Email Address *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="your@email.com" 
                                  {...field} 
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Password *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password"
                                  placeholder="Create a password" 
                                  {...field} 
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Confirm Password *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password"
                                  placeholder="Confirm your password" 
                                  {...field} 
                                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Company (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your company name" 
                                {...field} 
                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Service Selection Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Service Selection</h3>
                      <p className="text-sm text-gray-400">Choose your primary consultation service and any additional services you need</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="primaryService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Primary Service Need *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                <SelectValue placeholder="Select your main service requirement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-64">
                              {serviceOptions.map((service) => (
                                <SelectItem key={service.value} value={service.value} className="hover:bg-gray-700 py-3">
                                  <div className="flex items-start justify-between w-full">
                                    <div className="flex-1">
                                      <div className="font-medium text-white">{service.label}</div>
                                      <div className="text-xs text-gray-400 mt-1">{service.description}</div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="preferredSchedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Preferred Schedule</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                  <SelectValue placeholder="When do you prefer consultations?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="MORNING">Morning (9AM - 12PM)</SelectItem>
                                <SelectItem value="AFTERNOON">Afternoon (12PM - 6PM)</SelectItem>
                                <SelectItem value="EVENING">Evening (6PM - 9PM)</SelectItem>
                                <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="communicationPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Communication Preference</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                  <SelectValue placeholder="How should we contact you?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="PHONE">Phone</SelectItem>
                                <SelectItem value="SLACK">Slack</SelectItem>
                                <SelectItem value="VIDEO_CALL">Video Call</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Project Information Section */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Project Information</h3>
                      <p className="text-sm text-gray-400">Tell us about your project so we can provide the best consultation experience</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Project Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your blockchain project name" 
                                {...field} 
                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industryFocus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Industry Focus *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., DeFi, Gaming, Healthcare" 
                                {...field} 
                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Project Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your blockchain project, what you're building, and the challenges you're facing..."
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Primary Goals *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What are your main objectives for this subscription? What do you hope to achieve?"
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Timeline *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="IMMEDIATE">Immediate (ASAP)</SelectItem>
                              <SelectItem value="1_MONTH">Within 1 month</SelectItem>
                              <SelectItem value="3_MONTHS">Within 3 months</SelectItem>
                              <SelectItem value="6_MONTHS">Within 6 months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Budget Range *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                <SelectValue placeholder="Select budget" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="UNDER_10K">Under $10K</SelectItem>
                              <SelectItem value="10K_50K">$10K - $50K</SelectItem>
                              <SelectItem value="50K_100K">$50K - $100K</SelectItem>
                              <SelectItem value="100K_PLUS">$100K+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Team Size *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                <SelectValue placeholder="Select team size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="SOLO">Solo founder</SelectItem>
                              <SelectItem value="2_5">2-5 people</SelectItem>
                              <SelectItem value="6_10">6-10 people</SelectItem>
                              <SelectItem value="11_PLUS">11+ people</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specificChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Specific Challenges (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific challenges or roadblocks you're currently facing?"
                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Plan Features Preview */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-4">What&apos;s Included in {plan.name}:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plan.features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            feature.included ? 'bg-green-500/20' : 'bg-gray-600/20'
                          }`}>
                            {feature.included ? (
                              <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                            {feature.name}
                            {feature.limit && <span className="text-gray-400"> ({feature.limit})</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : !session ? (
                        `Sign Up & Subscribe to ${plan.name}`
                      ) : (
                        `Subscribe to ${plan.name} - $${plan.price.monthly}/month`
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={onClose}
                      className="sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 py-4 px-8 text-lg transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </ProminentBorder>
      </div>
    </div>
  )
}