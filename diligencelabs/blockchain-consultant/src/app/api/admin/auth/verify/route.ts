import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(
      token, 
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key'
    ) as { adminId: string; email: string; name: string }

    // Check if admin still exists and is active
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId }
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: "Admin not found or inactive" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    )
  }
}