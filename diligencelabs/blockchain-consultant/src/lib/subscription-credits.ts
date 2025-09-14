import { prisma } from './prisma'
import { SubscriptionPlan } from '@prisma/client'
import { getConsultationCredits } from './subscription-plans'

export interface CreditUsage {
  userId: string
  consultationType: string
  sessionId: string
  creditsUsed: number
  remainingCredits: number
}

export interface CreditBalance {
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  resetDate: Date
  isUnlimited: boolean
}

// Add consultation credit tracking to the Session model when used with subscriptions
export async function useConsultationCredit(
  userId: string, 
  sessionId: string, 
  consultationType: string
): Promise<{ success: boolean; message: string; remainingCredits?: number }> {
  
  // Get user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'TRIALING'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!subscription) {
    return { success: false, message: "No active subscription found" }
  }

  // Get plan credits configuration
  const planCredits = getConsultationCredits(subscription.planType)
  
  // Enterprise has unlimited credits
  if (planCredits === -1) {
    return { 
      success: true, 
      message: "Unlimited credits available",
      remainingCredits: -1
    }
  }

  // Calculate current period usage
  const currentPeriodStart = subscription.currentPeriodStart
  const currentPeriodEnd = subscription.currentPeriodEnd

  const usedCreditsThisPeriod = await prisma.session.count({
    where: {
      userId,
      createdAt: {
        gte: currentPeriodStart,
        lte: currentPeriodEnd
      },
      // Only count sessions that have used subscription credits
      // We can use a custom field or session status to track this
      status: { not: 'CANCELLED' }
    }
  })

  const remainingCredits = planCredits - usedCreditsThisPeriod

  if (remainingCredits <= 0) {
    return { 
      success: false, 
      message: `Monthly credit limit of ${planCredits} consultations reached`,
      remainingCredits: 0
    }
  }

  // Credit is available, mark session as using subscription credit
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      // We can add a field to track subscription usage
      // For now, we'll use the existing fields to indicate subscription usage
      description: `${consultationType} - Subscription Credit Used`
    }
  })

  return { 
    success: true, 
    message: "Consultation credit used successfully",
    remainingCredits: remainingCredits - 1
  }
}

export async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  // Get user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'TRIALING'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!subscription) {
    return null
  }

  // Get plan credits configuration
  const planCredits = getConsultationCredits(subscription.planType)
  
  // Enterprise has unlimited credits
  if (planCredits === -1) {
    return {
      totalCredits: -1,
      usedCredits: 0,
      remainingCredits: -1,
      resetDate: subscription.currentPeriodEnd,
      isUnlimited: true
    }
  }

  // Calculate current period usage
  const currentPeriodStart = subscription.currentPeriodStart
  const currentPeriodEnd = subscription.currentPeriodEnd

  const usedCreditsThisPeriod = await prisma.session.count({
    where: {
      userId,
      createdAt: {
        gte: currentPeriodStart,
        lte: currentPeriodEnd
      },
      status: { not: 'CANCELLED' }
    }
  })

  const remainingCredits = Math.max(0, planCredits - usedCreditsThisPeriod)

  return {
    totalCredits: planCredits,
    usedCredits: usedCreditsThisPeriod,
    remainingCredits,
    resetDate: currentPeriodEnd,
    isUnlimited: false
  }
}

export async function canBookConsultation(
  userId: string, 
  consultationType: string
): Promise<{ canBook: boolean; reason?: string; creditsRemaining?: number }> {
  
  // Get user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'TRIALING'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!subscription) {
    return { 
      canBook: false, 
      reason: "No active subscription. Please subscribe to a plan or book a free consultation." 
    }
  }

  // Check if subscription includes this consultation type
  // This would need to be implemented based on plan features
  
  const creditBalance = await getCreditBalance(userId)
  
  if (!creditBalance) {
    return { 
      canBook: false, 
      reason: "Unable to verify subscription credits" 
    }
  }

  if (creditBalance.isUnlimited) {
    return { 
      canBook: true, 
      creditsRemaining: -1 
    }
  }

  if (creditBalance.remainingCredits <= 0) {
    return { 
      canBook: false, 
      reason: `Monthly credit limit reached. Credits reset on ${creditBalance.resetDate.toLocaleDateString()}`,
      creditsRemaining: 0
    }
  }

  return { 
    canBook: true, 
    creditsRemaining: creditBalance.remainingCredits 
  }
}

export async function getSubscriptionUsageReport(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'TRIALING'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!subscription) {
    return null
  }

  const currentPeriodStart = subscription.currentPeriodStart
  const currentPeriodEnd = subscription.currentPeriodEnd

  // Get all sessions in current billing period
  const sessionsThisPeriod = await prisma.session.findMany({
    where: {
      userId,
      createdAt: {
        gte: currentPeriodStart,
        lte: currentPeriodEnd
      }
    },
    select: {
      id: true,
      consultationType: true,
      status: true,
      createdAt: true,
      completedAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const creditBalance = await getCreditBalance(userId)

  return {
    subscription: {
      planType: subscription.planType,
      status: subscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      amount: subscription.amount
    },
    creditBalance,
    sessionsThisPeriod,
    usage: {
      totalSessions: sessionsThisPeriod.length,
      completedSessions: sessionsThisPeriod.filter(s => s.status === 'COMPLETED').length,
      pendingSessions: sessionsThisPeriod.filter(s => s.status === 'PENDING').length,
      cancelledSessions: sessionsThisPeriod.filter(s => s.status === 'CANCELLED').length
    }
  }
}