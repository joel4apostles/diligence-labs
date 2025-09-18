import dynamic from 'next/dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

const ExpertProjectDashboard = dynamic(() => import('@/components/expert/ExpertProjectDashboard'), {
  ssr: false
})

const prisma = new PrismaClient()

export default async function ExpertDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Check if user has a verified expert profile
  const expertProfile = await prisma.expertProfile.findUnique({
    where: { 
      userId: session.user.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  if (!expertProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-white mb-4">Expert Profile Required</h1>
              <p className="text-gray-400 mb-6">
                You need to apply and be verified as an expert to access the expert dashboard.
              </p>
              <a 
                href="/apply/expert" 
                className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Apply to Become an Expert
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (expertProfile.verificationStatus !== 'VERIFIED') {
    const statusMessages = {
      'PENDING': 'Your expert application is under review.',
      'UNDER_REVIEW': 'Your application requires additional information.',
      'REJECTED': 'Your expert application was not approved.',
      'SUSPENDED': 'Your expert account has been suspended.'
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
              <h1 className="text-2xl font-bold text-white mb-4">Expert Verification Required</h1>
              <p className="text-gray-400 mb-2">
                {statusMessages[expertProfile.verificationStatus as keyof typeof statusMessages] || 
                 'Your expert profile is not yet verified.'}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Status: <span className="text-yellow-400">{expertProfile.verificationStatus}</span>
              </p>
              <a 
                href="/dashboard" 
                className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
              >
                Go to User Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <ExpertProjectDashboard />
      </div>
    </div>
  )
}