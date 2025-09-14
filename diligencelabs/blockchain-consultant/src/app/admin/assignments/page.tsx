"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"

interface PendingItem {
  id: string
  type: 'report' | 'session'
  title: string
  description?: string
  consultationType?: string
  reportType?: string
  priority: string
  complexity?: string
  estimatedHours?: number
  deadline?: string
  user: {
    name: string | null
    email: string
  }
  createdAt: string
  status: string
}

interface Assignment {
  id: string
  itemId: string
  itemType: 'report' | 'session'
  itemTitle: string
  assignee: {
    id: string
    name: string | null
    email: string
    teamMember?: {
      position: string
      department: string
      specializations: string[]
      currentWorkload: number
      maxHoursPerWeek: number
    }
  }
  role: string
  status: string
  estimatedHours?: number
  actualHours?: number
  createdAt: string
  startedAt?: string
  completedAt?: string
}

interface TeamMember {
  id: string
  user: {
    id: string
    name: string | null
    email: string
  }
  position: string
  department: string
  specializations: string[]
  currentWorkload: number
  maxHoursPerWeek: number
  isActive: boolean
}

export default function AdminAssignmentsPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{ memberId: string, role: string }[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignmentStatus, setAssignmentStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchAssignmentData()
  }, [])

  const fetchAssignmentData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const headers = {
        'Authorization': `Bearer ${token}`
      }
      
      const [pendingResponse, assignmentsResponse, teamResponse] = await Promise.all([
        fetch('/api/admin/assignments/pending', { headers }),
        fetch('/api/admin/assignments', { headers }),
        fetch('/api/admin/team', { headers })
      ])

      if (pendingResponse.ok) {
        try {
          const pendingData = await pendingResponse.json()
          setPendingItems(Array.isArray(pendingData.items) ? pendingData.items : [])
        } catch (error) {
          console.error("Failed to parse pending data:", error)
          setPendingItems([])
        }
      } else {
        console.log("Failed to fetch pending items:", pendingResponse.status)
        setPendingItems([])
      }

      if (assignmentsResponse.ok) {
        try {
          const assignmentData = await assignmentsResponse.json()
          setAssignments(Array.isArray(assignmentData.assignments) ? assignmentData.assignments : [])
        } catch (error) {
          console.error("Failed to parse assignments data:", error)
          setAssignments([])
        }
      } else {
        console.log("Failed to fetch assignments:", assignmentsResponse.status)
        setAssignments([])
      }

      if (teamResponse.ok) {
        try {
          const teamData = await teamResponse.json()
          setTeamMembers(Array.isArray(teamData.members) ? teamData.members : [])
        } catch (error) {
          console.error("Failed to parse team data:", error)
          setTeamMembers([])
        }
      } else {
        console.log("Failed to fetch team data:", teamResponse.status)
        setTeamMembers([])
      }

    } catch (error) {
      console.error("Failed to fetch assignment data:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTeamMember = (memberId: string, defaultRole: string = 'CONTRIBUTOR') => {
    setSelectedTeamMembers(prev => {
      const existing = prev.find(tm => tm.memberId === memberId)
      if (existing) {
        return prev.filter(tm => tm.memberId !== memberId)
      } else {
        const role = prev.length === 0 ? 'LEAD' : defaultRole
        return [...prev, { memberId, role }]
      }
    })
  }


  const handleAssignTask = async () => {
    if (!selectedItem || selectedTeamMembers.length === 0) {
      setAssignmentStatus({ type: 'error', message: 'Please select team members to assign' })
      return
    }
    
    try {
      setIsAssigning(true)
      console.log('Starting assignment for item:', selectedItem.id, 'type:', selectedItem.type)
      console.log('Selected team members:', selectedTeamMembers)
      
      for (const teamMember of selectedTeamMembers) {
        const assignmentData = {
          itemId: selectedItem.id,
          itemType: selectedItem.type,
          assigneeIds: [teamMember.memberId],
          role: teamMember.role,
          estimatedHours: selectedItem.estimatedHours
        }
        
        console.log('Sending assignment request:', assignmentData)
        
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/assignments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(assignmentData)
        })

        console.log('Assignment response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Assignment API error:', errorData)
          throw new Error(errorData.error || 'Failed to assign task')
        }
        
        const successData = await response.json()
        console.log('Assignment successful:', successData)
      }

      await fetchAssignmentData()
      setAssignmentStatus({ 
        type: 'success', 
        message: `Successfully assigned ${selectedTeamMembers.length} team member${selectedTeamMembers.length !== 1 ? 's' : ''} to the task!` 
      })
      
      setTimeout(() => {
        setShowAssignModal(false)
        setSelectedItem(null)
        setSelectedTeamMembers([])
        setAssignmentStatus(null)
      }, 2000)
      
    } catch (error) {
      console.error("Failed to assign task:", error)
      setAssignmentStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to assign task. Please try again.' 
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const openAssignModal = (item: PendingItem) => {
    setSelectedItem(item)
    setSelectedTeamMembers([])
    setAssignmentStatus(null)
    setShowAssignModal(true)
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'LOW': 'bg-gray-500/20 text-gray-400',
      'MEDIUM': 'bg-blue-500/20 text-blue-400',
      'HIGH': 'bg-orange-500/20 text-orange-400',
      'URGENT': 'bg-red-500/20 text-red-400'
    }
    return colors[priority] || 'bg-gray-500/20 text-gray-400'
  }

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      'SIMPLE': 'bg-green-500/20 text-green-400',
      'MEDIUM': 'bg-yellow-500/20 text-yellow-400',
      'COMPLEX': 'bg-orange-500/20 text-orange-400',
      'VERY_COMPLEX': 'bg-red-500/20 text-red-400'
    }
    return colors[complexity] || 'bg-gray-500/20 text-gray-400'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ASSIGNED': 'bg-blue-500/20 text-blue-400',
      'IN_PROGRESS': 'bg-yellow-500/20 text-yellow-400',
      'COMPLETED': 'bg-green-500/20 text-green-400',
      'ON_HOLD': 'bg-gray-500/20 text-gray-400',
      'CANCELLED': 'bg-red-500/20 text-red-400'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading assignment data...</p>
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
            <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Task Assignments</span>
          </h1>
          <p className="text-gray-400 text-lg">Assign reports and consultations to team members</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/team">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              Manage Team
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← Back to Admin
            </Button>
          </Link>
        </div>
      </div>

      <HorizontalDivider style="subtle" />

      {/* Pending Items for Assignment */}
      <div className={`mb-12 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Pending Assignments</CardTitle>
                <CardDescription className="text-gray-400">
                  Reports and consultations awaiting team assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingItems.length > 0 ? (
                  <div className="space-y-4">
                    {pendingItems.filter(item => item && item.id).map((item) => (
                      <div key={item.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.type.toUpperCase()}
                              </Badge>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              {item.complexity && (
                                <Badge className={getComplexityColor(item.complexity)}>
                                  {item.complexity}
                                </Badge>
                              )}
                              {item.estimatedHours && (
                                <Badge variant="outline" className="text-xs">
                                  ~{item.estimatedHours}h
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-white font-medium mb-1">{item.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">
                              Client: {item.user?.name || item.user?.email || 'Unknown'}
                            </p>
                            {item.description && (
                              <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                              {item.deadline && (
                                <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button
                              size="sm"
                              onClick={() => openAssignModal(item)}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                            >
                              Assign Team
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No pending items for assignment
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>

      {/* Current Assignments */}
      <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Active Assignments</CardTitle>
                <CardDescription className="text-gray-400">
                  Current team member assignments and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.filter(assignment => assignment && assignment.id).map((assignment) => (
                      <div key={assignment.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {assignment.itemType.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {assignment.role}
                              </Badge>
                            </div>
                            <h3 className="text-white font-medium mb-1">{assignment.itemTitle}</h3>
                            <p className="text-gray-400 text-sm mb-2">
                              Assigned to: {assignment.assignee?.name || assignment.assignee?.email || 'Unknown'}
                            </p>
                            {assignment.assignee?.teamMember && (
                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                <span>{assignment.assignee.teamMember.position || 'Unknown'}</span>
                                <span>{assignment.assignee.teamMember.department || 'Unknown'}</span>
                                <span>
                                  Workload: {assignment.assignee.teamMember.currentWorkload || 0}h / {assignment.assignee.teamMember.maxHoursPerWeek || 40}h
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Assigned: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                              {assignment.estimatedHours && (
                                <span>Est: {assignment.estimatedHours}h</span>
                              )}
                              {assignment.actualHours && (
                                <span>Actual: {assignment.actualHours}h</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No active assignments found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Assign Team Members</h2>
            
            {/* Status Notification */}
            {assignmentStatus && (
              <div className={`mb-4 p-3 rounded-lg border ${
                assignmentStatus.type === 'success' 
                  ? 'bg-emerald-900/20 border-emerald-600 text-emerald-400' 
                  : 'bg-red-900/20 border-red-600 text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  {assignmentStatus.type === 'success' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm">{assignmentStatus.message}</span>
                </div>
              </div>
            )}
            
            {/* Task Details */}
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
              <h3 className="text-lg text-white mb-2">{selectedItem.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{selectedItem.description}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Type: {selectedItem.type.toUpperCase()}</span>
                <span>Priority: {selectedItem.priority}</span>
                {selectedItem.estimatedHours && (
                  <span>Est. Hours: {selectedItem.estimatedHours}h</span>
                )}
              </div>
            </div>

            {/* Available Team Members */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Available Team Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {teamMembers.filter(member => member && member.isActive).map((member) => {
                  const isSelected = selectedTeamMembers.some(tm => tm.memberId === member.user?.id)
                  
                  return (
                    <div 
                      key={member.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-700/50 ${
                        isSelected 
                          ? 'bg-emerald-900/30 border-emerald-600' 
                          : 'bg-gray-800/50 border-gray-600'
                      }`}
                      onClick={() => toggleTeamMember(member.user?.id || '', 'CONTRIBUTOR')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium text-sm">
                              {member.user?.name || member.user?.email || 'Unknown'}
                            </p>
                          </div>
                          <p className="text-gray-400 text-xs mb-1">
                            {member.position || 'Unknown'} - {member.department || 'Unknown'}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Workload: {member.currentWorkload || 0}h / {member.maxHoursPerWeek || 40}h 
                            ({Math.round(((member.currentWorkload || 0) / (member.maxHoursPerWeek || 40)) * 100)}%)
                          </p>
                          {Array.isArray(member.specializations) && member.specializations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {member.specializations.slice(0, 2).map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {spec.replace('_', ' ')}
                                </Badge>
                              ))}
                              {member.specializations.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.specializations.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {isSelected ? (
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3">
              <div className="text-sm text-gray-400">
                {selectedTeamMembers.length > 0 ? (
                  `${selectedTeamMembers.length} team member${selectedTeamMembers.length > 1 ? 's' : ''} selected`
                ) : (
                  'Select team members to assign'
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedItem(null)
                    setSelectedTeamMembers([])
                  }}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTask}
                  disabled={selectedTeamMembers.length === 0 || isAssigning}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                  {isAssigning ? 'Assigning...' : `Assign ${selectedTeamMembers.length} Member${selectedTeamMembers.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}