"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AccessibilityIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  severity: 'critical' | 'moderate' | 'minor'
  rule: string
  element: string
  description: string
  recommendation: string
  wcagLevel: 'A' | 'AA' | 'AAA'
}

// Accessibility checker that runs automated tests
export const AccessibilityChecker: React.FC<{
  enabled?: boolean
  showResults?: boolean
}> = ({ enabled = process.env.NODE_ENV === 'development', showResults = true }) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const runAccessibilityCheck = () => {
      setIsScanning(true)
      const foundIssues: AccessibilityIssue[] = []

      // Check for missing alt text on images
      const images = document.querySelectorAll('img')
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-hidden')) {
          foundIssues.push({
            id: `img-alt-${index}`,
            type: 'error',
            severity: 'critical',
            rule: 'WCAG 1.1.1',
            element: `img[src="${img.src.substring(0, 50)}..."]`,
            description: 'Image missing alternative text',
            recommendation: 'Add descriptive alt text or aria-hidden="true" for decorative images',
            wcagLevel: 'A'
          })
        }
      })

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let lastLevel = 0
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1))
        if (level > lastLevel + 1 && lastLevel !== 0) {
          foundIssues.push({
            id: `heading-${index}`,
            type: 'error',
            severity: 'moderate',
            rule: 'WCAG 1.3.1',
            element: `${heading.tagName}: "${heading.textContent?.substring(0, 30)}..."`,
            description: 'Heading levels should not be skipped',
            recommendation: 'Use heading levels in sequential order (h1, h2, h3, etc.)',
            wcagLevel: 'A'
          })
        }
        lastLevel = level
      })

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button')
      buttons.forEach((button, index) => {
        const hasText = button.textContent?.trim()
        const hasAriaLabel = button.getAttribute('aria-label')
        const hasAriaLabelledBy = button.getAttribute('aria-labelledby')
        
        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          foundIssues.push({
            id: `button-${index}`,
            type: 'error',
            severity: 'critical',
            rule: 'WCAG 4.1.2',
            element: `button[class="${button.className.substring(0, 30)}..."]`,
            description: 'Button missing accessible name',
            recommendation: 'Add visible text, aria-label, or aria-labelledby attribute',
            wcagLevel: 'A'
          })
        }
      })

      // Check for form labels
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach((input, index) => {
        const id = input.getAttribute('id')
        const hasLabel = id && document.querySelector(`label[for="${id}"]`)
        const hasAriaLabel = input.getAttribute('aria-label')
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby')
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          foundIssues.push({
            id: `input-${index}`,
            type: 'error',
            severity: 'critical',
            rule: 'WCAG 3.3.2',
            element: `${input.tagName.toLowerCase()}[type="${input.getAttribute('type') || 'text'}"]`,
            description: 'Form control missing label',
            recommendation: 'Associate with a label element or add aria-label attribute',
            wcagLevel: 'A'
          })
        }
      })

      // Check for sufficient color contrast (simplified check)
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button')
      textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Simple check for very light text on light backgrounds (this is a basic implementation)
        if (color.includes('rgb(255') && backgroundColor.includes('rgb(255')) {
          foundIssues.push({
            id: `contrast-${index}`,
            type: 'warning',
            severity: 'moderate',
            rule: 'WCAG 1.4.3',
            element: `${element.tagName.toLowerCase()}: "${element.textContent?.substring(0, 20)}..."`,
            description: 'Potential color contrast issue',
            recommendation: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)',
            wcagLevel: 'AA'
          })
        }
      })

      // Check for keyboard focusability
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]')
      interactiveElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex')
        if (tabIndex === '-1' && !element.getAttribute('aria-hidden')) {
          foundIssues.push({
            id: `focus-${index}`,
            type: 'warning',
            severity: 'moderate',
            rule: 'WCAG 2.1.1',
            element: `${element.tagName.toLowerCase()}[tabindex="-1"]`,
            description: 'Interactive element not keyboard accessible',
            recommendation: 'Remove tabindex="-1" or ensure element is not meant to be interactive',
            wcagLevel: 'A'
          })
        }
      })

      // Check for missing language attribute
      if (!document.documentElement.getAttribute('lang')) {
        foundIssues.push({
          id: 'lang-missing',
          type: 'error',
          severity: 'moderate',
          rule: 'WCAG 3.1.1',
          element: 'html',
          description: 'Page missing language attribute',
          recommendation: 'Add lang attribute to html element (e.g., lang="en")',
          wcagLevel: 'A'
        })
      }

      setIssues(foundIssues)
      setIsScanning(false)
    }

    // Run initial check
    runAccessibilityCheck()

    // Re-run check when DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(runAccessibilityCheck, 1000) // Debounce
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })

    return () => observer.disconnect()
  }, [enabled])

  if (!enabled || !showResults) return null

  const criticalIssues = issues.filter(issue => issue.severity === 'critical')
  const moderateIssues = issues.filter(issue => issue.severity === 'moderate')
  const minorIssues = issues.filter(issue => issue.severity === 'minor')

  return (
    <div className="fixed bottom-20 left-4 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          px-4 py-2 rounded-lg shadow-lg text-white font-medium transition-all duration-300
          ${criticalIssues.length > 0 
            ? 'bg-red-500 hover:bg-red-600' 
            : moderateIssues.length > 0 
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-green-500 hover:bg-green-600'
          }
        `}
        aria-label={`Accessibility checker: ${issues.length} issues found`}
        aria-expanded={showPanel}
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>A11y: {issues.length}</span>
          {isScanning && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
        </div>
      </button>

      {/* Results Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: -300, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -300, y: 20 }}
            className="absolute bottom-16 left-0 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Accessibility Report
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                WCAG 2.1 Compliance Check
              </p>
            </div>

            <div className="overflow-y-auto max-h-80">
              {issues.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="text-green-500 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">No issues found!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your page appears to be accessible
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Critical Issues */}
                  {criticalIssues.length > 0 && (
                    <div>
                      <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2 border-l-4 border-red-500">
                        <h4 className="font-medium text-red-800 dark:text-red-300">
                          Critical Issues ({criticalIssues.length})
                        </h4>
                      </div>
                      {criticalIssues.map((issue) => (
                        <IssueItem key={issue.id} issue={issue} />
                      ))}
                    </div>
                  )}

                  {/* Moderate Issues */}
                  {moderateIssues.length > 0 && (
                    <div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 border-l-4 border-yellow-500">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                          Moderate Issues ({moderateIssues.length})
                        </h4>
                      </div>
                      {moderateIssues.map((issue) => (
                        <IssueItem key={issue.id} issue={issue} />
                      ))}
                    </div>
                  )}

                  {/* Minor Issues */}
                  {minorIssues.length > 0 && (
                    <div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">
                          Minor Issues ({minorIssues.length})
                        </h4>
                      </div>
                      {minorIssues.map((issue) => (
                        <IssueItem key={issue.id} issue={issue} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const IssueItem: React.FC<{ issue: AccessibilityIssue }> = ({ issue }) => {
  const [expanded, setExpanded] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getTypeColor(issue.type)}`}>
                {issue.rule}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                WCAG {issue.wcagLevel}
              </span>
            </div>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {issue.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {issue.element}
            </p>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recommendation:
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {issue.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}