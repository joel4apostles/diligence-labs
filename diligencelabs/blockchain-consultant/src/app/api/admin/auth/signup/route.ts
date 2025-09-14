import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validatePasswordStrength } from "@/lib/password-security"

// Admin registration key - in production, this should be in environment variables
const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || "DILIGENCE_ADMIN_2024"

export async function POST(request: Request) {
  try {
    const { name, email, password, adminKey } = await request.json()

    if (!name || !email || !password || !adminKey) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Verify admin registration key
    if (adminKey !== ADMIN_REGISTRATION_KEY) {
      return NextResponse.json(
        { error: "Invalid admin registration key" },
        { status: 403 }
      )
    }

    // Validate password strength
    const passwordStrength = validatePasswordStrength(password, email)
    if (!passwordStrength.isValid) {
      const failedRequirements = Object.entries(passwordStrength.requirements)
        .filter(([_, passed]) => !passed)
        .map(([requirement]) => requirement)
      
      return NextResponse.json({
        error: "Password does not meet security requirements",
        passwordStrength: {
          score: passwordStrength.score,
          feedback: passwordStrength.feedback,
          failedRequirements
        }
      }, { status: 400 })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })

    return NextResponse.json({
      message: "Admin account created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    console.error("Admin signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}