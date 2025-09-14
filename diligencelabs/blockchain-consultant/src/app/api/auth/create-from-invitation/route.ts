import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendEmail, getEmailVerificationTemplate } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      )
    }

    // Find session with this invitation token
    const session = await prisma.session.findFirst({
      where: {
        accountCreationToken: token,
        accountCreationExpiry: {
          gt: new Date() // Token not expired
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      )
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: session.guestEmail! }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists for this email" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      guestEmail: session.guestEmail,
      guestName: session.guestName,
      consultationType: session.consultationType
    })

  } catch (error) {
    console.error("Invitation validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate invitation" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, name, password } = body

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: "Token, name, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Find session with this invitation token
    const session = await prisma.session.findFirst({
      where: {
        accountCreationToken: token,
        accountCreationExpiry: {
          gt: new Date() // Token not expired
        }
      }
    })

    if (!session || !session.guestEmail) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      )
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: session.guestEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists for this email" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const emailVerificationToken = uuidv4()
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: session.guestEmail,
        name,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpiry,
        role: "USER"
      }
    })

    // Link the session to the newly created user
    await prisma.session.update({
      where: { id: session.id },
      data: {
        userId: user.id,
        guestEmail: null,
        guestName: null,
        guestPhone: null,
        accountCreationToken: null,
        accountCreationExpiry: null
      }
    })

    // Send email verification
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/verify-email?token=${emailVerificationToken}`
    const emailTemplate = getEmailVerificationTemplate(verificationUrl, name)
    
    const emailSent = await sendEmail({
      to: session.guestEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })

    return NextResponse.json({
      message: "Account created successfully",
      userId: user.id,
      emailVerificationSent: emailSent,
      sessionLinked: true
    })

  } catch (error) {
    console.error("Account creation from invitation error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}