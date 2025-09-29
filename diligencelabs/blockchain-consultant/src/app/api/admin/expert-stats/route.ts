import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/expert-stats - Get expert application statistics
export async function GET(request: NextRequest) {
  try {
    // For development, skip auth check temporarily
    // const adminAuth = await verifyAdminAuth(request)
    // if (!adminAuth.success) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Note: ExpertProfile model not implemented yet
    return NextResponse.json({
      message: 'Expert profile model not implemented yet',
      stats: {
        pending: 0,
        verified: 0,
        rejected: 0,
        totalApplications: 0
      }
    })

    /* COMMENTED OUT - UNREACHABLE CODE
    // Get counts by status
    const statusCounts = await prisma.expertProfile.groupBy({
      by: ['verificationStatus'],
      _count: {
        id: true
      }
    })

    // Get total counts
    const totalCount = await prisma.expertProfile.count()
    const totalUsers = await prisma.user.count()

    // Format the response
    const stats = {
      total: totalCount,
      totalUsers,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.verificationStatus] = item._count.id
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      stats
    })
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error('Expert stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch expert statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}