"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoginLog {
  id: string
  timestamp: string
  ipAddress: string
  location: {
    country: string
    city: string
    region: string
  }
  device: {
    os: string
    browser: string
    deviceType: string
  }
  success: boolean
  failureReason?: string
  riskScore: number
  isVPN: boolean
  isProxy: boolean
  sessionDuration?: number
}

interface SecurityRisk {
  id: string
  type: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  title: string
  description: string
  impact: string
  likelihood: string
  recommendation: string
  preventionSteps: string[]
  detectedAt: string
}

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
  loginLogs?: LoginLog[]
  securityRisks?: SecurityRisk[]
  accountAge: number
  lastPasswordChange: number
  suspiciousActivityCount: number
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

interface EnhancedFraudAlertModalProps {
  alert: FraudAlert | null
  isOpen: boolean
  onClose: () => void
  onResolve: (alertId: string) => Promise<void>
  getSeverityColor: (severity: string) => string
}

export function EnhancedFraudAlertModal({ 
  alert, 
  isOpen, 
  onClose, 
  onResolve, 
  getSeverityColor 
}: EnhancedFraudAlertModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen || !alert) return null

  const getRiskLevelColor = (type: string) => {
    switch (type) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 max-w-7xl max-h-[90vh] overflow-y-auto w-full">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Enhanced Fraud Alert Analysis</h2>
              <div className="flex items-center gap-3">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {alert.type}
                </Badge>
                <span className="text-sm text-gray-400">
                  Risk Score: <span className="text-red-400 font-semibold">{alert.riskScore}/100</span>
                </span>
                <span className="text-sm text-gray-400">
                  User: <span className="text-white font-medium">{alert.userProfile?.name || alert.userEmail}</span>
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              ✕ Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="loginlogs">Login Logs</TabsTrigger>
              <TabsTrigger value="security">Security Risks</TabsTrigger>
              <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="prevention">Prevention</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alert Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Alert Details</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alert ID:</span>
                        <span className="text-white font-mono text-sm">{alert.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Detected:</span>
                        <span className="text-white">{new Date(alert.detectedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-green-400">{alert.confidenceLevel}%</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-400">Description:</span>
                        <span className="text-white text-right max-w-xs">{alert.description}</span>
                      </div>
                    </div>
                  </div>

                  {/* Device & Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Device & Location</h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm block mb-1">IP Address</span>
                          <span className="text-white font-mono">{alert.ipAddress}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block mb-1">Device</span>
                          <span className="text-white">{alert.deviceInfo?.os} - {alert.deviceInfo?.browser}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm block mb-1">Location</span>
                          <span className="text-white">{alert.geolocation?.city}, {alert.geolocation?.country}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block mb-1">ISP</span>
                          <span className="text-white">{alert.geolocation?.isp}</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {alert.deviceInfo?.isVPN && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">VPN</Badge>
                        )}
                        {alert.geolocation?.isProxy && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Proxy</Badge>
                        )}
                        {alert.deviceInfo?.isMobile && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Mobile</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Profile */}
                {alert.userProfile && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">User Profile</h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{alert.userProfile.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white font-mono text-sm">{alert.userProfile.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Age:</span>
                          <span className="text-white">{alert.userProfile.accountAge} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge className={alert.userProfile.accountStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {alert.userProfile.accountStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Subscription:</span>
                          <span className="text-white">{alert.userProfile.subscriptionTier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Security Summary</h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-red-400">{alert.userProfile.failedLoginAttempts}</div>
                          <div className="text-gray-400 text-sm">Failed Logins</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-400">{alert.userProfile.suspiciousActivityCount}</div>
                          <div className="text-gray-400 text-sm">Suspicious Activities</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{alert.userProfile.totalTransactions}</div>
                          <div className="text-gray-400 text-sm">Total Transactions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-yellow-400">{alert.userProfile.lastPasswordChange}</div>
                          <div className="text-gray-400 text-sm">Days Since Password Change</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Login Logs Tab */}
            <TabsContent value="loginlogs" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Login Activity</h3>
                <div className="space-y-3">
                  {alert.userProfile?.loginLogs?.map((log, index) => (
                    <div key={log.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className={log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {log.success ? 'SUCCESS' : 'FAILED'}
                            </Badge>
                            <span className="text-gray-400 text-sm">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <Badge className={getRiskLevelColor(log.riskScore >= 80 ? 'HIGH' : log.riskScore >= 60 ? 'MEDIUM' : 'LOW')}>
                              Risk: {log.riskScore}/100
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">IP Address:</span>
                              <div className="text-white font-mono">{log.ipAddress}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Location:</span>
                              <div className="text-white">{log.location.city}, {log.location.country}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Device:</span>
                              <div className="text-white">{log.device.os} - {log.device.browser}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Session:</span>
                              <div className="text-white">{log.sessionDuration ? `${log.sessionDuration}m` : 'Ongoing'}</div>
                            </div>
                          </div>

                          {!log.success && log.failureReason && (
                            <div className="text-red-400 text-sm">
                              <span className="text-gray-400">Failure Reason:</span> {log.failureReason}
                            </div>
                          )}

                          <div className="flex gap-2">
                            {log.isVPN && <Badge className="bg-red-500/20 text-red-400 text-xs">VPN</Badge>}
                            {log.isProxy && <Badge className="bg-orange-500/20 text-orange-400 text-xs">Proxy</Badge>}
                            <Badge variant="outline" className="text-xs">{log.device.deviceType}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      No login logs available
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Security Risks Tab */}
            <TabsContent value="security" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Identified Security Risks</h3>
                <div className="space-y-4">
                  {alert.userProfile?.securityRisks?.map((risk) => (
                    <div key={risk.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getRiskLevelColor(risk.type)}>
                            {risk.type} RISK
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {risk.category}
                          </Badge>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(risk.detectedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="text-white font-semibold mb-2">{risk.title}</h4>
                      <p className="text-gray-300 text-sm mb-3">{risk.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-400 text-sm">Impact:</span>
                          <div className="text-white text-sm">{risk.impact}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Likelihood:</span>
                          <div className="text-white text-sm">{risk.likelihood}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <h5 className="text-yellow-400 text-sm font-semibold mb-2">Recommendation:</h5>
                        <p className="text-gray-300 text-sm">{risk.recommendation}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      No specific security risks identified
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Behavioral Analysis Tab */}
            <TabsContent value="behavioral" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Usage Patterns</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                    <div>
                      <span className="text-gray-400 text-sm block mb-2">Typical Login Hours</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.behavioral?.typicalLoginHours.map((hour) => (
                          <Badge key={hour} variant="outline" className="text-xs">{hour}:00</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Session Duration:</span>
                      <span className="text-white">{alert.behavioral?.averageSessionDuration} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm block mb-2">Usual Locations</span>
                      <div className="space-y-1">
                        {alert.behavioral?.usualLocations.map((location, index) => (
                          <div key={index} className="text-white text-sm">{location}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                    {alert.userProfile && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Overall Risk Score</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  alert.userProfile.riskScore >= 80 ? 'bg-red-500' :
                                  alert.userProfile.riskScore >= 60 ? 'bg-orange-500' :
                                  alert.userProfile.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${alert.userProfile.riskScore}%` }}
                              />
                            </div>
                            <span className="text-white font-bold">{alert.userProfile.riskScore}/100</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm block mb-2">Risk Factors:</span>
                          <div className="flex flex-wrap gap-2">
                            {alert.userProfile.riskFactors.map((factor, index) => (
                              <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Prevention Tab */}
            <TabsContent value="prevention" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Prevention Recommendations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-3">🚨 Immediate Actions Required</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Force password reset for this user account</li>
                      <li>• Enable mandatory 2FA authentication</li>
                      <li>• Review and revoke suspicious active sessions</li>
                      <li>• Block access from high-risk IP addresses</li>
                      <li>• Monitor account for 48 hours for unusual activity</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-3">⚠️ Medium-term Improvements</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Implement device fingerprinting</li>
                      <li>• Add geolocation-based access controls</li>
                      <li>• Set up automated risk scoring alerts</li>
                      <li>• Configure session timeout policies</li>
                      <li>• Deploy behavioral analytics monitoring</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-3">🛡️ Long-term Security Enhancements</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Deploy AI-powered fraud detection</li>
                      <li>• Implement zero-trust security model</li>
                      <li>• Add biometric authentication options</li>
                      <li>• Create user security awareness programs</li>
                      <li>• Establish incident response procedures</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-3">✅ Preventive Measures</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Regular security awareness training</li>
                      <li>• Automated vulnerability scanning</li>
                      <li>• Multi-layer authentication systems</li>
                      <li>• Real-time threat intelligence feeds</li>
                      <li>• Comprehensive audit logging</li>
                    </ul>
                  </div>
                </div>

                {alert.investigationNotes && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
                    <h4 className="text-white font-semibold mb-2">Investigation Notes</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{alert.investigationNotes}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700 p-6">
          <div className="flex gap-4 justify-end">
            {!alert.resolved && (
              <Button
                onClick={async () => {
                  await onResolve(alert.id)
                  onClose()
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300"
              >
                Mark as Resolved
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}