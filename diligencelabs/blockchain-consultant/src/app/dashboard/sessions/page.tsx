"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/date-utils"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Session = {
  id: string
  consultationType: string
  status: string
  description: string
  scheduledAt: string | null
  createdAt: string
  notes: string | null
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const consultationTypeLabels = {
  STRATEGIC_ADVISORY: "Strategic Advisory",
  DUE_DILIGENCE: "Due Diligence", 
  TOKENOMICS_DESIGN: "Tokenomics Design",
  TOKEN_LAUNCH: "Token Launch Consultation",
}

export default function Sessions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isModifyRequestOpen, setIsModifyRequestOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/unified-signin")
      return
    }
    if (session) {
      setIsPageLoaded(true)
      fetchSessions()
    }
  }, [session, status, router])

  async function fetchSessions() {
    try {
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading sessions...</div>
      </div>
    )
  }

  const parseSessionDetails = (description: string) => {
    const lines = description.split('\n')
    const title = lines[0]?.replace('Title: ', '') || 'Untitled'
    const project = lines[1]?.replace('Project: ', '') || 'Unknown Project'
    const descriptionStart = lines.findIndex(line => line === 'Description:')
    const mainDescription = descriptionStart !== -1 
      ? lines.slice(descriptionStart + 1).join('\n').split('\n\n')[0] 
      : description.split('\n\n')[1] || 'No description'
    
    return { title, project, mainDescription }
  }

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session)
    setIsViewDetailsOpen(true)
  }

  const handleModifyRequest = (session: Session) => {
    setSelectedSession(session)
    setIsModifyRequestOpen(true)
  }

  const handleCancelSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      
      if (response.ok) {
        setSessions(sessions.map(s => 
          s.id === sessionId ? { ...s, status: 'CANCELLED' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to cancel session:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Dashboard Background */}
      <DynamicPageBackground variant="dashboard" opacity={0.2} />
      
      <PageStructureLines />
      <FormGridLines />
      <ParallaxBackground />
      <FloatingElements />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className={`flex items-center gap-4 mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
              ← Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-light mb-2">
              <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">My Sessions</span>
            </h1>
            <p className="text-gray-400 text-lg">View and manage your consultation sessions</p>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <Link href="/dashboard/book-consultation">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105">
              Book New Consultation
            </Button>
          </Link>
        </div>

        <HorizontalDivider style="subtle" />

        <div className={`max-w-6xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        {sessions.length === 0 ? (
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10" animated={true}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0 text-center py-12">
              <CardContent>
                <div className="space-y-6">
                  <div className="text-6xl mb-6">📅</div>
                  <h3 className="text-2xl font-light text-white">No sessions yet</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto">
                    You haven't booked any consultation sessions yet. Start by booking your first consultation with our blockchain experts.
                  </p>
                  <Link href="/dashboard/book-consultation">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-8 text-lg rounded-lg transition-all duration-300 hover:scale-105 mt-4">
                      Book Your First Consultation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </ProminentBorder>
        ) : (
          <div className="space-y-8">
            {sessions.map((session) => {
              const { title, project, mainDescription } = parseSessionDetails(session.description)
              
              return (
                <ProminentBorder key={session.id} className="rounded-2xl overflow-hidden shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-300" animated={false}>
                  <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="text-xl font-light text-white">{title}</CardTitle>
                          <CardDescription className="flex items-center gap-3 text-gray-300">
                            <span className="font-medium text-blue-400">{project}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{consultationTypeLabels[session.consultationType as keyof typeof consultationTypeLabels]}</span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
                            session.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            session.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            session.status === 'IN_PROGRESS' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            session.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                            'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-300 leading-relaxed">
                          {mainDescription}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <span className="font-medium text-gray-400 text-sm">Created:</span>
                            <p className="text-white mt-1">{formatDate(session.createdAt)}</p>
                          </div>
                          {session.scheduledAt && (
                            <div>
                              <span className="font-medium text-gray-400 text-sm">Scheduled:</span>
                              <p className="text-white mt-1">{formatDate(session.scheduledAt)}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-400 text-sm">Type:</span>
                            <p className="text-white mt-1">{consultationTypeLabels[session.consultationType as keyof typeof consultationTypeLabels]}</p>
                          </div>
                        </div>

                        {session.notes && (
                          <div className="pt-4 border-t border-gray-700">
                            <span className="font-medium text-gray-400 text-sm">Notes:</span>
                            <p className="text-gray-300 mt-2 leading-relaxed">{session.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                            onClick={() => handleViewDetails(session)}
                          >
                            View Details
                          </Button>
                          {session.status === "PENDING" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                              onClick={() => handleModifyRequest(session)}
                            >
                              Modify Request
                            </Button>
                          )}
                          {session.status === "SCHEDULED" && (
                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all duration-300 hover:scale-105">
                              Join Session
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ProminentBorder>
              )
            })}
          </div>
        )}
        </div>
      </div>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 text-white">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Session Details
                  </span>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Complete information about your consultation session
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Session Title</h3>
                    <p className="text-white text-lg">{parseSessionDetails(selectedSession.description).title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                    <Badge className={`
                      ${selectedSession.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : ''}
                      ${selectedSession.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}
                      ${selectedSession.status === 'IN_PROGRESS' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
                      ${selectedSession.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : ''}
                      ${selectedSession.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300 border-red-500/30' : ''}
                      border
                    `}>
                      {selectedSession.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Project Name</h3>
                    <p className="text-white">{parseSessionDetails(selectedSession.description).project}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Consultation Type</h3>
                    <p className="text-blue-400 font-medium">{consultationTypeLabels[selectedSession.consultationType as keyof typeof consultationTypeLabels]}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Created</h3>
                    <p className="text-white">{formatDate(selectedSession.createdAt)}</p>
                  </div>
                  
                  {selectedSession.scheduledAt && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Scheduled For</h3>
                      <p className="text-white">{formatDate(selectedSession.scheduledAt)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {parseSessionDetails(selectedSession.description).mainDescription}
                    </p>
                  </div>
                </div>
                
                {selectedSession.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Additional Notes</h3>
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedSession.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  {selectedSession.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() => {
                          setIsViewDetailsOpen(false)
                          handleModifyRequest(selectedSession)
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
                      >
                        Modify Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCancelSession(selectedSession.id)}
                        className="border-red-600 text-red-300 hover:bg-red-800 hover:border-red-500 transition-all duration-300"
                      >
                        Cancel Session
                      </Button>
                    </>
                  )}
                  {selectedSession.status === "SCHEDULED" && (
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 hover:scale-105">
                      Join Session
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modify Request Modal */}
      <Dialog open={isModifyRequestOpen} onOpenChange={setIsModifyRequestOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 text-white">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Modify Request
                  </span>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update your consultation request details
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-6">
                <p className="text-gray-300">
                  Contact our team to modify your consultation request. This session is currently in{' '}
                  <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 mx-1">
                    {selectedSession.status}
                  </Badge>
                  status.
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Current Session Details:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li><span className="text-gray-400">Type:</span> {consultationTypeLabels[selectedSession.consultationType as keyof typeof consultationTypeLabels]}</li>
                    <li><span className="text-gray-400">Project:</span> {parseSessionDetails(selectedSession.description).project}</li>
                    <li><span className="text-gray-400">Created:</span> {formatDate(selectedSession.createdAt)}</li>
                  </ul>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsModifyRequestOpen(false)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsModifyRequestOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}