// Hardcoded types to match Prisma schema until client generation is fixed
type SubscriptionPlan = 'BASIC_MONTHLY' | 'PROFESSIONAL_MONTHLY' | 'ENTERPRISE_MONTHLY'
type BillingCycle = 'MONTHLY' | 'YEARLY'

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number | string
}

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan
  name: string
  description: string
  price: {
    monthly: number
    yearly?: number
  }
  features: PlanFeature[]
  popular?: boolean
  stripePriceId: {
    monthly: string
    yearly?: string
  }
  consultationCredits: {
    monthly: number
    rollover: boolean
  }
  consultationTypes: string[]
  prioritySupport: boolean
  reportAccess: boolean
  teamCollaboration: boolean
  maxTeamMembers?: number
}

// Special plan for free consultation (not stored in database)
export const FREE_CONSULTATION_PLAN: SubscriptionPlanConfig = {
  id: "BASIC_FREE" as any, // Special non-database plan
  name: "Basic",
  description: "One-time free consultation for new clients",
  price: {
    monthly: 0,
  },
  features: [
    { name: "1 Free Consultation", included: true },
    { name: "Strategic Advisory", included: true },
    { name: "Email Support", included: true },
    { name: "Basic Project Assessment", included: true },
    { name: "Follow-up Report", included: false },
    { name: "Priority Support", included: false },
    { name: "Team Collaboration", included: false },
    { name: "Advanced Analytics", included: false },
  ],
  stripePriceId: {
    monthly: "free", // Free plan
  },
  consultationCredits: {
    monthly: 1,
    rollover: false,
  },
  consultationTypes: ["STRATEGIC_ADVISORY"],
  prioritySupport: false,
  reportAccess: false,
  teamCollaboration: false,
}

export const PAID_SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: "BASIC_MONTHLY" as SubscriptionPlan,
    name: "Premium",
    description: "Monthly subscription with enhanced features",
    price: {
      monthly: 299,
    },
    features: [
      { name: "3 Monthly Consultations", included: true },
      { name: "All Consultation Types", included: true },
      { name: "Priority Scheduling", included: true },
      { name: "Priority Email Support", included: true },
      { name: "Advanced Reports & Analytics", included: true },
      { name: "Credit Rollover", included: true },
      { name: "Team Collaboration", included: true, limit: "2 members" },
      { name: "Monthly Strategy Sessions", included: true },
    ],
    stripePriceId: {
      monthly: "price_premium_monthly",
    },
    consultationCredits: {
      monthly: 3,
      rollover: true,
    },
    consultationTypes: ["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKEN_LAUNCH", "BLOCKCHAIN_INTEGRATION_ADVISORY"],
    prioritySupport: true,
    reportAccess: true,
    teamCollaboration: true,
    maxTeamMembers: 2,
    popular: true,
  },
  {
    id: "PROFESSIONAL_MONTHLY" as SubscriptionPlan,
    name: "Professional",
    description: "Advanced monthly subscription for professional users",
    price: {
      monthly: 499,
    },
    features: [
      { name: "6 Monthly Consultations", included: true },
      { name: "All Consultation Types", included: true },
      { name: "Comprehensive Due Diligence", included: true },
      { name: "Priority Support (24h response)", included: true },
      { name: "Custom Reports & Analytics", included: true },
      { name: "Team Collaboration", included: true, limit: "5 members" },
      { name: "Monthly Strategic Reviews", included: true },
      { name: "Direct Expert Access", included: true },
    ],
    stripePriceId: {
      monthly: "price_professional_monthly",
    },
    consultationCredits: {
      monthly: 6,
      rollover: true,
    },
    consultationTypes: ["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKEN_LAUNCH", "BLOCKCHAIN_INTEGRATION_ADVISORY"],
    prioritySupport: true,
    reportAccess: true,
    teamCollaboration: true,
    maxTeamMembers: 5,
  },
  {
    id: "ENTERPRISE_MONTHLY" as SubscriptionPlan,
    name: "Enterprise",
    description: "Top-tier monthly subscription for enterprise-level needs",
    price: {
      monthly: 999,
    },
    features: [
      { name: "Unlimited Monthly Consultations", included: true },
      { name: "All Consultation Types", included: true },
      { name: "White-glove Due Diligence", included: true },
      { name: "24/7 Priority Support", included: true },
      { name: "Custom Reports & Analytics", included: true },
      { name: "Unlimited Team Collaboration", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Custom Integration Support", included: true },
    ],
    stripePriceId: {
      monthly: "price_enterprise_monthly",
    },
    consultationCredits: {
      monthly: -1, // Unlimited
      rollover: true,
    },
    consultationTypes: ["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKEN_LAUNCH", "BLOCKCHAIN_INTEGRATION_ADVISORY"],
    prioritySupport: true,
    reportAccess: true,
    teamCollaboration: true,
  },
]

// Combined plans for display (includes free plan + paid plans)
export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  FREE_CONSULTATION_PLAN,
  ...PAID_SUBSCRIPTION_PLANS
]

export function getPlanConfig(planId: SubscriptionPlan | string): SubscriptionPlanConfig | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

export function getPlanPrice(planId: SubscriptionPlan, cycle: BillingCycle): number {
  const plan = getPlanConfig(planId)
  if (!plan) return 0
  
  return cycle === "MONTHLY" ? plan.price.monthly : (plan.price.yearly || plan.price.monthly * 12)
}

export function getStripePriceId(planId: SubscriptionPlan, cycle: BillingCycle): string {
  const plan = getPlanConfig(planId)
  if (!plan) return ""
  
  return cycle === "MONTHLY" 
    ? plan.stripePriceId.monthly 
    : (plan.stripePriceId.yearly || plan.stripePriceId.monthly)
}

export function hasFeature(planId: SubscriptionPlan, featureName: string): boolean {
  const plan = getPlanConfig(planId)
  if (!plan) return false
  
  const feature = plan.features.find(f => f.name === featureName)
  return feature?.included || false
}

export function getConsultationCredits(planId: SubscriptionPlan): number {
  const plan = getPlanConfig(planId)
  return plan?.consultationCredits.monthly || 0
}

export function canAccessConsultationType(planId: SubscriptionPlan, consultationType: string): boolean {
  const plan = getPlanConfig(planId)
  if (!plan) return false
  
  return plan.consultationTypes.includes(consultationType)
}