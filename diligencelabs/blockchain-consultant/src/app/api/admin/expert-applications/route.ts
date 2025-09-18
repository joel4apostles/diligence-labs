import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAdminAuth, hasPermission } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { expertApprovalEmailTemplate, expertRejectionEmailTemplate } from '@/lib/email-templates'

const prisma = new PrismaClient()

// GET /api/admin/expert-applications - Get all expert applications
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminAuth(request)
    
    if (!adminAuth.success || !adminAuth.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - ADMIN or SUPER_ADMIN can view applications
    if (!hasPermission(adminAuth.admin.role, 'ADMIN')) {
      return NextResponse.json({ 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (status !== 'ALL') {
      where.verificationStatus = status
    }

    const skip = (page - 1) * limit

    const [applications, total] = await Promise.all([
      prisma.expertProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true
            }
          },
          evaluations: {
            take: 5,
            orderBy: {
              submittedAt: 'desc'
            },
            include: {
              project: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          },
          achievements: {
            take: 3,
            orderBy: {
              awardedAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.expertProfile.count({ where })
    ])

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Expert applications fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch expert applications' }, { status: 500 })
  }
}

// POST /api/admin/expert-applications - Process expert application (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminAuth(request)
    
    if (!adminAuth.success || !adminAuth.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - ADMIN or SUPER_ADMIN can process applications
    if (!hasPermission(adminAuth.admin.role, 'ADMIN')) {
      return NextResponse.json({ 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { expertId, action, reviewNotes } = body

    if (!expertId || !action || !['APPROVE', 'REJECT', 'REQUEST_INFO'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid expertId or action' 
      }, { status: 400 })
    }

    // Get expert profile
    const expertProfile = await prisma.expertProfile.findUnique({
      where: { id: expertId },
      include: {
        user: true
      }
    })

    if (!expertProfile) {
      return NextResponse.json({ error: 'Expert profile not found' }, { status: 404 })
    }

    // Update verification status based on action
    let newStatus: string
    let tierUpdate: any = {}
    
    switch (action) {
      case 'APPROVE':
        newStatus = 'VERIFIED'
        // Set initial expert tier and reputation
        tierUpdate = {
          expertTier: 'BRONZE',
          reputationPoints: 100, // Starting reputation points
          verifiedAt: new Date()
        }
        break
      case 'REJECT':
        newStatus = 'REJECTED'
        break
      case 'REQUEST_INFO':
        newStatus = 'UNDER_REVIEW'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update expert profile
    const updatedProfile = await prisma.expertProfile.update({
      where: { id: expertId },
      data: {
        verificationStatus: newStatus,
        ...tierUpdate
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

    // If approved, create initial achievement and send approval email
    if (action === 'APPROVE') {
      await prisma.expertAchievement.create({
        data: {
          expertId,
          achievementType: 'TIER_PROMOTION',
          title: 'Expert Verification',
          description: 'Successfully verified as a blockchain expert',
          pointsAwarded: 100
        }
      })

      // Update user role to include expert privileges
      await prisma.user.update({
        where: { id: expertProfile.userId },
        data: {
          // Add any additional user-level changes for approved experts
          reputationPoints: {
            increment: 100
          }
        }
      })

      // Send approval email notification
      try {
        const emailData = {
          expertName: expertProfile.user.name || 'Expert',
          expertEmail: expertProfile.user.email,
          companyName: updatedProfile.company || undefined,
          position: updatedProfile.position || undefined,
          approvalDate: new Date().toLocaleDateString(),
          dashboardUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`,
          supportEmail: process.env.SUPPORT_EMAIL || 'support@diligencelabs.com'
        }
        
        const emailTemplate = expertApprovalEmailTemplate(emailData)
        
        await sendEmail({
          to: expertProfile.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })
        
        console.log(`Approval email sent to ${expertProfile.user.email}`)
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the entire operation if email fails
      }
    }

    // If rejected, send rejection email
    if (action === 'REJECT') {
      try {
        const emailData = {
          expertName: expertProfile.user.name || 'Expert',
          expertEmail: expertProfile.user.email,
          rejectionReason: reviewNotes || undefined,
          rejectionDate: new Date().toLocaleDateString(),
          supportEmail: process.env.SUPPORT_EMAIL || 'support@diligencelabs.com'
        }
        
        const emailTemplate = expertRejectionEmailTemplate(emailData)
        
        await sendEmail({
          to: expertProfile.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })
        
        console.log(`Rejection email sent to ${expertProfile.user.email}`)
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
        // Don't fail the entire operation if email fails
      }
    }

    // Log the admin action
    await prisma.userActivityLog.create({
      data: {
        userId: expertProfile.userId,
        action: `EXPERT_APPLICATION_${action}`,
        details: JSON.stringify({
          adminId: adminAuth.admin.id,
          adminEmail: adminAuth.admin.email,
          reviewNotes,
          previousStatus: expertProfile.verificationStatus,
          newStatus
        }),
        ipAddress: request.ip || 'unknown'
      }
    })

    return NextResponse.json({
      message: `Expert application ${action.toLowerCase()}d successfully`,
      expertProfile: updatedProfile,
      action,
      newStatus,
      emailSent: action === 'APPROVE' || action === 'REJECT'
    })

  } catch (error) {
    console.error('Expert application processing error:', error)
    return NextResponse.json({ error: 'Failed to process expert application' }, { status: 500 })
  }
}

// PUT /api/admin/expert-applications - Bulk process applications
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminAuth(request)
    
    if (!adminAuth.success || !adminAuth.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - SUPER_ADMIN for bulk operations
    if (!hasPermission(adminAuth.admin.role, 'SUPER_ADMIN')) {
      return NextResponse.json({ 
        error: 'Super Admin permissions required for bulk operations' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { expertIds, action, reviewNotes } = body

    if (!expertIds || !Array.isArray(expertIds) || expertIds.length === 0 || !action) {
      return NextResponse.json({ 
        error: 'Invalid expertIds array or action' 
      }, { status: 400 })
    }

    if (!['APPROVE', 'REJECT', 'REQUEST_INFO'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action' 
      }, { status: 400 })
    }

    // Process each expert application
    const results = []
    
    for (const expertId of expertIds) {
      try {
        // Get expert profile
        const expertProfile = await prisma.expertProfile.findUnique({
          where: { id: expertId },
          include: { user: true }
        })

        if (!expertProfile) {
          results.push({ expertId, status: 'ERROR', message: 'Expert not found' })
          continue
        }

        // Update verification status
        let newStatus: string
        let tierUpdate: any = {}
        
        switch (action) {
          case 'APPROVE':
            newStatus = 'VERIFIED'
            tierUpdate = {
              expertTier: 'BRONZE',
              reputationPoints: 100,
              verifiedAt: new Date()
            }
            break
          case 'REJECT':
            newStatus = 'REJECTED'
            break
          case 'REQUEST_INFO':
            newStatus = 'UNDER_REVIEW'
            break
        }

        // Update expert profile
        await prisma.expertProfile.update({
          where: { id: expertId },
          data: {
            verificationStatus: newStatus,
            ...tierUpdate
          }
        })

        // If approved, create achievement and update user
        if (action === 'APPROVE') {
          await Promise.all([
            prisma.expertAchievement.create({
              data: {
                expertId,
                achievementType: 'TIER_PROMOTION',
                title: 'Expert Verification',
                description: 'Successfully verified as a blockchain expert',
                pointsAwarded: 100
              }
            }),
            prisma.user.update({
              where: { id: expertProfile.userId },
              data: {
                reputationPoints: {
                  increment: 100
                }
              }
            })
          ])
        }

        // Log the action
        await prisma.userActivityLog.create({
          data: {
            userId: expertProfile.userId,
            action: `BULK_EXPERT_APPLICATION_${action}`,
            details: JSON.stringify({
              adminId: adminAuth.admin.id,
              adminEmail: adminAuth.admin.email,
              reviewNotes,
              previousStatus: expertProfile.verificationStatus,
              newStatus
            }),
            ipAddress: request.ip || 'unknown'
          }
        })

        results.push({ 
          expertId, 
          status: 'SUCCESS', 
          message: `Application ${action.toLowerCase()}d successfully`,
          userEmail: expertProfile.user.email
        })

      } catch (error) {
        console.error(`Error processing expert ${expertId}:`, error)
        results.push({ 
          expertId, 
          status: 'ERROR', 
          message: 'Processing failed' 
        })
      }
    }

    const successCount = results.filter(r => r.status === 'SUCCESS').length
    const errorCount = results.filter(r => r.status === 'ERROR').length

    return NextResponse.json({
      message: `Bulk processing completed: ${successCount} successful, ${errorCount} failed`,
      results,
      summary: {
        total: expertIds.length,
        successful: successCount,
        failed: errorCount
      }
    })

  } catch (error) {
    console.error('Bulk expert application processing error:', error)
    return NextResponse.json({ error: 'Failed to process bulk expert applications' }, { status: 500 })
  }
}