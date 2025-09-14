"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  email: string
  name: string | null
  accountStatus: string
}

interface UserNotificationModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSent: () => void
}

export function UserNotificationModal({ user, isOpen, onClose, onSent }: UserNotificationModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("subscription")
  const [formData, setFormData] = useState({
    // Subscription Status
    subscriptionStatus: 'ACTIVE',
    subscriptionDetails: '',
    subscriptionAction: '',
    
    // Malicious Activity
    activityType: 'SUSPICIOUS_LOGIN',
    activityDetails: '',
    ipAddress: '',
    timestamp: new Date().toISOString().slice(0, 16),
    
    // Subscription Expiration
    planName: 'Professional Plan',
    expirationDate: '',
    daysRemaining: 7
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const sendNotification = async (notificationType: string) => {
    if (!user) return

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      let notificationData: any = { notificationType }

      switch (notificationType) {
        case 'subscription_status':
          notificationData = {
            ...notificationData,
            status: formData.subscriptionStatus,
            details: formData.subscriptionDetails,
            actionRequired: formData.subscriptionAction || undefined
          }
          break
        case 'malicious_activity':
          notificationData = {
            ...notificationData,
            activityType: formData.activityType,
            details: formData.activityDetails,
            ipAddress: formData.ipAddress || undefined,
            timestamp: formData.timestamp || undefined
          }
          break
        case 'subscription_expiration':
          notificationData = {
            ...notificationData,
            planName: formData.planName,
            expirationDate: formData.expirationDate,
            daysRemaining: formData.daysRemaining
          }
          break
      }

      const response = await fetch(`/api/admin/users/${user.id}/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      })

      if (response.ok) {
        onSent()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('Failed to send notification:', errorData.error)
        alert('Failed to send notification: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Error sending notification')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-white">
                Send Notification
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                Send email notification to: <span className="font-medium text-orange-400">{user.email}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {user.accountStatus}
                </Badge>
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="subscription" className="data-[state=active]:bg-orange-500">
                Subscription Status
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-red-500">
                Security Alert
              </TabsTrigger>
              <TabsTrigger value="expiration" className="data-[state=active]:bg-yellow-500">
                Expiration Warning
              </TabsTrigger>
            </TabsList>

            {/* Subscription Status Tab */}
            <TabsContent value="subscription" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select 
                  value={formData.subscriptionStatus}
                  onChange={(e) => handleInputChange('subscriptionStatus', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Details
                </label>
                <Textarea 
                  value={formData.subscriptionDetails}
                  onChange={(e) => handleInputChange('subscriptionDetails', e.target.value)}
                  placeholder="Explain the subscription status change..."
                  className="min-h-[80px] bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action Required (Optional)
                </label>
                <Textarea 
                  value={formData.subscriptionAction}
                  onChange={(e) => handleInputChange('subscriptionAction', e.target.value)}
                  placeholder="What action should the user take?"
                  className="min-h-[60px] bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Button 
                onClick={() => sendNotification('subscription_status')}
                disabled={loading || !formData.subscriptionDetails}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading ? 'Sending...' : 'Send Subscription Notification'}
              </Button>
            </TabsContent>

            {/* Security Alert Tab */}
            <TabsContent value="security" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activity Type
                </label>
                <select 
                  value={formData.activityType}
                  onChange={(e) => handleInputChange('activityType', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="SUSPICIOUS_LOGIN">Suspicious Login Attempt</option>
                  <option value="UNUSUAL_ACTIVITY">Unusual Account Activity</option>
                  <option value="MULTIPLE_FAILED_LOGINS">Multiple Failed Logins</option>
                  <option value="ACCOUNT_COMPROMISE">Potential Account Compromise</option>
                  <option value="POLICY_VIOLATION">Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activity Details
                </label>
                <Textarea 
                  value={formData.activityDetails}
                  onChange={(e) => handleInputChange('activityDetails', e.target.value)}
                  placeholder="Describe the suspicious activity..."
                  className="min-h-[80px] bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    IP Address (Optional)
                  </label>
                  <Input 
                    value={formData.ipAddress}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                    placeholder="192.168.1.1"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timestamp
                  </label>
                  <Input 
                    type="datetime-local"
                    value={formData.timestamp}
                    onChange={(e) => handleInputChange('timestamp', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <Button 
                onClick={() => sendNotification('malicious_activity')}
                disabled={loading || !formData.activityDetails}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                {loading ? 'Sending...' : 'Send Security Alert'}
              </Button>
            </TabsContent>

            {/* Expiration Warning Tab */}
            <TabsContent value="expiration" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Name
                </label>
                <Input 
                  value={formData.planName}
                  onChange={(e) => handleInputChange('planName', e.target.value)}
                  placeholder="Professional Plan"
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiration Date
                  </label>
                  <Input 
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Days Remaining
                  </label>
                  <Input 
                    type="number"
                    min="1"
                    max="365"
                    value={formData.daysRemaining}
                    onChange={(e) => handleInputChange('daysRemaining', parseInt(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <Button 
                onClick={() => sendNotification('subscription_expiration')}
                disabled={loading || !formData.planName || !formData.expirationDate}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
                {loading ? 'Sending...' : 'Send Expiration Warning'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}