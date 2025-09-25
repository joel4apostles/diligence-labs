"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, X, AlertCircle, Shield } from "lucide-react"
import { getPasswordStrengthColor, getPasswordStrengthLabel, validatePasswordStrength } from "@/lib/password-security"

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
  const [serverStrength, setServerStrength] = useState<PasswordStrengthResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Client-side immediate calculation
  const clientStrength = useMemo(() => {
    if (!password) return null
    return validatePasswordStrength(password, email)
  }, [password, email])

  // Use client-side calculation for immediate feedback, server-side for validation
  const strength = serverStrength || clientStrength

  useEffect(() => {
    if (!password) {
      setServerStrength(null)
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
          setServerStrength(data.strength)
        } else {
          // Fallback to client-side calculation on API failure
          setServerStrength(null)
        }
      } catch (error) {
        console.error('Password strength check failed:', error)
        // Fallback to client-side calculation on error
        setServerStrength(null)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(checkPasswordStrength, 500)
    return () => clearTimeout(debounceTimer)
  }, [password, email])

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Meter */}
      {strength && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Password Strength</span>
              {isLoading && (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
              )}
            </div>
            <span 
              className="font-medium transition-colors duration-300" 
              style={{ color: getPasswordStrengthColor(strength.score) }}
            >
              {getPasswordStrengthLabel(strength.score)}
            </span>
          </div>
          
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ease-out ${
                  level <= strength.score
                    ? 'opacity-100 scale-100'
                    : 'opacity-20 scale-95'
                }`}
                style={{
                  backgroundColor: level <= strength.score 
                    ? getPasswordStrengthColor(strength.score)
                    : '#374151',
                  transform: `scaleY(${level <= strength.score ? 1 : 0.7})`
                }}
              />
            ))}
          </div>

          {/* Crack Time Display */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Time to crack: <span className="font-medium text-gray-400">{strength.crackTime}</span>
            </span>
            {strength.score >= 3 && (
              <span className="text-green-400 font-medium">✓ Strong</span>
            )}
          </div>

          {/* Primary Warning (Length Priority) */}
          {strength.feedback.warning && (
            <div className={`flex items-start space-x-2 text-xs p-3 rounded-lg border transition-all duration-300 ${
              strength.feedback.warning.includes('characters long') 
                ? 'text-red-400 bg-red-400/10 border-red-400/20 animate-pulse' 
                : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{strength.feedback.warning}</span>
            </div>
          )}

          {/* Suggestions */}
          {strength.feedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-400">Suggestions:</h5>
              <div className="space-y-1">
                {strength.feedback.suggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs text-blue-400 bg-blue-400/10 p-2 rounded-lg border border-blue-400/20 hover:bg-blue-400/20 transition-colors duration-200">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requirements Checklist */}
      {showRequirements && strength && (
        <div className="space-y-3 pt-2 border-t border-gray-700/50">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <span>Password Requirements</span>
            <span className="text-xs text-gray-500">
              ({Object.values(strength.requirements).filter(Boolean).length}/{Object.values(strength.requirements).length})
            </span>
          </h4>
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

      {/* Overall Status */}
      {strength && (
        <div className={`flex items-center space-x-2 text-sm p-2 rounded-lg border transition-all duration-300 ${
          strength.isValid 
            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
            : 'text-orange-400 bg-orange-400/10 border-orange-400/20'
        }`}>
          {strength.isValid ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span className="font-medium">
            {strength.isValid ? 'Password meets all requirements' : 'Password needs improvement'}
          </span>
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

  const getBgColor = () => {
    if (met) return 'bg-green-400/10 border-green-400/20'
    if (priority) return 'bg-red-400/10 border-red-400/20'
    return 'bg-gray-500/10 border-gray-500/20'
  }

  return (
    <div className={`flex items-center space-x-3 text-xs p-2 rounded-lg border transition-all duration-300 ${
      getBgColor()
    } ${getTextColor()} ${priority ? 'font-medium' : ''} ${
      met ? 'scale-100 opacity-100' : 'scale-98 opacity-80'
    }`}>
      <div className={`flex-shrink-0 transition-all duration-300 ${
        met ? 'scale-110' : 'scale-100'
      }`}>
        {met ? (
          <Check className={`w-4 h-4 ${getIconColor()}`} />
        ) : (
          <X className={`w-4 h-4 ${getIconColor()}`} />
        )}
      </div>
      <span className="flex-1">{text}</span>
      {met && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}