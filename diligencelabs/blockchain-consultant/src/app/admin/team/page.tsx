"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"

interface TeamMember {
  id: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  position: string
  department: string
  specializations: string[]
  hourlyRate: number | null
  isActive: boolean
  maxHoursPerWeek: number
  currentWorkload: number
  createdAt: string
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  averageWorkload: number
  departments: Record<string, number>
}

export default function AdminTeamPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [showAddMember, setShowAddMember] = useState(false)
  const [addMemberData, setAddMemberData] = useState({
    userId: '',
    position: '',
    department: 'BLOCKCHAIN_INTEGRATION',
    specializations: [] as string[],
    hourlyRate: '',
    maxHoursPerWeek: '40'
  })
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [addMemberStatus, setAddMemberStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchTeamData()
  }, [search, departmentFilter])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search,
        department: departmentFilter
      })
      
      const response = await fetch('/api/admin/team?' + params.toString())
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data.members || [])
        setTeamStats(data.stats || null)
      } else {
        console.log("Team API response not ok:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch team data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/admin/users?role=ALL&limit=100')
      if (response.ok) {
        const data = await response.json()
        const existingMemberIds = teamMembers.map(member => member.user.id)
        const availableUsers = data.users.filter((user: any) => 
          !existingMemberIds.includes(user.id)
        )
        setAvailableUsers(availableUsers)
      }
    } catch (error) {
      console.error("Failed to fetch available users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAddMember = async () => {
    if (!addMemberData.userId || !addMemberData.position) {
      setAddMemberStatus({ type: 'error', message: 'Please fill in all required fields' })
      return
    }

    try {
      setIsAddingMember(true)
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addMemberData)
      })

      if (response.ok) {
        setAddMemberStatus({ type: 'success', message: 'Team member added successfully!' })
        fetchTeamData()
        
        setTimeout(() => {
          setShowAddMember(false)
          setAddMemberData({
            userId: '',
            position: '',
            department: 'BLOCKCHAIN_INTEGRATION',
            specializations: [],
            hourlyRate: '',
            maxHoursPerWeek: '40'
          })
          setAddMemberStatus(null)
        }, 2000)
      } else {
        const errorData = await response.json()
        setAddMemberStatus({ type: 'error', message: errorData.error || 'Failed to add team member' })
      }
    } catch (error) {
      setAddMemberStatus({ type: 'error', message: 'Failed to add team member. Please try again.' })
    } finally {
      setIsAddingMember(false)
    }
  }

  const openAddMemberModal = () => {
    setShowAddMember(true)
    setAddMemberStatus(null)
    fetchAvailableUsers()
  }

  const toggleSpecialization = (spec: string) => {
    setAddMemberData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }))
  }

  const departments = [
    'BLOCKCHAIN_INTEGRATION',
    'STRATEGY_CONSULTING', 
    'DUE_DILIGENCE',
    'TOKEN_ECONOMICS',
    'MARKETING',
    'BUSINESS_DEVELOPMENT',
    'PROJECT_MANAGEMENT',
    'RESEARCH'
  ]

  const getDepartmentColor = (department: string) => {
    const colorMap = {
      'BLOCKCHAIN_INTEGRATION': 'bg-blue-500/20 text-blue-400',
      'STRATEGY_CONSULTING': 'bg-purple-500/20 text-purple-400',
      'DUE_DILIGENCE': 'bg-green-500/20 text-green-400',
      'TOKEN_ECONOMICS': 'bg-yellow-500/20 text-yellow-400',
      'MARKETING': 'bg-pink-500/20 text-pink-400',
      'BUSINESS_DEVELOPMENT': 'bg-cyan-500/20 text-cyan-400',
      'PROJECT_MANAGEMENT': 'bg-orange-500/20 text-orange-400',
      'RESEARCH': 'bg-red-500/20 text-red-400'
    } as const
    return colorMap[department as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-400'
  }

  const getWorkloadColor = (workload: number, maxHours: number) => {
    const percentage = (workload / maxHours) * 100
    if (percentage >= 90) return 'text-red-400'
    if (percentage >= 70) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading team data...</p>
        </div>
      </div>
    )
  }

  const animationStyle = isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'

  return (
    <div>
      {/* Header */}
      <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${animationStyle}`}>
        <div>
          <h1 className="text-4xl font-light mb-2">
            <span className="font-normal bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Team Management</span>
          </h1>
          <p className="text-gray-400 text-lg">Manage team members, assignments, and workload</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={openAddMemberModal}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 hover:scale-105"
          >
            Add Team Member
          </Button>
          <Link href="/admin">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← Back to Admin
            </Button>
          </Link>
        </div>
      </div>

      <HorizontalDivider style="subtle" />

      {/* Team Statistics */}
      {teamStats && (
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-300 ${animationStyle}`}>
          <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20" />
              <Card className="bg-transparent border-0 relative z-10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Total Team Members</p>
                      <p className="text-2xl font-bold text-white">{teamStats.totalMembers}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ProminentBorder>

          <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20" />
              <Card className="bg-transparent border-0 relative z-10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Active Members</p>
                      <p className="text-2xl font-bold text-white">{teamStats.activeMembers}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ProminentBorder>

          <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20" />
              <Card className="bg-transparent border-0 relative z-10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Avg. Workload</p>
                      <p className="text-2xl font-bold text-white">{teamStats.averageWorkload}%</p>
                    </div>
                    <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ProminentBorder>

          <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
              <Card className="bg-transparent border-0 relative z-10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Departments</p>
                      <p className="text-2xl font-bold text-white">{Object.keys(teamStats.departments).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ProminentBorder>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className={`mb-8 transition-all duration-1000 delay-400 ${animationStyle}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl p-6 rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Search Team Members</label>
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Department Filter</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-emerald-400 focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Button 
                  onClick={() => {
                    setSearch('')
                    setDepartmentFilter('ALL')
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

      {/* Team Members List */}
      <div className={`transition-all duration-1000 delay-500 ${animationStyle}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Team Members</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage team member details, workload, and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers && teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{member.user.name || 'No Name'}</h3>
                              <p className="text-gray-400 text-sm">{member.user.email}</p>
                              <p className="text-gray-300 text-sm">{member.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getDepartmentColor(member.department)}>
                              {member.department.replace(/_/g, ' ')}
                            </Badge>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${getWorkloadColor(member.currentWorkload, member.maxHoursPerWeek)}`}>
                                {member.currentWorkload}h / {member.maxHoursPerWeek}h
                              </p>
                              <p className="text-xs text-gray-400">
                                {Math.round((member.currentWorkload / member.maxHoursPerWeek) * 100)}% capacity
                              </p>
                            </div>
                            <Badge variant={member.isActive ? 'default' : 'destructive'}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        {member.specializations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {member.specializations.map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No team members found matching your criteria
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Add Team Member</h2>
            
            {addMemberStatus && (
              <div className={`mb-4 p-3 rounded-lg border ${
                addMemberStatus.type === 'success' 
                  ? 'bg-emerald-900/20 border-emerald-600 text-emerald-400' 
                  : 'bg-red-900/20 border-red-600 text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  {addMemberStatus.type === 'success' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm">{addMemberStatus.message}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* User Selection */}
              <div>
                <Label className="text-white mb-2 block">Select User *</Label>
                {loadingUsers ? (
                  <div className="text-gray-400">Loading users...</div>
                ) : (
                  <select
                    value={addMemberData.userId}
                    onChange={(e) => setAddMemberData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                    disabled={isAddingMember}
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Position */}
              <div>
                <Label className="text-white mb-2 block">Position *</Label>
                <Input
                  value={addMemberData.position}
                  onChange={(e) => setAddMemberData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="e.g., Senior Blockchain Developer"
                  className="bg-gray-800 text-white border-gray-600 focus:border-emerald-500"
                  disabled={isAddingMember}
                />
              </div>

              {/* Department */}
              <div>
                <Label className="text-white mb-2 block">Department *</Label>
                <select
                  value={addMemberData.department}
                  onChange={(e) => setAddMemberData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-emerald-500 focus:outline-none"
                  disabled={isAddingMember}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specializations */}
              <div>
                <Label className="text-white mb-2 block">Specializations</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {[
                    'SMART_CONTRACTS', 'DEFI_PROTOCOLS', 'TOKENOMICS', 'MARKET_ANALYSIS',
                    'REGULATORY_COMPLIANCE', 'SECURITY_AUDITING', 'BLOCKCHAIN_ARCHITECTURE',
                    'INVESTMENT_ANALYSIS', 'CRYPTO_TRADING', 'NFT_MARKETS', 'DAO_GOVERNANCE',
                    'LAYER2_SOLUTIONS', 'BLOCKCHAIN_SELECTION', 'INFRASTRUCTURE_PARTNERS',
                    'WHITE_LABEL_SOLUTIONS', 'DEVELOPMENT_FRAMEWORKS'
                  ].map(spec => (
                    <div key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        id={spec}
                        checked={addMemberData.specializations.includes(spec)}
                        onChange={() => toggleSpecialization(spec)}
                        className="mr-2"
                        disabled={isAddingMember}
                      />
                      <label htmlFor={spec} className="text-gray-300 text-sm cursor-pointer">
                        {spec.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <Label className="text-white mb-2 block">Hourly Rate (USD)</Label>
                <Input
                  type="number"
                  value={addMemberData.hourlyRate}
                  onChange={(e) => setAddMemberData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="e.g., 75"
                  className="bg-gray-800 text-white border-gray-600 focus:border-emerald-500"
                  disabled={isAddingMember}
                />
              </div>

              {/* Max Hours Per Week */}
              <div>
                <Label className="text-white mb-2 block">Max Hours Per Week</Label>
                <Input
                  type="number"
                  value={addMemberData.maxHoursPerWeek}
                  onChange={(e) => setAddMemberData(prev => ({ ...prev, maxHoursPerWeek: e.target.value }))}
                  placeholder="40"
                  className="bg-gray-800 text-white border-gray-600 focus:border-emerald-500"
                  disabled={isAddingMember}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMember(false)
                  setAddMemberStatus(null)
                  setAddMemberData({
                    userId: '',
                    position: '',
                    department: 'BLOCKCHAIN_INTEGRATION',
                    specializations: [],
                    hourlyRate: '',
                    maxHoursPerWeek: '40'
                  })
                }}
                disabled={isAddingMember}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!addMemberData.userId || !addMemberData.position || isAddingMember}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                {isAddingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}