"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'

// ==================== BIOMETRIC AUTHENTICATION ====================
interface BiometricAuthProps {
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess, onError }) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setIsSupported(true)
    }
  }, [])

  const handleBiometricAuth = async () => {
    if (!isSupported) {
      onError('Biometric authentication is not supported on this device')
      return
    }

    setIsLoading(true)

    try {
      // Create credential options
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "Diligence Labs",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      })

      if (credential) {
        onSuccess(credential)
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      onError('Biometric authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-4"
    >
      <motion.button
        onClick={handleBiometricAuth}
        disabled={isLoading}
        className="relative p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="fingerprint"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-400 text-center"
      >
        Touch the fingerprint sensor or use Face ID
      </motion.p>
    </motion.div>
  )
}

// ==================== PASSKEY AUTHENTICATION ====================
export const PasskeyAuth: React.FC<BiometricAuthProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(!!window.PublicKeyCredential)
  }, [])

  const handlePasskeyAuth = async () => {
    setIsLoading(true)

    try {
      // Get existing credential
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: "required"
        }
      })

      if (credential) {
        onSuccess(credential)
      }
    } catch (error) {
      console.error('Passkey authentication failed:', error)
      onError('Passkey authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) return null

  return (
    <Button
      onClick={handlePasskeyAuth}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Authenticating...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Use Passkey
        </div>
      )}
    </Button>
  )
}

// ==================== SOCIAL LOGIN WITH ENHANCED UX ====================
interface SocialLoginProps {
  provider: 'google' | 'github' | 'twitter' | 'linkedin'
  onLogin: (provider: string) => void
  isLoading?: boolean
}

export const EnhancedSocialLogin: React.FC<SocialLoginProps> = ({
  provider,
  onLogin,
  isLoading = false
}) => {
  const providerConfig = {
    google: {
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    github: {
      name: 'GitHub',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      color: 'from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
    },
    twitter: {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'from-black to-gray-800 hover:from-gray-800 hover:to-black'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    }
  }

  const config = providerConfig[provider]

  return (
    <motion.button
      onClick={() => onLogin(provider)}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
        bg-gradient-to-r ${config.color} text-white font-medium
        transform transition-all duration-200 hover:scale-[1.02]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {config.icon}
          </motion.div>
        )}
      </AnimatePresence>
      
      <span>
        {isLoading ? 'Connecting...' : `Continue with ${config.name}`}
      </span>
    </motion.button>
  )
}

// ==================== SMART PASSWORD FIELD ====================
interface SmartPasswordFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showStrength?: boolean
}

export const SmartPasswordField: React.FC<SmartPasswordFieldProps> = ({
  value,
  onChange,
  placeholder = "Enter password",
  showStrength = true
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [strength, setStrength] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Calculate password strength
    let score = 0
    const newSuggestions: string[] = []

    if (value.length >= 8) score += 1
    else newSuggestions.push("Use at least 8 characters")

    if (/[A-Z]/.test(value)) score += 1
    else newSuggestions.push("Add uppercase letters")

    if (/[a-z]/.test(value)) score += 1
    else newSuggestions.push("Add lowercase letters")

    if (/[0-9]/.test(value)) score += 1
    else newSuggestions.push("Add numbers")

    if (/[^A-Za-z0-9]/.test(value)) score += 1
    else newSuggestions.push("Add special characters")

    setStrength(score)
    setSuggestions(newSuggestions)
  }, [value])

  const strengthColors = {
    0: 'bg-red-500',
    1: 'bg-red-400',
    2: 'bg-yellow-500',
    3: 'bg-yellow-400',
    4: 'bg-green-400',
    5: 'bg-green-500'
  }

  const strengthLabels = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
    5: 'Very Strong'
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
        />
        
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <motion.div
            initial={false}
            animate={{ scale: isVisible ? 1.1 : 1 }}
            transition={{ duration: 0.1 }}
          >
            {isVisible ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.div>
        </button>
      </div>

      {showStrength && value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-300 ${strengthColors[strength as keyof typeof strengthColors]}`}
                initial={{ width: 0 }}
                animate={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {strengthLabels[strength as keyof typeof strengthLabels]}
            </span>
          </div>

          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-400"
            >
              <p className="mb-1">Suggestions:</p>
              <ul className="space-y-1">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <motion.li
                    key={suggestion}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-gray-500 rounded-full" />
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}