"use client"

import React, { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibility } from './accessibility'

// Accessible Input Component
export const AccessibleInput: React.FC<{
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helpText?: string
  errorMessage?: string
  className?: string
  autoComplete?: string
  pattern?: string
  minLength?: number
  maxLength?: number
}> = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  errorMessage,
  className = '',
  autoComplete,
  pattern,
  minLength,
  maxLength
}) => {
  const id = useId()
  const helpId = useId()
  const errorId = useId()
  const [isFocused, setIsFocused] = useState(false)
  const { announceToScreenReader } = useAccessibility()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (helpText) {
      announceToScreenReader(helpText)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (errorMessage) {
      announceToScreenReader(`Error: ${errorMessage}`)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className={`block text-sm font-medium text-gray-300 ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200
            ${errorMessage 
              ? 'border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-600 bg-gray-800/50 focus:border-orange-500 focus:ring-orange-500'
            }
            text-white placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused ? 'ring-2' : ''}
          `}
          aria-describedby={`${helpText ? helpId : ''} ${errorMessage ? errorId : ''}`.trim()}
          aria-invalid={!!errorMessage}
        />
        
        {/* Focus indicator for better visibility */}
        {isFocused && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 rounded-lg border-2 border-orange-400 pointer-events-none"
          />
        )}
      </div>

      {helpText && (
        <p id={helpId} className="text-sm text-gray-400">
          {helpText}
        </p>
      )}

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          id={errorId}
          className="text-sm text-red-400 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </motion.p>
      )}
    </div>
  )
}

// Accessible Textarea Component
export const AccessibleTextarea: React.FC<{
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helpText?: string
  errorMessage?: string
  className?: string
  rows?: number
  minLength?: number
  maxLength?: number
}> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  errorMessage,
  className = '',
  rows = 4,
  minLength,
  maxLength
}) => {
  const id = useId()
  const helpId = useId()
  const errorId = useId()
  const [isFocused, setIsFocused] = useState(false)
  const { announceToScreenReader } = useAccessibility()

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (helpText) {
      announceToScreenReader(helpText)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (errorMessage) {
      announceToScreenReader(`Error: ${errorMessage}`)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className={`block text-sm font-medium text-gray-300 ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          minLength={minLength}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-vertical
            ${errorMessage 
              ? 'border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-600 bg-gray-800/50 focus:border-orange-500 focus:ring-orange-500'
            }
            text-white placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused ? 'ring-2' : ''}
          `}
          aria-describedby={`${helpText ? helpId : ''} ${errorMessage ? errorId : ''}`.trim()}
          aria-invalid={!!errorMessage}
        />
        
        {/* Character count for long text fields */}
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {helpText && (
        <p id={helpId} className="text-sm text-gray-400">
          {helpText}
        </p>
      )}

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          id={errorId}
          className="text-sm text-red-400 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </motion.p>
      )}
    </div>
  )
}

// Accessible Select Component
export const AccessibleSelect: React.FC<{
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; disabled?: boolean }>
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helpText?: string
  errorMessage?: string
  className?: string
}> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  errorMessage,
  className = ''
}) => {
  const id = useId()
  const helpId = useId()
  const errorId = useId()
  const [isFocused, setIsFocused] = useState(false)
  const { announceToScreenReader } = useAccessibility()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
    const selectedOption = options.find(opt => opt.value === e.target.value)
    if (selectedOption) {
      announceToScreenReader(`Selected: ${selectedOption.label}`)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (helpText) {
      announceToScreenReader(helpText)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (errorMessage) {
      announceToScreenReader(`Error: ${errorMessage}`)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className={`block text-sm font-medium text-gray-300 ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none
            ${errorMessage 
              ? 'border-red-500 bg-red-50/10 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-600 bg-gray-800/50 focus:border-orange-500 focus:ring-orange-500'
            }
            text-white
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFocused ? 'ring-2' : ''}
          `}
          aria-describedby={`${helpText ? helpId : ''} ${errorMessage ? errorId : ''}`.trim()}
          aria-invalid={!!errorMessage}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-gray-800 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {helpText && (
        <p id={helpId} className="text-sm text-gray-400">
          {helpText}
        </p>
      )}

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          id={errorId}
          className="text-sm text-red-400 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMessage}
        </motion.p>
      )}
    </div>
  )
}

// Accessible Checkbox Component
export const AccessibleCheckbox: React.FC<{
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  helpText?: string
  className?: string
}> = ({
  label,
  checked,
  onChange,
  disabled = false,
  helpText,
  className = ''
}) => {
  const id = useId()
  const helpId = useId()
  const { announceToScreenReader } = useAccessibility()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
    announceToScreenReader(`${label} ${e.target.checked ? 'checked' : 'unchecked'}`)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="
            mt-1 h-4 w-4 text-orange-500 border-gray-600 rounded
            focus:ring-orange-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-gray-800 border-2
          "
          aria-describedby={helpText ? helpId : undefined}
        />
        <label 
          htmlFor={id}
          className="ml-3 text-sm text-gray-300 cursor-pointer"
        >
          {label}
        </label>
      </div>

      {helpText && (
        <p id={helpId} className="text-sm text-gray-400 ml-7">
          {helpText}
        </p>
      )}
    </div>
  )
}

// Form Validation Hook
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { announceToScreenReader } = useAccessibility()

  const validateField = (
    name: string,
    value: string,
    rules: {
      required?: boolean
      email?: boolean
      minLength?: number
      maxLength?: number
      pattern?: RegExp
      custom?: (value: string) => string | null
    }
  ): string | null => {
    if (rules.required && !value.trim()) {
      return `${name} is required`
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address'
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name} must be no more than ${rules.maxLength} characters`
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return `${name} format is invalid`
    }

    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }

  const setFieldError = (field: string, error: string | null) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[field] = error
        announceToScreenReader(`Error in ${field}: ${error}`)
      } else {
        delete newErrors[field]
      }
      return newErrors
    })
  }

  const clearErrors = () => {
    setErrors({})
  }

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    validateField,
    setFieldError,
    clearErrors,
    hasErrors
  }
}