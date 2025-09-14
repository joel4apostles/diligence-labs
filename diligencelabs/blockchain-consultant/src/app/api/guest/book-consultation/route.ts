import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, getAccountCreationInviteTemplate } from "@/lib/email"
import { getClientInfo, checkFreeConsultationEligibility, markFreeConsultationUsed } from "@/lib/fraud-prevention"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      consultationType, 
      description, 
      guestEmail, 
      guestName, 
      guestPhone,
      sendAccountInvite = true,
      isFreeConsultation = true // Default to free consultation
    } = body

    // Validate required fields
    if (!consultationType || !guestEmail || !guestName) {
      return NextResponse.json(
        { error: "Consultation type, email, and name are required" },
        { status: 400 }
      )
    }

    // Get client information for fraud prevention
    const clientInfo = await getClientInfo()

    // Check eligibility for free consultation
    if (isFreeConsultation) {
      const eligibilityCheck = await checkFreeConsultationEligibility(guestEmail, clientInfo)
      
      if (!eligibilityCheck.eligible) {
        return NextResponse.json(
          { error: eligibilityCheck.reason },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: guestEmail }
    })

    let sessionData: any = {
      consultationType,
      description,
      guestEmail,
      guestName,
      guestPhone: guestPhone || null,
      priority: 'MEDIUM',
      isFreeConsultation,
      clientIpAddress: clientInfo.ipAddress,
      clientFingerprint: clientInfo.fingerprint
    }

    // If user exists, link the session to them
    if (existingUser) {
      sessionData.userId = existingUser.id
      sessionData.guestEmail = null // Clear guest fields if user exists
      sessionData.guestName = null
      sessionData.guestPhone = null
      
      // Mark free consultation as used for existing user
      if (isFreeConsultation) {
        await markFreeConsultationUsed(existingUser.id)
      }
    } else if (sendAccountInvite) {
      // Generate account creation token for guest
      const accountCreationToken = uuidv4()
      const accountCreationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      
      sessionData.accountCreationToken = accountCreationToken
      sessionData.accountCreationExpiry = accountCreationExpiry
    }

    // Create the consultation session
    const session = await prisma.session.create({
      data: sessionData
    })

    // Send account creation invitation email if requested and user doesn't exist
    if (sendAccountInvite && !existingUser) {
      const createAccountUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/create-account?token=${sessionData.accountCreationToken}`
      const emailTemplate = getAccountCreationInviteTemplate(createAccountUrl, consultationType, isFreeConsultation)
      
      await sendEmail({
        to: guestEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })
    }

    return NextResponse.json({
      message: isFreeConsultation 
        ? "Free consultation booked successfully! We'll contact you within 24 hours to schedule your session."
        : "Consultation booked successfully",
      sessionId: session.id,
      accountInviteSent: sendAccountInvite && !existingUser,
      existingUser: !!existingUser,
      isFreeConsultation
    })

  } catch (error) {
    console.error("Guest consultation booking error:", error)
    return NextResponse.json(
      { error: "Failed to book consultation" },
      { status: 500 }
    )
  }
}