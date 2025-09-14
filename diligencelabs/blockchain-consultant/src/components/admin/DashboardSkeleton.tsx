import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProminentBorder } from "@/components/ui/border-effects"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardSkeletonProps {
  isPageLoaded: boolean
}

export function DashboardSkeleton({ isPageLoaded }: DashboardSkeletonProps) {
  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Header Skeleton */}
      <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="w-px h-8" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-60" />
        </div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {[...Array(4)].map((_, i) => (
          <ProminentBorder key={i} className="rounded-xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          </ProminentBorder>
        ))}
      </div>

      {/* Notification Center Skeleton */}
      <div className={`transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Notification Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <ProminentBorder key={i} className="rounded-xl overflow-hidden" animated={false}>
                <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-5" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-12 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              </ProminentBorder>
            ))}
          </div>

          {/* Action Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <ProminentBorder key={i} className="rounded-2xl overflow-hidden" animated={false}>
                <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </ProminentBorder>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Actions Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {[...Array(5)].map((_, i) => (
          <ProminentBorder key={i} className="rounded-2xl overflow-hidden" animated={false}>
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </ProminentBorder>
        ))}
      </div>
    </div>
  )
}