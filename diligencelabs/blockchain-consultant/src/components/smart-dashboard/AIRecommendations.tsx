'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Target,
  Lightbulb,
  ArrowRight,
  Star,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  GlassMorphismCard,
  theme,
  animations
} from '@/components/ui/consistent-theme'
import { AIRecommendationEngine, type AIRecommendation, type UserProfile } from '@/lib/ai-recommendations'
import Link from 'next/link'

interface AIRecommendationsProps {
  userProfile: UserProfile
  consultationType?: string
  showHeader?: boolean
  maxRecommendations?: number
}

export default function AIRecommendations({ 
  userProfile, 
  consultationType,
  showHeader = true,
  maxRecommendations = 6 
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [userProfile, consultationType])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const engine = AIRecommendationEngine.getInstance()
      const recs = await engine.generateAllRecommendations(userProfile, consultationType)
      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to load AI recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'expert': return Users
      case 'service': return Target
      case 'content': return BookOpen
      case 'timing': return Clock
      case 'strategy': return TrendingUp
      default: return Lightbulb
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'from-red-500 to-red-600'
      case 'high': return 'from-orange-500 to-orange-600'
      case 'medium': return 'from-blue-500 to-blue-600'
      case 'low': return 'from-gray-500 to-gray-600'
      default: return 'from-blue-500 to-blue-600'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'low': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const displayedRecommendations = showAll 
    ? recommendations 
    : recommendations.slice(0, maxRecommendations)

  if (loading) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="text-center">
            <h2 className="text-2xl font-light mb-2 text-white">
              AI-Powered Recommendations
            </h2>
            <p className="text-gray-400">Analyzing your profile to provide personalized insights...</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <GlassMorphismCard variant="neutral">
                <Card className="bg-transparent border-0">
                  <CardHeader>
                    <div className="w-8 h-8 bg-gray-700 rounded-lg mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              </GlassMorphismCard>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <GlassMorphismCard variant="neutral">
        <Card className="bg-transparent border-0">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Building Your AI Profile
            </h3>
            <p className="text-gray-400">
              Complete more consultations to receive personalized AI recommendations
            </p>
          </CardContent>
        </Card>
      </GlassMorphismCard>
    )
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <motion.div 
          {...animations.fadeIn}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-light text-white">
              AI-Powered Recommendations
            </h2>
          </div>
          <p className="text-gray-400 text-lg">
            Personalized insights based on your profile and consultation history
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {displayedRecommendations.map((recommendation, index) => {
            const IconComponent = getRecommendationIcon(recommendation.type)
            const isExpanded = expandedCard === recommendation.id
            
            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                layout
              >
                <GlassMorphismCard 
                  variant={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'}
                  hover={true}
                  className="h-full cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : recommendation.id)}
                >
                  <Card className="bg-transparent border-0 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 bg-gradient-to-r ${getPriorityColor(recommendation.priority)} rounded-lg flex items-center justify-center mb-3`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`text-xs px-2 py-1 ${getPriorityBadgeColor(recommendation.priority)}`}>
                            {recommendation.priority.toUpperCase()}
                          </Badge>
                          {isExpanded ? 
                            <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg text-white group-hover:text-blue-100 transition-colors duration-300">
                        {recommendation.title}
                      </CardTitle>
                      
                      <CardDescription className="text-gray-400">
                        {recommendation.description}
                      </CardDescription>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className={`text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                            {Math.round(recommendation.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <Progress 
                          value={recommendation.confidence * 100} 
                          className="h-1" 
                        />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 mb-4"
                          >
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Why We Recommend This
                              </h4>
                              <ul className="space-y-1">
                                {recommendation.reasoning.map((reason, i) => (
                                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                    <Star className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {recommendation.metadata && (
                              <div className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
                                <strong>Additional Details:</strong>
                                <pre className="mt-1 whitespace-pre-wrap">
                                  {JSON.stringify(recommendation.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {recommendation.actionable && (
                        <div className="mt-auto">
                          <Link href={`/dashboard/book-consultation?type=${recommendation.type}&id=${recommendation.id}`}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button 
                                className={`w-full bg-gradient-to-r ${getPriorityColor(recommendation.priority)} hover:opacity-90 transition-opacity`}
                                size="sm"
                              >
                                Take Action
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </GlassMorphismCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {recommendations.length > maxRecommendations && (
        <div className="text-center">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {showAll 
              ? `Show Less (${maxRecommendations})` 
              : `Show All Recommendations (${recommendations.length})`
            }
          </Button>
        </div>
      )}

      <motion.div 
        {...animations.fadeIn}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <p className="text-xs text-gray-500">
          AI recommendations are generated based on your profile, consultation history, and market analysis.
          <br />
          Recommendations are updated daily to ensure relevance and accuracy.
        </p>
      </motion.div>
    </div>
  )
}