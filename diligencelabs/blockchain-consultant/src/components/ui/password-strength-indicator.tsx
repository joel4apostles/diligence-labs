"use client"

import { useState, useEffect } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { getPasswordStrengthColor, getPasswordStrengthLabel } from "@/lib/password-security"

interface PasswordStrengthResult {
  score: number
  feedback: {
    warning: string
    suggestions: string[]
  }
  crackTime: string
  isValid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumbers: boolean
    hasSpecialChars: boolean
    noCommonPatterns: boolean
    notTooSimilarToEmail: boolean
  }
}

interface PasswordStrengthIndicatorProps {
  password: string
  email?: string
  showRequirements?: boolean
  className?: string
}

export function PasswordStrengthIndicator({ 
  password, 
  email, 
  showRequirements = true,
  className = "" 
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!password) {
      setStrength(null)
      return
    }

    const checkPasswordStrength = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/auth/check-password-strength', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password, email }),
        })

        if (response.ok) {
          const data = await response.json()
          setStrength(data.strength)
        }
      } catch (error) {
        console.error('Password strength check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(checkPasswordStrength, 300)
    return () => clearTimeout(debounceTimer)
  }, [password, email])

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Meter */}
      {strength && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Password Strength</span>
            <span 
              className="font-medium" 
              style={{ color: getPasswordStrengthColor(strength.score) }}
            >
              {getPasswordStrengthLabel(strength.score)}
            </span>
          </div>
          
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  level <= strength.score
                    ? 'opacity-100'
                    : 'opacity-20'
                }`}
                style={{
                  backgroundColor: level <= strength.score 
                    ? getPasswordStrengthColor(strength.score)
                    : '#374151'
                }}
              />
            ))}
          </div>

          {/* Crack Time Display */}
          {strength.crackTime && (
            <p className="text-xs text-gray-500">
              Time to crack: {strength.crackTime}
            </p>
          )}

          {/* Primary Warning (Length Priority) */}
          {strength.feedback.warning && (
            <div className={`flex items-start space-x-2 text-xs p-2 rounded border ${
              strength.feedback.warning.includes('characters long') 
                ? 'text-red-400 bg-red-400/10 border-red-400/20' 
                : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
            }`}>
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{strength.feedback.warning}</span>
            </div>
          )}

          {/* Suggestions */}
          {strength.feedback.suggestions.length > 0 && (
            <div className="space-y-1">
              {strength.feedback.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs text-blue-400 bg-blue-400/10 p-2 rounded border border-blue-400/20">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requirements Checklist */}
      {showRequirements && strength && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Password Requirements</h4>
          <div className="grid grid-cols-1 gap-2">
            <RequirementItem
              met={strength.requirements.minLength}
              text="At least 8 characters long"
              priority={true}
            />
            <RequirementItem
              met={strength.requirements.hasUppercase}
              text="Contains uppercase letter (A-Z)"
            />
            <RequirementItem
              met={strength.requirements.hasLowercase}
              text="Contains lowercase letter (a-z)"
            />
            <RequirementItem
              met={strength.requirements.hasNumbers}
              text="Contains number (0-9)"
            />
            <RequirementItem
              met={strength.requirements.hasSpecialChars}
              text="Contains special character (!@#$%^&*)"
            />
            <RequirementItem
              met={strength.requirements.noCommonPatterns}
              text="Not a common password"
            />
            {email && (
              <RequirementItem
                met={strength.requirements.notTooSimilarToEmail}
                text="Not similar to your email"
              />
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
          <span>Checking password strength...</span>
        </div>
      )}
    </div>
  )
}

interface RequirementItemProps {
  met: boolean
  text: string
  priority?: boolean
}

function RequirementItem({ met, text, priority = false }: RequirementItemProps) {
  const getTextColor = () => {
    if (met) return 'text-green-400'
    if (priority) return 'text-red-400'
    return 'text-gray-500'
  }

  const getIconColor = () => {
    if (met) return 'text-green-400'
    if (priority) return 'text-red-400'
    return 'text-gray-500'
  }

  return (
    <div className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${
      getTextColor()
    } ${priority ? 'font-medium' : ''}`}>
      {met ? (
        <Check className={`w-3 h-3 ${getIconColor()}`} />
      ) : (
        <X className={`w-3 h-3 ${getIconColor()}`} />
      )}
      <span>{text}</span>
    </div>
  )
}