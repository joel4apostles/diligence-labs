#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🔄 Creating database migration for AdminKey model...')

try {
  // Generate Prisma migration
  execSync('npx prisma migrate dev --name add_admin_key_model', { 
    stdio: 'inherit',
    cwd: process.cwd()
  })
  
  console.log('✅ AdminKey migration created successfully!')
  console.log('📝 Migration includes:')
  console.log('   - AdminKey table with dynamic key management')
  console.log('   - Expiration and usage tracking')
  console.log('   - Performance indexes')
  
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  console.log('📋 Manual steps:')
  console.log('   1. Run: npx prisma migrate dev --name add_admin_key_model')
  console.log('   2. Run: npx prisma generate')
  process.exit(1)
}