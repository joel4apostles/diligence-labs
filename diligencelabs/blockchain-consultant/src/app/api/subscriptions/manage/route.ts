import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cancelSubscription, pauseSubscription, resumeSubscription } from "@/lib/stripe-subscription"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement when subscription model is added to schema
    // For now, return mock subscription data for free tier users
    const subscription = {
      id: 'free-tier',
      userId: session.user.id,
      planType: 'FREE',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('Subscription API called - returning mock data for user:', session.user.id)
    return NextResponse.json({ subscription })

  } catch (error) {
    console.error("Failed to fetch subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, subscriptionId } = body

    if (!action || !subscriptionId) {
      return NextResponse.json({ error: "Action and subscription ID are required" }, { status: 400 })
    }

    // Verify the subscription belongs to the user
    const subscription = await prisma.subscription.findFirst({
      where: { 
        id: subscriptionId,
        userId: session.user.id 
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    let result

    switch (action) {
      case 'cancel':
        result = await cancelSubscription(subscription.stripeSubscriptionId, false)
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { cancelAtPeriodEnd: true }
        })
        break

      case 'cancel_immediate':
        result = await cancelSubscription(subscription.stripeSubscriptionId, true)
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { 
            status: 'CANCELED',
            canceledAt: new Date()
          }
        })
        break


      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Subscription ${action} successful`,
      result 
    })

  } catch (error) {
    console.error(`Failed to manage subscription:`, error)
    return NextResponse.json(
      { error: `Failed to manage subscription` },
      { status: 500 }
    )
  }
}