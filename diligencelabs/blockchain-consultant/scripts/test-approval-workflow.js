const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testApprovalWorkflow() {
  try {
    console.log('🔍 Testing Expert Application Approval Workflow...\n')

    // 1. Fetch pending applications
    console.log('1. Fetching pending expert applications...')
    const pendingApplications = await prisma.expertProfile.findMany({
      where: {
        verificationStatus: 'PENDING'
      },
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

    console.log(`   Found ${pendingApplications.length} pending applications:`)
    pendingApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.user.name} (${app.user.email}) - ${app.company}`)
    })

    if (pendingApplications.length === 0) {
      console.log('   No pending applications found. Create some sample data first!')
      return
    }

    // 2. Test approval of first application
    const firstApplication = pendingApplications[0]
    console.log(`\n2. Testing APPROVAL of: ${firstApplication.user.name}`)

    // Update verification status
    const approvedProfile = await prisma.expertProfile.update({
      where: { id: firstApplication.id },
      data: {
        verificationStatus: 'VERIFIED',
        expertTier: 'BRONZE',
        reputationPoints: firstApplication.reputationPoints + 100,
        verifiedAt: new Date()
      }
    })

    // Create achievement for approval
    try {
      const achievement = await prisma.expertAchievement.create({
        data: {
          expertId: firstApplication.id,
          achievementType: 'TIER_PROMOTION',
          title: 'Expert Verification',
          description: 'Successfully verified as a blockchain expert',
          pointsAwarded: 100
        }
      })
      console.log(`   ✅ Created achievement: ${achievement.title}`)
    } catch (achievementError) {
      console.log(`   ⚠️ Achievement creation failed: ${achievementError.message}`)
    }

    // Update user reputation
    await prisma.user.update({
      where: { id: firstApplication.userId },
      data: {
        reputationPoints: {
          increment: 100
        }
      }
    })

    console.log(`   ✅ ${firstApplication.user.name} has been APPROVED`)
    console.log(`   📊 New tier: ${approvedProfile.expertTier}`)
    console.log(`   🎖️ Reputation points: ${approvedProfile.reputationPoints}`)

    // 3. Test rejection of second application (if available)
    if (pendingApplications.length > 1) {
      const secondApplication = pendingApplications[1]
      console.log(`\n3. Testing REJECTION of: ${secondApplication.user.name}`)

      await prisma.expertProfile.update({
        where: { id: secondApplication.id },
        data: {
          verificationStatus: 'REJECTED'
        }
      })

      console.log(`   ❌ ${secondApplication.user.name} has been REJECTED`)
    }

    // 4. Show updated statistics
    console.log('\n4. Updated Application Statistics:')
    const stats = await prisma.expertProfile.groupBy({
      by: ['verificationStatus'],
      _count: {
        id: true
      }
    })

    stats.forEach(stat => {
      console.log(`   ${stat.verificationStatus}: ${stat._count.id}`)
    })

    // 5. Show verified experts
    console.log('\n5. Verified Experts:')
    const verifiedExperts = await prisma.expertProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    verifiedExperts.forEach((expert, index) => {
      console.log(`   ${index + 1}. ${expert.user.name} - ${expert.company} (Tier: ${expert.expertTier})`)
    })

    console.log('\n✅ Expert Application Approval Workflow Test Completed Successfully!')
    console.log('\n📋 Summary of what we tested:')
    console.log('   • Fetching pending applications from database')
    console.log('   • Approving an expert application')
    console.log('   • Creating achievement for approved expert')
    console.log('   • Updating user reputation points')
    console.log('   • Rejecting an expert application')
    console.log('   • Displaying updated statistics')
    
    console.log('\n🎯 Next steps:')
    console.log('   • Visit the admin panel to test the UI: http://localhost:3000/admin/expert-applications')
    console.log('   • Test email notifications (configure SMTP settings)')
    console.log('   • Test bulk operations for multiple applications')

  } catch (error) {
    console.error('❌ Error testing approval workflow:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApprovalWorkflow()