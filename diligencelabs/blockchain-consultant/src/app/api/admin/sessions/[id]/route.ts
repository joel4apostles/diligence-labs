import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const updateSessionSchema = z.object({
  status: z.enum(["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const resolvedParams = await params
    const body = await request.json()
    const data = updateSessionSchema.parse(body)

    const updatedSession = await prisma.session.update({
      where: { id: resolvedParams.id },
      data: {
        status: data.status,
        ...(data.notes && { notes: data.notes }),
        ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
      },
    })

    return NextResponse.json({
      message: "Session updated successfully",
      session: updatedSession,
    })
  } catch (error) {
    console.error("Session update error:", error)
    
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