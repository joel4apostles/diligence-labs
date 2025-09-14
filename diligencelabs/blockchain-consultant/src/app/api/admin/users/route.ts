import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch all users for admin
export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'ALL'
    const wallet = searchParams.get('wallet') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { walletAddress: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role !== 'ALL') {
      whereClause.role = role
    }

    if (wallet === 'CONNECTED') {
      whereClause.walletAddress = { not: null }
    } else if (wallet === 'NOT_CONNECTED') {
      whereClause.walletAddress = null
    }

    // Get users with counts
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          walletAddress: true,
          accountStatus: true,
          accountStatusReason: true,
          failedLoginAttempts: true,
          accountLockedUntil: true,
          lastFailedLogin: true,
          statusChangedAt: true,
          statusChangedBy: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          _count: {
            select: {
              sessions: true,
              reports: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages
      }
    })

  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// PATCH - Update user role or details
export async function PATCH(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { userId, role, name, emailVerified, accountStatus, accountStatusReason } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Build update data
    const updateData: any = {}
    if (role) updateData.role = role
    if (name !== undefined) updateData.name = name
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified ? new Date() : null
    if (accountStatus) {
      updateData.accountStatus = accountStatus
      updateData.statusChangedAt = new Date()
      updateData.statusChangedBy = adminData.adminId
      if (accountStatusReason !== undefined) updateData.accountStatusReason = accountStatusReason
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        walletAddress: true,
        accountStatus: true,
        accountStatusReason: true,
        statusChangedAt: true,
        statusChangedBy: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        _count: {
          select: {
            sessions: true,
            reports: true
          }
        }
      }
    })

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (soft delete by deactivating)
export async function DELETE(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === adminData.adminId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user and cascade relationships
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: "User deleted successfully" })

  } catch (error) {
    console.error("Failed to delete user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}