import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/subscription-plans - Get all available subscription plans
export async function GET(request: NextRequest) {
  try {
    // Define subscription plans with their features and pricing
    const subscriptionPlans = [
      {
        planType: 'BASIC_MONTHLY',
        name: 'Basic',
        price: 0,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        description: 'Perfect for individual founders and startups',
        features: {
          monthlyProjects: 1,
          expertReviews: 2,
          basicReports: true,
          communityAccess: true,
          emailSupport: true,
          priorityLevel: 'LOW',
          reputationBonus: 1.0
        },
        limits: {
          projectsPerMonth: 1,
          expertsPerProject: 2,
          revisionRequests: 1,
          detailedAnalysis: false
        },
        popular: false
      },
      {
        planType: 'PROFESSIONAL_MONTHLY',
        name: 'Professional',
        price: 299,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        description: 'For growing companies and serious projects',
        features: {
          monthlyProjects: 5,
          expertReviews: 4,
          detailedReports: true,
          prioritySupport: true,
          communityAccess: true,
          expertChat: true,
          priorityLevel: 'MEDIUM',
          reputationBonus: 1.2
        },
        limits: {
          projectsPerMonth: 5,
          expertsPerProject: 4,
          revisionRequests: 3,
          detailedAnalysis: true
        },
        popular: true
      },
      {
        planType: 'ENTERPRISE_MONTHLY',
        name: 'Enterprise',
        price: 999,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        description: 'For large organizations with multiple projects',
        features: {
          monthlyProjects: 20,
          expertReviews: 6,
          comprehensiveReports: true,
          dedicatedSupport: true,
          customIntegrations: true,
          advancedAnalytics: true,
          priorityLevel: 'HIGH',
          reputationBonus: 1.5
        },
        limits: {
          projectsPerMonth: 20,
          expertsPerProject: 6,
          revisionRequests: 'unlimited',
          detailedAnalysis: true
        },
        popular: false
      },
      {
        planType: 'VC_TIER_MONTHLY',
        name: 'VC Tier',
        price: 2499,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        description: 'Designed for venture capital firms and investment funds',
        features: {
          monthlyProjects: 100,
          expertReviews: 8,
          institutionalReports: true,
          dedicatedAccountManager: true,
          whiteGloveService: true,
          customDashboard: true,
          portfolioTracking: true,
          priorityLevel: 'URGENT',
          reputationBonus: 2.0,
          feeSharing: true,
          expertNetworkAccess: true
        },
        limits: {
          projectsPerMonth: 100,
          expertsPerProject: 8,
          revisionRequests: 'unlimited',
          detailedAnalysis: true,
          institutionalFeatures: true
        },
        popular: false,
        enterprise: true
      },
      {
        planType: 'ECOSYSTEM_PARTNER_MONTHLY',
        name: 'Ecosystem Partner',
        price: 4999,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        description: 'For blockchain ecosystems, foundations, and major protocols',
        features: {
          monthlyProjects: 'unlimited',
          expertReviews: 10,
          ecosystemReports: true,
          foundationSupport: true,
          customBranding: true,
          apiAccess: true,
          bulkAnalysis: true,
          priorityLevel: 'URGENT',
          reputationBonus: 3.0,
          feeSharing: true,
          exclusiveExperts: true,
          ecosystemIntegration: true
        },
        limits: {
          projectsPerMonth: 'unlimited',
          expertsPerProject: 10,
          revisionRequests: 'unlimited',
          detailedAnalysis: true,
          institutionalFeatures: true,
          ecosystemFeatures: true
        },
        popular: false,
        enterprise: true
      }
    ]

    // Calculate fee sharing information
    const feeShareBreakdown = {
      platformFee: 0.30, // 30% to platform
      expertPool: 0.65,  // 65% to experts
      submitterBonus: 0.05 // 5% back to quality submitters
    }

    return NextResponse.json({
      plans: subscriptionPlans,
      feeSharing: feeShareBreakdown,
      currency: 'USD'
    })

  } catch (error) {
    console.error('Subscription plans fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 })
  }
}

// POST /api/subscription-plans/init - Initialize subscription features in database
export async function POST(request: NextRequest) {
  try {
    const plans = [
      'BASIC_MONTHLY',
      'PROFESSIONAL_MONTHLY', 
      'ENTERPRISE_MONTHLY',
      'VC_TIER_MONTHLY',
      'ECOSYSTEM_PARTNER_MONTHLY'
    ]

    const features = [
      { name: 'monthlyProjects', description: 'Number of projects per month' },
      { name: 'expertReviews', description: 'Number of expert reviewers per project' },
      { name: 'priorityLevel', description: 'Evaluation priority level' },
      { name: 'reputationBonus', description: 'Reputation points multiplier' },
      { name: 'feeSharing', description: 'Access to fee sharing program' },
      { name: 'detailedAnalysis', description: 'Access to detailed analysis reports' },
      { name: 'customDashboard', description: 'Custom analytics dashboard' },
      { name: 'dedicatedSupport', description: 'Dedicated customer support' }
    ]

    const planFeatures = {
      'BASIC_MONTHLY': {
        monthlyProjects: '1',
        expertReviews: '2',
        priorityLevel: 'LOW',
        reputationBonus: '1.0',
        feeSharing: 'false',
        detailedAnalysis: 'false',
        customDashboard: 'false',
        dedicatedSupport: 'false'
      },
      'PROFESSIONAL_MONTHLY': {
        monthlyProjects: '5',
        expertReviews: '4',
        priorityLevel: 'MEDIUM',
        reputationBonus: '1.2',
        feeSharing: 'false',
        detailedAnalysis: 'true',
        customDashboard: 'false',
        dedicatedSupport: 'true'
      },
      'ENTERPRISE_MONTHLY': {
        monthlyProjects: '20',
        expertReviews: '6',
        priorityLevel: 'HIGH',
        reputationBonus: '1.5',
        feeSharing: 'false',
        detailedAnalysis: 'true',
        customDashboard: 'true',
        dedicatedSupport: 'true'
      },
      'VC_TIER_MONTHLY': {
        monthlyProjects: '100',
        expertReviews: '8',
        priorityLevel: 'URGENT',
        reputationBonus: '2.0',
        feeSharing: 'true',
        detailedAnalysis: 'true',
        customDashboard: 'true',
        dedicatedSupport: 'true'
      },
      'ECOSYSTEM_PARTNER_MONTHLY': {
        monthlyProjects: 'unlimited',
        expertReviews: '10',
        priorityLevel: 'URGENT',
        reputationBonus: '3.0',
        feeSharing: 'true',
        detailedAnalysis: 'true',
        customDashboard: 'true',
        dedicatedSupport: 'true'
      }
    }

    // Create subscription features for each plan
    const createPromises = []
    
    for (const plan of plans) {
      for (const feature of features) {
        const featureValue = planFeatures[plan as keyof typeof planFeatures]?.[feature.name as keyof typeof planFeatures.BASIC_MONTHLY]
        
        if (featureValue) {
          createPromises.push(
            prisma.subscriptionFeature.upsert({
              where: {
                planType_featureName: {
                  planType: plan as any,
                  featureName: feature.name
                }
              },
              update: {
                featureValue,
                isActive: true
              },
              create: {
                planType: plan as any,
                featureName: feature.name,
                featureValue,
                isActive: true
              }
            })
          )
        }
      }
    }

    await Promise.all(createPromises)

    return NextResponse.json({ 
      message: 'Subscription features initialized successfully',
      featuresCreated: createPromises.length
    })

  } catch (error) {
    console.error('Subscription features initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize subscription features' }, { status: 500 })
  }
}