/**
 * Utility functions for consistent date formatting across server and client
 * to prevent hydration mismatches
 */

/**
 * Format date consistently for server and client rendering
 * Uses a fixed locale and options to prevent hydration mismatches
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  
  // Return empty string if invalid date
  if (isNaN(d.getTime())) {
    return ''
  }
  
  // Use a fixed locale and format to ensure consistency
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d)
}

/**
 * Format date with time consistently
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  
  // Return empty string if invalid date
  if (isNaN(d.getTime())) {
    return ''
  }
  
  // Use a fixed locale and format to ensure consistency
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | number): string {
  const d = new Date(date)
  
  // Return empty string if invalid date
  if (isNaN(d.getTime())) {
    return ''
  }
  
  return d.toISOString().split('T')[0]
}