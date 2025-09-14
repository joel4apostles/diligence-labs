"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProminentBorder } from "@/components/ui/border-effects"

interface WalletStats {
  totalUsers: number
  usersWithWallets: number
  usersWithoutWallets: number
  walletConnectionRate: number
  recentWalletConnections: Array<{
    userId: string
    email: string
    name: string | null
    walletAddress: string
    connectedAt: string
  }>
}

export function WalletMonitoring() {
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWalletStats()
  }, [])

  const fetchWalletStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/wallet-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProminentBorder className="rounded-xl overflow-hidden" animated={true}>
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
          <CardHeader>
            <CardTitle className="text-white">Wallet Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-700/50 rounded"></div>
              <div className="h-20 bg-gray-700/50 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </ProminentBorder>
    )
  }

  if (!stats) {
    return (
      <ProminentBorder className="rounded-xl overflow-hidden" animated={true}>
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
          <CardHeader>
            <CardTitle className="text-white">Wallet Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Failed to load wallet statistics</p>
          </CardContent>
        </Card>
      </ProminentBorder>
    )
  }

  return (
    <ProminentBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
      <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
        
        <Card className="bg-transparent border-0 relative z-10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              🔗 Wallet Monitoring
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track user wallet connections and Web3 adoption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
                <div className="text-xs text-gray-400">Total Users</div>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.usersWithWallets}</div>
                <div className="text-xs text-gray-400">Connected Wallets</div>
              </div>
              
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.usersWithoutWallets}</div>
                <div className="text-xs text-gray-400">No Wallet</div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.walletConnectionRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Connection Rate</div>
              </div>
            </div>

            {/* Recent Connections */}
            {stats.recentWalletConnections.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-3">Recent Wallet Connections</h4>
                <div className="space-y-2">
                  {stats.recentWalletConnections.map((connection, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {connection.name || 'Unknown User'}
                        </div>
                        <div className="text-gray-400 text-xs">{connection.email}</div>
                        <div className="text-blue-400 text-xs font-mono mt-1">
                          {connection.walletAddress.slice(0, 6)}...{connection.walletAddress.slice(-4)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                          Connected
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(connection.connectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProminentBorder>
  )
}