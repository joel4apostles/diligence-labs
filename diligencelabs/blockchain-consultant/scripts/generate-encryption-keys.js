#!/usr/bin/env node

/**
 * Encryption Key Generation Script
 * Generates secure cryptographic keys for production deployment
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

console.log('🔐 Generating secure encryption keys...\n')

// Generate master encryption key (256-bit)
const masterKey = crypto.randomBytes(32).toString('hex')
console.log('ENCRYPTION_MASTER_KEY=' + masterKey)

// Generate key derivation salt (256-bit)
const derivationSalt = crypto.randomBytes(32).toString('hex')
console.log('KEY_DERIVATION_SALT=' + derivationSalt)

// Generate NextAuth secret if not provided
const nextAuthSecret = crypto.randomBytes(32).toString('base64')
console.log('NEXTAUTH_SECRET=' + nextAuthSecret)

console.log('\n📋 Add these to your .env file for production deployment')
console.log('⚠️  NEVER commit these keys to version control!')
console.log('📦 Store them securely in your deployment platform (Vercel, AWS, etc.)')

// Optionally write to .env.local for development
const envLocalPath = path.join(__dirname, '..', '.env.local')
const envContent = `
# Generated encryption keys - DO NOT COMMIT
ENCRYPTION_MASTER_KEY="${masterKey}"
KEY_DERIVATION_SALT="${derivationSalt}"
NEXTAUTH_SECRET="${nextAuthSecret}"

# Enable encryption
ENABLE_FIELD_ENCRYPTION="true"
NEXT_PUBLIC_CLIENT_ENCRYPTION_ENABLED="true"
`

if (process.argv.includes('--write-local')) {
  try {
    fs.writeFileSync(envLocalPath, envContent.trim())
    console.log('\n✅ Keys written to .env.local')
    console.log('⚠️  Remember: .env.local is gitignored but still sensitive!')
  } catch (error) {
    console.error('❌ Failed to write .env.local:', error.message)
  }
}

console.log('\n🔧 Key Generation Complete!')
console.log('\n📖 Usage:')
console.log('  node scripts/generate-encryption-keys.js              # Display keys only')
console.log('  node scripts/generate-encryption-keys.js --write-local # Write to .env.local')

console.log('\n🛡️  Security Notes:')
console.log('• These keys provide AES-256-GCM encryption for sensitive data')
console.log('• Master key encrypts PII, financial data, and consultation details')
console.log('• Derivation salt ensures unique encryption per data context')
console.log('• Keys should be rotated periodically in production')
console.log('• Use environment variables or secure key management services')