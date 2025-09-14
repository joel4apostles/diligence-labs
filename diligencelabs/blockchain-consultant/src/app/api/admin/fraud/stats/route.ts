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

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mock fraud statistics - in a real application, this would come from a database
    const fraudStats = {
      totalAlerts: 23,
      criticalAlerts: 3,
      highAlerts: 5,
      mediumAlerts: 8,
      lowAlerts: 7,
      resolvedAlerts: 15,
      activeAlerts: 8,
      
      // Additional statistics
      alertsToday: 2,
      alertsThisWeek: 8,
      alertsThisMonth: 23,
      
      // Trends (percentage change from previous period)
      trendsVsPreviousWeek: {
        totalAlerts: 12.5, // +12.5%
        criticalAlerts: -25.0, // -25.0%
        resolvedAlerts: 33.3 // +33.3%
      },
      
      // Top threat types
      topThreats: [
        { type: 'Suspicious Login Activity', count: 8 },
        { type: 'Payment Anomaly', count: 5 },
        { type: 'Account Takeover Attempt', count: 4 },
        { type: 'Unusual Access Pattern', count: 3 },
        { type: 'API Rate Limit Exceeded', count: 2 },
        { type: 'Data Scraping Attempt', count: 1 }
      ],
      
      // Geographic distribution
      topCountries: [
        { country: 'Unknown/VPN', count: 8 },
        { country: 'United States', count: 6 },
        { country: 'China', count: 4 },
        { country: 'Russia', count: 3 },
        { country: 'Germany', count: 2 }
      ],
      
      // Time-based patterns
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.floor(Math.random() * 5) // Random data for demo
      })),
      
      // Response time metrics
      responseMetrics: {
        averageResolutionTime: '4.2 hours',
        fastestResolution: '15 minutes',
        slowestResolution: '2.3 days',
        autoResolvedPercentage: 32.5
      }
    }

    return NextResponse.json({
      success: true,
      stats: fraudStats,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching fraud statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}