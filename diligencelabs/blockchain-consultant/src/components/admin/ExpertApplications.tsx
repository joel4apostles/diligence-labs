'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  Mail,
  Calendar,
  Award,
  Star,
  Trophy,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  UserCheck,
  UserX,
  MessageSquare
} from 'lucide-react'

interface ExpertApplication {
  id: string
  verificationStatus: string
  kycStatus: string
  linkedinUrl?: string
  githubUrl?: string
  twitterHandle?: string
  company?: string
  position?: string
  yearsExperience?: number
  bio?: string
  primaryExpertise?: string
  secondaryExpertise?: string
  reputationPoints: number
  expertTier: string
  totalEvaluations: number
  accuracyRate: number
  createdAt: string
  verifiedAt?: string
  user: {
    id: string
    name: string
    email: string
    image?: string
    createdAt: string
  }
  evaluations: Array<{
    id: string
    overallScore?: number
    submittedAt?: string
    project: {
      name: string
      category: string
    }
  }>
  achievements: Array<{
    id: string
    title: string
    pointsAwarded: number
    awardedAt: string
  }>
}

export default function ExpertApplications() {
  const [applications, setApplications] = useState<ExpertApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('PENDING')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedApplication, setSelectedApplication] = useState<ExpertApplication | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchApplications()
  }, [selectedStatus, page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError('') // Clear previous errors
      
      console.log('Fetching expert applications...')
      
      const params = new URLSearchParams({
        status: selectedStatus,
        page: page.toString(),
        limit: '10'
      })

      // For development, first try to get a test token
      let token = localStorage.getItem('adminToken')
      
      if (!token) {
        console.log('No admin token found, trying to get test token...')
        try {
          const tokenResponse = await fetch('/api/admin/test-token')
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            token = tokenData.token
            if (token) {
              localStorage.setItem('adminToken', token)
            }
            console.log('Test token obtained and stored')
          }
        } catch (tokenError) {
          console.warn('Could not get test token:', tokenError)
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      console.log('Making request with headers:', headers)

      const response = await fetch(`/api/admin/expert-applications-simple?${params}`, {
        headers
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        if (response.status === 401) {
          throw new Error('Unauthorized - please login again')
        }
        if (response.status === 403) {
          throw new Error('Insufficient permissions')
        }
        throw new Error(`Failed to fetch applications: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      
      setApplications(data.applications || [])
      setTotalPages(data.pagination?.pages || 1)
      
      // Calculate status counts
      const counts: Record<string, number> = {}
      if (data.applications) {
        data.applications.forEach((app: ExpertApplication) => {
          counts[app.verificationStatus] = (counts[app.verificationStatus] || 0) + 1
        })
      }
      setStatusCounts(counts)
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError(error instanceof Error ? error.message : 'Failed to load expert applications')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessApplication = async (application: ExpertApplication, action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    try {
      setProcessing(application.id)
      setError('') // Clear previous errors
      
      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('No admin token found')
      }
      
      const response = await fetch('/api/admin/expert-applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expertId: application.id,
          action,
          reviewNotes
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please login again')
        }
        if (response.status === 403) {
          throw new Error('Insufficient permissions')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action.toLowerCase()} application`)
      }

      const result = await response.json()
      
      // Refresh applications list
      await fetchApplications()
      
      // Close dialog
      setActionDialogOpen(false)
      setSelectedApplication(null)
      setReviewNotes('')
      setSelectedAction(null)

    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing application:`, error)
      setError(error instanceof Error ? error.message : `Failed to ${action.toLowerCase()} application`)
    } finally {
      setProcessing(null)
    }
  }

  const createSampleData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Creating sample expert applications...')
      
      const response = await fetch('/api/admin/expert-applications-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create sample data: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Sample data created:', data)
      
      // Refresh the applications list to show the new data
      await fetchApplications()
    } catch (error) {
      console.error('Error creating sample data:', error)
      setError(error instanceof Error ? error.message : 'Failed to create sample data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'UNDER_REVIEW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'SUSPENDED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'UNDER_REVIEW': return <Eye className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'SUSPENDED': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const parseExpertise = (expertiseJson?: string) => {
    try {
      return expertiseJson ? JSON.parse(expertiseJson) : []
    } catch {
      return []
    }
  }

  const filteredApplications = applications.filter(app =>
    app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && applications.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading expert applications...</p>
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no applications found
  if (!loading && applications.length === 0 && !error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-3" />
              Expert Applications
            </h2>
            <p className="text-gray-400 mt-1">Review and manage expert verification requests</p>
            
            {/* Status Summary */}
            {Object.keys(statusCounts).length > 0 && (
              <div className="flex items-center gap-4 mt-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'VERIFIED' ? 'bg-green-400' :
                      status === 'PENDING' ? 'bg-yellow-400' :
                      status === 'UNDER_REVIEW' ? 'bg-blue-400' :
                      status === 'REJECTED' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}></span>
                    <span className="text-sm text-gray-300">{status}: {count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Expert Applications</h3>
            <p className="text-gray-400 mb-6">There are no expert applications to review at this time.</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={fetchApplications}
                variant="outline" 
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                Refresh Applications
              </Button>
              <Button 
                onClick={createSampleData}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-3" />
            Expert Applications
          </h2>
          <p className="text-gray-400 mt-1">Review and manage expert verification requests</p>
          
          {/* Status Summary */}
          {Object.keys(statusCounts).length > 0 && (
            <div className="flex items-center gap-4 mt-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'VERIFIED' ? 'bg-green-400' :
                    status === 'PENDING' ? 'bg-yellow-400' :
                    status === 'UNDER_REVIEW' ? 'bg-blue-400' :
                    status === 'REJECTED' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`}></span>
                  <span className="text-sm text-gray-300">{status}: {count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search experts..."
                className="pl-10 bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="ALL">All Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedStatus('PENDING')
                setPage(1)
              }}
              className="border-gray-600 text-gray-400"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>

            <Button
              onClick={fetchApplications}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Applications List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header with Avatar and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {application.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{application.user.name}</h3>
                      <p className="text-xs text-gray-400">{application.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(application.verificationStatus)}>
                      {getStatusIcon(application.verificationStatus)}
                      <span className="ml-1 text-xs">{application.verificationStatus}</span>
                    </Badge>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Company:</span>
                    <p className="text-white font-medium">{application.company || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Experience:</span>
                    <p className="text-white font-medium">{application.yearsExperience || 'N/A'} years</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Reputation:</span>
                    <p className="text-white font-medium">{application.reputationPoints} points</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Applied:</span>
                    <p className="text-white font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Expertise Tags - Limited */}
                <div className="flex flex-wrap gap-1">
                  {parseExpertise(application.primaryExpertise).slice(0, 2).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-blue-400 border-blue-400/30 text-xs px-2 py-1">
                      {skill}
                    </Badge>
                  ))}
                  {parseExpertise(application.primaryExpertise).length > 2 && (
                    <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs px-2 py-1">
                      +{parseExpertise(application.primaryExpertise).length - 2} more
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 flex-1 mr-2"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                      {selectedApplication && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-xl text-white">
                              Expert Application Review: {selectedApplication.user.name}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Profile Summary */}
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-white font-semibold mb-3">Profile Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="text-gray-400">Email:</span> {selectedApplication.user.email}</p>
                                  <p><span className="text-gray-400">Company:</span> {selectedApplication.company || 'Not provided'}</p>
                                  <p><span className="text-gray-400">Position:</span> {selectedApplication.position || 'Not provided'}</p>
                                  <p><span className="text-gray-400">Experience:</span> {selectedApplication.yearsExperience || 'Not provided'} years</p>
                                  <p><span className="text-gray-400">Applied:</span> {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-white font-semibold mb-3">Social Links</h4>
                                <div className="space-y-2 text-sm">
                                  {selectedApplication.linkedinUrl && (
                                    <p>
                                      <span className="text-gray-400">LinkedIn:</span>
                                      <a 
                                        href={selectedApplication.linkedinUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 ml-2"
                                      >
                                        View Profile <ExternalLink className="w-3 h-3 inline" />
                                      </a>
                                    </p>
                                  )}
                                  {selectedApplication.githubUrl && (
                                    <p>
                                      <span className="text-gray-400">GitHub:</span>
                                      <a 
                                        href={selectedApplication.githubUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 ml-2"
                                      >
                                        View Profile <ExternalLink className="w-3 h-3 inline" />
                                      </a>
                                    </p>
                                  )}
                                  {selectedApplication.twitterHandle && (
                                    <p>
                                      <span className="text-gray-400">Twitter:</span>
                                      <a 
                                        href={`https://twitter.com/${selectedApplication.twitterHandle.replace('@', '')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 ml-2"
                                      >
                                        @{selectedApplication.twitterHandle.replace('@', '')} <ExternalLink className="w-3 h-3 inline" />
                                      </a>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expertise */}
                            <div>
                              <h4 className="text-white font-semibold mb-3">Areas of Expertise</h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-gray-400 text-sm mb-2">Primary Expertise:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {parseExpertise(selectedApplication.primaryExpertise).map((skill: string, index: number) => (
                                      <Badge key={index} variant="outline" className="text-blue-400 border-blue-400/30">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {parseExpertise(selectedApplication.secondaryExpertise).length > 0 && (
                                  <div>
                                    <p className="text-gray-400 text-sm mb-2">Secondary Expertise:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {parseExpertise(selectedApplication.secondaryExpertise).map((skill: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-green-400 border-green-400/30">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Bio */}
                            {selectedApplication.bio && (
                              <div>
                                <h4 className="text-white font-semibold mb-3">Bio / Experience Summary</h4>
                                <p className="text-gray-300 text-sm bg-gray-800/30 p-4 rounded-lg">
                                  {selectedApplication.bio}
                                </p>
                              </div>
                            )}

                            {/* Recent Evaluations */}
                            {selectedApplication.evaluations.length > 0 && (
                              <div>
                                <h4 className="text-white font-semibold mb-3">Recent Evaluations</h4>
                                <div className="space-y-2">
                                  {selectedApplication.evaluations.map((evaluation, index) => (
                                    <div key={index} className="bg-gray-800/30 p-3 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="text-white font-medium">{evaluation.project.name}</p>
                                          <p className="text-gray-400 text-sm">{evaluation.project.category}</p>
                                        </div>
                                        <div className="text-right">
                                          {evaluation.overallScore && (
                                            <p className="text-white font-semibold">{evaluation.overallScore}/10</p>
                                          )}
                                          {evaluation.submittedAt && (
                                            <p className="text-gray-400 text-xs">
                                              {new Date(evaluation.submittedAt).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Admin Actions */}
                            {selectedApplication.verificationStatus === 'PENDING' && (
                              <div className="border-t border-gray-700 pt-6">
                                <h4 className="text-white font-semibold mb-3">Admin Review</h4>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Add review notes (optional)..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    className="bg-gray-800/50 border-gray-700 text-white"
                                  />
                                  
                                  <div className="flex space-x-3">
                                    <Button
                                      onClick={() => handleProcessApplication(selectedApplication, 'APPROVE')}
                                      disabled={processing === selectedApplication.id}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {processing === selectedApplication.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                      ) : (
                                        <UserCheck className="w-4 h-4 mr-2" />
                                      )}
                                      Approve
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleProcessApplication(selectedApplication, 'REQUEST_INFO')}
                                      disabled={processing === selectedApplication.id}
                                      variant="outline"
                                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Request Info
                                    </Button>
                                    
                                    <Button
                                      onClick={() => handleProcessApplication(selectedApplication, 'REJECT')}
                                      disabled={processing === selectedApplication.id}
                                      variant="outline"
                                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                      <UserX className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Quick Actions for pending applications */}
                  {application.verificationStatus === 'PENDING' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleProcessApplication(application, 'APPROVE')}
                        disabled={processing === application.id}
                        className="bg-green-600 hover:bg-green-700 text-xs px-3"
                      >
                        {processing === application.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProcessApplication(application, 'REJECT')}
                        disabled={processing === application.id}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs px-3"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
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
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 ${
                    page === pageNum 
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
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-gray-600 text-gray-400"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}