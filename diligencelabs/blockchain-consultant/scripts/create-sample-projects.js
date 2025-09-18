const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleProjects() {
  try {
    console.log('Creating sample projects for due diligence...')

    // Get a user to act as project submitter
    const submitter = await prisma.user.findFirst({
      where: {
        email: {
          not: {
            contains: 'expert'
          }
        }
      }
    })

    if (!submitter) {
      // Create a sample submitter
      const newSubmitter = await prisma.user.create({
        data: {
          name: 'Project Submitter',
          email: 'submitter@example.com',
          role: 'USER',
          reputationPoints: 50
        }
      })
      console.log('Created sample submitter:', newSubmitter.email)
    }

    const projectSubmitter = submitter || await prisma.user.findFirst()

    // Sample project data
    const projectsData = [
      {
        name: 'DeFi Yield Optimizer',
        description: 'An advanced yield farming protocol that automatically optimizes returns across multiple DeFi platforms using AI-driven strategies.',
        website: 'https://defiyield.example.com',
        category: 'DEFI',
        status: 'EXPERT_ASSIGNMENT',
        submitterId: projectSubmitter.id,
        foundingTeam: JSON.stringify([
          { name: 'Alice Johnson', role: 'CEO', experience: '10 years DeFi' },
          { name: 'Bob Smith', role: 'CTO', experience: '8 years Solidity' }
        ]),
        teamSize: 12,
        blockchain: 'Ethereum',
        technologyStack: JSON.stringify(['Solidity', 'React', 'Node.js', 'TheGraph']),
        repository: 'https://github.com/defiyield/protocol',
        whitepaper: 'https://defiyield.example.com/whitepaper.pdf',
        fundingRaised: 2500000,
        userBase: 15000,
        monthlyRevenue: 180000,
        evaluationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priorityLevel: 'HIGH',
        evaluationBudget: 15000
      },
      {
        name: 'NFT Marketplace 3.0',
        description: 'Next-generation NFT marketplace with cross-chain support, advanced royalty management, and creator tools.',
        website: 'https://nftmarket3.example.com',
        category: 'NFT',
        status: 'EXPERT_ASSIGNMENT',
        submitterId: projectSubmitter.id,
        foundingTeam: JSON.stringify([
          { name: 'Carol Davis', role: 'Founder', experience: '6 years NFT space' },
          { name: 'Dave Wilson', role: 'Lead Developer', experience: '5 years Web3' }
        ]),
        teamSize: 8,
        blockchain: 'Polygon',
        technologyStack: JSON.stringify(['Solidity', 'IPFS', 'Vue.js', 'Express.js']),
        repository: 'https://github.com/nftmarket3/platform',
        fundingRaised: 1200000,
        userBase: 8500,
        monthlyRevenue: 95000,
        evaluationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        priorityLevel: 'MEDIUM',
        evaluationBudget: 8000
      },
      {
        name: 'GameFi Battle Arena',
        description: 'Play-to-earn battle royale game with NFT characters, skill-based gameplay, and tournament rewards.',
        website: 'https://gamefi-arena.example.com',
        category: 'GAMEFI',
        status: 'EXPERT_ASSIGNMENT',
        submitterId: projectSubmitter.id,
        foundingTeam: JSON.stringify([
          { name: 'Eve Chen', role: 'Game Director', experience: '12 years Game Dev' },
          { name: 'Frank Miller', role: 'Blockchain Lead', experience: '4 years GameFi' }
        ]),
        teamSize: 25,
        blockchain: 'BSC',
        technologyStack: JSON.stringify(['Unity', 'Solidity', 'Node.js', 'MongoDB']),
        fundingRaised: 3800000,
        userBase: 45000,
        monthlyRevenue: 320000,
        evaluationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priorityLevel: 'URGENT',
        evaluationBudget: 25000
      },
      {
        name: 'Layer 2 Scaling Solution',
        description: 'Zero-knowledge rollup solution for Ethereum scaling with focus on DeFi applications and low transaction costs.',
        website: 'https://l2scale.example.com',
        category: 'INFRASTRUCTURE',
        status: 'EVALUATION_IN_PROGRESS',
        submitterId: projectSubmitter.id,
        foundingTeam: JSON.stringify([
          { name: 'Grace Kim', role: 'CEO', experience: '15 years Cryptography' },
          { name: 'Henry Lee', role: 'Protocol Engineer', experience: '7 years ZK' }
        ]),
        teamSize: 18,
        blockchain: 'Ethereum',
        technologyStack: JSON.stringify(['Rust', 'zkSNARKs', 'Solidity', 'TypeScript']),
        repository: 'https://github.com/l2scale/zk-rollup',
        whitepaper: 'https://l2scale.example.com/technical-paper.pdf',
        fundingRaised: 8500000,
        userBase: 2300,
        evaluationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        priorityLevel: 'HIGH',
        evaluationBudget: 35000
      },
      {
        name: 'Social DApp Network',
        description: 'Decentralized social media platform with token incentives, content ownership, and community governance.',
        website: 'https://socialdapp.example.com',
        category: 'SOCIAL',
        status: 'EXPERT_ASSIGNMENT',
        submitterId: projectSubmitter.id,
        foundingTeam: JSON.stringify([
          { name: 'Ivy Rodriguez', role: 'Founder', experience: '8 years Social Media' },
          { name: 'Jack Thompson', role: 'Head of Product', experience: '6 years DApps' }
        ]),
        teamSize: 15,
        blockchain: 'Solana',
        technologyStack: JSON.stringify(['Rust', 'React', 'GraphQL', 'Arweave']),
        fundingRaised: 4200000,
        userBase: 28000,
        monthlyRevenue: 125000,
        evaluationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        priorityLevel: 'MEDIUM',
        evaluationBudget: 12000
      },
      {
        name: 'Cross-Chain Bridge Protocol',
        description: 'Secure and efficient bridge protocol enabling asset transfers between Ethereum, Polygon, and BSC.',
        website: 'https://crossbridge.example.com',
        category: 'INFRASTRUCTURE',
        status: 'EXPERT_ASSIGNMENT',
        submitterId: projectSubmitter.id,
        foundingTeam: JSON.stringify([
          { name: 'Kevin Chang', role: 'Protocol Lead', experience: '9 years Blockchain' },
          { name: 'Lisa Wang', role: 'Security Engineer', experience: '7 years Smart Contracts' }
        ]),
        teamSize: 10,
        blockchain: 'Multi-chain',
        technologyStack: JSON.stringify(['Solidity', 'Go', 'TypeScript', 'Docker']),
        repository: 'https://github.com/crossbridge/protocol',
        fundingRaised: 1800000,
        evaluationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        priorityLevel: 'LOW',
        evaluationBudget: 10000
      }
    ]

    const createdProjects = []

    for (const projectData of projectsData) {
      try {
        const project = await prisma.project.create({
          data: projectData
        })

        createdProjects.push(project)
        console.log(`✓ Created project: ${project.name} (${project.category})`)

      } catch (projectError) {
        console.error(`Error creating project ${projectData.name}:`, projectError.message)
      }
    }

    console.log(`\n✅ Successfully created ${createdProjects.length} sample projects`)
    console.log('\nSample projects created:')
    createdProjects.forEach(project => {
      console.log(`  - ${project.name} (${project.category}) - ${project.status}`)
    })

    // Get some verified experts to create sample assignments
    const verifiedExperts = await prisma.expertProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED'
      },
      take: 2
    })

    if (verifiedExperts.length > 0 && createdProjects.length > 0) {
      console.log('\n📋 Creating sample assignments...')
      
      // Assign first expert to first project
      if (verifiedExperts[0] && createdProjects[0]) {
        try {
          await prisma.projectAssignment.create({
            data: {
              projectId: createdProjects[0].id,
              expertId: verifiedExperts[0].id,
              assignmentType: 'PRIMARY',
              status: 'ASSIGNED',
              acceptedAt: new Date()
            }
          })
          console.log(`✓ Assigned ${verifiedExperts[0].id} to ${createdProjects[0].name}`)

          // Update project status
          await prisma.project.update({
            where: { id: createdProjects[0].id },
            data: { status: 'IN_EVALUATION' }
          })
        } catch (assignmentError) {
          console.log('Assignment creation error (ignoring):', assignmentError.message)
        }
      }

      // Assign second expert to infrastructure project if available
      const infraProject = createdProjects.find(p => p.category === 'INFRASTRUCTURE')
      if (verifiedExperts[1] && infraProject) {
        try {
          await prisma.projectAssignment.create({
            data: {
              projectId: infraProject.id,
              expertId: verifiedExperts[1].id,
              assignmentType: 'PRIMARY',
              status: 'ASSIGNED',
              acceptedAt: new Date()
            }
          })
          console.log(`✓ Assigned ${verifiedExperts[1].id} to ${infraProject.name}`)
        } catch (assignmentError) {
          console.log('Assignment creation error (ignoring):', assignmentError.message)
        }
      }
    }

    console.log('\n🎯 Expert Dashboard Ready!')
    console.log('   • Navigate to: http://localhost:3000/expert/dashboard')
    console.log('   • Login with a verified expert account to test the system')
    console.log('   • Try assigning yourself to available projects')
    console.log('   • View your assignments and project details')

  } catch (error) {
    console.error('Error creating sample projects:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleProjects()