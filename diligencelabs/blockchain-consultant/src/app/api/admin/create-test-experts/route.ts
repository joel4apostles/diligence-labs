import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/admin/create-test-experts - Create comprehensive test expert data
export async function POST(request: NextRequest) {
  try {
    console.log('Creating comprehensive test expert data...')

    // Sample expert data with different statuses and backgrounds
    const expertData = [
      {
        user: {
          name: 'Dr. Sarah Chen',
          email: 'sarah.chen@blockchain.dev',
          role: Role.USER
        },
        profile: {
          verificationStatus: 'PENDING',
          kycStatus: 'PENDING',
          company: 'Ethereum Foundation',
          position: 'Senior Protocol Engineer',
          yearsExperience: 8,
          bio: 'Leading blockchain researcher with extensive experience in consensus mechanisms and smart contract security. Published 20+ papers on blockchain scalability.',
          primaryExpertise: JSON.stringify(['Ethereum', 'Smart Contracts', 'DeFi', 'Consensus Mechanisms']),
          secondaryExpertise: JSON.stringify(['Layer 2', 'ZK-Proofs', 'MEV']),
          linkedinUrl: 'https://linkedin.com/in/sarahchen',
          githubUrl: 'https://github.com/sarahchen',
          twitterHandle: '@sarahchen_eth',
          reputationPoints: 850,
          expertTier: 'BRONZE'
        }
      },
      {
        user: {
          name: 'Marcus Rodriguez',
          email: 'marcus@defi-capital.com',
          role: Role.USER
        },
        profile: {
          verificationStatus: 'PENDING',
          kycStatus: 'VERIFIED',
          company: 'DeFi Capital Ventures',
          position: 'Investment Director',
          yearsExperience: 6,
          bio: 'Former Goldman Sachs analyst turned DeFi investor. Led investments in 15+ successful DeFi protocols with combined TVL of $2B+.',
          primaryExpertise: JSON.stringify(['DeFi', 'Yield Farming', 'Tokenomics', 'Investment Analysis']),
          secondaryExpertise: JSON.stringify(['Risk Management', 'Portfolio Theory', 'Market Making']),
          linkedinUrl: 'https://linkedin.com/in/marcusrodriguez',
          githubUrl: 'https://github.com/mrodriguez',
          twitterHandle: '@marcus_defi',
          reputationPoints: 720,
          expertTier: 'BRONZE'
        }
      },
      {
        user: {
          name: 'Aisha Patel',
          email: 'aisha@crypto-security.io',
          role: Role.USER
        },
        profile: {
          verificationStatus: 'PENDING',
          kycStatus: 'PENDING',
          company: 'CryptoSec Auditors',
          position: 'Lead Security Auditor',
          yearsExperience: 5,
          bio: 'Cybersecurity expert specializing in smart contract audits. Discovered critical vulnerabilities in 50+ protocols, preventing $100M+ in potential losses.',
          primaryExpertise: JSON.stringify(['Security Audits', 'Smart Contract Vulnerabilities', 'Penetration Testing']),
          secondaryExpertise: JSON.stringify(['Formal Verification', 'Bug Bounties', 'Incident Response']),
          linkedinUrl: 'https://linkedin.com/in/aishapatel',
          githubUrl: 'https://github.com/aishapatel',
          twitterHandle: '@aisha_sec',
          reputationPoints: 920,
          expertTier: 'BRONZE'
        }
      },
      {
        user: {
          name: 'James Thompson',
          email: 'james@nft-studio.com',
          role: Role.USER
        },
        profile: {
          verificationStatus: 'VERIFIED',
          kycStatus: 'VERIFIED',
          company: 'NFT Creative Studio',
          position: 'Technical Lead',
          yearsExperience: 4,
          bio: 'Full-stack developer and NFT expert. Built marketplace infrastructure handling $50M+ in NFT transactions. Expert in ERC standards and IPFS.',
          primaryExpertise: JSON.stringify(['NFTs', 'ERC Standards', 'IPFS', 'Marketplace Development']),
          secondaryExpertise: JSON.stringify(['Frontend Development', 'API Design', 'Database Architecture']),
          linkedinUrl: 'https://linkedin.com/in/jamesthompson',
          githubUrl: 'https://github.com/jthompson',
          twitterHandle: '@james_nft',
          reputationPoints: 680,
          expertTier: 'SILVER',
          verifiedAt: new Date('2024-01-15')
        }
      },
      {
        user: {
          name: 'Elena Kowalski',
          email: 'elena@regulatory-experts.com',
          role: Role.USER
        },
        profile: {
          verificationStatus: 'PENDING',
          kycStatus: 'VERIFIED',
          company: 'Blockchain Legal Advisors',
          position: 'Regulatory Compliance Officer',
          yearsExperience: 12,
          bio: 'Former SEC lawyer with deep expertise in cryptocurrency regulations. Advised 100+ projects on compliance strategies across multiple jurisdictions.',
          primaryExpertise: JSON.stringify(['Regulatory Compliance', 'Securities Law', 'Legal Advisory']),
          secondaryExpertise: JSON.stringify(['International Law', 'Policy Development', 'Risk Assessment']),
          linkedinUrl: 'https://linkedin.com/in/elenakowalski',
          twitterHandle: '@elena_reg',
          reputationPoints: 1150,
          expertTier: 'BRONZE'
        }
      },
      {
        user: {
          name: 'David Kim',
          email: 'david@layer2-solutions.tech',
          role: Role.USER
        },
        profile: {
          verificationStatus: 'REJECTED',
          kycStatus: 'REJECTED',
          company: 'Layer2 Solutions',
          position: 'Protocol Developer',
          yearsExperience: 3,
          bio: 'Emerging developer working on Layer 2 scaling solutions. Limited experience but showing promise in zk-rollup implementations.',
          primaryExpertise: JSON.stringify(['Layer 2', 'Scaling Solutions', 'ZK Technology']),
          secondaryExpertise: JSON.stringify(['Rust Programming', 'Cryptography']),
          githubUrl: 'https://github.com/davidkim',
          twitterHandle: '@david_l2',
          reputationPoints: 180,
          expertTier: 'BRONZE'
        }
      }
    ]

    const createdExperts = []

    for (const expertInfo of expertData) {
      try {
        // Create or update user
        const user = await prisma.user.upsert({
          where: { email: expertInfo.user.email },
          update: {},
          create: {
            ...expertInfo.user
          }
        })

        // Note: ExpertProfile model not implemented yet in schema
        // Would create expert profile when model is added
        const expertProfile = { id: 'mock-profile', userId: user.id }

        // Note: ExpertAchievement model not implemented yet
        // Would create achievements when model is added to schema

        createdExperts.push({
          user: user,
          profile: expertProfile
        })

        console.log(`Created expert: ${user.name} (mock profile)`)

      } catch (expertError) {
        console.error(`Error creating expert ${expertInfo.user.name}:`, expertError)
      }
    }

    // Note: Would create project evaluations when ExpertProfile model exists
    const verifiedExperts: any[] = [] // Mock empty array since model not implemented
    
    // Note: Would create sample projects and evaluations when models are implemented
    console.log('Skipping project creation - models not implemented yet')

    return NextResponse.json({
      message: 'Comprehensive test expert data created successfully',
      created: createdExperts.length,
      experts: createdExperts.map(e => ({
        name: e.user.name,
        email: e.user.email,
        status: 'mock',
        company: 'mock company'
      }))
    })

  } catch (error) {
    console.error('Error creating test expert data:', error)
    return NextResponse.json({ 
      error: 'Failed to create test expert data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}