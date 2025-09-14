import { NextResponse } from "next/server"
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { getSubscriptionExpirationTemplate } from "@/lib/admin-email-templates"

// POST - Check and send expiration notifications
export async function POST(request: Request) {
  try {
    // Only ADMIN and SUPER_ADMIN can send bulk notifications
    const adminData = verifyAdminPermission(request, 'ADMIN')
    
    if (!adminData) {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { daysToCheck = [30, 14, 7, 3, 1], testMode = false } = body

    const results = {
      checked: 0,
      sent: 0,
      errors: 0,
      notifications: [] as any[]
    }

    // Check for subscriptions expiring within the specified days
    for (const days of daysToCheck) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + days)
      
      // Find users with subscriptions expiring on target date
      const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })

      results.checked += expiringSubscriptions.length

      for (const subscription of expiringSubscriptions) {
        try {
          // Check if we've already sent a notification for this expiry period
          const existingNotification = await prisma.adminNotificationLog.findFirst({
            where: {
              userId: subscription.user.id,
              notificationType: 'subscription_expiration',
              details: {
                contains: `"daysRemaining":${days}`
              },
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
              }
            }
          })

          if (existingNotification) {
            console.log(`Skipping duplicate notification for user ${subscription.user.email}`)
            continue
          }

          const planName = subscription.planId?.toUpperCase() || 'Premium Plan'
          const expirationDate = subscription.currentPeriodEnd.toLocaleDateString()
          
          const emailTemplate = getSubscriptionExpirationTemplate(
            subscription.user.name || 'User',
            planName,
            expirationDate,
            days
          )

          if (!testMode) {
            const emailSent = await sendEmail({
              to: subscription.user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html
            })

            if (emailSent) {
              // Log the notification
              await prisma.adminNotificationLog.create({
                data: {
                  userId: subscription.user.id,
                  adminId: adminData.adminId,
                  notificationType: 'subscription_expiration',
                  emailSent: true,
                  details: JSON.stringify({
                    planName,
                    expirationDate,
                    daysRemaining: days,
                    subscriptionId: subscription.id
                  }),
                  createdAt: new Date()
                }
              })

              results.sent++
            } else {
              results.errors++
            }
          }

          results.notifications.push({
            userId: subscription.user.id,
            email: subscription.user.email,
            planName,
            expirationDate,
            daysRemaining: days,
            sent: !testMode,
            testMode
          })

        } catch (error) {
          console.error(`Failed to process expiration for user ${subscription.user.email}:`, error)
          results.errors++
        }
      }
    }

    return NextResponse.json({
      message: `Subscription expiration check completed`,
      testMode,
      summary: {
        subscriptionsChecked: results.checked,
        notificationsSent: results.sent,
        errors: results.errors
      },
      notifications: results.notifications
    })

  } catch (error) {
    console.error("Failed to check subscription expirations:", error)
    return NextResponse.json(
      { error: "Failed to check subscription expirations" },
      { status: 500 }
    )
  }
}

// GET - Get upcoming expirations report
export async function GET(request: Request) {
  try {
    // MODERATOR and above can view expiration reports
    const adminData = verifyAdminPermission(request, 'MODERATOR')
    
    if (!adminData) {
      return forbiddenResponse()
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + days)

    const upcomingExpirations = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lte: targetDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        currentPeriodEnd: 'asc'
      }
    })

    const formattedExpirations = upcomingExpirations.map(sub => {
      const daysRemaining = Math.ceil(
        (sub.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        subscriptionId: sub.id,
        userId: sub.user.id,
        userEmail: sub.user.email,
        userName: sub.user.name,
        planId: sub.planId,
        currentPeriodEnd: sub.currentPeriodEnd,
        daysRemaining,
        isUrgent: daysRemaining <= 7,
        isCritical: daysRemaining <= 3
      }
    })

    return NextResponse.json({
      upcomingExpirations: formattedExpirations,
      summary: {
        total: formattedExpirations.length,
        critical: formattedExpirations.filter(e => e.isCritical).length,
        urgent: formattedExpirations.filter(e => e.isUrgent).length
      }
    })

  } catch (error) {
    console.error("Failed to get expiration report:", error)
    return NextResponse.json(
      { error: "Failed to get expiration report" },
      { status: 500 }
    )
  }
}