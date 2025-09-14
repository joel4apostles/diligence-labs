import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      sessions,
    })
  } catch (error) {
    console.error("Admin sessions fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}