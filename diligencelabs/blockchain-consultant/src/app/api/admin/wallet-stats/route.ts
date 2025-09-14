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

    // Get wallet statistics
    const [totalUsers, usersWithWallets, usersWithoutWallets] = await Promise.all([
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

    // Get recent wallet connections (users who have wallets, ordered by updatedAt)
    const recentWalletConnections = await prisma.user.findMany({
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

    const walletConnectionRate = totalUsers > 0 ? (usersWithWallets / totalUsers) * 100 : 0

    return NextResponse.json({
      totalUsers,
      usersWithWallets,
      usersWithoutWallets,
      walletConnectionRate,
      recentWalletConnections: recentWalletConnections.map(user => ({
        userId: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress!,
        connectedAt: user.updatedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error("Failed to fetch wallet stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet statistics" },
      { status: 500 }
    )
  }
}