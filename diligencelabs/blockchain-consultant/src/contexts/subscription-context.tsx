"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { SubscriptionPlanConfig } from '@/lib/subscription-plans'

interface SubscriptionContextType {
  isModalOpen: boolean
  selectedPlan: SubscriptionPlanConfig | null
  openSubscriptionModal: (plan: SubscriptionPlanConfig) => void
  closeSubscriptionModal: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanConfig | null>(null)

  const openSubscriptionModal = (plan: SubscriptionPlanConfig) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const closeSubscriptionModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
  }

  return (
    <SubscriptionContext.Provider
      value={{
        isModalOpen,
        selectedPlan,
        openSubscriptionModal,
        closeSubscriptionModal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}