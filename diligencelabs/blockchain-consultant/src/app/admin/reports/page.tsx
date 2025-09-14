"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { PageStructureLines } from "@/components/ui/page-structure"

interface Report {
  id: string
  title: string
  description: string | null
  status: string
  type: string
  priority: string
  complexity: string
  estimatedHours: number | null
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface Session {
  id: string
  consultationType: string
  status: string
  priority: string
  estimatedHours: number | null
  description: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    setIsPageLoaded(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // For now, we'll use the pending assignments API to get data
      const response = await fetch('/api/admin/assignments/pending')
      if (response.ok) {
        const data = await response.json()
        
        // Separate reports and sessions from the items
        const reportItems = data.items.filter((item: any) => item.type === 'report')
        const sessionItems = data.items.filter((item: any) => item.type === 'session')
        
        setReports(reportItems)
        setSessions(sessionItems)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-500/20 text-yellow-400',
      'IN_REVIEW': 'bg-blue-500/20 text-blue-400',
      'COMPLETED': 'bg-green-500/20 text-green-400',
      'SCHEDULED': 'bg-cyan-500/20 text-cyan-400',
      'IN_PROGRESS': 'bg-orange-500/20 text-orange-400'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
        <DynamicPageBackground variant="admin" opacity={0.25} />
        <PageStructureLines />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reports and analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <DynamicPageBackground variant="admin" opacity={0.25} />
      <PageStructureLines />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Header */}
      <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div>
          <h1 className="text-4xl font-light mb-2">
            <span className="font-normal bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Reports & Analytics</span>
          </h1>
          <p className="text-gray-400 text-lg">Monitor reports and consultation sessions</p>
        </div>
      </div>

      <HorizontalDivider style="subtle" />

      {/* Reports Section */}
      <div className={`mb-12 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Reports ({reports.length})</CardTitle>
                <CardDescription className="text-gray-400">
                  Due diligence and analysis reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div key={report.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {report.reportType || report.type}
                              </Badge>
                              <Badge className={getPriorityColor(report.priority)}>
                                {report.priority}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                              {report.estimatedHours && (
                                <Badge variant="outline" className="text-xs">
                                  ~{report.estimatedHours}h
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-white font-medium mb-1">{report.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">
                              Client: {report.user?.name || report.user?.email || 'Unknown'}
                            </p>
                            {report.description && (
                              <p className="text-gray-300 text-sm mb-3">{report.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No reports found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>

      {/* Sessions Section */}
      <div className={`transition-all duration-1000 delay-400 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl rounded-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Consultation Sessions ({sessions.length})</CardTitle>
                <CardDescription className="text-gray-400">
                  Advisory and consultation sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {session.consultationType}
                              </Badge>
                              <Badge className={getPriorityColor(session.priority)}>
                                {session.priority}
                              </Badge>
                              <Badge className={getStatusColor(session.status)}>
                                {session.status}
                              </Badge>
                              {session.estimatedHours && (
                                <Badge variant="outline" className="text-xs">
                                  ~{session.estimatedHours}h
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-white font-medium mb-1">
                              {session.title || `${session.consultationType} Consultation`}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">
                              Client: {session.user?.name || session.user?.email || 'Unknown'}
                            </p>
                            {session.description && (
                              <p className="text-gray-300 text-sm mb-3">{session.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No consultation sessions found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>
      </div>
    </div>
  )
}