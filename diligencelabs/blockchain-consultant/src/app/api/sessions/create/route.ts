import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const sessionSchema = z.object({
  consultationType: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKENOMICS_DESIGN", "TOKEN_LAUNCH"]),
  description: z.string().min(20),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
  contactEmail: z.string().email(),
  duration: z.enum(["30", "45", "60"]),
  // Optional fields that may vary by consultation type
  title: z.string().optional(),
  projectName: z.string().optional(),
  businessName: z.string().optional(),
  preferredDate: z.string().optional(),
  budget: z.string().optional(),
  // Service-specific fields
  businessType: z.string().optional(),
  currentChallenges: z.string().optional(),
  strategicGoals: z.string().optional(),
  timeline: z.string().optional(),
  marketFocus: z.string().optional(),
  projectType: z.string().optional(),
  technicalArchitecture: z.string().optional(),
  teamSize: z.string().optional(),
  fundingStage: z.string().optional(),
  tokenType: z.string().optional(),
  tokenPurpose: z.string().optional(),
  economicModel: z.string().optional(),
  totalSupply: z.string().optional(),
  distributionModel: z.string().optional(),
  stakeholders: z.string().optional(),
  launchType: z.string().optional(),
  launchTimeline: z.string().optional(),
  targetRaise: z.string().optional(),
  launchPlatforms: z.string().optional(),
  marketingStrategy: z.string().optional(),
  legalCompliance: z.string().optional(),
  communitySize: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = sessionSchema.parse(body)

    // Create a dynamic description based on consultation type and available fields
    let description = `Consultation Type: ${data.consultationType}\n`
    
    // Add title/project/business name
    if (data.title) description += `Title: ${data.title}\n`
    if (data.projectName) description += `Project: ${data.projectName}\n`
    if (data.businessName) description += `Business: ${data.businessName}\n`
    
    description += `\nDescription:\n${data.description}\n`
    description += `\nDuration: ${data.duration} minutes\n`
    description += `Urgency: ${data.urgency}\n`
    
    // Add service-specific fields
    if (data.businessType) description += `Business Type: ${data.businessType}\n`
    if (data.currentChallenges) description += `Current Challenges: ${data.currentChallenges}\n`
    if (data.strategicGoals) description += `Strategic Goals: ${data.strategicGoals}\n`
    if (data.timeline) description += `Timeline: ${data.timeline}\n`
    if (data.marketFocus) description += `Market Focus: ${data.marketFocus}\n`
    if (data.projectType) description += `Project Type: ${data.projectType}\n`
    if (data.technicalArchitecture) description += `Technical Architecture: ${data.technicalArchitecture}\n`
    if (data.teamSize) description += `Team Size: ${data.teamSize}\n`
    if (data.fundingStage) description += `Funding Stage: ${data.fundingStage}\n`
    if (data.tokenType) description += `Token Type: ${data.tokenType}\n`
    if (data.tokenPurpose) description += `Token Purpose: ${data.tokenPurpose}\n`
    if (data.economicModel) description += `Economic Model: ${data.economicModel}\n`
    if (data.totalSupply) description += `Total Supply: ${data.totalSupply}\n`
    if (data.distributionModel) description += `Distribution Model: ${data.distributionModel}\n`
    if (data.stakeholders) description += `Stakeholders: ${data.stakeholders}\n`
    if (data.launchType) description += `Launch Type: ${data.launchType}\n`
    if (data.launchTimeline) description += `Launch Timeline: ${data.launchTimeline}\n`
    if (data.targetRaise) description += `Target Raise: ${data.targetRaise}\n`
    if (data.launchPlatforms) description += `Launch Platforms: ${data.launchPlatforms}\n`
    if (data.marketingStrategy) description += `Marketing Strategy: ${data.marketingStrategy}\n`
    if (data.legalCompliance) description += `Legal Compliance: ${data.legalCompliance}\n`
    if (data.communitySize) description += `Community Size: ${data.communitySize}\n`
    
    if (data.budget) description += `Budget: ${data.budget}\n`
    if (data.preferredDate) description += `Preferred Date: ${data.preferredDate}\n`

    // Create consultation session
    const consultationSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        consultationType: data.consultationType,
        description: description,
        scheduledAt: data.preferredDate ? new Date(data.preferredDate) : null,
        status: "PENDING",
        notes: `Contact Email: ${data.contactEmail}`,
      },
    })

    return NextResponse.json(
      { 
        message: "Consultation booked successfully", 
        session: consultationSession 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Session creation error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}