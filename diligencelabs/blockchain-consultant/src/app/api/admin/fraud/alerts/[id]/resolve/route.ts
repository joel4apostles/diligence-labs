import { NextRequest, NextResponse } from 'next/server'

function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  // In a real application, you would verify the JWT token here
  const token = authHeader.substring(7)
  return token && token.length > 0
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: alertId } = await params

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Update the alert status in the database
    // 2. Log the admin action
    // 3. Potentially send notifications
    // 4. Update any related security measures

    // Mock response for demonstration
    console.log(`Admin resolved fraud alert: ${alertId} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      message: 'Fraud alert resolved successfully',
      alertId,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'admin' // In reality, you'd get this from the JWT token
    })

  } catch (error) {
    console.error('Error resolving fraud alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: alertId } = await params

    // Mock detailed alert data
    const alertDetails = {
      id: alertId,
      type: 'Suspicious Login Activity',
      severity: 'HIGH',
      userId: 'user123',
      userEmail: 'suspicious@example.com',
      description: 'Multiple failed login attempts from different IP addresses within 5 minutes',
      detectedAt: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resolved: false,
      
      // Additional details
      detectionRules: ['MULTIPLE_FAILED_LOGINS', 'GEOGRAPHIC_ANOMALY'],
      riskScore: 85,
      affectedServices: ['Authentication', 'User Account'],
      
      // Investigation data
      relatedIps: ['192.168.1.100', '192.168.1.101', '192.168.1.102'],
      timeframe: {
        start: new Date(Date.now() - 300000).toISOString(),
        end: new Date().toISOString()
      },
      
      // Response actions
      automaticActions: [
        'Account temporarily locked',
        'Email notification sent to user',
        'Security team alerted'
      ],
      
      recommendedActions: [
        'Review user account activity',
        'Contact user to verify legitimate access attempts',
        'Consider implementing additional authentication factors'
      ]
    }

    return NextResponse.json({
      success: true,
      alert: alertDetails
    })

  } catch (error) {
    console.error('Error fetching fraud alert details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}