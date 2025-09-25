"use client"

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/date-utils'
import { 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Mail,
  Download,
  Eye
} from 'lucide-react'
import { ProminentBorder } from '@/components/ui/border-effects'

interface SearchResult {
  id: string
  type: 'consultation' | 'report' | 'user'
  title: string
  description?: string
  status?: string
  createdAt: string
  updatedAt?: string
  metadata?: Record<string, any>
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading?: boolean
  query?: string
  type?: string
  onViewDetails?: (id: string, type: string) => void
  className?: string
}

export function SearchResults({
  results,
  isLoading = false,
  query = '',
  type = 'all',
  onViewDetails,
  className = ''
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-600/30 animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-light text-white mb-2">No results found</h3>
        <p className="text-gray-400">
          {query 
            ? `No results found for "${query}"` 
            : 'Try adjusting your search query or filters'}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm text-gray-400 mb-4">
        Found {results.length} result{results.length !== 1 ? 's' : ''}
        {query && ` for "${query}"`}
      </div>

      {results.map((result, index) => (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ProminentBorder 
            className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            animated={true}
          >
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-0">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getResultIcon(result.type, result.status)}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-medium text-white">
                        {result.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getResultTypeLabel(result.type)}
                        </Badge>
                        {result.status && (
                          <Badge 
                            className={`text-xs ${getStatusColor(result.status)}`}
                          >
                            {result.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onViewDetails && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(result.id, result.type)}
                        className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    {getActionButton(result)}
                  </div>
                </div>
              </CardHeader>

              {result.description && (
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-300 text-sm leading-relaxed">
                    {result.description}
                  </CardDescription>
                </CardContent>
              )}

              <CardContent className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(result.createdAt)}</span>
                    </div>
                    {result.updatedAt && result.updatedAt !== result.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated {formatDate(result.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {result.metadata && (
                    <div className="flex items-center gap-2">
                      {renderMetadata(result.metadata)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ProminentBorder>
        </motion.div>
      ))}
    </div>
  )
}

function getResultIcon(type: string, status?: string) {
  const iconClass = "h-5 w-5"
  
  switch (type) {
    case 'consultation':
      return <User className={`${iconClass} text-blue-400`} />
    case 'report':
      return <FileText className={`${iconClass} text-green-400`} />
    case 'user':
      return <User className={`${iconClass} text-purple-400`} />
    default:
      return <FileText className={`${iconClass} text-gray-400`} />
  }
}

function getResultTypeLabel(type: string) {
  switch (type) {
    case 'consultation':
      return 'Consultation'
    case 'report':
      return 'Report'
    case 'user':
      return 'User'
    default:
      return 'Unknown'
  }
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
    case 'SCHEDULED':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    case 'IN_REVIEW':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-300 border border-green-500/30'
    case 'CANCELLED':
      return 'bg-red-500/20 text-red-300 border border-red-500/30'
    case 'REJECTED':
      return 'bg-red-500/20 text-red-300 border border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
  }
}

function getActionButton(result: SearchResult) {
  switch (result.type) {
    case 'consultation':
      return (
        <Link href={`/dashboard/consultations/${result.id}`}>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </Link>
      )
    
    case 'report':
      if (result.status === 'COMPLETED' && result.metadata?.fileUrl) {
        return (
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        )
      }
      return (
        <Link href={`/dashboard/reports`}>
          <Button size="sm" variant="outline" className="border-gray-600/50 text-gray-300">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </Link>
      )
    
    case 'user':
      return (
        <Button size="sm" variant="outline" className="border-gray-600/50 text-gray-300">
          <Mail className="h-3 w-3 mr-1" />
          Contact
        </Button>
      )
    
    default:
      return null
  }
}

function renderMetadata(metadata: Record<string, any>) {
  const items = []
  
  if (metadata.consultationType) {
    items.push(
      <span key="type" className="text-blue-400">
        {metadata.consultationType.replace('_', ' ')}
      </span>
    )
  }
  
  if (metadata.clientName) {
    items.push(
      <span key="client" className="text-gray-400">
        Client: {metadata.clientName}
      </span>
    )
  }
  
  if (metadata.email) {
    items.push(
      <span key="email" className="text-gray-400">
        {metadata.email}
      </span>
    )
  }
  
  if (metadata.role) {
    items.push(
      <Badge key="role" variant="outline" className="text-xs">
        {metadata.role}
      </Badge>
    )
  }
  
  return items
}

// Utility function to transform API results to SearchResult format
export function transformApiResults(apiResults: any[], type: string): SearchResult[] {
  return apiResults.map(item => {
    switch (type) {
      case 'consultations':
        return {
          id: item.id,
          type: 'consultation' as const,
          title: item.clientName || 'Consultation Session',
          description: item.description,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          metadata: {
            consultationType: item.consultationType,
            clientName: item.clientName
          }
        }
      
      case 'reports':
        return {
          id: item.id,
          type: 'report' as const,
          title: item.title,
          description: item.description,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          metadata: {
            type: item.type,
            fileUrl: item.fileUrl
          }
        }
      
      case 'users':
        return {
          id: item.id,
          type: 'user' as const,
          title: item.name || item.email,
          description: `${item.email} • ${item._count?.sessions || 0} consultations • ${item._count?.reports || 0} reports`,
          status: item.emailVerified ? 'VERIFIED' : 'UNVERIFIED',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          metadata: {
            email: item.email,
            role: item.role,
            consultationsCount: item._count?.sessions || 0,
            reportsCount: item._count?.reports || 0
          }
        }
      
      default:
        return {
          id: item.id,
          type: 'consultation' as const,
          title: item.title || item.name || 'Unknown',
          description: item.description,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
    }
  })
}