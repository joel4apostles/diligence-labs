"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { FormGridLines } from "@/components/ui/grid-lines"
import { PageStructureLines } from "@/components/ui/page-structure"
import { DynamicPageBackground } from "@/components/ui/dynamic-page-background"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AdvancedSearch, 
  CONSULTATION_FILTERS, 
  REPORT_FILTERS, 
  USER_FILTERS,
  COMMON_SORT_OPTIONS,
  SEARCH_TYPES
} from "@/components/ui/advanced-search"
import { SearchResults, transformApiResults } from "@/components/ui/search-results"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [searchResults, setSearchResults] = useState<any>({})
  const [isSearching, setIsSearching] = useState(false)
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/unified-signin")
      return
    }
    if (session) {
      setIsPageLoaded(true)
    }
  }, [session, status, router])

  const handleGlobalSearch = async (query: string, filters: Record<string, any>, sort?: { field: string; direction: 'asc' | 'desc' }) => {
    if (!query && Object.keys(filters).length === 0) {
      setSearchResults({})
      setLastSearchQuery('')
      return
    }

    setIsSearching(true)
    setLastSearchQuery(query)

    try {
      const params = new URLSearchParams({
        query,
        type: 'all',
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
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCategorySearch = async (query: string, filters: Record<string, any>, sort?: { field: string; direction: 'asc' | 'desc' }, type: string = activeTab) => {
    if (!query && Object.keys(filters).length === 0) {
      setSearchResults(prev => ({ ...prev, [type]: [] }))
      return
    }

    setIsSearching(true)

    try {
      const params = new URLSearchParams({
        query,
        type,
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
        setSearchResults(prev => ({
          ...prev,
          [type]: transformApiResults(data.data, type)
        }))
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const getTotalResults = () => {
    if (!searchResults) return 0
    return Object.values(searchResults).reduce((total: number, results: any) => {
      return total + (Array.isArray(results) ? results.length : 0)
    }, 0)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">Loading...</div>
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
              <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Advanced Search</span>
            </h1>
            <p className="text-gray-400 text-lg">Search across consultations, reports, and users</p>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        <div className={`max-w-7xl mx-auto transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/30 border border-gray-700/50 rounded-lg p-1 mb-8">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                All Results
                {getTotalResults() > 0 && (
                  <Badge className="ml-2 bg-blue-500/20 text-blue-300 text-xs">
                    {getTotalResults()}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="consultations" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                Consultations
                {searchResults.consultations?.length > 0 && (
                  <Badge className="ml-2 bg-green-500/20 text-green-300 text-xs">
                    {searchResults.consultations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                Reports
                {searchResults.reports?.length > 0 && (
                  <Badge className="ml-2 bg-purple-500/20 text-purple-300 text-xs">
                    {searchResults.reports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
              >
                Users
                {searchResults.users?.length > 0 && (
                  <Badge className="ml-2 bg-orange-500/20 text-orange-300 text-xs">
                    {searchResults.users.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <AdvancedSearch
                searchTypes={SEARCH_TYPES.ALL}
                onSearch={handleGlobalSearch}
                placeholder="Search across all content..."
                showAdvancedFilters={false}
                className="mb-8"
              />

              {lastSearchQuery && (
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <h2 className="text-2xl font-light text-white mb-2">
                      Search Results for "{lastSearchQuery}"
                    </h2>
                    <p className="text-gray-400">
                      Found {getTotalResults()} total results across all categories
                    </p>
                  </motion.div>

                  {/* Consultations */}
                  {searchResults.consultations && searchResults.consultations.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-light text-green-400">Consultations</h3>
                        <Link href="/dashboard/consultations">
                          <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/20">
                            View All →
                          </Button>
                        </Link>
                      </div>
                      <SearchResults
                        results={transformApiResults(searchResults.consultations, 'consultations')}
                        isLoading={isSearching}
                      />
                    </div>
                  )}

                  {/* Reports */}
                  {searchResults.reports && searchResults.reports.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-light text-purple-400">Reports</h3>
                        <Link href="/dashboard/reports">
                          <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                            View All →
                          </Button>
                        </Link>
                      </div>
                      <SearchResults
                        results={transformApiResults(searchResults.reports, 'reports')}
                        isLoading={isSearching}
                      />
                    </div>
                  )}

                  {/* Users (Admin only) */}
                  {searchResults.users && searchResults.users.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-light text-orange-400">Users</h3>
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                          Admin Only
                        </Badge>
                      </div>
                      <SearchResults
                        results={transformApiResults(searchResults.users, 'users')}
                        isLoading={isSearching}
                      />
                    </div>
                  )}

                  {getTotalResults() === 0 && !isSearching && (
                    <Card className="bg-gray-800/30 border-gray-600/30 text-center py-12">
                      <CardContent>
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-light text-white mb-2">No results found</h3>
                        <p className="text-gray-400">
                          No results found for "{lastSearchQuery}". Try adjusting your search query.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!lastSearchQuery && (
                <Card className="bg-gray-800/30 border-gray-600/30 text-center py-16">
                  <CardContent>
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-2xl font-light text-white mb-4">Start Your Search</h3>
                    <p className="text-gray-400 max-w-md mx-auto text-lg">
                      Use the search bar above to find consultations, reports, and users across the platform.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="consultations" className="space-y-6">
              <AdvancedSearch
                filters={CONSULTATION_FILTERS}
                sortOptions={COMMON_SORT_OPTIONS}
                onSearch={(query, filters, sort) => handleCategorySearch(query, filters, sort, 'consultations')}
                placeholder="Search consultations..."
                className="mb-6"
              />
              <SearchResults
                results={searchResults.consultations || []}
                isLoading={isSearching}
                type="consultations"
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <AdvancedSearch
                filters={REPORT_FILTERS}
                sortOptions={COMMON_SORT_OPTIONS}
                onSearch={(query, filters, sort) => handleCategorySearch(query, filters, sort, 'reports')}
                placeholder="Search reports..."
                className="mb-6"
              />
              <SearchResults
                results={searchResults.reports || []}
                isLoading={isSearching}
                type="reports"
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdvancedSearch
                filters={USER_FILTERS}
                sortOptions={COMMON_SORT_OPTIONS}
                onSearch={(query, filters, sort) => handleCategorySearch(query, filters, sort, 'users')}
                placeholder="Search users..."
                className="mb-6"
              />
              <SearchResults
                results={searchResults.users || []}
                isLoading={isSearching}
                type="users"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}