"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubtleBorder } from "@/components/ui/border-effects"
import { formatDate } from "@/lib/date-utils"

interface GuestConsultation {
  id: string
  consultationType: string
  status: string
  description: string
  scheduledAt: string | null
  createdAt: string
  notes: string | null
  isFreeConsultation: boolean
  guestEmail: string
  guestName: string | null
  guestPhone: string | null
  clientIpAddress: string | null
}

interface GuestConsultationCardProps {
  consultation: GuestConsultation
  onStatusUpdate?: (id: string, status: string) => void
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const consultationTypeLabels = {
  STRATEGIC_ADVISORY: "Strategic Advisory",
  DUE_DILIGENCE: "Due Diligence", 
  BLOCKCHAIN_INTEGRATION_ADVISORY: "Blockchain Integration Advisory",
  TOKEN_LAUNCH: "Token Launch Consultation",
}

export function GuestConsultationCard({ consultation, onStatusUpdate }: GuestConsultationCardProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const parseConsultationDetails = (description: string) => {
    const lines = description.split('\n')
    const title = lines[0]?.replace('Title: ', '') || 'Untitled'
    const project = lines[1]?.replace('Project: ', '') || 'Unknown Project'
    const descriptionStart = lines.findIndex(line => line === 'Description:')
    const mainDescription = descriptionStart !== -1 
      ? lines.slice(descriptionStart + 1).join('\n').split('\n\n')[0] 
      : description.split('\n\n')[1] || 'No description'
    
    return { title, project, mainDescription }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return
    
    try {
      setUpdating(newStatus)
      await onStatusUpdate(consultation.id, newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const { title, project, mainDescription } = parseConsultationDetails(consultation.description)

  return (
    <SubtleBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
      <div className="relative group bg-gradient-to-br from-purple-900/20 to-pink-900/10 backdrop-blur-xl rounded-xl border border-purple-500/20">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        
        <Card className="bg-transparent border-0 relative z-10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                    GUEST BOOKING
                  </Badge>
                  {consultation.isFreeConsultation && (
                    <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                      FREE
                    </Badge>
                  )}
                  <Badge className={`text-xs ${statusColors[consultation.status as keyof typeof statusColors]}`}>
                    {consultation.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-white">{title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {project} • {consultationTypeLabels[consultation.consultationType as keyof typeof consultationTypeLabels]}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-2">Guest Information</h4>
              <div className="space-y-1">
                {consultation.guestName && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Name:</span> {consultation.guestName}
                  </p>
                )}
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Email:</span> {consultation.guestEmail}
                </p>
                {consultation.guestPhone && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-400">Phone:</span> {consultation.guestPhone}
                  </p>
                )}
                {consultation.clientIpAddress && (
                  <p className="text-sm text-gray-400 font-mono">
                    <span className="text-gray-500">IP:</span> {consultation.clientIpAddress}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Description:</p>
              <p className="text-sm text-gray-300 line-clamp-3 bg-gray-800/20 p-3 rounded">
                {mainDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Created:</span>
                <p className="text-gray-300">{formatDate(consultation.createdAt)}</p>
              </div>
              {consultation.scheduledAt && (
                <div>
                  <span className="text-gray-400">Scheduled:</span>
                  <p className="text-gray-300">{formatDate(consultation.scheduledAt)}</p>
                </div>
              )}
            </div>

            {consultation.notes && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Admin Notes:</p>
                <p className="text-sm text-gray-300 bg-gray-800/20 p-2 rounded">{consultation.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                View Details
              </Button>
              
              {consultation.status === "PENDING" && (
                <>
                  <Button 
                    size="sm"
                    disabled={updating === "SCHEDULED"}
                    onClick={() => handleStatusUpdate("SCHEDULED")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updating === "SCHEDULED" ? "Scheduling..." : "Schedule"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    disabled={updating === "CANCELLED"}
                    onClick={() => handleStatusUpdate("CANCELLED")}
                  >
                    {updating === "CANCELLED" ? "Declining..." : "Decline"}
                  </Button>
                </>
              )}
              
              {consultation.status === "SCHEDULED" && (
                <>
                  <Button 
                    size="sm"
                    disabled={updating === "IN_PROGRESS"}
                    onClick={() => handleStatusUpdate("IN_PROGRESS")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updating === "IN_PROGRESS" ? "Starting..." : "Start Session"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={updating === "PENDING"}
                    onClick={() => handleStatusUpdate("PENDING")}
                  >
                    {updating === "PENDING" ? "Moving..." : "Back to Pending"}
                  </Button>
                </>
              )}
              
              {consultation.status === "IN_PROGRESS" && (
                <Button 
                  size="sm"
                  disabled={updating === "COMPLETED"}
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {updating === "COMPLETED" ? "Completing..." : "Mark Complete"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SubtleBorder>
  )
}