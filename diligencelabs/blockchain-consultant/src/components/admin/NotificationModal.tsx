"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface User {
  id: string
  name: string | null
  email: string
  accountStatus: string
  createdAt: string
}

interface NotificationHistory {
  id: string
  notificationType: string
  emailSent: boolean
  details: any
  createdAt: string
  user: User
  admin: {
    name: string
    email: string
  }
}

interface ExpiringSubscription {
  subscriptionId: string
  userId: string
  userEmail: string
  userName: string | null
  planId: string | null
  currentPeriodEnd: string
  daysRemaining: number
  isUrgent: boolean
  isCritical: boolean
}

interface NotificationModalProps {
  title: string
  description: string
  trigger: React.ReactNode
  type: 'users' | 'expirations' | 'history'
}

export function NotificationModal({ title, description, trigger, type }: NotificationModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [expirations, setExpirations] = useState<ExpiringSubscription[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [notificationType, setNotificationType] = useState<string>("subscription_status")
  const [notificationData, setNotificationData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sendingBulk, setSendingBulk] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users?search=${searchTerm}&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/notifications/history?limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setHistory(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpirations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/notifications/subscription-expiry?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setExpirations(data.upcomingExpirations)
      }
    } catch (error) {
      console.error('Error fetching expirations:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!selectedUser) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${selectedUser}/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationType,
          ...notificationData
        })
      })

      if (response.ok) {
        alert('Notification sent successfully!')
        setSelectedUser("")
        setNotificationData({})
      } else {
        alert('Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Error sending notification')
    } finally {
      setLoading(false)
    }
  }

  const sendBulkExpirationNotifications = async () => {
    try {
      setSendingBulk(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/notifications/subscription-expiry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          daysToCheck: [30, 14, 7, 3, 1],
          testMode: false
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Bulk notifications completed: ${data.summary.notificationsSent} sent`)
        fetchExpirations()
      } else {
        alert('Failed to send bulk notifications')
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
      alert('Error sending bulk notifications')
    } finally {
      setSendingBulk(false)
    }
  }

  useEffect(() => {
    if (open) {
      if (type === 'users') fetchUsers()
      else if (type === 'history') fetchHistory()
      else if (type === 'expirations') fetchExpirations()
    }
  }, [open, type, searchTerm])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{title}</DialogTitle>
          <p className="text-gray-400">{description}</p>
        </DialogHeader>

        {type === 'users' && (
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="send" className="text-gray-300">Send Notification</TabsTrigger>
              <TabsTrigger value="users" className="text-gray-300">Browse Users</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm">User</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select user..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id} className="text-white">
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm">Notification Type</label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="subscription_status" className="text-white">Subscription Status</SelectItem>
                      <SelectItem value="malicious_activity" className="text-white">Security Alert</SelectItem>
                      <SelectItem value="subscription_expiration" className="text-white">Expiration Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {notificationType === 'subscription_status' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Status</label>
                    <Input 
                      className="bg-gray-800 border-gray-600 text-white"
                      value={notificationData.status || ''}
                      onChange={(e) => setNotificationData({...notificationData, status: e.target.value})}
                      placeholder="ACTIVE, EXPIRED, CANCELLED, etc."
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Details</label>
                    <Textarea 
                      className="bg-gray-800 border-gray-600 text-white"
                      value={notificationData.details || ''}
                      onChange={(e) => setNotificationData({...notificationData, details: e.target.value})}
                      placeholder="Describe the status change..."
                    />
                  </div>
                </div>
              )}

              {notificationType === 'malicious_activity' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm">Activity Type</label>
                    <Input 
                      className="bg-gray-800 border-gray-600 text-white"
                      value={notificationData.activityType || ''}
                      onChange={(e) => setNotificationData({...notificationData, activityType: e.target.value})}
                      placeholder="Suspicious login, unusual activity, etc."
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Details</label>
                    <Textarea 
                      className="bg-gray-800 border-gray-600 text-white"
                      value={notificationData.details || ''}
                      onChange={(e) => setNotificationData({...notificationData, details: e.target.value})}
                      placeholder="Describe the security concern..."
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={sendNotification} 
                disabled={loading || !selectedUser}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </TabsContent>

            <TabsContent value="users">
              <div className="mb-4">
                <Input 
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {users.map(user => (
                    <Card key={user.id} className="bg-gray-800 border-gray-700">
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-white text-sm">{user.name || 'No Name'}</CardTitle>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                          <Badge className={user.accountStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {user.accountStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {type === 'expirations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg">Upcoming Subscription Expirations</h3>
              <Button 
                onClick={sendBulkExpirationNotifications}
                disabled={sendingBulk}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                {sendingBulk ? 'Sending...' : 'Send Bulk Notifications'}
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {expirations.map(exp => (
                  <Card key={exp.subscriptionId} className="bg-gray-800 border-gray-700">
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-white text-sm">{exp.userName || 'No Name'}</CardTitle>
                          <p className="text-gray-400 text-xs">{exp.userEmail}</p>
                          <p className="text-gray-500 text-xs">Plan: {exp.planId}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={exp.isCritical ? 'bg-red-500' : exp.isUrgent ? 'bg-yellow-500' : 'bg-blue-500'}>
                            {exp.daysRemaining} days
                          </Badge>
                          <p className="text-gray-400 text-xs mt-1">
                            Expires: {new Date(exp.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {type === 'history' && (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {history.map(notification => (
                <Card key={notification.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white text-sm">
                          {notification.user.name || 'No Name'} - {notification.notificationType}
                        </CardTitle>
                        <p className="text-gray-400 text-xs">{notification.user.email}</p>
                        <p className="text-gray-500 text-xs">
                          Sent by: {notification.admin.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={notification.emailSent ? 'bg-green-500' : 'bg-red-500'}>
                          {notification.emailSent ? 'Sent' : 'Failed'}
                        </Badge>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}