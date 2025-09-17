import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { getTempAdmin } from "@/lib/temp-admin-storage"

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

    // Check if admin still exists and is active (with database fallback)
    let admin = null
    try {
      admin = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId }
      })
    } catch (error) {
      console.warn('Database not available for token verification, using token data')
      
      // First check temporary admin storage
      const tempAdmin = getTempAdmin(decoded.email)
      if (tempAdmin && tempAdmin.id === decoded.adminId) {
        console.log('Found admin in temporary storage for verification')
        admin = tempAdmin
      } else {
        // For demo purposes, trust the token if it's the mock admin
        if (decoded.adminId === 'mock-admin-id' && decoded.email === 'admin@test.com') {
          admin = {
            id: decoded.adminId,
            email: decoded.email,
            name: decoded.name,
            role: 'SUPER_ADMIN',
            isActive: true
          }
        }
      }
    }

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