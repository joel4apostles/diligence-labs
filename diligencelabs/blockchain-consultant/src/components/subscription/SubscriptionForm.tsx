"use client"

import { useState, memo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ProminentBorder } from "@/components/ui/border-effects"
import { SubscriptionPlanConfig } from "@/lib/subscription-plans"
import { subscriptionFormSchema, SubscriptionFormData } from "./schema"
import dynamic from "next/dynamic"

// Lazy load form sections for better performance
const AccountInfoSection = dynamic(() => import("./AccountInfoSection").then(mod => ({ default: mod.AccountInfoSection })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-800/50 rounded-xl mb-6" />
})

const ServiceSelectionSection = dynamic(() => import("./ServiceSelectionSection").then(mod => ({ default: mod.ServiceSelectionSection })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-800/50 rounded-xl mb-6" />
})

const ProjectInfoSection = dynamic(() => import("./ProjectInfoSection").then(mod => ({ default: mod.ProjectInfoSection })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-800/50 rounded-xl mb-6" />
})

const ConsultationPreferencesSection = dynamic(() => import("./ConsultationPreferencesSection").then(mod => ({ default: mod.ConsultationPreferencesSection })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-800/50 rounded-xl mb-6" />
})

interface SubscriptionFormProps {
  plan: SubscriptionPlanConfig
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  context?: 'homepage' | 'dashboard'
}

function SubscriptionFormComponent({ plan, isOpen, onClose, onSuccess, context = 'homepage' }: SubscriptionFormProps) {
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
      primaryService: "STRATEGIC_ADVISORY" as const,
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

  const showAccountFields = !session || context === 'homepage'

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/subscriptions/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          planId: plan.id,
          billingCycle: 'monthly'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Something went wrong')
      }

      const result = await response.json()
      
      if (result.success) {
        onSuccess()
        
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
        } else if (result.requiresAuth) {
          localStorage.setItem('pendingSubscriptionForm', JSON.stringify({
            formData: data,
            planId: plan.id,
            billingCycle: 'monthly'
          }))
          router.push('/auth/unified-signin')
        }
      }
    } catch (error: any) {
      console.error('Subscription form error:', error)
      alert(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Subscribe to {plan.name}
          </DialogTitle>
        </DialogHeader>

        <ProminentBorder className="rounded-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              <AccountInfoSection form={form} showAccountFields={showAccountFields} />
              <ServiceSelectionSection form={form} />
              <ProjectInfoSection form={form} />
              <ConsultationPreferencesSection form={form} />

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-8"
                >
                  {isLoading ? 'Processing...' : `Subscribe to ${plan.name}`}
                </Button>
              </div>
            </form>
          </Form>
        </ProminentBorder>
      </DialogContent>
    </Dialog>
  )
}

export const SubscriptionForm = memo(SubscriptionFormComponent)