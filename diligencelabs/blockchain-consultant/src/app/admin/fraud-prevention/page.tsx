"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { PageStructureLines } from "@/components/ui/page-structure"
import { EnhancedFraudAlertModal } from "@/components/enhanced-fraud-alert-modal"

interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  registrationDate: string
  lastLogin: string
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING'
  subscriptionTier: string
  totalTransactions: number
  failedLoginAttempts: number
  passwordLastChanged: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  location: {
    country?: string
    city?: string
    timezone?: string
  }
  deviceFingerprints: string[]
  riskScore: number
  riskFactors: string[]
}

interface FraudAlert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  userEmail?: string
  description: string
  detectedAt: string
  ipAddress?: string
  userAgent?: string
  resolved: boolean
  riskScore: number
  confidenceLevel: number
  userProfile?: UserProfile
  deviceInfo: {
    fingerprint: string
    os: string
    browser: string
    isMobile: boolean
    isVPN: boolean
  }
  geolocation: {
    country: string
    city: string
    region: string
    isp: string
    isProxy: boolean
  }
  behavioral: {
    typicalLoginHours: number[]
    averageSessionDuration: number
    usualDevices: string[]
    usualLocations: string[]
  }
  transactionInfo?: {
    recentTransactions: number
    failedPayments: number
    chargebacks: number
    refunds: number
  }
  relatedAlerts: string[]
  investigationNotes?: string
}

interface FraudStats {
  totalAlerts: number
  criticalAlerts: number
  highAlerts: number
  mediumAlerts: number
  lowAlerts: number
  resolvedAlerts: number
  activeAlerts: number
}

export default function FraudPreventionPage() {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [fraudStats, setFraudStats] = useState<FraudStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0,
    resolvedAlerts: 0,
    activeAlerts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchFraudData()
  }, [])

  const fetchFraudData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      // Fetch fraud alerts
      const alertsResponse = await fetch('/api/admin/fraud/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Fetch fraud statistics
      const statsResponse = await fetch('/api/admin/fraud/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (alertsResponse.ok && statsResponse.ok) {
        const alertsData = await alertsResponse.json()
        const statsData = await statsResponse.json()
        
        setFraudAlerts(alertsData.alerts || [])
        setFraudStats(statsData.stats || fraudStats)
      } else {
        // Enhanced mock data with detailed user profiles
        setFraudAlerts([
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
              riskFactors: ['Multiple failed logins', 'New device', 'Unusual location', 'No 2FA']
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
            investigationNotes: 'User attempting login from unusual location with VPN'
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
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
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
              riskFactors: ['Multiple payment failures', 'High transaction volume', 'Recent password change']
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
            investigationNotes: 'Potential compromised payment method or card testing'
          },
          {
            id: '3',
            type: 'Account Takeover Attempt',
            severity: 'MEDIUM',
            userId: 'user789',
            userEmail: 'takeover@example.com',
            description: 'Password change followed by immediate subscription upgrade attempt',
            detectedAt: new Date(Date.now() - 172800000).toISOString(),
            ipAddress: '172.16.0.1',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
            resolved: true,
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
              riskFactors: ['Recent password change', 'Immediate upgrade attempt', 'No 2FA']
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
            investigationNotes: 'Resolved: User confirmed password change was legitimate'
          }
        ])
        
        setFraudStats({
          totalAlerts: 15,
          criticalAlerts: 2,
          highAlerts: 4,
          mediumAlerts: 6,
          lowAlerts: 3,
          resolvedAlerts: 8,
          activeAlerts: 7
        })
      }
    } catch (error) {
      console.error("Failed to fetch fraud data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'LOW': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'MEDIUM': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'HIGH': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'CRITICAL': 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[severity] || colors['LOW']
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/fraud/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setFraudAlerts(alerts => alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ))
      }
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <DynamicPageBackground variant="admin" opacity={0.25} />
        <PageStructureLines />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading fraud prevention data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <DynamicPageBackground variant="admin" opacity={0.25} />
      <PageStructureLines />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                ← Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-light mb-2">
                <span className="font-normal bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">Fraud Prevention</span>
              </h1>
              <p className="text-gray-400 text-lg">Monitor and analyze potential fraud activities</p>
            </div>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        {/* Statistics Cards */}
        <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-white">{fraudStats.totalAlerts}</div>
              <p className="text-xs text-gray-400">Total Alerts</p>
            </Card>
          </ProminentBorder>
          
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-red-900/60 to-red-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-red-400">{fraudStats.criticalAlerts}</div>
              <p className="text-xs text-gray-400">Critical</p>
            </Card>
          </ProminentBorder>
          
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-orange-900/60 to-orange-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-orange-400">{fraudStats.highAlerts}</div>
              <p className="text-xs text-gray-400">High</p>
            </Card>
          </ProminentBorder>
          
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-yellow-900/60 to-yellow-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-yellow-400">{fraudStats.mediumAlerts}</div>
              <p className="text-xs text-gray-400">Medium</p>
            </Card>
          </ProminentBorder>
          
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-gray-400">{fraudStats.lowAlerts}</div>
              <p className="text-xs text-gray-400">Low</p>
            </Card>
          </ProminentBorder>
          
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-green-900/60 to-green-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-green-400">{fraudStats.resolvedAlerts}</div>
              <p className="text-xs text-gray-400">Resolved</p>
            </Card>
          </ProminentBorder>
          
          <ProminentBorder className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/30 backdrop-blur-xl border-0 text-center p-4">
              <div className="text-2xl font-bold text-blue-400">{fraudStats.activeAlerts}</div>
              <p className="text-xs text-gray-400">Active</p>
            </Card>
          </ProminentBorder>
        </div>

        {/* Fraud Alerts Section */}
        <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20" />
              
              <Card className="bg-transparent border-0 relative z-10">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Recent Fraud Alerts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Latest detected suspicious activities and security threats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fraudAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {fraudAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alert.type}
                                </Badge>
                                {alert.resolved && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    RESOLVED
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="text-white font-medium mb-1">{alert.type}</h3>
                              <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                              
                              {alert.userEmail && (
                                <p className="text-gray-400 text-sm mb-2">
                                  User: {alert.userEmail}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                                {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {!alert.resolved && (
                                <Button
                                  size="sm"
                                  onClick={() => resolveAlert(alert.id)}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300"
                                >
                                  Resolve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAlert(alert)
                                  setShowDetailView(true)
                                }}
                                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No fraud alerts detected. System is secure.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ProminentBorder>
        </div>

        {/* Detailed Alert View Modal */}
        <EnhancedFraudAlertModal
          alert={selectedAlert}
          isOpen={showDetailView}
          onClose={() => setShowDetailView(false)}
          onResolve={resolveAlert}
          getSeverityColor={getSeverityColor}
        />
      </div>
    </div>
  )
}