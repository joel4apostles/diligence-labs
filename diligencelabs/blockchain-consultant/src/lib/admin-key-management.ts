import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Temporary in-memory storage for generated keys when database is unavailable
const tempKeys = new Map<string, {
  key: string
  createdAt: Date
  expiresAt: Date | null
  createdBy: string
  isActive: boolean
  usageCount: number
  maxUsages: number | null
}>()

export interface AdminKey {
  id: string
  key: string
  createdAt: Date
  expiresAt: Date | null
  createdBy: string
  isActive: boolean
  usageCount: number
  maxUsages: number | null
}

export class AdminKeyManager {
  /**
   * Generate a cryptographically secure admin key
   */
  static generateSecureKey(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomBytes = crypto.randomBytes(length)
    let result = ''
    
    for (let i = 0; i < length; i++) {
      result += charset[randomBytes[i] % charset.length]
    }
    
    // Add prefix and format for readability
    return `DL_ADMIN_${result.slice(0, 8)}_${result.slice(8, 16)}_${result.slice(16, 24)}`
  }

  /**
   * Create a new admin registration key
   */
  static async createAdminKey(options: {
    createdBy: string
    expiresInHours?: number
    maxUsages?: number
    description?: string
  }): Promise<AdminKey> {
    const key = this.generateSecureKey()
    const expiresAt = options.expiresInHours 
      ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
      : null

    try {
      const adminKey = await prisma.adminKey.create({
        data: {
          key,
          createdBy: options.createdBy,
          expiresAt,
          maxUsages: options.maxUsages || null,
          description: options.description || `Generated on ${new Date().toLocaleString()}`,
          isActive: true,
          usageCount: 0
        }
      })

      return adminKey
    } catch (error) {
      // Fallback to temporary storage if database is not available
      console.warn('Database not available, using temporary storage for admin key')
      const tempKey = {
        key,
        createdAt: new Date(),
        expiresAt,
        createdBy: options.createdBy,
        isActive: true,
        usageCount: 0,
        maxUsages: options.maxUsages || null
      }
      
      // Store in temporary memory
      tempKeys.set(key, tempKey)
      
      return {
        id: crypto.randomUUID(),
        ...tempKey
      }
    }
  }

  /**
   * Validate an admin key
   */
  static async validateAdminKey(key: string): Promise<{ valid: boolean; key?: AdminKey; reason?: string }> {
    // First check temporary in-memory storage
    const tempKey = tempKeys.get(key)
    if (tempKey) {
      // Check if temp key is active
      if (!tempKey.isActive) {
        return { valid: false, reason: 'Invalid or expired key' }
      }

      // Check expiration
      if (tempKey.expiresAt && tempKey.expiresAt < new Date()) {
        tempKey.isActive = false
        tempKeys.set(key, tempKey)
        return { valid: false, reason: 'Key has expired' }
      }

      // Check usage limit
      if (tempKey.maxUsages && tempKey.usageCount >= tempKey.maxUsages) {
        tempKey.isActive = false
        tempKeys.set(key, tempKey)
        return { valid: false, reason: 'Key usage limit exceeded' }
      }

      // Increment usage count
      tempKey.usageCount += 1
      tempKeys.set(key, tempKey)

      return { 
        valid: true, 
        key: {
          id: crypto.randomUUID(),
          ...tempKey
        }
      }
    }

    // Fallback to environment variable if no database
    const envKey = process.env.ADMIN_ACCESS_CODE
    if (envKey && key === envKey) {
      return { valid: true }
    }

    try {
      const adminKey = await prisma.adminKey.findFirst({
        where: {
          key,
          isActive: true
        }
      })

      if (!adminKey) {
        return { valid: false, reason: 'Invalid or expired key' }
      }

      // Check expiration
      if (adminKey.expiresAt && adminKey.expiresAt < new Date()) {
        await prisma.adminKey.update({
          where: { id: adminKey.id },
          data: { isActive: false }
        })
        return { valid: false, reason: 'Key has expired' }
      }

      // Check usage limit
      if (adminKey.maxUsages && adminKey.usageCount >= adminKey.maxUsages) {
        await prisma.adminKey.update({
          where: { id: adminKey.id },
          data: { isActive: false }
        })
        return { valid: false, reason: 'Key usage limit exceeded' }
      }

      // Increment usage count
      await prisma.adminKey.update({
        where: { id: adminKey.id },
        data: { usageCount: adminKey.usageCount + 1 }
      })

      return { valid: true, key: adminKey }
    } catch (error) {
      console.error('Error validating admin key:', error)
      return { valid: false, reason: 'Validation error' }
    }
  }

  /**
   * Get all active admin keys
   */
  static async getActiveKeys(): Promise<AdminKey[]> {
    try {
      return await prisma.adminKey.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching admin keys:', error)
      return []
    }
  }

  /**
   * Deactivate an admin key
   */
  static async deactivateKey(keyId: string): Promise<boolean> {
    try {
      await prisma.adminKey.update({
        where: { id: keyId },
        data: { isActive: false }
      })
      return true
    } catch (error) {
      console.error('Error deactivating admin key:', error)
      return false
    }
  }

  /**
   * Clean up expired keys
   */
  static async cleanupExpiredKeys(): Promise<number> {
    try {
      const result = await prisma.adminKey.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true
        },
        data: { isActive: false }
      })
      return result.count
    } catch (error) {
      console.error('Error cleaning up expired keys:', error)
      return 0
    }
  }

  /**
   * Auto-rotate keys (create new and deactivate old)
   */
  static async rotateKeys(createdBy: string): Promise<AdminKey> {
    // Deactivate all existing keys
    try {
      await prisma.adminKey.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    } catch (error) {
      console.warn('Could not deactivate old keys:', error)
    }

    // Create new key
    return this.createAdminKey({
      createdBy,
      expiresInHours: 24, // Default 24-hour expiration for rotated keys
      description: `Auto-rotated key generated on ${new Date().toLocaleString()}`
    })
  }

  /**
   * Get key statistics
   */
  static async getKeyStats(): Promise<{
    totalKeys: number
    activeKeys: number
    expiredKeys: number
    usedKeys: number
  }> {
    try {
      const [total, active, expired, used] = await Promise.all([
        prisma.adminKey.count(),
        prisma.adminKey.count({ where: { isActive: true } }),
        prisma.adminKey.count({ 
          where: { 
            expiresAt: { lt: new Date() },
            isActive: false 
          } 
        }),
        prisma.adminKey.count({ where: { usageCount: { gt: 0 } } })
      ])

      return { totalKeys: total, activeKeys: active, expiredKeys: expired, usedKeys: used }
    } catch (error) {
      console.error('Error fetching key stats:', error)
      return { totalKeys: 0, activeKeys: 0, expiredKeys: 0, usedKeys: 0 }
    }
  }
}