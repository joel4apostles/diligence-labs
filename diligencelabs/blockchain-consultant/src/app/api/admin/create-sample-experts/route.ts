import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAdminAuth } from '@/lib/admin-auth'

const prisma = new PrismaClient()

// POST /api/admin/create-sample-experts - Create sample expert applications
export async function POST(request: NextRequest) {
  try {
    // For development, skip auth check temporarily
    // const adminAuth = await verifyAdminAuth(request)
    // if (!adminAuth.success) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Create sample users first
    const sampleUsers = [
      {
        email: 'alice.blockchain@example.com',
        name: 'Alice Johnson',
        role: 'USER',
        reputationPoints: 150
      },
      {
        email: 'bob.defi@example.com', 
        name: 'Bob Chen',
        role: 'USER',
        reputationPoints: 280
      },
      {
        email: 'carol.web3@example.com',
        name: 'Carol Martinez', 
        role: 'USER',
        reputationPoints: 85
      }
    ]

    const createdUsers = []
    for (const userData of sampleUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        })
        createdUsers.push(user)
      } catch (error) {
        // User might already exist, try to find them
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        })
        if (existingUser) {
          createdUsers.push(existingUser)
        }
      }
    }

    // Create expert profiles
    const expertProfiles = []
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i]
      const profileData = [
        {
          userId: user.id,
          verificationStatus: 'PENDING',
          kycStatus: 'PENDING',
          linkedinUrl: 'https://linkedin.com/in/alice-johnson',
          githubUrl: 'https://github.com/alice-blockchain',
          company: 'Blockchain Innovations Inc',
          position: 'Senior Blockchain Developer',
          yearsExperience: 5,
          bio: 'Experienced blockchain developer with expertise in Ethereum, Solidity, and DeFi protocols.',
          primaryExpertise: JSON.stringify(['Ethereum', 'Solidity', 'DeFi', 'Smart Contracts']),
          secondaryExpertise: JSON.stringify(['Web3.js', 'Layer 2', 'NFTs']),
          reputationPoints: 150,
          expertTier: 'BRONZE',
          totalEvaluations: 12,
          accuracyRate: 92.5
        },
        {
          userId: user.id,
          verificationStatus: 'UNDER_REVIEW',
          kycStatus: 'PENDING',
          linkedinUrl: 'https://linkedin.com/in/bob-chen',
          githubUrl: 'https://github.com/bob-defi',
          twitterHandle: '@bobdefi',
          company: 'DeFi Capital',
          position: 'Head of Research',
          yearsExperience: 7,
          bio: 'DeFi researcher and analyst with deep understanding of yield farming and tokenomics.',
          primaryExpertise: JSON.stringify(['DeFi', 'Tokenomics', 'Yield Farming', 'AMM']),
          secondaryExpertise: JSON.stringify(['MEV', 'Cross-chain', 'Governance']),
          reputationPoints: 280,
          expertTier: 'SILVER',
          totalEvaluations: 28,
          accuracyRate: 94.2
        },
        {
          userId: user.id,
          verificationStatus: 'PENDING',
          kycStatus: 'PENDING',
          linkedinUrl: 'https://linkedin.com/in/carol-martinez',
          company: 'Web3 Ventures',
          position: 'Investment Associate',
          yearsExperience: 3,
          bio: 'Investment professional focused on blockchain and Web3 startups.',
          primaryExpertise: JSON.stringify(['Investment Analysis', 'Due Diligence', 'Market Research']),
          secondaryExpertise: JSON.stringify(['DAO Governance', 'Legal Framework']),
          reputationPoints: 85,
          expertTier: 'BRONZE',
          totalEvaluations: 6,
          accuracyRate: 88.3
        }
      ][i]

      try {
        const profile = await prisma.expertProfile.create({
          data: profileData,
          include: {
            user: true
          }
        })
        expertProfiles.push(profile)
      } catch (error) {
        console.log(`Profile for user ${user.email} might already exist`)
      }
    }

    return NextResponse.json({
      message: 'Sample expert applications created successfully',
      count: expertProfiles.length,
      users: createdUsers.length,
      profiles: expertProfiles
    })

  } catch (error) {
    console.error('Create sample experts error:', error)
    return NextResponse.json({ 
      error: 'Failed to create sample expert applications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}