"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  walletAddress: string | null
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [walletFilter, setWalletFilter] = useState('ALL')
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchUsers()
  }, [search, roleFilter, statusFilter, walletFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
        wallet: walletFilter,
        limit: '100'
      })
      
      const token = localStorage.getItem('adminToken')
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
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-500/20 text-red-400',
      'TEAM_MEMBER': 'bg-orange-500/20 text-orange-400',
      'USER': 'bg-blue-500/20 text-blue-400'
    }
    return colors[role] || 'bg-gray-500/20 text-gray-400'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-500/20 text-green-400',
      'SUSPENDED': 'bg-yellow-500/20 text-yellow-400',
      'RESTRICTED': 'bg-orange-500/20 text-orange-400',
      'DISABLED': 'bg-red-500/20 text-red-400',
      'PENDING_VERIFICATION': 'bg-blue-500/20 text-blue-400'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  const updateUserStatus = async (userId: string, accountStatus: string, reason?: string) => {
    try {
      setStatusUpdateLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountStatus, reason })
      })

      if (response.ok) {
        await fetchUsers() // Refresh the list
        setShowStatusModal(false)
        setSelectedUser(null)
      } else {
        console.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
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
    <div>
      {/* Header */}
      <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div>
          <h1 className="text-4xl font-light mb-2">
            <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">User Management</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage user accounts and permissions</p>
        </div>
      </div>

      <HorizontalDivider style="subtle" />

      {/* Search and Filter Controls */}
      <div className={`mb-8 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl p-6 rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Search Users</label>
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-400"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Role Filter</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-orange-400 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="TEAM_MEMBER">Team Members</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Wallet Filter</label>
                <select
                  value={walletFilter}
                  onChange={(e) => setWalletFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-orange-400 focus:outline-none"
                >
                  <option value="ALL">All Users</option>
                  <option value="CONNECTED">Wallet Connected</option>
                  <option value="NOT_CONNECTED">No Wallet</option>
                </select>
              </div>
              
              <div>
                <Button 
                  onClick={() => {
                    setSearch('')
                    setRoleFilter('ALL')
                  }}
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </ProminentBorder>
      </div>

      {/* Users List */}
      <div className={`transition-all duration-1000 delay-400 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader>
                <CardTitle className="text-xl text-white">All Users ({users.length})</CardTitle>
                <CardDescription className="text-gray-400">
                  System users with their roles and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{user.name || 'No Name'}</h3>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                              {user.walletAddress && (
                                <p className="text-blue-400 text-xs font-mono mt-1">
                                  🔗 {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role.replace('_', ' ')}
                                </Badge>
                                {user.emailVerified ? (
                                  <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                                    ✓ Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                                    ⚠ Unverified
                                  </Badge>
                                )}
                                {user.walletAddress && (
                                  <Badge variant="outline" className="text-xs text-purple-400 border-purple-400">
                                    🔗 Wallet
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-4 text-sm text-gray-400 mb-1">
                              <span>{user._count.sessions} sessions</span>
                              <span>{user._count.reports} reports</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No users found matching your criteria
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>
    </div>
  )
}