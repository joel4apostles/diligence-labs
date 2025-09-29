import { NextRequest, NextResponse } from 'next/server'
import { AdminKeyManager } from '@/lib/admin-key-management'
import { verifyAdminAuth, hasPermission } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    // Check if admin has SUPER_ADMIN privileges
    if (!adminAuth.admin || !hasPermission(adminAuth.admin.role, 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        error: 'Access denied. Super Admin privileges required for key management.' 
      }, { status: 403 })
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'list':
        const keys = await AdminKeyManager.getActiveKeys()
        return NextResponse.json({ keys })

      case 'stats':
        const stats = await AdminKeyManager.getKeyStats()
        return NextResponse.json({ stats })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin keys API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    // Check if admin has SUPER_ADMIN privileges
    if (!adminAuth.admin || !hasPermission(adminAuth.admin.role, 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        error: 'Access denied. Super Admin privileges required for key management.' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...options } = body

    switch (action) {
      case 'create':
        const newKey = await AdminKeyManager.createAdminKey({
          createdBy: adminAuth.admin.email,
          expiresInHours: options.expiresInHours || 24,
          maxUsages: options.maxUsages || null,
          description: options.description
        })
        return NextResponse.json({ 
          success: true, 
          key: newKey,
          message: 'Admin key created successfully' 
        })

      case 'rotate':
        const rotatedKey = await AdminKeyManager.rotateKeys(adminAuth.admin.email)
        return NextResponse.json({ 
          success: true, 
          key: rotatedKey,
          message: 'Keys rotated successfully. All previous keys are now inactive.' 
        })

      case 'cleanup':
        const cleanedCount = await AdminKeyManager.cleanupExpiredKeys()
        return NextResponse.json({ 
          success: true, 
          cleanedCount,
          message: `Cleaned up ${cleanedCount} expired keys` 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin keys API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request)
    if (!adminAuth.success) {
      return NextResponse.json({ error: adminAuth.error }, { status: 401 })
    }

    // Check if admin has SUPER_ADMIN privileges
    if (!adminAuth.admin || !hasPermission(adminAuth.admin.role, 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        error: 'Access denied. Super Admin privileges required for key management.' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { keyId } = body

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
    }

    const success = await AdminKeyManager.deactivateKey(keyId)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Key deactivated successfully' 
      })
    } else {
      return NextResponse.json({ error: 'Failed to deactivate key' }, { status: 500 })
    }
  } catch (error) {
    console.error('Admin keys API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}