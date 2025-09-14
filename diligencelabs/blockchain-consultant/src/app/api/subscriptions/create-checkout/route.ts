import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createSubscriptionCheckoutSession } from "@/lib/stripe-subscription"

// Hardcoded enums to match Prisma schema until client generation is fixed
const SubscriptionPlan = {
  BASIC_MONTHLY: 'BASIC_MONTHLY',
  PROFESSIONAL_MONTHLY: 'PROFESSIONAL_MONTHLY', 
  ENTERPRISE_MONTHLY: 'ENTERPRISE_MONTHLY'
} as const

const BillingCycle = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'  
} as const

type SubscriptionPlanType = typeof SubscriptionPlan[keyof typeof SubscriptionPlan]
type BillingCycleType = typeof BillingCycle[keyof typeof BillingCycle]

export async function POST(request: NextRequest) {
  try {
    console.log("Create checkout API called")
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    
    if (!session?.user?.id) {
      console.log("No session found, returning unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)
    const { planId, billingCycle } = body

    if (!planId || !billingCycle) {
      return NextResponse.json({ error: "Plan ID and billing cycle are required" }, { status: 400 })
    }

    if (!Object.values(SubscriptionPlan).includes(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    if (!Object.values(BillingCycle).includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 })
    }

    const checkoutSession = await createSubscriptionCheckoutSession({
      userId: session.user.id,
      email: session.user.email!,
      planId: planId as SubscriptionPlanType,
      billingCycle: billingCycle as BillingCycleType,
      successUrl: `${process.env.NEXTAUTH_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}#subscription`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/#subscription`,
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })

  } catch (error) {
    console.error("Failed to create checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}