"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserNotificationModal } from "./UserNotificationModal"
import { NotificationHistory } from "./NotificationHistory"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: boolean
  accountStatus: string
  accountStatusReason: string | null
  failedLoginAttempts: number
  accountLockedUntil: Date | null
  lastFailedLogin: Date | null
  statusChangedAt: Date | null
  statusChangedBy: string | null
  createdAt: string
  _count: {
    sessions: number
    reports: number
  }
}

export function EnhancedUserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showHistoryForUser, setShowHistoryForUser] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
        limit: '20'
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'SUSPENDED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'RESTRICTED':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'DISABLED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'USER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleSendNotification = (user: User) => {
    setSelectedUser(user)
    setShowNotificationModal(true)
  }

  const handleNotificationSent = () => {
    // Refresh the user list and close modal
    fetchUsers()
    setShowNotificationModal(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-light mb-2">
            <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Enhanced User Management
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Manage users with advanced email notifications</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Users ({users.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Manage user accounts and send notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white truncate">
                        {user.name || 'Unnamed User'}
                      </h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.accountStatus)}>
                        {user.accountStatus}
                      </Badge>
                      {user.emailVerified && (
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-400 mb-2">{user.email}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Sessions:</span>
                        <span className="ml-1 text-white">{user._count.sessions}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Reports:</span>
                        <span className="ml-1 text-white">{user._count.reports}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Failed Logins:</span>
                        <span className={`ml-1 ${user.failedLoginAttempts > 0 ? 'text-red-400' : 'text-white'}`}>
                          {user.failedLoginAttempts}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Joined:</span>
                        <span className="ml-1 text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {user.accountStatusReason && (
                      <div className="mt-2 p-2 bg-gray-900/50 rounded text-sm">
                        <span className="text-gray-400">Status Reason:</span>
                        <span className="ml-1 text-white">{user.accountStatusReason}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSendNotification(user)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      📧 Send Notification
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowHistoryForUser(
                        showHistoryForUser === user.id ? null : user.id
                      )}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      {showHistoryForUser === user.id ? 'Hide History' : '📋 History'}
                    </Button>
                  </div>
                </div>

                {/* Show notification history for this user */}
                {showHistoryForUser === user.id && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <NotificationHistory userId={user.id} limit={5} />
                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Global Notification History */}
      <NotificationHistory />

      {/* Notification Modal */}
      <UserNotificationModal
        user={selectedUser}
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false)
          setSelectedUser(null)
        }}
        onSent={handleNotificationSent}
      />
    </div>
  )
}