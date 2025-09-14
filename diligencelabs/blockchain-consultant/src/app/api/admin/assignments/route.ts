import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch current assignments
export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    // Get all current assignments
    const [reportAssignments, sessionAssignments] = await Promise.all([
      prisma.reportAssignment.findMany({
        include: {
          report: {
            select: {
              id: true,
              title: true,
              type: true,
              priority: true,
              complexity: true,
              estimatedHours: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              teamMember: {
                select: {
                  position: true,
                  department: true,
                  specializations: true,
                  currentWorkload: true,
                  maxHoursPerWeek: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sessionAssignment.findMany({
        include: {
          session: {
            select: {
              id: true,
              consultationType: true,
              description: true,
              priority: true,
              estimatedHours: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              teamMember: {
                select: {
                  position: true,
                  department: true,
                  specializations: true,
                  currentWorkload: true,
                  maxHoursPerWeek: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Format assignments for unified display
    const assignments = [
      ...reportAssignments.map(assignment => ({
        id: assignment.id,
        itemId: assignment.report.id,
        itemType: 'report' as const,
        itemTitle: assignment.report.title,
        assignee: assignment.assignee,
        role: assignment.role,
        status: assignment.status,
        estimatedHours: assignment.estimatedHours,
        actualHours: assignment.actualHours,
        createdAt: assignment.createdAt,
        startedAt: assignment.startedAt,
        completedAt: assignment.completedAt
      })),
      ...sessionAssignments.map(assignment => ({
        id: assignment.id,
        itemId: assignment.session.id,
        itemType: 'session' as const,
        itemTitle: `${assignment.session.consultationType} Consultation`,
        assignee: assignment.assignee,
        role: assignment.role,
        status: assignment.status,
        estimatedHours: assignment.estimatedHours,
        actualHours: assignment.actualHours,
        createdAt: assignment.createdAt,
        startedAt: assignment.startedAt,
        completedAt: assignment.completedAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ assignments })

  } catch (error) {
    console.error("Failed to fetch assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

// POST - Create new assignment
export async function POST(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { itemId, itemType, assigneeIds, role = 'LEAD', estimatedHours } = body

    if (!itemId || !itemType || !assigneeIds || !Array.isArray(assigneeIds) || assigneeIds.length === 0) {
      return NextResponse.json(
        { error: "Item ID, item type, and assignee IDs are required" },
        { status: 400 }
      )
    }

    // Validate that the item exists
    if (itemType === 'report') {
      const report = await prisma.report.findUnique({ where: { id: itemId } })
      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 })
      }
    } else if (itemType === 'session') {
      const sessionItem = await prisma.session.findUnique({ where: { id: itemId } })
      if (!sessionItem) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
    }

    // Create assignments for each assignee
    const assignments = []
    
    for (let i = 0; i < assigneeIds.length; i++) {
      const assigneeId = assigneeIds[i]
      const assignmentRole = i === 0 ? role : 'CONTRIBUTOR' // First assignee gets specified role, others are contributors
      
      if (itemType === 'report') {
        const assignment = await prisma.reportAssignment.create({
          data: {
            reportId: itemId,
            assigneeId,
            assignedById: adminData.adminId,
            role: assignmentRole,
            estimatedHours: estimatedHours ? parseInt(estimatedHours) : null
          },
          include: {
            report: { select: { title: true } },
            assignee: { select: { name: true, email: true } }
          }
        })
        assignments.push(assignment)
      } else {
        const assignment = await prisma.sessionAssignment.create({
          data: {
            sessionId: itemId,
            assigneeId,
            role: assignmentRole,
            estimatedHours: estimatedHours ? parseInt(estimatedHours) : null
          },
          include: {
            session: { select: { consultationType: true } },
            assignee: { select: { name: true, email: true } }
          }
        })
        assignments.push(assignment)
      }

      // Update team member workload
      if (estimatedHours) {
        await prisma.teamMember.updateMany({
          where: { userId: assigneeId },
          data: {
            currentWorkload: {
              increment: parseInt(estimatedHours)
            }
          }
        })
      }
    }

    // Update item status
    if (itemType === 'report') {
      await prisma.report.update({
        where: { id: itemId },
        data: { status: 'IN_REVIEW' }
      })
    } else {
      await prisma.session.update({
        where: { id: itemId },
        data: { status: 'SCHEDULED' }
      })
    }

    return NextResponse.json({
      message: "Assignments created successfully",
      assignments
    })

  } catch (error) {
    console.error("Failed to create assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}

// PATCH - Update assignment status or details
export async function PATCH(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { assignmentId, itemType, status, actualHours, notes } = body

    if (!assignmentId || !itemType) {
      return NextResponse.json(
        { error: "Assignment ID and item type are required" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (actualHours !== undefined) updateData.actualHours = actualHours ? parseInt(actualHours) : null
    if (notes !== undefined) updateData.notes = notes

    // Add timestamps based on status
    if (status === 'IN_PROGRESS' && !updateData.startedAt) {
      updateData.startedAt = new Date()
    } else if (status === 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date()
    }

    let updatedAssignment
    if (itemType === 'report') {
      updatedAssignment = await prisma.reportAssignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: {
          report: { select: { title: true } },
          assignee: { select: { name: true, email: true } }
        }
      })
    } else {
      updatedAssignment = await prisma.sessionAssignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: {
          session: { select: { consultationType: true } },
          assignee: { select: { name: true, email: true } }
        }
      })
    }

    // Update team member workload if actual hours changed
    if (actualHours !== undefined && updatedAssignment.estimatedHours) {
      const hoursDiff = (actualHours || 0) - updatedAssignment.estimatedHours
      if (hoursDiff !== 0) {
        await prisma.teamMember.updateMany({
          where: { userId: updatedAssignment.assigneeId },
          data: {
            currentWorkload: {
              increment: hoursDiff
            }
          }
        })
      }
    }

    return NextResponse.json({ assignment: updatedAssignment })

  } catch (error) {
    console.error("Failed to update assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}