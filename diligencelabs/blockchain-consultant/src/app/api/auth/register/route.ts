import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendEmail, getEmailVerificationTemplate } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"
import { validatePasswordStrength } from "@/lib/password-security"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Validate password strength
    const passwordStrength = validatePasswordStrength(password, email)
    if (!passwordStrength.isValid) {
      const failedRequirements = Object.entries(passwordStrength.requirements)
        .filter(([_, passed]) => !passed)
        .map(([requirement]) => requirement)
      
      return NextResponse.json({
        message: "Password does not meet security requirements",
        passwordStrength: {
          score: passwordStrength.score,
          feedback: passwordStrength.feedback,
          failedRequirements
        }
      }, { status: 400 })
    }

    // Check if user already exists (case insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const emailVerificationToken = uuidv4()
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(), // Store email in lowercase
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpiry,
        // Note: emailVerified will be null until verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      }
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/verify-email?token=${emailVerificationToken}`
    const emailTemplate = getEmailVerificationTemplate(verificationUrl, name)
    
    const emailSent = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.", 
        user,
        emailVerificationSent: emailSent
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
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