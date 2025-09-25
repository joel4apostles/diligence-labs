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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AnalyticsDashboard } from "@/components/ui/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedSearch, REPORT_FILTERS, COMMON_SORT_OPTIONS } from "@/components/ui/advanced-search"
import { SearchResults, transformApiResults } from "@/components/ui/search-results"

type Report = {
  id: string
  title: string
  description: string | null
  fileUrl: string | null
  status: string
  type: string
  createdAt: string
  updatedAt: string
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  IN_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const reportTypeLabels = {
  DUE_DILIGENCE: "Due Diligence Report",
  ADVISORY_NOTES: "Advisory Notes",
  BLOCKCHAIN_INTEGRATION_ADVISORY: "Blockchain Integration Advisory",
  MARKET_RESEARCH: "Market Research",
}

export default function Reports() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isModifyRequestOpen, setIsModifyRequestOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/unified-signin")
      return
    }
    if (session) {
      setIsPageLoaded(true)
      fetchReports()
    }
  }, [session, status, router])

  async function fetchReports() {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    setIsViewDetailsOpen(true)
  }

  const handleModifyRequest = (report: Report) => {
    setSelectedReport(report)
    setIsModifyRequestOpen(true)
  }

  const handleCancelReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      
      if (response.ok) {
        setReports(reports.map(r => 
          r.id === reportId ? { ...r, status: 'CANCELLED' } : r
        ))
      }
    } catch (error) {
      console.error('Failed to cancel report:', error)
    }
  }

  const handleSearch = async (query: string, filters: Record<string, any>, sort?: { field: string; direction: 'asc' | 'desc' }) => {
    if (!query && Object.keys(filters).length === 0) {
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    setShowSearchResults(true)

    try {
      const params = new URLSearchParams({
        query,
        type: 'reports',
        ...(sort && {
          sortField: sort.field,
          sortDirection: sort.direction
        })
      })

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'dateRange' && value.from && value.to) {
            params.append(`filter_dateRange`, JSON.stringify(value))
          } else {
            params.append(`filter_${key}`, value.toString())
          }
        }
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(transformApiResults(data.data, 'reports'))
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">Loading reports...</div>
      </div>
    )
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
              <span className="font-normal bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">My Reports</span>
            </h1>
            <p className="text-gray-400 text-lg">Access your analysis and due diligence reports</p>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        <div className={`max-w-6xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/30 border border-gray-700/50 rounded-lg p-1 mb-8">
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                My Reports
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                Analytics Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              {/* Advanced Search */}
              <div className="space-y-6">
                <AdvancedSearch
                  filters={REPORT_FILTERS}
                  sortOptions={COMMON_SORT_OPTIONS}
                  onSearch={handleSearch}
                  placeholder="Search reports..."
                  className="mb-6"
                />
                
                <div className="flex justify-end">
                  <Link href="/dashboard/request-report">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                      Request New Report
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Search Results or Regular Reports */}
              {showSearchResults ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-light text-white">Search Results</h3>
                    <Button
                      variant="outline"
                      onClick={() => setShowSearchResults(false)}
                      className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                    >
                      Show All Reports
                    </Button>
                  </div>
                  <SearchResults
                    results={searchResults}
                    isLoading={isSearching}
                    onViewDetails={(id, type) => {
                      const report = reports.find(r => r.id === id)
                      if (report) {
                        setSelectedReport(report)
                        setIsViewDetailsOpen(true)
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  {reports.length === 0 ? (
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10" animated={true} movingBorder={true}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0 text-center py-12">
              <CardContent>
                <div className="space-y-6">
                  <div className="text-6xl mb-6">📊</div>
                  <h3 className="text-2xl font-light text-white">No reports yet</h3>
                  <p className="text-gray-400 text-lg max-w-md mx-auto">
                    You haven't requested any reports yet. Request a due diligence report, technical analysis, or advisory notes to get started.
                  </p>
                  <Link href="/dashboard/request-report">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-8 text-lg rounded-lg transition-all duration-300 hover:scale-105 mt-4">
                      Request Your First Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </ProminentBorder>
        ) : (
          <div className="space-y-8">
            {reports.map((report) => (
              <ProminentBorder key={report.id} className="rounded-2xl overflow-hidden shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-300" animated={true} movingBorder={true}>
                <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-light text-white">{report.title}</CardTitle>
                        <CardDescription className="text-purple-400 font-medium">
                          {reportTypeLabels[report.type as keyof typeof reportTypeLabels]}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
                          report.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          report.status === 'IN_REVIEW' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          report.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {report.description && (
                        <p className="text-gray-300 leading-relaxed">
                          {report.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <span className="font-medium text-gray-400 text-sm">Requested:</span>
                          <p className="text-white mt-1">{formatDate(report.createdAt)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-400 text-sm">Last Updated:</span>
                          <p className="text-white mt-1">{formatDate(report.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        {report.status === "COMPLETED" && report.fileUrl ? (
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all duration-300 hover:scale-105">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Report
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="border-gray-600 text-gray-500 opacity-50">
                            Report Not Ready
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                          onClick={() => handleViewDetails(report)}
                        >
                          View Details
                        </Button>
                        {report.status === "PENDING" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                            onClick={() => handleModifyRequest(report)}
                          >
                            Modify Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ProminentBorder>
            ))}
          </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 text-white">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Report Details
                  </span>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Complete information about your report request
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Report Title</h3>
                    <p className="text-white text-lg">{selectedReport.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                    <Badge className={`
                      ${selectedReport.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : ''}
                      ${selectedReport.status === 'IN_REVIEW' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}
                      ${selectedReport.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
                      ${selectedReport.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border-red-500/30' : ''}
                      border
                    `}>
                      {selectedReport.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Report Type</h3>
                    <p className="text-purple-400 font-medium">{reportTypeLabels[selectedReport.type as keyof typeof reportTypeLabels]}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Requested</h3>
                    <p className="text-white">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Last Updated</h3>
                    <p className="text-white">{formatDate(selectedReport.updatedAt)}</p>
                  </div>

                  {selectedReport.fileUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">File Status</h3>
                      <p className="text-green-400">Report Available for Download</p>
                    </div>
                  )}
                </div>
                
                {selectedReport.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  {selectedReport.status === "COMPLETED" && selectedReport.fileUrl && (
                    <Button
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 hover:scale-105"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </Button>
                  )}
                  {selectedReport.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() => {
                          setIsViewDetailsOpen(false)
                          handleModifyRequest(selectedReport)
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
                      >
                        Modify Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCancelReport(selectedReport.id)}
                        className="border-red-600 text-red-300 hover:bg-red-800 hover:border-red-500 transition-all duration-300"
                      >
                        Cancel Report
                      </Button>
                    </>
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
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Modify Report Request
                  </span>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update your report request details
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-6">
                <p className="text-gray-300">
                  Contact our team to modify your report request. This report is currently in{' '}
                  <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 mx-1">
                    {selectedReport.status}
                  </Badge>
                  status.
                </p>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-300 font-medium mb-2">Current Report Details:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li><span className="text-gray-400">Type:</span> {reportTypeLabels[selectedReport.type as keyof typeof reportTypeLabels]}</li>
                    <li><span className="text-gray-400">Title:</span> {selectedReport.title}</li>
                    <li><span className="text-gray-400">Requested:</span> {formatDate(selectedReport.createdAt)}</li>
                  </ul>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setIsModifyRequestOpen(false)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
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