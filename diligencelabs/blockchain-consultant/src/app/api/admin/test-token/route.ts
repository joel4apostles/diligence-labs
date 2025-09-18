import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// GET /api/admin/test-token - Generate a test admin token for development
export async function GET(request: NextRequest) {
  try {
    // For testing purposes only - generate a test admin token
    const testAdminPayload = {
      adminId: 'test-admin-id',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'SUPER_ADMIN'
    }

    const token = jwt.sign(
      testAdminPayload,
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key',
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      message: 'Test admin token generated successfully',
      token,
      admin: testAdminPayload
    })

  } catch (error) {
    console.error('Test token generation error:', error)
    return NextResponse.json({ error: 'Failed to generate test token' }, { status: 500 })
  }
}