import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getAccountStatusTemplate } from '@/lib/email'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { accountStatus, reason } = await request.json()

    if (!accountStatus || !['ACTIVE', 'SUSPENDED', 'RESTRICTED', 'DISABLED'].includes(accountStatus)) {
      return NextResponse.json(
        { error: 'Invalid account status' },
        { status: 400 }
      )
    }

    // Get the user to update
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admins from disabling their own account
    if (user.id === session.user.id && accountStatus !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot modify your own account status' },
        { status: 400 }
      )
    }

    // Update user account status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus,
        accountStatusReason: reason || null,
        statusChangedAt: new Date(),
        statusChangedBy: session.user.id,
        // Clear any account locks when status is changed
        accountLockedUntil: null,
        failedLoginAttempts: 0,
      }
    })

    // Send notification email if status changed
    if (user.accountStatus !== accountStatus) {
      try {
        const emailTemplate = getAccountStatusTemplate(
          user.name || 'User',
          accountStatus,
          reason
        )
        
        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        })
      } catch (emailError) {
        console.error('Failed to send account status email:', emailError)
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      message: 'Account status updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        accountStatus: updatedUser.accountStatus,
        accountStatusReason: updatedUser.accountStatusReason,
        statusChangedAt: updatedUser.statusChangedAt,
      }
    })

  } catch (error) {
    console.error('Update account status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}