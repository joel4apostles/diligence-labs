import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

export interface AdminTokenPayload {
  adminId: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR'
}

export function verifyAdminToken(request: Request): AdminTokenPayload | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key'
    ) as AdminTokenPayload
    
    return decoded
  } catch (error) {
    return null
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'SUPER_ADMIN': 3,
    'ADMIN': 2,
    'MODERATOR': 1
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

export function verifyAdminPermission(request: Request, requiredRole: string = 'MODERATOR'): AdminTokenPayload | null {
  const adminData = verifyAdminToken(request)
  
  if (!adminData) {
    return null
  }
  
  if (!hasPermission(adminData.role, requiredRole)) {
    return null
  }
  
  return adminData
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
}