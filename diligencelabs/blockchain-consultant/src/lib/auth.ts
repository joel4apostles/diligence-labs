import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sendEmail, getPasswordResetTemplate } from './email'
import { logger, log } from './logger'
import crypto from 'crypto'
import { getServerSession } from 'next-auth/next'
import { NextRequest } from 'next/server'

const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email.toLowerCase()
        }
      })

      log.auth('login_attempt', user?.id, !!user, {
        email: credentials.email.toLowerCase(),
        hasPassword: !!user?.password,
        accountStatus: user?.accountStatus
      })

      if (!user || !user.password) {
        log.auth('login_failed', undefined, false, { reason: 'user_not_found_or_no_password' })
        return null
      }

      // Check if account is locked
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later or reset your password.')
      }

      // Check account status
      if (user.accountStatus !== 'ACTIVE') {
        const statusMessages = {
          SUSPENDED: 'Your account has been suspended. Please contact support.',
          RESTRICTED: 'Your account has been restricted. Please contact support.',
          DISABLED: 'Your account has been disabled. Please contact support.',
          PENDING_VERIFICATION: 'Please verify your email address before logging in.'
        }
        throw new Error(statusMessages[user.accountStatus as keyof typeof statusMessages] || 'Account access denied.')
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      )

      console.log('Password check:', { 
        isPasswordValid,
        passwordLength: credentials.password?.length,
        hashedPasswordLength: user.password?.length
      })

      if (!isPasswordValid) {
        // Increment failed login attempts
        const failedAttempts = user.failedLoginAttempts + 1
        const maxAttempts = 5
        
        const updateData: Record<string, unknown> = {
          failedLoginAttempts: failedAttempts,
          lastFailedLogin: new Date()
        }

        // Lock account after max attempts
        if (failedAttempts >= maxAttempts) {
          const lockDuration = 30 * 60 * 1000 // 30 minutes
          updateData.accountLockedUntil = new Date(Date.now() + lockDuration)
          
          // Generate password reset token and send email
          const resetToken = crypto.randomBytes(32).toString('hex')
          const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
          
          updateData.passwordResetToken = resetToken
          updateData.passwordResetExpiry = resetExpiry

          try {
            const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`
            const emailTemplate = getPasswordResetTemplate(resetUrl, user.name || 'User')
            
            await sendEmail({
              to: user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            })
          } catch (emailError) {
            console.error('Failed to send password reset email:', emailError)
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        })

        if (failedAttempts >= maxAttempts) {
          throw new Error(`Account locked due to ${maxAttempts} failed login attempts. A password reset link has been sent to your email.`)
        }

        return null
      }

      // Reset failed attempts on successful login
      if (user.failedLoginAttempts > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            accountLockedUntil: null
          }
        })
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
        accountStatus: user.accountStatus,
      }
    }
  })
]

// Only add OAuth providers if proper credentials are configured
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret" &&
    !process.env.GOOGLE_CLIENT_ID.includes("your-") &&
    !process.env.GOOGLE_CLIENT_ID.includes("client-id") &&
    process.env.GOOGLE_CLIENT_ID.length > 30) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }))
  console.log('✅ Google OAuth provider configured')
} else {
  console.log('⚠️ Google OAuth provider skipped - invalid credentials')
}

if (process.env.TWITTER_CLIENT_ID && 
    process.env.TWITTER_CLIENT_ID !== "your-twitter-client-id" &&
    process.env.TWITTER_CLIENT_SECRET && 
    process.env.TWITTER_CLIENT_SECRET !== "your-twitter-client-secret" &&
    !process.env.TWITTER_CLIENT_ID.includes("your-") &&
    !process.env.TWITTER_CLIENT_ID.includes("client-id") &&
    process.env.TWITTER_CLIENT_ID.length > 30) {
  providers.push(TwitterProvider({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    version: "2.0",
  }))
  console.log('Twitter OAuth provider added successfully')
} else {
  console.log('Twitter OAuth provider skipped - placeholder or invalid credentials detected')
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily commented out due to type compatibility
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.walletAddress = (user as any).walletAddress
        token.accountStatus = (user as any).accountStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.sub!
        ;(session.user as any).role = token.role as string
        ;(session.user as any).walletAddress = token.walletAddress as string | null
        ;(session.user as any).accountStatus = token.accountStatus as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/unified-signin'
  }
}

// Helper function to verify authentication and get user data
export async function verifyAuthAndGetUser(request?: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        error: 'Unauthorized', 
        status: 401 
      }
    }

    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        walletAddress: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return { 
        error: 'User not found', 
        status: 404 
      }
    }

    return { 
      user, 
      session 
    }
  } catch (error) {
    console.error('Error in verifyAuthAndGetUser:', error)
    return { 
      error: 'Internal server error', 
      status: 500 
    }
  }
}