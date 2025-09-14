import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Admin registration endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, adminCode } = body

    // Validate admin code (you should change this to your secure code)
    const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || "BLOCKCHAIN_ADMIN_2024"
    
    if (adminCode !== ADMIN_ACCESS_CODE) {
      return NextResponse.json(
        { error: "Invalid admin access code" },
        { status: 403 }
      )
    }

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date() // Auto-verify admin accounts
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: "Admin account created successfully",
      user
    })

  } catch (error) {
    console.error("Admin registration error:", error)
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    )
  }
}