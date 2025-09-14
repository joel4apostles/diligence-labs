import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch pending items that need assignment
export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    // Get reports that don't have assignments or are still pending
    const pendingReports = await prisma.report.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            AND: [
              { status: { not: 'COMPLETED' } },
              { assignments: { none: {} } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        assignments: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    // Get sessions that don't have assignments or are still pending
    const pendingSessions = await prisma.session.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            AND: [
              { status: { not: 'COMPLETED' } },
              { assignments: { none: {} } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        assignments: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    // Format items for unified display
    const pendingItems = [
      ...pendingReports.map(report => ({
        id: report.id,
        type: 'report' as const,
        title: report.title,
        description: report.description,
        reportType: report.type,
        priority: report.priority,
        complexity: report.complexity,
        estimatedHours: report.estimatedHours,
        deadline: report.deadline,
        user: report.user,
        createdAt: report.createdAt,
        status: report.status,
        hasAssignments: report.assignments.length > 0
      })),
      ...pendingSessions.map(session => ({
        id: session.id,
        type: 'session' as const,
        title: `${session.consultationType} Consultation`,
        description: session.description,
        consultationType: session.consultationType,
        priority: session.priority,
        estimatedHours: session.estimatedHours,
        user: session.user,
        createdAt: session.createdAt,
        status: session.status,
        hasAssignments: session.assignments.length > 0
      }))
    ].sort((a, b) => {
      // Sort by priority first, then by creation date
      const priorityOrder: Record<string, number> = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      const priorityA = priorityOrder[a.priority] || 0
      const priorityB = priorityOrder[b.priority] || 0
      const priorityDiff = priorityB - priorityA
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    // Get assignment suggestions based on complexity and type
    const assignmentSuggestions = pendingItems.map(item => {
      let suggestedTeamSize = 1
      let suggestedHours = item.estimatedHours || 8

      // Determine team size based on complexity and type
      if (item.type === 'report') {
        switch (item.complexity) {
          case 'SIMPLE':
            suggestedTeamSize = 1
            suggestedHours = suggestedHours || 4
            break
          case 'MEDIUM':
            suggestedTeamSize = 1
            suggestedHours = suggestedHours || 8
            break
          case 'COMPLEX':
            suggestedTeamSize = 2
            suggestedHours = suggestedHours || 16
            break
          case 'VERY_COMPLEX':
            suggestedTeamSize = 3
            suggestedHours = suggestedHours || 32
            break
        }

        // Special cases for certain report types
        if (item.reportType === 'DUE_DILIGENCE') {
          suggestedTeamSize = Math.max(suggestedTeamSize, 2)
          suggestedHours = Math.max(suggestedHours, 16)
        }
      } else {
        // Session suggestions
        switch (item.consultationType) {
          case 'STRATEGIC_ADVISORY':
            suggestedTeamSize = 1
            suggestedHours = 2
            break
          case 'DUE_DILIGENCE':
            suggestedTeamSize = 2
            suggestedHours = 4
            break
          case 'TOKEN_LAUNCH':
            suggestedTeamSize = 2
            suggestedHours = 3
            break
          case 'TOKENOMICS_DESIGN':
            suggestedTeamSize = 1
            suggestedHours = 3
            break
        }
      }

      return {
        itemId: item.id,
        suggestedTeamSize,
        suggestedHours,
        urgency: item.priority === 'URGENT' ? 'high' : item.priority === 'HIGH' ? 'medium' : 'low'
      }
    })

    return NextResponse.json({
      items: pendingItems,
      suggestions: assignmentSuggestions,
      stats: {
        totalPending: pendingItems.length,
        urgentItems: pendingItems.filter(item => item.priority === 'URGENT').length,
        unassignedItems: pendingItems.filter(item => !item.hasAssignments).length
      }
    })

  } catch (error) {
    console.error("Failed to fetch pending assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending assignments" },
      { status: 500 }
    )
  }
}