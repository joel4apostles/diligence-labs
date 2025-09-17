"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

interface AdminKey {
  id: string
  key: string
  description?: string
  createdBy: string
  isActive: boolean
  usageCount: number
  maxUsages: number | null
  expiresAt: string | null
  createdAt: string
}

interface KeyStats {
  totalKeys: number
  activeKeys: number
  expiredKeys: number
  usedKeys: number
}

export function AdminKeyManagement() {
  const [keys, setKeys] = useState<AdminKey[]>([])
  const [stats, setStats] = useState<KeyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState<AdminKey | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Form state for creating new keys
  const [expiresInHours, setExpiresInHours] = useState(24)
  const [maxUsages, setMaxUsages] = useState<number | null>(null)
  const [description, setDescription] = useState('')

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/keys?action=list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setKeys(data.keys)
      } else if (response.status === 403) {
        console.error('Access denied: Super Admin privileges required')
      }
    } catch (error) {
      console.error('Error fetching keys:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/keys?action=stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      } else if (response.status === 403) {
        console.error('Access denied: Super Admin privileges required')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const createKey = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create',
          expiresInHours,
          maxUsages,
          description
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        setNewKey(data.key)
        fetchKeys()
        fetchStats()
        setCreateDialogOpen(false)
        // Reset form
        setExpiresInHours(24)
        setMaxUsages(null)
        setDescription('')
      }
    } catch (error) {
      console.error('Error creating key:', error)
    } finally {
      setLoading(false)
    }
  }

  const rotateKeys = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate' })
      })
      
      const data = await response.json()
      if (response.ok) {
        setNewKey(data.key)
        fetchKeys()
        fetchStats()
      }
    } catch (error) {
      console.error('Error rotating keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const deactivateKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      })
      
      if (response.ok) {
        fetchKeys()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deactivating key:', error)
    }
  }

  const cleanupExpiredKeys = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      })
      
      if (response.ok) {
        fetchKeys()
        fetchStats()
      }
    } catch (error) {
      console.error('Error cleaning up keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  useEffect(() => {
    fetchKeys()
    fetchStats()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.activeKeys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expired Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.expiredKeys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Used Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.usedKeys}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Key Display */}
      {newKey && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-400">🔑 New Admin Key Generated</CardTitle>
            <CardDescription>
              Share this key securely with new admins. It will not be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-black/50 rounded border font-mono text-sm">
                {newKey.key}
              </code>
              <Button 
                onClick={() => copyToClipboard(newKey.key)}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Expires: {newKey.expiresAt ? formatDate(newKey.expiresAt) : 'Never'} | 
              Max Uses: {newKey.maxUsages || 'Unlimited'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200">
              <span className="mr-2">🔑</span>
              Create New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-blue-500/20 text-white max-w-md">
            <DialogHeader className="text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <DialogTitle className="text-xl font-semibold text-white mb-2">
                Create New Admin Key
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm">
                Generate a secure registration key with custom expiration and usage limits.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Expiration Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-400">⏰</span>
                  <Label htmlFor="expiresInHours" className="text-sm font-medium text-gray-200">
                    Expiration Time
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="expiresInHours"
                    type="number"
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(Number(e.target.value))}
                    min={1}
                    max={8760} // 1 year
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 pr-16"
                    placeholder="24"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    hours
                  </span>
                </div>
                <div className="flex space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpiresInHours(1)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    1h
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiresInHours(24)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    1d
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiresInHours(168)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    1w
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiresInHours(720)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    1m
                  </button>
                </div>
              </div>

              {/* Usage Limit Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-purple-400">🔢</span>
                  <Label htmlFor="maxUsages" className="text-sm font-medium text-gray-200">
                    Usage Limit
                  </Label>
                </div>
                <Input
                  id="maxUsages"
                  type="number"
                  value={maxUsages || ''}
                  onChange={(e) => setMaxUsages(e.target.value ? Number(e.target.value) : null)}
                  min={1}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                  placeholder="Leave empty for unlimited uses"
                />
                <div className="flex space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMaxUsages(1)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    1 use
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxUsages(5)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    5 uses
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxUsages(10)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    10 uses
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxUsages(null)}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-gray-300 transition-colors"
                  >
                    ∞ unlimited
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-400">📝</span>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-200">
                    Description (Optional)
                  </Label>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400/20 min-h-[80px] resize-none"
                  placeholder="e.g., Key for new team member onboarding..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createKey}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      Generate Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={rotateKeys} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Rotating...' : 'Rotate All Keys'}
        </Button>

        <Button 
          onClick={cleanupExpiredKeys} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Cleaning...' : 'Cleanup Expired'}
        </Button>
      </div>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Registration Keys</CardTitle>
          <CardDescription>
            Manage admin registration keys. Active keys can be used to create new admin accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No admin keys found. Create your first key to get started.
              </div>
            ) : (
              keys.map((key) => (
                <div 
                  key={key.id} 
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono">{key.key.substring(0, 20)}...</code>
                      <Badge variant={key.isActive ? 'default' : 'secondary'}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {isExpired(key.expiresAt) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(key.createdAt)} | 
                      Uses: {key.usageCount}/{key.maxUsages || '∞'} | 
                      Expires: {key.expiresAt ? formatDate(key.expiresAt) : 'Never'}
                    </div>
                    {key.description && (
                      <div className="text-sm text-gray-400">{key.description}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => copyToClipboard(key.key)}
                      variant="outline"
                      size="sm"
                    >
                      Copy
                    </Button>
                    {key.isActive && (
                      <Button
                        onClick={() => deactivateKey(key.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}