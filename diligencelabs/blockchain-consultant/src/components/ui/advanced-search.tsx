"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Calendar, User, FileText, ChevronDown, SortAsc, SortDesc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'

interface SearchFilter {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'multiSelect'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface SortOption {
  value: string
  label: string
  direction: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  filters?: SearchFilter[]
  sortOptions?: SortOption[]
  onSearch: (query: string, filters: Record<string, any>, sort?: { field: string; direction: 'asc' | 'desc' }) => void
  placeholder?: string
  searchTypes?: Array<{ value: string; label: string; icon?: React.ReactNode }>
  defaultSearchType?: string
  className?: string
  showAdvancedFilters?: boolean
}

export function AdvancedSearch({
  filters = [],
  sortOptions = [],
  onSearch,
  placeholder = "Search...",
  searchTypes = [],
  defaultSearchType,
  className = '',
  showAdvancedFilters = true
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSearchType, setSelectedSearchType] = useState(defaultSearchType || '')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string, filters: Record<string, any>, sort?: { field: string; direction: 'asc' | 'desc' }) => {
      onSearch(query, filters, sort)
    }, 300),
    [onSearch]
  )

  useEffect(() => {
    debouncedSearch(searchQuery, activeFilters, sortBy || undefined)
  }, [searchQuery, activeFilters, sortBy, debouncedSearch])

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }))
  }

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[filterId]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setDateRange(undefined)
    setSortBy(null)
  }

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key] !== '' && activeFilters[key] !== null).length
  }

  const handleSortChange = (field: string) => {
    setSortBy(prev => {
      if (prev?.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Search Type Selector */}
          {searchTypes.length > 0 && (
            <Select value={selectedSearchType} onValueChange={setSelectedSearchType}>
              <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Search in..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {searchTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-12 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          {showAdvancedFilters && filters.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50 relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          )}

          {/* Sort Options */}
          {sortOptions.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                >
                  {sortBy ? (
                    <div className="flex items-center gap-2">
                      {sortBy.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      Sort
                    </div>
                  ) : (
                    <>
                      <SortAsc className="h-4 w-4 mr-2" />
                      Sort
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-gray-800 border-gray-600">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Sort by</h4>
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full justify-start text-gray-300 hover:bg-gray-700 ${
                        sortBy?.field === option.value ? 'bg-gray-700 text-white' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        {option.label}
                        {sortBy?.field === option.value && (
                          sortBy.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  ))}
                  {sortBy && (
                    <Button
                      variant="ghost"
                      onClick={() => setSortBy(null)}
                      className="w-full justify-start text-red-400 hover:bg-gray-700"
                    >
                      Clear Sort
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Active filters:</span>
          {Object.entries(activeFilters).map(([filterId, value]) => {
            if (!value || value === '') return null
            const filter = filters.find(f => f.id === filterId)
            if (!filter) return null

            let displayValue = value
            if (filter.type === 'select' && filter.options) {
              const option = filter.options.find(opt => opt.value === value)
              displayValue = option?.label || value
            }

            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="bg-blue-500/20 text-blue-300 border border-blue-500/30"
              >
                {filter.label}: {displayValue}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFilter(filterId)}
                  className="ml-1 h-3 w-3 p-0 text-blue-300 hover:text-white"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )
          })}
          <Button
            size="sm"
            variant="ghost"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{filter.label}</label>
                  
                  {filter.type === 'text' && (
                    <Input
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      placeholder={filter.placeholder}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  )}

                  {filter.type === 'select' && (
                    <Select
                      value={activeFilters[filter.id] || ''}
                      onValueChange={(value) => handleFilterChange(filter.id, value)}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white">
                        <SelectValue placeholder={filter.placeholder || 'Select...'} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="" className="text-white hover:bg-gray-700">All</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === 'dateRange' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from && dateRange?.to ? (
                            `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                          ) : (
                            'Select date range'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600">
                        <CalendarComponent
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range)
                            handleFilterChange(filter.id, range)
                          }}
                          numberOfMonths={2}
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-600/30">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Predefined filter configurations for common use cases
export const CONSULTATION_FILTERS: SearchFilter[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'PENDING', label: 'Pending' },
      { value: 'SCHEDULED', label: 'Scheduled' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' }
    ]
  },
  {
    id: 'consultationType',
    label: 'Service Type',
    type: 'select',
    options: [
      { value: 'STRATEGIC_ADVISORY', label: 'Strategic Advisory' },
      { value: 'DUE_DILIGENCE', label: 'Due Diligence' },
      { value: 'TOKEN_LAUNCH', label: 'Token Launch' },
      { value: 'TOKENOMICS_DESIGN', label: 'Tokenomics Design' }
    ]
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'dateRange'
  }
]

export const REPORT_FILTERS: SearchFilter[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'PENDING', label: 'Pending' },
      { value: 'IN_REVIEW', label: 'In Review' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'REJECTED', label: 'Rejected' }
    ]
  },
  {
    id: 'type',
    label: 'Report Type',
    type: 'select',
    options: [
      { value: 'DUE_DILIGENCE', label: 'Due Diligence Report' },
      { value: 'ADVISORY_NOTES', label: 'Advisory Notes' },
      { value: 'BLOCKCHAIN_INTEGRATION_ADVISORY', label: 'Blockchain Integration Advisory' },
      { value: 'MARKET_RESEARCH', label: 'Market Research' }
    ]
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'dateRange'
  }
]

export const USER_FILTERS: SearchFilter[] = [
  {
    id: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'USER', label: 'User' },
      { value: 'ADMIN', label: 'Admin' }
    ]
  },
  {
    id: 'emailVerified',
    label: 'Email Status',
    type: 'select',
    options: [
      { value: 'verified', label: 'Verified' },
      { value: 'unverified', label: 'Unverified' }
    ]
  },
  {
    id: 'dateRange',
    label: 'Registration Date',
    type: 'dateRange'
  }
]

export const COMMON_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Date Created', direction: 'desc' },
  { value: 'updatedAt', label: 'Last Updated', direction: 'desc' },
  { value: 'name', label: 'Name', direction: 'asc' },
  { value: 'status', label: 'Status', direction: 'asc' }
]

export const SEARCH_TYPES = {
  ALL: [
    { value: 'all', label: 'All Content', icon: <Search className="h-4 w-4" /> },
    { value: 'consultations', label: 'Consultations', icon: <User className="h-4 w-4" /> },
    { value: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
    { value: 'users', label: 'Users', icon: <User className="h-4 w-4" /> }
  ],
  DASHBOARD: [
    { value: 'consultations', label: 'Consultations', icon: <User className="h-4 w-4" /> },
    { value: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> }
  ]
}