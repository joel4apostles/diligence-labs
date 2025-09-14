import { NextResponse } from "next/server"
import { verifyAdminToken, unauthorizedResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch team members and statistics
export async function GET(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || 'ALL'

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (search) {
      whereClause.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      }
    }
    
    if (department !== 'ALL') {
      whereClause.department = department
    }

    // Get team members with user details
    const teamMembers = await prisma.teamMember.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get team statistics
    const [
      totalMembers,
      activeMembers,
      departmentStats
    ] = await Promise.all([
      prisma.teamMember.count(),
      prisma.teamMember.count({ where: { isActive: true } }),
      prisma.teamMember.groupBy({
        by: ['department'],
        _count: { department: true }
      })
    ])

    // Calculate average workload
    const workloadData = await prisma.teamMember.findMany({
      select: { currentWorkload: true, maxHoursPerWeek: true },
      where: { isActive: true }
    })

    const averageWorkload = workloadData.length > 0 
      ? Math.round(workloadData.reduce((acc, member) => 
          acc + (member.currentWorkload / member.maxHoursPerWeek) * 100, 0) / workloadData.length)
      : 0

    // Format department statistics
    const departments = departmentStats.reduce((acc, stat) => {
      acc[stat.department] = stat._count.department
      return acc
    }, {} as Record<string, number>)

    const stats = {
      totalMembers,
      activeMembers,
      averageWorkload,
      departments
    }

    return NextResponse.json({
      members: teamMembers,
      stats
    })

  } catch (error) {
    console.error("Failed to fetch team data:", error)
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    )
  }
}

// POST - Add new team member
export async function POST(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { 
      userId, 
      position, 
      department, 
      specializations = [], 
      hourlyRate, 
      maxHoursPerWeek = 40 
    } = body

    // Validate input
    if (!userId || !position || !department) {
      return NextResponse.json(
        { error: "User ID, position, and department are required" },
        { status: 400 }
      )
    }

    // Check if user exists and is not already a team member
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { teamMember: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (existingUser.teamMember) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 }
      )
    }

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        userId,
        position,
        department,
        specializations,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        maxHoursPerWeek: parseInt(maxHoursPerWeek)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    // Update user role to TEAM_MEMBER if not already ADMIN
    if (existingUser.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "TEAM_MEMBER" }
      })
    }

    return NextResponse.json({
      message: "Team member added successfully",
      teamMember
    })

  } catch (error) {
    console.error("Failed to add team member:", error)
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
}

// PATCH - Update team member
export async function PATCH(request: Request) {
  try {
    const adminData = verifyAdminToken(request)
    
    if (!adminData) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { 
      teamMemberId, 
      position, 
      department, 
      specializations, 
      hourlyRate, 
      maxHoursPerWeek,
      isActive
    } = body

    if (!teamMemberId) {
      return NextResponse.json({ error: "Team member ID is required" }, { status: 400 })
    }

    // Build update data
    const updateData: any = {}
    if (position !== undefined) updateData.position = position
    if (department !== undefined) updateData.department = department
    if (specializations !== undefined) updateData.specializations = specializations
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate ? parseFloat(hourlyRate) : null
    if (maxHoursPerWeek !== undefined) updateData.maxHoursPerWeek = parseInt(maxHoursPerWeek)
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedTeamMember = await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ teamMember: updatedTeamMember })

  } catch (error) {
    console.error("Failed to update team member:", error)
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    )
  }
}