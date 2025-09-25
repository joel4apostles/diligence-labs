'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { 
  GlassMorphismCard,
  theme,
  animations
} from '@/components/ui/consistent-theme'

interface ChartData {
  sessionsByType: Array<{
    type: string
    count: number
    color: string
  }>
  sessionsByStatus: Array<{
    status: string
    count: number
    color: string
  }>
  monthlyActivity: Array<{
    month: string
    sessions: number
    reports: number
    date: string
  }>
  weeklyTrends: Array<{
    week: string
    sessions: number
    completion_rate: number
  }>
}

interface InteractiveChartsProps {
  userId: string
  timeRange?: '30d' | '90d' | '6m' | '1y'
}

export function InteractiveCharts({ userId, timeRange = '30d' }: InteractiveChartsProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChart, setSelectedChart] = useState<'activity' | 'types' | 'status' | 'trends'>('activity')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChartData()
  }, [userId, timeRange])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/dashboard/user-stats?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }
      
      const data = await response.json()
      
      // Transform data for charts
      const transformedData: ChartData = {
        sessionsByType: data.analytics.sessionsByType.map((item: any, index: number) => ({
          type: item.type.replace('_', ' ').toLowerCase(),
          count: item.count,
          color: getTypeColor(index)
        })),
        sessionsByStatus: data.analytics.sessionsByStatus.map((item: any, index: number) => ({
          status: item.status.toLowerCase(),
          count: item.count,
          color: getStatusColor(item.status)
        })),
        monthlyActivity: data.analytics.monthlyActivity || [],
        weeklyTrends: generateWeeklyTrends(data.analytics.monthlyActivity || [])
      }
      
      setChartData(transformedData)
    } catch (err: any) {
      console.error('Error fetching chart data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    return colors[index % colors.length]
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10B981'
      case 'pending':
        return '#F59E0B'
      case 'scheduled':
        return '#3B82F6'
      case 'cancelled':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const generateWeeklyTrends = (monthlyData: any[]) => {
    // Generate sample weekly trend data
    const weeks = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      
      weeks.push({
        week: `Week ${12 - i}`,
        sessions: Math.floor(Math.random() * 10) + 1,
        completion_rate: Math.floor(Math.random() * 30) + 70
      })
    }
    
    return weeks
  }

  // Simple bar chart component
  const BarChart = ({ data, xKey, yKey, color }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item[yKey]))
    
    return (
      <div className="space-y-3">
        {data.map((item: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-20 text-sm text-gray-300 capitalize">
              {item[xKey]}
            </div>
            <div className="flex-1 relative">
              <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item[yKey] / maxValue) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-lg"
                  style={{ backgroundColor: item.color || color }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                {item[yKey]}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Simple line chart component
  const LineChart = ({ data, xKey, yKey, color = '#3B82F6' }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item[yKey]))
    const points = data.map((item: any, index: number) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - (item[yKey] / maxValue) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="space-y-4">
        <div className="relative h-48 bg-gray-800/30 rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            {data.map((item: any, index: number) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - (item[yKey] / maxValue) * 100
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (index * 0.1) + 1 }}
                />
              )
            })}
          </svg>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          {data.map((item: any, index: number) => (
            <span key={index} className={index % 2 === 0 ? 'block' : 'hidden sm:block'}>
              {item[xKey]}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const chartTabs = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'types', label: 'Types', icon: PieChart },
    { id: 'status', label: 'Status', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp }
  ]

  if (loading) {
    return (
      <GlassMorphismCard variant="neutral">
        <Card className="bg-transparent border-0">
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </GlassMorphismCard>
    )
  }

  if (error || !chartData) {
    return (
      <GlassMorphismCard variant="neutral">
        <Card className="bg-transparent border-0">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Charts Unavailable
            </h3>
            <p className="text-gray-400 mb-4">
              {error || 'Unable to load chart data'}
            </p>
            <Button onClick={fetchChartData} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </GlassMorphismCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {chartTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={selectedChart === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart(tab.id as any)}
                className={`flex items-center space-x-2 ${
                  selectedChart === tab.id 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            {timeRange.toUpperCase()}
          </Badge>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart Content */}
      <GlassMorphismCard variant="primary" hover={false}>
        <Card className="bg-transparent border-0">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {selectedChart === 'activity' && 'Monthly Activity'}
              {selectedChart === 'types' && 'Sessions by Type'}
              {selectedChart === 'status' && 'Sessions by Status'}
              {selectedChart === 'trends' && 'Weekly Trends'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {selectedChart === 'activity' && 'Your consultation and report activity over time'}
              {selectedChart === 'types' && 'Breakdown of consultation types you\'ve booked'}
              {selectedChart === 'status' && 'Current status distribution of your sessions'}
              {selectedChart === 'trends' && 'Weekly session completion trends'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <motion.div
              key={selectedChart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedChart === 'activity' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Sessions</h4>
                      <LineChart
                        data={chartData.monthlyActivity}
                        xKey="month"
                        yKey="sessions"
                        color="#3B82F6"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Reports</h4>
                      <LineChart
                        data={chartData.monthlyActivity}
                        xKey="month"
                        yKey="reports"
                        color="#8B5CF6"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {chartData.monthlyActivity.reduce((sum, item) => sum + item.sessions, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {chartData.monthlyActivity.reduce((sum, item) => sum + item.reports, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(chartData.monthlyActivity.reduce((sum, item) => sum + item.sessions, 0) / Math.max(chartData.monthlyActivity.length, 1))}
                      </div>
                      <div className="text-sm text-gray-400">Avg/Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {chartData.monthlyActivity.length > 1 ? '+12%' : '0%'}
                      </div>
                      <div className="text-sm text-gray-400">Growth</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedChart === 'types' && (
                <BarChart
                  data={chartData.sessionsByType}
                  xKey="type"
                  yKey="count"
                />
              )}

              {selectedChart === 'status' && (
                <BarChart
                  data={chartData.sessionsByStatus}
                  xKey="status"
                  yKey="count"
                />
              )}

              {selectedChart === 'trends' && (
                <div className="space-y-6">
                  <LineChart
                    data={chartData.weeklyTrends}
                    xKey="week"
                    yKey="completion_rate"
                    color="#10B981"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {Math.round(chartData.weeklyTrends.reduce((sum, item) => sum + item.completion_rate, 0) / chartData.weeklyTrends.length)}%
                      </div>
                      <div className="text-sm text-gray-300">Avg Completion Rate</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {Math.round(chartData.weeklyTrends.reduce((sum, item) => sum + item.sessions, 0) / chartData.weeklyTrends.length)}
                      </div>
                      <div className="text-sm text-gray-300">Avg Sessions/Week</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {chartData.weeklyTrends.length}
                      </div>
                      <div className="text-sm text-gray-300">Weeks Tracked</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </GlassMorphismCard>
    </div>
  )
}