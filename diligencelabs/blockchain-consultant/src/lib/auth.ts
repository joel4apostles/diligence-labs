import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sendEmail, getPasswordResetTemplate } from './email'
import crypto from 'crypto'

const providers = [
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

      console.log('Auth attempt:', { 
        email: credentials.email.toLowerCase(), 
        userFound: !!user, 
        hasPassword: !!user?.password,
        accountStatus: user?.accountStatus 
      })

      if (!user || !user.password) {
        console.log('Login failed: User not found or no password')
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
        
        let updateData: any = {
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
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your-google-client-id") {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }))
}

if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_ID !== "your-twitter-client-id") {
  providers.push(TwitterProvider({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    version: "2.0",
  }))
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.walletAddress = user.walletAddress
        token.accountStatus = user.accountStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.walletAddress = token.walletAddress as string | null
        session.user.accountStatus = token.accountStatus as string
      }
      return session
    },
    async signOut({ token, session }) {
      // Ensure session is completely cleared
      console.log('NextAuth signOut callback triggered')
      return true
    }
  },
  pages: {
    signIn: '/auth/unified-signin',
    signUp: '/auth/signup',
    signOut: '/',
  }
}