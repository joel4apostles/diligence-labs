"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts'

interface AnalyticsData {
  consultations: Array<{
    date: string
    completed: number
    scheduled: number
    revenue: number
  }>
  serviceTypes: Array<{
    name: string
    value: number
    color: string
  }>
  userGrowth: Array<{
    month: string
    users: number
    subscriptions: number
  }>
  performance: Array<{
    metric: string
    value: number
    target: number
    color: string
  }>
}

interface AnalyticsDashboardProps {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  className?: string
}

export function AnalyticsDashboard({ timeRange = '30d', className = '' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  // Generate mock data (replace with real API calls)
  const generateMockData = (): AnalyticsData => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365
    
    const consultations = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      return {
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 10) + 2,
        scheduled: Math.floor(Math.random() * 8) + 1,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      }
    })

    const serviceTypes = [
      { name: 'Strategic Advisory', value: 35, color: '#3B82F6' },
      { name: 'Due Diligence', value: 28, color: '#10B981' },
      { name: 'Token Launch', value: 22, color: '#F59E0B' },
      { name: 'Integration Advisory', value: 15, color: '#EF4444' },
    ]

    const userGrowth = Array.from({ length: 12 }, (_, i) => {
      const month = new Date()
      month.setMonth(month.getMonth() - (11 - i))
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        users: Math.floor(Math.random() * 200) + 50 + i * 25,
        subscriptions: Math.floor(Math.random() * 50) + 10 + i * 5,
      }
    })

    const performance = [
      { metric: 'Client Satisfaction', value: 94, target: 90, color: '#10B981' },
      { metric: 'Project Success Rate', value: 87, target: 85, color: '#3B82F6' },
      { metric: 'Time to Delivery', value: 92, target: 90, color: '#F59E0B' },
      { metric: 'Repeat Clients', value: 76, target: 70, color: '#8B5CF6' },
    ]

    return { consultations, serviceTypes, userGrowth, performance }
  }

  useEffect(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 1000)
  }, [selectedTimeRange])

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ]

  const totalRevenue = useMemo(() => {
    if (!data) return 0
    return data.consultations.reduce((sum, item) => sum + item.revenue, 0)
  }, [data])

  const totalConsultations = useMemo(() => {
    if (!data) return 0
    return data.consultations.reduce((sum, item) => sum + item.completed, 0)
  }, [data])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 animate-pulse">
            <div className="h-64 bg-gray-700/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-light mb-2">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Analytics
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent ml-2">
              Dashboard
            </span>
          </h2>
          <p className="text-gray-400">Real-time insights into your blockchain consulting business</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeRange(option.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTimeRange === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-900/60 to-blue-800/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Total Revenue</p>
              <p className="text-white text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm">+12.5% from last period</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/60 to-green-800/30 border border-green-500/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Consultations</p>
              <p className="text-white text-2xl font-bold">{totalConsultations}</p>
              <p className="text-green-400 text-sm">+8.3% from last period</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-900/60 to-orange-800/30 border border-orange-500/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Active Clients</p>
              <p className="text-white text-2xl font-bold">47</p>
              <p className="text-green-400 text-sm">+15.2% from last period</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-900/60 to-purple-800/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Success Rate</p>
              <p className="text-white text-2xl font-bold">94%</p>
              <p className="text-green-400 text-sm">+2.1% from last period</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.consultations}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Service Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Service Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.serviceTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.serviceTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#10B981"
                strokeWidth={2}
                name="Total Users"
              />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Subscriptions"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data.performance}>
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="value"
              />
              <Legend
                iconSize={18}
                layout="vertical"
                verticalAlign="middle"
                wrapperStyle={{
                  color: '#F9FAFB',
                  fontSize: '12px',
                  lineHeight: '24px'
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Consultation Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 backdrop-blur-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Consultation Activity</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.consultations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar dataKey="completed" fill="#10B981" name="Completed" />
            <Bar dataKey="scheduled" fill="#F59E0B" name="Scheduled" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}