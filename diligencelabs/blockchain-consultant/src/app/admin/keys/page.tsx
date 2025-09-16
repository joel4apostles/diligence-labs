"use client"

import { AdminKeyManagement } from '@/components/admin/AdminKeyManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminKeysPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Key Management</h1>
          <p className="text-gray-400">
            Generate and manage dynamic registration keys for admin account creation.
          </p>
        </div>

        <Card className="mb-8 border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-blue-400">🔐 Dynamic Admin Keys</CardTitle>
            <CardDescription>
              This system provides enhanced security with:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Automatic Expiration:</strong> Keys expire after a set time period</li>
              <li>• <strong>Usage Limits:</strong> Limit how many times a key can be used</li>
              <li>• <strong>Key Rotation:</strong> Generate new keys and deactivate old ones instantly</li>
              <li>• <strong>Usage Tracking:</strong> Monitor when and how often keys are used</li>
              <li>• <strong>Fallback Support:</strong> Environment variable fallback for reliability</li>
            </ul>
          </CardContent>
        </Card>

        <AdminKeyManagement />
      </div>
    </div>
  )
}