"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrivacySettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PrivacySettings {
  profileVisibility: string
  emailNotifications: boolean
  marketingEmails: boolean
  dataProcessingConsent: boolean
  analyticsTracking: boolean
  thirdPartySharing: boolean
}

interface DataRetention {
  accountDataRetention: string
  activityLogRetention: string
  sessionDataRetention: string
}

export function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "private",
    emailNotifications: true,
    marketingEmails: false,
    dataProcessingConsent: true,
    analyticsTracking: true,
    thirdPartySharing: false
  })

  const [dataRetention, setDataRetention] = useState<DataRetention>({
    accountDataRetention: "indefinite",
    activityLogRetention: "1year",
    sessionDataRetention: "2years"
  })

  useEffect(() => {
    if (isOpen) {
      fetchPrivacySettings()
    }
  }, [isOpen])

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch('/api/user/privacy-settings')
      const data = await response.json()
      
      if (response.ok) {
        setPrivacySettings(data.privacySettings || privacySettings)
        setDataRetention(data.dataRetention || dataRetention)
      }
    } catch (error) {
      console.error('Failed to fetch privacy settings:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privacySettings,
          dataRetention,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update privacy settings')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error('Privacy settings update error:', error)
      setError(error.message || 'Failed to update privacy settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/user/download-data')
      
      if (response.ok) {
        // Get the filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
        const filename = filenameMatch ? filenameMatch[1] : 'user-data.json'
        
        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Failed to download data')
      }
    } catch (error) {
      console.error('Data download error:', error)
      setError('Failed to download data')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Privacy Settings</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Settings Updated</h3>
            <p className="text-gray-400">Your privacy settings have been saved.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Privacy Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Privacy Controls</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Profile Visibility</Label>
                    <p className="text-xs text-gray-500">Who can see your profile information</p>
                  </div>
                  <Select 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value) => setPrivacySettings({...privacySettings, profileVisibility: value})}
                  >
                    <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="contacts">Contacts</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive important account updates</p>
                  </div>
                  <Switch 
                    checked={privacySettings.emailNotifications}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, emailNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Marketing Emails</Label>
                    <p className="text-xs text-gray-500">Receive promotional and marketing content</p>
                  </div>
                  <Switch 
                    checked={privacySettings.marketingEmails}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, marketingEmails: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Analytics Tracking</Label>
                    <p className="text-xs text-gray-500">Help us improve by sharing usage data</p>
                  </div>
                  <Switch 
                    checked={privacySettings.analyticsTracking}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, analyticsTracking: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Third-party Sharing</Label>
                    <p className="text-xs text-gray-500">Allow sharing data with trusted partners</p>
                  </div>
                  <Switch 
                    checked={privacySettings.thirdPartySharing}
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, thirdPartySharing: checked})}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Data Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Data Management</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Account Data Retention</Label>
                    <p className="text-xs text-gray-500">How long we keep your account data</p>
                  </div>
                  <Select 
                    value={dataRetention.accountDataRetention} 
                    onValueChange={(value) => setDataRetention({...dataRetention, accountDataRetention: value})}
                  >
                    <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-300">Download My Data</Label>
                      <p className="text-xs text-blue-400/70">Get a copy of all your data in JSON format</p>
                    </div>
                    <Button
                      onClick={handleDownloadData}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}