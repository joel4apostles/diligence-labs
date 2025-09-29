import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const reportSchema = z.object({
  type: z.enum(["DUE_DILIGENCE", "ADVISORY_NOTES", "BLOCKCHAIN_INTEGRATION_ADVISORY", "MARKET_RESEARCH"]),
  title: z.string().min(5),
  description: z.string().min(20),
  projectName: z.string().min(2),
  projectUrl: z.string().url().optional().or(z.literal("")),
  deadline: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  additionalNotes: z.string().optional(),
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
    const data = reportSchema.parse(body)

    // Create comprehensive description
    const fullDescription = `Project: ${data.projectName}\n\n${data.description}${data.projectUrl ? `\n\nProject URL: ${data.projectUrl}` : ''}${data.deadline ? `\nPreferred Deadline: ${data.deadline}` : ''}${data.additionalNotes ? `\n\nAdditional Notes:\n${data.additionalNotes}` : ''}\n\nPriority: ${data.priority}`

    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: fullDescription,
        type: data.type,
        status: "PENDING",
      },
    })

    return NextResponse.json(
      { 
        message: "Report requested successfully", 
        report 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Report creation error:", error)
    
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