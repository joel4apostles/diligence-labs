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
      const response = await fetch('/api/admin/keys?action=list')
      const data = await response.json()
      if (response.ok) {
        setKeys(data.keys)
      }
    } catch (error) {
      console.error('Error fetching keys:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/keys?action=stats')
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const createKey = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            <Button>Create New Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin Key</DialogTitle>
              <DialogDescription>
                Generate a new registration key for admin account creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expiresInHours">Expires In (Hours)</Label>
                <Input
                  id="expiresInHours"
                  type="number"
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  min={1}
                  max={8760} // 1 year
                />
              </div>
              <div>
                <Label htmlFor="maxUsages">Max Uses (Optional)</Label>
                <Input
                  id="maxUsages"
                  type="number"
                  value={maxUsages || ''}
                  onChange={(e) => setMaxUsages(e.target.value ? Number(e.target.value) : null)}
                  min={1}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose or note for this key..."
                />
              </div>
              <Button onClick={createKey} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Key'}
              </Button>
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