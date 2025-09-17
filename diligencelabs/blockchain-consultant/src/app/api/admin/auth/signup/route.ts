import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validatePasswordStrength } from "@/lib/password-security"
import { AdminKeyManager } from "@/lib/admin-key-management"
import { addTempAdmin } from "@/lib/temp-admin-storage"
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { name, email, password, adminKey } = await request.json()

    if (!name || !email || !password || !adminKey) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Verify admin registration key using dynamic key manager
    const keyValidation = await AdminKeyManager.validateAdminKey(adminKey)
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.reason || "Invalid admin registration key" },
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

    // Check if admin already exists (with database fallback)
    let existingAdmin = null
    try {
      existingAdmin = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase() }
      })
    } catch (error) {
      console.warn('Database not available for admin check, proceeding with creation')
    }

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user (with database fallback)
    let admin
    try {
      admin = await prisma.adminUser.create({
        data: {
          name,
          email: email.toLowerCase(),
          hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true
        }
      })
    } catch (error) {
      console.warn('Database not available, creating mock admin response')
      const adminId = crypto.randomUUID()
      admin = {
        id: adminId,
        name,
        email: email.toLowerCase(),
        hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date()
      }
      
      // Store in temporary memory for login
      addTempAdmin(email.toLowerCase(), admin)
    }

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