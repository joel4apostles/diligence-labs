import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch wallet statistics for admin monitoring
export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    let totalUsers = 0
    let usersWithWallets = 0
    let usersWithoutWallets = 0
    let recentWalletConnections: any[] = []

    try {
      // Get wallet statistics
      const results = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            walletAddress: { not: null }
          }
        }),
        prisma.user.count({
          where: {
            walletAddress: null
          }
        })
      ])

      totalUsers = results[0]
      usersWithWallets = results[1]
      usersWithoutWallets = results[2]

      // Get recent wallet connections (users who have wallets, ordered by updatedAt)
      recentWalletConnections = await prisma.user.findMany({
        where: {
          walletAddress: { not: null }
        },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10
      })
    } catch (error) {
      console.warn('Database not available for wallet stats, using fallback data')
      // Provide fallback data when database is unavailable
      totalUsers = 0
      usersWithWallets = 0
      usersWithoutWallets = 0
      recentWalletConnections = []
    }

    const walletConnectionRate = totalUsers > 0 ? (usersWithWallets / totalUsers) * 100 : 0

    return NextResponse.json({
      totalUsers,
      usersWithWallets,
      usersWithoutWallets,
      walletConnectionRate,
      recentWalletConnections: recentWalletConnections.length > 0 ? recentWalletConnections.map(user => ({
        userId: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress || '',
        connectedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
      })) : []
    })

  } catch (error) {
    console.error("Failed to fetch wallet stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet statistics" },
      { status: 500 }
    )
  }
}