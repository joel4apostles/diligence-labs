export interface PasswordStrengthResult {
  score: number // 0-4 (0 = terrible, 4 = great)
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

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  minStrengthScore: number
  blockedPasswords: string[]
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minStrengthScore: 3, // Requires "good" or "great" password
  blockedPasswords: [
    'password',
    'password123',
    '12345678',
    'qwerty',
    'abc123',
    'admin',
    'login',
    'welcome',
    'letmein',
    'monkey',
    'dragon',
    'pass',
    'master'
  ]
}

export function validatePasswordStrength(
  password: string, 
  email?: string, 
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordStrengthResult {
  
  // Check basic requirements
  const hasMinLength = password.length >= requirements.minLength
  const hasUppercase = requirements.requireUppercase ? /[A-Z]/.test(password) : true
  const hasLowercase = requirements.requireLowercase ? /[a-z]/.test(password) : true
  const hasNumbers = requirements.requireNumbers ? /[0-9]/.test(password) : true
  const hasSpecialChars = requirements.requireSpecialChars ? /[^A-Za-z0-9]/.test(password) : true
  
  // Check for common patterns and similarity to email
  const lowercasePassword = password.toLowerCase()
  const emailLocal = email ? email.split('@')[0].toLowerCase() : ''
  const notTooSimilarToEmail = !email || !emailLocal || !lowercasePassword.includes(emailLocal)
  
  // Check against blocked passwords
  const isNotBlocked = !requirements.blockedPasswords.some(blocked => 
    lowercasePassword === blocked.toLowerCase() || 
    lowercasePassword.includes(blocked.toLowerCase())
  )
  const noCommonPatterns = isNotBlocked

  // Basic score calculation without zxcvbn for now
  let score = 0
  if (hasMinLength) score++
  if (hasUppercase) score++
  if (hasLowercase) score++
  if (hasNumbers) score++
  if (hasSpecialChars && noCommonPatterns) score++
  
  const meetsCrackTimeRequirement = score >= requirements.minStrengthScore
  
  const requirementsMet = {
    minLength: hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialChars,
    noCommonPatterns,
    notTooSimilarToEmail
  }

  const isValid = Object.values(requirementsMet).every(Boolean) && meetsCrackTimeRequirement

  // Generate specific feedback based on what's missing
  let warning = ''
  const suggestions: string[] = []

  // Prioritize length requirement
  if (!hasMinLength) {
    warning = `Password must be at least ${requirements.minLength} characters long`
    suggestions.push(`Add ${requirements.minLength - password.length} more characters to meet minimum length`)
  } else if (!meetsCrackTimeRequirement || !isValid) {
    if (!hasUppercase && requirements.requireUppercase) {
      suggestions.push('Add at least one uppercase letter (A-Z)')
    }
    if (!hasLowercase && requirements.requireLowercase) {
      suggestions.push('Add at least one lowercase letter (a-z)')
    }
    if (!hasNumbers && requirements.requireNumbers) {
      suggestions.push('Add at least one number (0-9)')
    }
    if (!hasSpecialChars && requirements.requireSpecialChars) {
      suggestions.push('Add at least one special character (!@#$%^&*)')
    }
    if (!noCommonPatterns) {
      suggestions.push('Avoid common passwords and patterns')
    }
    if (!notTooSimilarToEmail && email) {
      suggestions.push('Make your password different from your email address')
    }

    if (suggestions.length > 0) {
      warning = 'Password needs improvement'
    } else if (score < requirements.minStrengthScore) {
      warning = 'Password strength is too low'
      suggestions.push('Use a more complex password')
    }
  }

  return {
    score: Math.min(score, 4),
    feedback: {
      warning,
      suggestions
    },
    crackTime: score < 2 ? 'less than a day' : score < 3 ? 'days' : score < 4 ? 'months' : 'centuries',
    isValid,
    requirements: requirementsMet
  }
}

export function getPasswordRequirementsList(requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS): string[] {
  const reqList: string[] = []
  
  reqList.push(`At least ${requirements.minLength} characters long`)
  
  if (requirements.requireUppercase) {
    reqList.push('Contains at least one uppercase letter (A-Z)')
  }
  
  if (requirements.requireLowercase) {
    reqList.push('Contains at least one lowercase letter (a-z)')
  }
  
  if (requirements.requireNumbers) {
    reqList.push('Contains at least one number (0-9)')
  }
  
  if (requirements.requireSpecialChars) {
    reqList.push('Contains at least one special character (!@#$%^&*)')
  }
  
  reqList.push('Not a common password or similar to your email')
  reqList.push('Strong enough to resist automated attacks')
  
  return reqList
}

export function getPasswordStrengthColor(score: number): string {
  const colors = {
    0: '#ef4444', // red - terrible
    1: '#f97316', // orange - bad  
    2: '#eab308', // yellow - weak
    3: '#22c55e', // green - good
    4: '#10b981'  // emerald - great
  }
  return colors[score as keyof typeof colors] || '#6b7280'
}

export function getPasswordStrengthLabel(score: number): string {
  const labels = {
    0: 'Very Weak',
    1: 'Weak', 
    2: 'Fair',
    3: 'Good',
    4: 'Strong'
  }
  return labels[score as keyof typeof labels] || 'Unknown'
}

