import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const searchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['all', 'consultations', 'reports', 'users']).default('all'),
  filters: z.record(z.any()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  }).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortField = searchParams.get('sortField')
    const sortDirection = searchParams.get('sortDirection') as 'asc' | 'desc' || 'desc'
    
    // Parse filters from query params
    const filters: Record<string, any> = {}
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '')
        filters[filterKey] = value
      }
    }

    const searchData = searchSchema.parse({
      query,
      type,
      filters,
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
      page,
      limit
    })

    const offset = (searchData.page - 1) * searchData.limit
    const results: any = {
      query: searchData.query,
      type: searchData.type,
      page: searchData.page,
      limit: searchData.limit,
      data: [],
      total: 0,
      totalPages: 0
    }

    // Get user role for authorization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const isAdmin = user?.role === 'ADMIN'

    switch (searchData.type) {
      case 'consultations':
        results.data = await searchConsultations(searchData, session.user.id, isAdmin, offset)
        results.total = await countConsultations(searchData, session.user.id, isAdmin)
        break
      
      case 'reports':
        results.data = await searchReports(searchData, session.user.id, isAdmin, offset)
        results.total = await countReports(searchData, session.user.id, isAdmin)
        break
      
      case 'users':
        if (!isAdmin) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        results.data = await searchUsers(searchData, offset)
        results.total = await countUsers(searchData)
        break
      
      case 'all':
        const [consultations, reports, users] = await Promise.all([
          searchConsultations(searchData, session.user.id, isAdmin, 0, 5),
          searchReports(searchData, session.user.id, isAdmin, 0, 5),
          isAdmin ? searchUsers(searchData, 0, 5) : []
        ])
        results.data = {
          consultations,
          reports,
          ...(isAdmin && { users })
        }
        break
    }

    results.totalPages = Math.ceil(results.total / searchData.limit)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search API error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    )
  }
}

async function searchConsultations(
  searchData: z.infer<typeof searchSchema>,
  userId: string,
  isAdmin: boolean,
  offset: number,
  limit?: number
) {
  const where: any = {
    ...(isAdmin ? {} : { userId }),
    ...(searchData.query && {
      OR: [
        { clientName: { contains: searchData.query, mode: 'insensitive' } },
        { consultationType: { contains: searchData.query, mode: 'insensitive' } },
        { description: { contains: searchData.query, mode: 'insensitive' } }
      ]
    })
  }

  // Apply filters
  if (searchData.filters) {
    if (searchData.filters.status) {
      where.status = searchData.filters.status
    }
    if (searchData.filters.consultationType) {
      where.consultationType = searchData.filters.consultationType
    }
    if (searchData.filters.dateRange) {
      const { from, to } = searchData.filters.dateRange
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    }
  }

  const orderBy: any = {}
  if (searchData.sort) {
    orderBy[searchData.sort.field] = searchData.sort.direction
  } else {
    orderBy.createdAt = 'desc'
  }

  return await prisma.session.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy,
    skip: offset,
    take: limit || searchData.limit
  })
}

async function countConsultations(
  searchData: z.infer<typeof searchSchema>,
  userId: string,
  isAdmin: boolean
) {
  const where: any = {
    ...(isAdmin ? {} : { userId }),
    ...(searchData.query && {
      OR: [
        { clientName: { contains: searchData.query, mode: 'insensitive' } },
        { consultationType: { contains: searchData.query, mode: 'insensitive' } },
        { description: { contains: searchData.query, mode: 'insensitive' } }
      ]
    })
  }

  if (searchData.filters) {
    if (searchData.filters.status) {
      where.status = searchData.filters.status
    }
    if (searchData.filters.consultationType) {
      where.consultationType = searchData.filters.consultationType
    }
    if (searchData.filters.dateRange) {
      const { from, to } = searchData.filters.dateRange
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    }
  }

  return await prisma.session.count({ where })
}

async function searchReports(
  searchData: z.infer<typeof searchSchema>,
  userId: string,
  isAdmin: boolean,
  offset: number,
  limit?: number
) {
  const where: any = {
    ...(isAdmin ? {} : { userId }),
    ...(searchData.query && {
      OR: [
        { title: { contains: searchData.query, mode: 'insensitive' } },
        { description: { contains: searchData.query, mode: 'insensitive' } },
        { type: { contains: searchData.query, mode: 'insensitive' } }
      ]
    })
  }

  if (searchData.filters) {
    if (searchData.filters.status) {
      where.status = searchData.filters.status
    }
    if (searchData.filters.type) {
      where.type = searchData.filters.type
    }
    if (searchData.filters.dateRange) {
      const { from, to } = searchData.filters.dateRange
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    }
  }

  const orderBy: any = {}
  if (searchData.sort) {
    orderBy[searchData.sort.field] = searchData.sort.direction
  } else {
    orderBy.createdAt = 'desc'
  }

  return await prisma.report.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy,
    skip: offset,
    take: limit || searchData.limit
  })
}

async function countReports(
  searchData: z.infer<typeof searchSchema>,
  userId: string,
  isAdmin: boolean
) {
  const where: any = {
    ...(isAdmin ? {} : { userId }),
    ...(searchData.query && {
      OR: [
        { title: { contains: searchData.query, mode: 'insensitive' } },
        { description: { contains: searchData.query, mode: 'insensitive' } },
        { type: { contains: searchData.query, mode: 'insensitive' } }
      ]
    })
  }

  if (searchData.filters) {
    if (searchData.filters.status) {
      where.status = searchData.filters.status
    }
    if (searchData.filters.type) {
      where.type = searchData.filters.type
    }
    if (searchData.filters.dateRange) {
      const { from, to } = searchData.filters.dateRange
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    }
  }

  return await prisma.report.count({ where })
}

async function searchUsers(
  searchData: z.infer<typeof searchSchema>,
  offset: number,
  limit?: number
) {
  const where: any = {
    ...(searchData.query && {
      OR: [
        { name: { contains: searchData.query, mode: 'insensitive' } },
        { email: { contains: searchData.query, mode: 'insensitive' } }
      ]
    })
  }

  if (searchData.filters) {
    if (searchData.filters.role) {
      where.role = searchData.filters.role
    }
    if (searchData.filters.emailVerified) {
      if (searchData.filters.emailVerified === 'verified') {
        where.emailVerified = { not: null }
      } else {
        where.emailVerified = null
      }
    }
    if (searchData.filters.dateRange) {
      const { from, to } = searchData.filters.dateRange
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    }
  }

  const orderBy: any = {}
  if (searchData.sort) {
    orderBy[searchData.sort.field] = searchData.sort.direction
  } else {
    orderBy.createdAt = 'desc'
  }

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sessions: true,
          reports: true
        }
      }
    },
    orderBy,
    skip: offset,
    take: limit || searchData.limit
  })
}

async function countUsers(searchData: z.infer<typeof searchSchema>) {
  const where: any = {
    ...(searchData.query && {
      OR: [
        { name: { contains: searchData.query, mode: 'insensitive' } },
        { email: { contains: searchData.query, mode: 'insensitive' } }
      ]
    })
  }

  if (searchData.filters) {
    if (searchData.filters.role) {
      where.role = searchData.filters.role
    }
    if (searchData.filters.emailVerified) {
      if (searchData.filters.emailVerified === 'verified') {
        where.emailVerified = { not: null }
      } else {
        where.emailVerified = null
      }
    }
    if (searchData.filters.dateRange) {
      const { from, to } = searchData.filters.dateRange
      where.createdAt = {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    }
  }

  return await prisma.user.count({ where })
}