import { NextRequest, NextResponse } from 'next/server'

// Enhanced fraud alerts data with comprehensive user profiles, login logs, and security risks
const mockFraudAlerts = [
  {
    id: '1',
    type: 'Suspicious Login Activity',
    severity: 'HIGH',
    userId: 'user123',
    userEmail: 'suspicious@example.com',
    description: 'Multiple failed login attempts from different IP addresses within 5 minutes',
    detectedAt: new Date().toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    resolved: false,
    riskScore: 85,
    confidenceLevel: 92,
    userProfile: {
      id: 'user123',
      email: 'suspicious@example.com',
      name: 'John Suspicious',
      phone: '+1-555-0123',
      registrationDate: '2024-01-15T10:30:00Z',
      lastLogin: '2024-12-10T14:22:00Z',
      accountStatus: 'ACTIVE',
      subscriptionTier: 'Premium',
      totalTransactions: 45,
      failedLoginAttempts: 8,
      passwordLastChanged: '2024-11-20T09:15:00Z',
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false,
      location: {
        country: 'United States',
        city: 'New York',
        timezone: 'EST'
      },
      deviceFingerprints: ['fp_abc123', 'fp_def456', 'fp_ghi789'],
      riskScore: 85,
      riskFactors: ['Multiple failed logins', 'New device', 'Unusual location', 'No 2FA'],
      accountAge: 332,
      lastPasswordChange: 22,
      suspiciousActivityCount: 3,
      loginLogs: [
        {
          id: 'log1',
          timestamp: '2024-12-12T14:22:00Z',
          ipAddress: '192.168.1.100',
          location: { country: 'Russia', city: 'Moscow', region: 'Moscow Oblast' },
          device: { os: 'Windows 10', browser: 'Chrome 119', deviceType: 'Desktop' },
          success: false,
          failureReason: 'Invalid credentials - 3rd attempt',
          riskScore: 95,
          isVPN: true,
          isProxy: true
        },
        {
          id: 'log2',
          timestamp: '2024-12-12T14:18:00Z',
          ipAddress: '192.168.1.100',
          location: { country: 'Russia', city: 'Moscow', region: 'Moscow Oblast' },
          device: { os: 'Windows 10', browser: 'Chrome 119', deviceType: 'Desktop' },
          success: false,
          failureReason: 'Invalid credentials - 2nd attempt',
          riskScore: 85,
          isVPN: true,
          isProxy: true
        },
        {
          id: 'log3',
          timestamp: '2024-12-10T09:15:00Z',
          ipAddress: '192.168.1.50',
          location: { country: 'United States', city: 'New York', region: 'New York' },
          device: { os: 'Windows 10', browser: 'Chrome 118', deviceType: 'Desktop' },
          success: true,
          riskScore: 25,
          isVPN: false,
          isProxy: false,
          sessionDuration: 45
        },
        {
          id: 'log4',
          timestamp: '2024-12-09T16:30:00Z',
          ipAddress: '192.168.1.50',
          location: { country: 'United States', city: 'New York', region: 'New York' },
          device: { os: 'iPhone', browser: 'Safari Mobile', deviceType: 'Mobile' },
          success: true,
          riskScore: 15,
          isVPN: false,
          isProxy: false,
          sessionDuration: 32
        }
      ],
      securityRisks: [
        {
          id: 'risk1',
          type: 'HIGH',
          category: 'Authentication',
          title: 'Multiple Failed Login Attempts from VPN',
          description: 'User account has multiple failed login attempts from VPN/proxy services, indicating potential credential stuffing or brute force attack.',
          impact: 'Account compromise, unauthorized access to sensitive data',
          likelihood: 'High - Active attack pattern detected',
          recommendation: 'Immediately force password reset and enable 2FA',
          preventionSteps: ['Enable account lockout after 3 failed attempts', 'Implement CAPTCHA verification', 'Block VPN/proxy access', 'Enable 2FA requirement'],
          detectedAt: '2024-12-12T14:22:00Z'
        },
        {
          id: 'risk2',
          type: 'MEDIUM',
          category: 'Device Security',
          title: 'Unrecognized Device Access',
          description: 'Login attempt from previously unseen device fingerprint without proper verification.',
          impact: 'Potential unauthorized device access',
          likelihood: 'Medium - New device without verification',
          recommendation: 'Require device verification for new devices',
          preventionSteps: ['Implement device registration', 'Send email verification for new devices', 'Enable device-based 2FA'],
          detectedAt: '2024-12-12T14:18:00Z'
        }
      ]
    },
    deviceInfo: {
      fingerprint: 'fp_suspicious_001',
      os: 'Windows 10',
      browser: 'Chrome 119',
      isMobile: false,
      isVPN: true
    },
    geolocation: {
      country: 'Russia',
      city: 'Moscow',
      region: 'Moscow Oblast',
      isp: 'Unknown VPN Provider',
      isProxy: true
    },
    behavioral: {
      typicalLoginHours: [9, 10, 11, 14, 15, 16],
      averageSessionDuration: 45,
      usualDevices: ['fp_abc123', 'fp_def456'],
      usualLocations: ['New York, US', 'Boston, US']
    },
    transactionInfo: {
      recentTransactions: 3,
      failedPayments: 2,
      chargebacks: 0,
      refunds: 1
    },
    relatedAlerts: ['2', '4'],
    investigationNotes: 'User attempting login from unusual location with VPN. Recommend immediate password reset and 2FA enforcement.'
  },
  {
    id: '2',
    type: 'Payment Anomaly',
    severity: 'CRITICAL',
    userId: 'user456',
    userEmail: 'anomaly@example.com',
    description: 'Unusual payment pattern with 12 consecutive declined transactions',
    detectedAt: new Date(Date.now() - 86400000).toISOString(),
    ipAddress: '10.0.0.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    resolved: false,
    riskScore: 95,
    confidenceLevel: 98,
    userProfile: {
      id: 'user456',
      email: 'anomaly@example.com',
      name: 'Sarah Payment',
      phone: '+1-555-0456',
      registrationDate: '2024-03-10T14:20:00Z',
      lastLogin: '2024-12-11T11:30:00Z',
      accountStatus: 'SUSPENDED',
      subscriptionTier: 'Enterprise',
      totalTransactions: 156,
      failedLoginAttempts: 2,
      passwordLastChanged: '2024-12-01T16:45:00Z',
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      location: {
        country: 'Canada',
        city: 'Toronto',
        timezone: 'EST'
      },
      deviceFingerprints: ['fp_xyz789', 'fp_abc456'],
      riskScore: 95,
      riskFactors: ['Multiple payment failures', 'High transaction volume', 'Recent password change'],
      accountAge: 277,
      lastPasswordChange: 11,
      suspiciousActivityCount: 5,
      loginLogs: [
        {
          id: 'log5',
          timestamp: '2024-12-11T11:30:00Z',
          ipAddress: '10.0.0.5',
          location: { country: 'Canada', city: 'Toronto', region: 'Ontario' },
          device: { os: 'macOS Monterey', browser: 'Safari 16', deviceType: 'Desktop' },
          success: true,
          riskScore: 75,
          isVPN: false,
          isProxy: false,
          sessionDuration: 120
        },
        {
          id: 'log6',
          timestamp: '2024-12-10T22:15:00Z',
          ipAddress: '10.0.0.8',
          location: { country: 'Canada', city: 'Toronto', region: 'Ontario' },
          device: { os: 'macOS Monterey', browser: 'Safari 16', deviceType: 'Desktop' },
          success: true,
          riskScore: 45,
          isVPN: false,
          isProxy: false,
          sessionDuration: 95
        }
      ],
      securityRisks: [
        {
          id: 'risk3',
          type: 'HIGH',
          category: 'Payment Fraud',
          title: 'Potential Card Testing Activity',
          description: 'Rapid sequence of declined payment attempts suggests automated card testing or validation fraud.',
          impact: 'Financial fraud, merchant penalties, account suspension',
          likelihood: 'High - Clear automated pattern detected',
          recommendation: 'Suspend payment processing and require identity verification',
          preventionSteps: ['Implement payment velocity limits', 'Add CAPTCHA for payments', 'Enable payment 2FA', 'Monitor for card testing patterns'],
          detectedAt: '2024-12-11T15:45:00Z'
        }
      ]
    },
    deviceInfo: {
      fingerprint: 'fp_payment_002',
      os: 'macOS Monterey',
      browser: 'Safari 16',
      isMobile: false,
      isVPN: false
    },
    geolocation: {
      country: 'Canada',
      city: 'Toronto',
      region: 'Ontario',
      isp: 'Rogers Communications',
      isProxy: false
    },
    behavioral: {
      typicalLoginHours: [8, 9, 17, 18, 19],
      averageSessionDuration: 65,
      usualDevices: ['fp_xyz789'],
      usualLocations: ['Toronto, CA', 'Ottawa, CA']
    },
    transactionInfo: {
      recentTransactions: 25,
      failedPayments: 12,
      chargebacks: 3,
      refunds: 2
    },
    relatedAlerts: ['1'],
    investigationNotes: 'Potential compromised payment method or card testing. Account temporarily suspended pending verification.'
  },
  {
    id: '3',
    type: 'Account Takeover Attempt',
    severity: 'HIGH',
    userId: 'user789',
    userEmail: 'takeover@example.com',
    description: 'Password change followed by immediate subscription upgrade attempt',
    detectedAt: new Date(Date.now() - 172800000).toISOString(),
    ipAddress: '172.16.0.1',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    resolved: false,
    riskScore: 72,
    confidenceLevel: 78,
    userProfile: {
      id: 'user789',
      email: 'takeover@example.com',
      name: 'Mike Account',
      phone: '+1-555-0789',
      registrationDate: '2023-08-22T09:45:00Z',
      lastLogin: '2024-12-09T13:15:00Z',
      accountStatus: 'ACTIVE',
      subscriptionTier: 'Basic',
      totalTransactions: 23,
      failedLoginAttempts: 1,
      passwordLastChanged: '2024-12-08T10:30:00Z',
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: false,
      location: {
        country: 'Germany',
        city: 'Berlin',
        timezone: 'CET'
      },
      deviceFingerprints: ['fp_secure_003'],
      riskScore: 72,
      riskFactors: ['Recent password change', 'Immediate upgrade attempt', 'No 2FA'],
      accountAge: 478,
      lastPasswordChange: 4,
      suspiciousActivityCount: 1,
      loginLogs: [
        {
          id: 'log7',
          timestamp: '2024-12-09T13:15:00Z',
          ipAddress: '172.16.0.1',
          location: { country: 'Germany', city: 'Berlin', region: 'Berlin' },
          device: { os: 'Ubuntu 22.04', browser: 'Firefox 120', deviceType: 'Desktop' },
          success: true,
          riskScore: 65,
          isVPN: false,
          isProxy: false,
          sessionDuration: 25
        },
        {
          id: 'log8',
          timestamp: '2024-12-08T10:30:00Z',
          ipAddress: '172.16.0.1',
          location: { country: 'Germany', city: 'Berlin', region: 'Berlin' },
          device: { os: 'Ubuntu 22.04', browser: 'Firefox 120', deviceType: 'Desktop' },
          success: true,
          riskScore: 35,
          isVPN: false,
          isProxy: false,
          sessionDuration: 15
        }
      ],
      securityRisks: [
        {
          id: 'risk4',
          type: 'MEDIUM',
          category: 'Account Security',
          title: 'Rapid Account Changes After Password Reset',
          description: 'User changed password and immediately attempted subscription upgrade, indicating potential account takeover.',
          impact: 'Unauthorized account changes, financial fraud',
          likelihood: 'Medium - Suspicious timing of activities',
          recommendation: 'Require additional verification for account changes',
          preventionSteps: ['Enable cooling-off period after password changes', 'Require 2FA for subscription changes', 'Send email notifications for all account changes'],
          detectedAt: '2024-12-09T13:20:00Z'
        }
      ]
    },
    deviceInfo: {
      fingerprint: 'fp_takeover_003',
      os: 'Ubuntu 22.04',
      browser: 'Firefox 120',
      isMobile: false,
      isVPN: false
    },
    geolocation: {
      country: 'Germany',
      city: 'Berlin',
      region: 'Berlin',
      isp: 'Deutsche Telekom',
      isProxy: false
    },
    behavioral: {
      typicalLoginHours: [7, 8, 9, 16, 17, 18],
      averageSessionDuration: 38,
      usualDevices: ['fp_secure_003'],
      usualLocations: ['Berlin, DE']
    },
    transactionInfo: {
      recentTransactions: 2,
      failedPayments: 0,
      chargebacks: 0,
      refunds: 0
    },
    relatedAlerts: [],
    investigationNotes: 'Monitor for additional suspicious activity. Consider requiring 2FA for future account changes.'
  }
]

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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved')
    const limit = searchParams.get('limit')

    let filteredAlerts = [...mockFraudAlerts]

    // Apply filters
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity.toUpperCase())
    }
    
    if (resolved !== null) {
      const isResolved = resolved === 'true'
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === isResolved)
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit)
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredAlerts = filteredAlerts.slice(0, limitNum)
      }
    }

    // Sort by detection date (newest first)
    filteredAlerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())

    return NextResponse.json({
      success: true,
      alerts: filteredAlerts,
      total: filteredAlerts.length
    })

  } catch (error) {
    console.error('Error fetching fraud alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}