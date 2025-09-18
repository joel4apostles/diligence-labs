'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Target,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'

interface ExpertProfile {
  id: string
  rank: number
  user: {
    id: string
    name: string
    image?: string
  }
  verificationStatus: string
  expertTier: string
  reputationPoints: number
  totalEvaluations: number
  accuracyRate: number
  averageRating: number
  totalRewards: number
  monthlyEvaluations: number
  company?: string
  position?: string
  linkedinUrl?: string
  githubUrl?: string
  twitterHandle?: string
  primaryExpertise?: string
  achievements: Array<{
    id: string
    achievementType: string
    title: string
    awardedAt: string
  }>
  _count: {
    evaluations: number
    achievements: number
  }
}

interface LeaderboardProps {
  showFilters?: boolean
  maxEntries?: number
  showSearch?: boolean
}

export default function ExpertLeaderboard({ 
  showFilters = true, 
  maxEntries, 
  showSearch = true 
}: LeaderboardProps) {
  const [experts, setExperts] = useState<ExpertProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [sortBy, setSortBy] = useState('reputationPoints')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'from-purple-400 to-purple-600'
      case 'GOLD': return 'from-yellow-400 to-yellow-600'
      case 'SILVER': return 'from-gray-400 to-gray-600'
      case 'BRONZE': return 'from-amber-600 to-amber-800'
      case 'DIAMOND': return 'from-cyan-400 to-blue-600'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return Crown
      case 'PLATINUM': return Crown
      case 'GOLD': return Trophy
      case 'SILVER': return Medal
      case 'BRONZE': return Award
      default: return Star
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>
  }

  const fetchExperts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        sortBy,
        order: 'desc',
        page: page.toString(),
        limit: (maxEntries || 50).toString()
      })

      if (tierFilter) params.append('tier', tierFilter)

      const response = await fetch(`/api/experts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch experts')

      const data = await response.json()
      setExperts(data.experts)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching experts:', error)
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperts()
  }, [sortBy, tierFilter, page, maxEntries])

  const filteredExperts = experts.filter(expert =>
    expert.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const parseExpertise = (expertiseJson?: string) => {
    try {
      return expertiseJson ? JSON.parse(expertiseJson) : []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading expert leaderboard...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-8 text-center">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchExperts} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
          Expert Leaderboard
        </h2>
        <p className="text-gray-400">
          Top-performing experts ranked by reputation points and evaluation quality
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search experts..."
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
              )}
              
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tiers</SelectItem>
                  <SelectItem value="DIAMOND">Diamond</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reputationPoints">Reputation Points</SelectItem>
                  <SelectItem value="totalEvaluations">Total Evaluations</SelectItem>
                  <SelectItem value="accuracyRate">Accuracy Rate</SelectItem>
                  <SelectItem value="averageRating">Average Rating</SelectItem>
                  <SelectItem value="totalRewards">Total Rewards</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setTierFilter('')
                  setSortBy('reputationPoints')
                }}
                className="border-gray-600 text-gray-400"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {!maxEntries && filteredExperts.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 2nd Place */}
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-gray-600 order-1 md:order-1">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-400">
                  <Medal className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{filteredExperts[1].user.name}</h3>
              <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/30 mb-3">
                {filteredExperts[1].expertTier}
              </Badge>
              <p className="text-2xl font-bold text-gray-300">{filteredExperts[1].reputationPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Reputation Points</p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="bg-gradient-to-br from-yellow-900/60 to-yellow-800/30 border-yellow-500 order-2 md:order-2 transform md:scale-110 md:-mt-4">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-yellow-400">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{filteredExperts[0].user.name}</h3>
              <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 mb-3">
                {filteredExperts[0].expertTier} Champion
              </Badge>
              <p className="text-3xl font-bold text-yellow-300">{filteredExperts[0].reputationPoints.toLocaleString()}</p>
              <p className="text-sm text-yellow-400">Reputation Points</p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="bg-gradient-to-br from-amber-900/60 to-amber-800/30 border-amber-600 order-3 md:order-3">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-600">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{filteredExperts[2].user.name}</h3>
              <Badge className="bg-amber-600/20 text-amber-300 border-amber-600/30 mb-3">
                {filteredExperts[2].expertTier}
              </Badge>
              <p className="text-2xl font-bold text-amber-300">{filteredExperts[2].reputationPoints.toLocaleString()}</p>
              <p className="text-sm text-amber-400">Reputation Points</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Leaderboard */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <TrendingUp className="w-5 h-5 mr-2" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredExperts.map((expert, index) => {
              const TierIcon = getTierIcon(expert.expertTier)
              const expertise = parseExpertise(expert.primaryExpertise)
              
              return (
                <div 
                  key={expert.id}
                  className={`p-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors ${
                    expert.rank <= 3 ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(expert.rank)}
                      </div>

                      {/* Expert Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-white text-lg">{expert.user.name}</h3>
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getTierColor(expert.expertTier)} flex items-center justify-center`}>
                            <TierIcon className="w-3 h-3 text-white" />
                          </div>
                          <Badge variant="outline" className={`text-xs border-gray-600 text-gray-300`}>
                            {expert.expertTier}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {expert.company && (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {expert.company}
                            </span>
                          )}
                          
                          {expert.position && (
                            <span>{expert.position}</span>
                          )}
                          
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {expert.totalEvaluations} evaluations
                          </span>
                          
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {expert.accuracyRate.toFixed(1)}% accuracy
                          </span>
                        </div>

                        {/* Expertise Tags */}
                        {expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {expertise.slice(0, 3).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                                {skill}
                              </Badge>
                            ))}
                            {expertise.length > 3 && (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                +{expertise.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Recent achievements */}
                        {expert.achievements.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-gray-400">
                              Latest: {expert.achievements[0].title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right space-y-1">
                      <p className="font-bold text-xl text-white">
                        {expert.reputationPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">RP</p>
                      
                      <div className="flex items-center space-x-3 justify-end mt-2">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-green-400">
                            {expert.totalRewards.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-400">ETH</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-semibold text-purple-400">
                            {expert.averageRating.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-400">Rating</p>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center space-x-2 justify-end mt-2">
                        {expert.githubUrl && (
                          <a
                            href={expert.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {expert.linkedinUrl && (
                          <a
                            href={expert.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {expert.twitterHandle && (
                          <a
                            href={`https://twitter.com/${expert.twitterHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!maxEntries && totalPages > 1 && (
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