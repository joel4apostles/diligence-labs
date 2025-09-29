import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthAndGetUser } from '@/lib/auth'
import { AIRecommendationEngine, SmartNotificationEngine } from '@/lib/ai-recommendations'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/ai-insights - Get AI-powered insights and recommendations
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuthAndGetUser(request)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    
    const user = authResult.user
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'recommendations' | 'notifications' | 'all'

    // Build user profile for AI analysis
    const userProfile = await buildUserProfile(user?.id || '')

    const insights: any = {}

    if (type === 'recommendations' || type === 'all' || !type) {
      const engine = AIRecommendationEngine.getInstance()
      insights.recommendations = await engine.generateAllRecommendations(userProfile)
    }

    if (type === 'notifications' || type === 'all' || !type) {
      insights.notifications = await SmartNotificationEngine.generateSmartNotifications(userProfile)
    }

    return NextResponse.json({
      success: true,
      insights,
      userProfile: {
        id: userProfile.id,
        role: userProfile.role,
        industry: userProfile.industry,
        experience: userProfile.experience,
        consultationCount: userProfile.consultationHistory?.length || 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Insights error:', error)
    return NextResponse.json({ error: 'Failed to generate AI insights' }, { status: 500 })
  }
}

// POST /api/ai-insights/feedback - Submit feedback on AI recommendations
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuthAndGetUser(request)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    
    const user = authResult.user
    const body = await request.json()
    const { recommendationId, feedback, rating, action } = body

    // Store feedback for ML improvement (in a real implementation)
    const feedbackRecord = {
      userId: user?.id || '',
      recommendationId,
      feedback,
      rating,
      action, // 'accepted', 'dismissed', 'completed'
      timestamp: new Date()
    }

    // Log feedback for future AI model training
    console.log('AI Recommendation Feedback:', feedbackRecord)

    // In a production system, this would be stored in a feedback table
    // await prisma.aiFeedback.create({ data: feedbackRecord })

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback: feedbackRecord
    })

  } catch (error) {
    console.error('AI Feedback error:', error)
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 })
  }
}

// Helper function to build comprehensive user profile
async function buildUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: {
          status: 'ACTIVE'
        },
        take: 1
      }
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Simulated consultation history (in production, this would come from a consultations table)
  const consultationHistory = [
    {
      id: '1',
      type: 'tokenization',
      topic: 'Token Launch Strategy',
      outcome: 'successful',
      rating: 5,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expertId: 'expert1'
    },
    {
      id: '2',
      type: 'defi',
      topic: 'DeFi Protocol Design',
      outcome: 'in-progress',
      rating: 4,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      expertId: 'expert2'
    }
  ]

  // Determine user characteristics based on available data
  const activeSubscription = user.subscriptions[0]
  const subscriptionTier = activeSubscription?.planType || 'basic'
  
  // Infer industry and experience from user data (in production, this would be stored fields)
  const industry = inferIndustry(user.email || '', user.name || '')
  const experience = inferExperience(consultationHistory.length, user.createdAt)
  const companySize = inferCompanySize(subscriptionTier)
  const budget = inferBudget(subscriptionTier)

  return {
    id: user.id,
    role: user.role,
    industry,
    experience,
    consultationHistory,
    interests: ['blockchain', 'defi', 'tokenization'], // Would be stored/inferred
    companySize,
    budget
  }
}

// Helper functions for user profile inference
function inferIndustry(email: string, name: string): string {
  // Simple heuristics - in production, this would be more sophisticated
  if (email.includes('fintech') || email.includes('finance')) return 'Finance'
  if (email.includes('tech') || email.includes('startup')) return 'Technology'
  if (email.includes('crypto') || email.includes('blockchain')) return 'Cryptocurrency'
  if (email.includes('gaming')) return 'Gaming'
  if (email.includes('real-estate') || email.includes('property')) return 'Real Estate'
  
  return 'Technology' // Default
}

function inferExperience(consultationCount: number, userCreatedAt: Date): string {
  const accountAgeInDays = Math.floor((Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
  
  if (consultationCount >= 10 || accountAgeInDays > 365) return 'Advanced'
  if (consultationCount >= 3 || accountAgeInDays > 90) return 'Intermediate'
  return 'Beginner'
}

function inferCompanySize(subscriptionTier: string): string {
  switch (subscriptionTier) {
    case 'enterprise':
    case 'professional':
      return 'enterprise'
    case 'premium':
      return 'scale-up'
    default:
      return 'startup'
  }
}

function inferBudget(subscriptionTier: string): number {
  switch (subscriptionTier) {
    case 'enterprise':
      return 50000
    case 'professional':
      return 20000
    case 'premium':
      return 10000
    default:
      return 5000
  }
}