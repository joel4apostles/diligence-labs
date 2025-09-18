'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  FolderOpen,
  Clock,
  Users,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  ExternalLink,
  Filter,
  Search,
  Briefcase,
  Target,
  Timer,
  DollarSign,
  Eye,
  UserPlus,
  UserMinus,
  Loader2,
  BarChart3
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  website?: string
  category: string
  status: string
  priorityLevel: string
  evaluationBudget?: number
  evaluationDeadline?: string
  createdAt: string
  isAssigned: boolean
  hasEvaluated: boolean
  availableSlots: number
  evaluationProgress: number
  submitter: {
    name: string
    email: string
    image?: string
  }
  assignments: any[]
  _count: {
    assignments: number
    evaluations: number
  }
}

interface Assignment {
  id: string
  status: string
  assignmentType: string
  estimatedHours?: number
  acceptedAt: string
  hasEvaluated: boolean
  evaluationStatus: string
  daysOnProject: number
  project: Project & {
    submitter: {
      name: string
      email: string
      image?: string
    }
  }
  otherExperts: Array<{
    name: string
    image?: string
    tier: string
    status: string
  }>
  projectProgress: {
    totalExperts: number
    completedEvaluations: number
  }
}

export default function ExpertProjectDashboard() {
  const [activeTab, setActiveTab] = useState('available')
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Statistics
  const [stats, setStats] = useState({
    totalAvailable: 0,
    myActiveAssignments: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0
  })

  useEffect(() => {
    fetchData()
  }, [activeTab, categoryFilter, statusFilter, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (activeTab === 'available') {
        await fetchAvailableProjects()
      } else {
        await fetchMyAssignments()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableProjects = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12'
    })
    
    if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
    if (statusFilter !== 'ALL') params.append('status', statusFilter)

    const response = await fetch(`/api/expert/available-projects?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch available projects')
    }
    
    const data = await response.json()
    setAvailableProjects(data.projects)
    setTotalPages(data.pagination.pages)
    setStats(prev => ({ ...prev, totalAvailable: data.pagination.total }))
  }

  const fetchMyAssignments = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12'
    })
    
    if (statusFilter !== 'ALL') params.append('status', statusFilter)

    const response = await fetch(`/api/expert/my-assignments?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch assignments')
    }
    
    const data = await response.json()
    setMyAssignments(data.assignments)
    setTotalPages(data.pagination.pages)
    setStats(prev => ({
      ...prev,
      myActiveAssignments: data.statistics.total,
      completedEvaluations: data.statistics.completedEvaluations,
      pendingEvaluations: data.statistics.pendingEvaluations
    }))
  }

  const handleAssignProject = async (projectId: string) => {
    try {
      setAssigning(projectId)
      setError('')

      const response = await fetch('/api/expert/assign-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          assignmentType: 'PRIMARY'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign project')
      }

      const result = await response.json()
      
      // Refresh data
      await fetchData()
      
      // Show success message (you can enhance with toast notifications)
      alert(`Successfully assigned to project! +${result.pointsAwarded} reputation points`)

    } catch (error) {
      console.error('Assignment error:', error)
      setError(error instanceof Error ? error.message : 'Assignment failed')
    } finally {
      setAssigning(null)
    }
  }

  const handleUnassignProject = async (projectId: string) => {
    try {
      setAssigning(projectId)
      setError('')

      const response = await fetch(`/api/expert/assign-project?projectId=${projectId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unassign project')
      }

      // Refresh data
      await fetchData()
      
      alert('Successfully removed from project')

    } catch (error) {
      console.error('Unassignment error:', error)
      setError(error instanceof Error ? error.message : 'Unassignment failed')
    } finally {
      setAssigning(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXPERT_ASSIGNMENT': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'EVALUATION_IN_PROGRESS': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'ASSIGNED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const filteredProjects = availableProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.submitter.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAssignments = myAssignments.filter(assignment =>
    assignment.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.project.submitter.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Briefcase className="w-8 h-8 mr-3" />
            Expert Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage your project assignments and evaluations</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Available Projects</p>
                <p className="text-2xl font-bold text-white">{stats.totalAvailable}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">My Assignments</p>
                <p className="text-2xl font-bold text-white">{stats.myActiveAssignments}</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedEvaluations}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-700/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingEvaluations}</p>
              </div>
              <Timer className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available" className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4" />
                <span>Available Projects</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>My Assignments</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="DEFI">DeFi</SelectItem>
                  <SelectItem value="NFT">NFTs</SelectItem>
                  <SelectItem value="GAMEFI">Gaming</SelectItem>
                  <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="DAO">DAO</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {activeTab === 'available' ? (
                    <>
                      <SelectItem value="EXPERT_ASSIGNMENT">Available</SelectItem>
                      <SelectItem value="EVALUATION_IN_PROGRESS">In Progress</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setCategoryFilter('ALL')
                  setStatusFilter('ALL')
                  setSearchTerm('')
                }}
                className="border-gray-600 text-gray-400"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            <TabsContent value="available" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading available projects...</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Projects Available</h3>
                  <p className="text-gray-400">No projects match your current filters.</p>
                </div>
              ) : (
                <>
                  {/* Available Projects Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredProjects.map((project) => (
                      <Card 
                        key={project.id} 
                        className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                                <p className="text-sm text-gray-400 mb-2">{project.description}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                                    {project.category}
                                  </Badge>
                                  <Badge className={getPriorityColor(project.priorityLevel)}>
                                    {project.priorityLevel}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Project Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Submitter:</span>
                                <p className="text-white font-medium">{project.submitter.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Available Slots:</span>
                                <p className="text-white font-medium">{project.availableSlots}/3</p>
                              </div>
                              {project.evaluationBudget && (
                                <div>
                                  <span className="text-gray-400">Budget:</span>
                                  <p className="text-white font-medium">${project.evaluationBudget}</p>
                                </div>
                              )}
                              {project.evaluationDeadline && (
                                <div>
                                  <span className="text-gray-400">Deadline:</span>
                                  <p className="text-white font-medium">
                                    {new Date(project.evaluationDeadline).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Progress */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                  {project._count.assignments} experts assigned
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                  {project.evaluationProgress} evaluations
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                              <Badge className={getStatusColor(project.status)}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                              
                              {project.isAssigned ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnassignProject(project.id)}
                                  disabled={assigning === project.id}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  {assigning === project.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <UserMinus className="w-4 h-4 mr-2" />
                                  )}
                                  Remove Assignment
                                </Button>
                              ) : project.availableSlots > 0 ? (
                                <Button
                                  onClick={() => handleAssignProject(project.id)}
                                  disabled={assigning === project.id}
                                  className="bg-blue-500 hover:bg-blue-600"
                                  size="sm"
                                >
                                  {assigning === project.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <UserPlus className="w-4 h-4 mr-2" />
                                  )}
                                  Assign Myself
                                </Button>
                              ) : (
                                <Button disabled size="sm" variant="outline">
                                  <Users className="w-4 h-4 mr-2" />
                                  Full
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="ml-2 text-gray-400">Loading your assignments...</span>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Assignments</h3>
                  <p className="text-gray-400">You haven't been assigned to any projects yet.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('available')}
                  >
                    Browse Available Projects
                  </Button>
                </div>
              ) : (
                <>
                  {/* My Assignments Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAssignments.map((assignment) => (
                      <Card 
                        key={assignment.id} 
                        className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                  {assignment.project.name}
                                </h3>
                                <p className="text-sm text-gray-400 mb-2">
                                  {assignment.project.description}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                                    {assignment.project.category}
                                  </Badge>
                                  <Badge className={getStatusColor(assignment.status)}>
                                    {assignment.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Assignment Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Role:</span>
                                <p className="text-white font-medium">{assignment.assignmentType}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Days Assigned:</span>
                                <p className="text-white font-medium">{assignment.daysOnProject}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Other Experts:</span>
                                <p className="text-white font-medium">{assignment.otherExperts.length}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Progress:</span>
                                <p className="text-white font-medium">
                                  {assignment.projectProgress.completedEvaluations}/{assignment.projectProgress.totalExperts}
                                </p>
                              </div>
                            </div>

                            {/* Evaluation Status */}
                            <div className="bg-gray-900/50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Evaluation Status:</span>
                                <Badge className={
                                  assignment.evaluationStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                  assignment.evaluationStatus === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }>
                                  {assignment.evaluationStatus.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              
                              {assignment.hasEvaluated ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500/30 text-green-400"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Completed
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-purple-500 hover:bg-purple-600"
                                >
                                  <Award className="w-4 h-4 mr-2" />
                                  Start Evaluation
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-400"
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 ${
                        currentPage === pageNum 
                          ? 'bg-blue-500 text-white' 
                          : 'border-gray-600 text-gray-400'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-400"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}