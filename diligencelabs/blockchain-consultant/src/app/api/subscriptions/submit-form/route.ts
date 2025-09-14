import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log("Submit form API called")
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    
    if (!session?.user?.id) {
      console.log("No session found, returning unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      // Account Information (for non-authenticated users)
      fullName,
      email,
      company,
      // Service Selection
      primaryService,
      additionalServices,
      // Project Information
      projectName,
      projectDescription,
      primaryGoals,
      timeline,
      budgetRange,
      teamSize,
      industryFocus,
      specificChallenges,
      // Consultation Preferences
      preferredSchedule,
      communicationPreference,
      // Plan Information
      planId,
      planName
    } = body

    // Validate required fields
    if (!primaryService || !projectName || !projectDescription || !primaryGoals || !timeline || !budgetRange || !teamSize || !industryFocus || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Store the comprehensive subscription form data as a consultation session with enhanced metadata
    const subscriptionRequest = await prisma.session.create({
      data: {
        userId: session.user.id,
        consultationType: primaryService as any, // Use selected primary service as consultation type
        status: "PENDING",
        description: `Subscription Request - ${planName}
        
Project: ${projectName}
Primary Service: ${primaryService}
Industry: ${industryFocus}
Timeline: ${timeline}
Budget Range: ${budgetRange}
Team Size: ${teamSize}

Project Description:
${projectDescription}

Primary Goals:
${primaryGoals}

${specificChallenges ? `Specific Challenges:\n${specificChallenges}` : ''}

${preferredSchedule ? `Preferred Schedule: ${preferredSchedule}` : ''}
${communicationPreference ? `Communication Preference: ${communicationPreference}` : ''}`,
        notes: JSON.stringify({
          type: 'subscription_form',
          planId,
          planName,
          priority: 'HIGH', // Store priority in notes instead
          formData: {
            // Account Information
            fullName,
            email,
            company,
            // Service Selection
            primaryService,
            additionalServices,
            // Project Information
            projectName,
            projectDescription,
            primaryGoals,
            timeline,
            budgetRange,
            teamSize,
            industryFocus,
            specificChallenges,
            // Consultation Preferences
            preferredSchedule,
            communicationPreference
          }
        }),
      }
    })

    return NextResponse.json({ 
      success: true, 
      sessionId: subscriptionRequest.id,
      message: "Subscription form submitted successfully" 
    })

  } catch (error) {
    console.error("Failed to submit subscription form:", error)
    return NextResponse.json(
      { error: "Failed to submit subscription form" },
      { status: 500 }
    )
  }
}