import { NextResponse } from "next/server"
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { 
  getSubscriptionStatusTemplate, 
  getMaliciousActivityTemplate, 
  getSubscriptionExpirationTemplate 
} from "@/lib/admin-email-templates"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN and SUPER_ADMIN can send notifications
    const adminData = verifyAdminPermission(request, 'ADMIN')
    
    if (!adminData) {
      return forbiddenResponse()
    }

    const userId = params.id
    const body = await request.json()
    const { notificationType, ...notificationData } = body

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let emailTemplate
    let logData: any = {
      userId,
      adminId: adminData.adminId,
      notificationType,
      timestamp: new Date()
    }

    // Generate appropriate email template based on notification type
    switch (notificationType) {
      case 'subscription_status':
        const { status, details, actionRequired } = notificationData
        emailTemplate = getSubscriptionStatusTemplate(
          user.name || 'User',
          status,
          details,
          actionRequired
        )
        logData.details = { status, details, actionRequired }
        break

      case 'malicious_activity':
        const { activityType, details: activityDetails, ipAddress, timestamp } = notificationData
        emailTemplate = getMaliciousActivityTemplate(
          user.name || 'User',
          activityType,
          activityDetails,
          ipAddress,
          timestamp
        )
        logData.details = { activityType, details: activityDetails, ipAddress, timestamp }
        break

      case 'subscription_expiration':
        const { planName, expirationDate, daysRemaining } = notificationData
        emailTemplate = getSubscriptionExpirationTemplate(
          user.name || 'User',
          planName,
          expirationDate,
          daysRemaining
        )
        logData.details = { planName, expirationDate, daysRemaining }
        break

      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        )
    }

    // Send email
    const emailSent = await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email notification" },
        { status: 500 }
      )
    }

    // Log the notification in database
    await prisma.adminNotificationLog.create({
      data: {
        userId,
        adminId: adminData.adminId,
        notificationType,
        emailSent: true,
        details: JSON.stringify(logData.details),
        createdAt: new Date()
      }
    })

    // Also log as user activity if it's a security-related notification
    if (notificationType === 'malicious_activity') {
      await prisma.userActivityLog.create({
        data: {
          userId,
          action: 'SECURITY_NOTIFICATION_SENT',
          details: `Admin sent security alert: ${notificationData.activityType}`,
          ipAddress: notificationData.ipAddress || 'Unknown',
          userAgent: 'Admin Panel',
          createdAt: new Date()
        }
      })
    }

    return NextResponse.json({
      message: "Notification sent successfully",
      emailSent: true,
      notificationType,
      sentTo: user.email
    })

  } catch (error) {
    console.error("Failed to send notification:", error)
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    )
  }
}