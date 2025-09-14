"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface FraudAlertDetailModalProps {
  alert: FraudAlert | null
  isOpen: boolean
  onClose: () => void
  onResolve: (alertId: string) => Promise<void>
  getSeverityColor: (severity: string) => string
}

export function FraudAlertDetailModal({ 
  alert, 
  isOpen, 
  onClose, 
  onResolve, 
  getSeverityColor 
}: FraudAlertDetailModalProps) {
  if (!isOpen || !alert) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Fraud Alert Details</h2>
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

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alert Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Alert Information</h3>
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

            {/* Device & Location Information */}
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

            {/* Transaction Information */}
            {alert.transactionInfo && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Transaction Data</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{alert.transactionInfo.recentTransactions}</div>
                    <div className="text-gray-400 text-sm">Recent Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{alert.transactionInfo.failedPayments}</div>
                    <div className="text-gray-400 text-sm">Failed Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{alert.transactionInfo.chargebacks}</div>
                    <div className="text-gray-400 text-sm">Chargebacks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{alert.transactionInfo.refunds}</div>
                    <div className="text-gray-400 text-sm">Refunds</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Information */}
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
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{alert.userProfile.phone}</span>
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
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registered:</span>
                    <span className="text-white">{new Date(alert.userProfile.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Security Profile</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-400">{alert.userProfile.failedLoginAttempts}</div>
                      <div className="text-gray-400 text-sm">Failed Logins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{alert.userProfile.totalTransactions}</div>
                      <div className="text-gray-400 text-sm">Total Transactions</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Email Verified:</span>
                    <Badge className={alert.userProfile.emailVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {alert.userProfile.emailVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Phone Verified:</span>
                    <Badge className={alert.userProfile.phoneVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {alert.userProfile.phoneVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">2FA Enabled:</span>
                    <Badge className={alert.userProfile.twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {alert.userProfile.twoFactorEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Password Changed:</span>
                    <span className="text-white text-sm">{new Date(alert.userProfile.passwordLastChanged).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Score</span>
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
                </div>
              </div>

              {/* Behavioral Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Behavioral Analysis</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm block mb-1">Typical Login Hours</span>
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
                    <span className="text-gray-400 text-sm block mb-1">Usual Locations</span>
                    <div className="space-y-1">
                      {alert.behavioral?.usualLocations.map((location, index) => (
                        <div key={index} className="text-white text-sm">{location}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investigation Notes */}
              {alert.investigationNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Investigation Notes</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{alert.investigationNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
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