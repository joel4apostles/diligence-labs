import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/admin/seed-expert-applications - Create sample expert applications for testing
export async function POST(request: NextRequest) {
  try {
    // First, create some sample users if they don't exist
    const sampleUsers = [
      {
        id: 'sample-user-1',
        email: 'expert1@blockchain.com',
        name: 'Alice Johnson',
        role: Role.USER
      },
      {
        id: 'sample-user-2', 
        email: 'expert2@defi.com',
        name: 'Bob Chen',
        role: Role.USER
      },
      {
        id: 'sample-user-3',
        email: 'expert3@web3.com', 
        name: 'Carol Martinez',
        role: Role.USER
      }
    ]

    // Create users (upsert to avoid conflicts)
    for (const userData of sampleUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      })
    }

    // Note: ExpertProfile model not implemented yet
    return NextResponse.json({
      message: 'Expert applications seeded successfully (users only)',
      created: sampleUsers.length,
      note: 'ExpertProfile model not implemented yet'
    })

    /* COMMENTED OUT - UNREACHABLE CODE
    // Create sample expert profiles
    const expertProfiles = [
      {
        userId: 'sample-user-1',
        verificationStatus: 'PENDING',
        kycStatus: 'PENDING',
        linkedinUrl: 'https://linkedin.com/in/alice-johnson',
        githubUrl: 'https://github.com/alice-blockchain',
        company: 'Blockchain Innovations Inc',
        position: 'Senior Blockchain Developer',
        yearsExperience: 5,
        bio: 'Experienced blockchain developer with expertise in Ethereum, Solidity, and DeFi protocols. Previously worked at major DeFi projects.',
        primaryExpertise: JSON.stringify(['Ethereum', 'Solidity', 'DeFi', 'Smart Contracts']),
        secondaryExpertise: JSON.stringify(['Web3.js', 'Layer 2', 'NFTs']),
        reputationPoints: 150,
        expertTier: 'BRONZE',
        totalEvaluations: 12,
        accuracyRate: 92.5
      },
      {
        userId: 'sample-user-2',
        verificationStatus: 'PENDING',
        kycStatus: 'PENDING', 
        linkedinUrl: 'https://linkedin.com/in/bob-chen',
        githubUrl: 'https://github.com/bob-defi',
        twitterHandle: '@bobdefi',
        company: 'DeFi Capital',
        position: 'Head of Research',
        yearsExperience: 7,
        bio: 'DeFi researcher and analyst with deep understanding of yield farming, liquidity mining, and tokenomics.',
        primaryExpertise: JSON.stringify(['DeFi', 'Tokenomics', 'Yield Farming', 'AMM']),
        secondaryExpertise: JSON.stringify(['MEV', 'Cross-chain', 'Governance']),
        reputationPoints: 280,
        expertTier: 'SILVER',
        totalEvaluations: 28,
        accuracyRate: 94.2
      },
      {
        userId: 'sample-user-3',
        verificationStatus: 'UNDER_REVIEW',
        kycStatus: 'PENDING',
        linkedinUrl: 'https://linkedin.com/in/carol-martinez',
        company: 'Web3 Ventures',
        position: 'Investment Associate', 
        yearsExperience: 3,
        bio: 'Investment professional focused on blockchain and Web3 startups. Experience in due diligence and market analysis.',
        primaryExpertise: JSON.stringify(['Investment Analysis', 'Due Diligence', 'Market Research']),
        secondaryExpertise: JSON.stringify(['DAO Governance', 'Legal Framework']),
        reputationPoints: 85,
        expertTier: 'BRONZE',
        totalEvaluations: 6,
        accuracyRate: 88.3
      }
    ]

    // Create expert profiles (upsert to avoid conflicts)
    const created = []
    for (const profileData of expertProfiles) {
      const profile = await prisma.expertProfile.upsert({
        where: { userId: profileData.userId },
        update: profileData,
        create: profileData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      created.push(profile)
    }

    return NextResponse.json({
      message: 'Sample expert applications created successfully',
      count: created.length,
      profiles: created
    })
    END COMMENTED OUT CODE */

  } catch (error) {
    console.error('Seed expert applications error:', error)
    return NextResponse.json({ error: 'Failed to create sample applications' }, { status: 500 })
  }
}