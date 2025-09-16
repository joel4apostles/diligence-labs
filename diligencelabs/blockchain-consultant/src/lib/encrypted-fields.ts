/**
 * Database Field-Level Encryption Helpers
 * Provides transparent encryption/decryption for sensitive database fields
 */

import { encryption, type EncryptedData } from './encryption'
import { logger } from './logger'

// Define which fields should be encrypted for each model
export const ENCRYPTED_FIELDS = {
  User: {
    email: 'pii',
    name: 'pii',
    phone: 'pii',
    address: 'pii',
    walletAddress: 'financial',
    taxId: 'financial'
  },
  ConsultationSession: {
    title: 'sensitive',
    description: 'sensitive',
    projectName: 'sensitive',
    notes: 'sensitive',
    clientNotes: 'sensitive'
  },
  Subscription: {
    stripeCustomerId: 'financial',
    stripeSubscriptionId: 'financial'
  },
  PaymentIntent: {
    stripePaymentIntentId: 'financial',
    clientSecret: 'financial'
  }
} as const

type EncryptionContext = 'pii' | 'financial' | 'sensitive'

/**
 * Encrypt a field value before storing in database
 */
export function encryptField(
  value: string | null | undefined,
  fieldType: EncryptionContext,
  userId?: string,
  sessionId?: string
): string | null {
  if (!value) return null

  try {
    let encryptedData: EncryptedData

    switch (fieldType) {
      case 'pii':
        encryptedData = encryption.encryptPII(value, userId)
        break
      case 'financial':
        encryptedData = encryption.encryptFinancial(value, userId)
        break
      case 'sensitive':
        if (sessionId) {
          encryptedData = encryption.encryptConsultation(value, sessionId, userId)
        } else {
          encryptedData = encryption.encrypt(value, 'sensitive', 'sensitive')
        }
        break
      default:
        throw new Error(`Unknown encryption type: ${fieldType}`)
    }

    // Store as JSON string in database
    return JSON.stringify(encryptedData)
  } catch (error) {
    logger.error('Field encryption failed', { fieldType, userId, sessionId }, error as Error)
    throw new Error('Failed to encrypt sensitive field')
  }
}

/**
 * Decrypt a field value after retrieving from database
 */
export function decryptField(
  encryptedValue: string | null | undefined,
  fieldType: EncryptionContext,
  userId?: string,
  sessionId?: string
): string | null {
  if (!encryptedValue) return null

  try {
    const encryptedData: EncryptedData = JSON.parse(encryptedValue)

    switch (fieldType) {
      case 'pii':
        return encryption.decryptPII(encryptedData, userId)
      case 'financial':
        return encryption.decryptFinancial(encryptedData, userId)
      case 'sensitive':
        if (sessionId) {
          return encryption.decryptConsultation(encryptedData, sessionId, userId)
        } else {
          return encryption.decrypt(encryptedData, 'sensitive')
        }
      default:
        throw new Error(`Unknown decryption type: ${fieldType}`)
    }
  } catch (error) {
    logger.error('Field decryption failed', { fieldType, userId, sessionId }, error as Error)
    // Return null instead of throwing to prevent app crashes with corrupted data
    return null
  }
}

/**
 * Encrypt multiple fields in a data object
 */
export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  modelName: keyof typeof ENCRYPTED_FIELDS,
  userId?: string,
  sessionId?: string
): T {
  const encryptedData = { ...data }
  const fieldsConfig = ENCRYPTED_FIELDS[modelName]

  if (!fieldsConfig) {
    logger.warn('No encryption configuration found for model', { modelName })
    return encryptedData
  }

  for (const [fieldName, fieldType] of Object.entries(fieldsConfig)) {
    if (fieldName in encryptedData && encryptedData[fieldName]) {
      const value = encryptedData[fieldName] as string
      encryptedData[fieldName] = encryptField(value, fieldType as EncryptionContext, userId, sessionId) as T[keyof T]
    }
  }

  return encryptedData
}

/**
 * Decrypt multiple fields in a data object
 */
export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  modelName: keyof typeof ENCRYPTED_FIELDS,
  userId?: string,
  sessionId?: string
): T {
  const decryptedData = { ...data }
  const fieldsConfig = ENCRYPTED_FIELDS[modelName]

  if (!fieldsConfig) {
    logger.warn('No decryption configuration found for model', { modelName })
    return decryptedData
  }

  for (const [fieldName, fieldType] of Object.entries(fieldsConfig)) {
    if (fieldName in decryptedData && decryptedData[fieldName]) {
      const value = decryptedData[fieldName] as string
      decryptedData[fieldName] = decryptField(value, fieldType as EncryptionContext, userId, sessionId) as T[keyof T]
    }
  }

  return decryptedData
}

/**
 * Prisma middleware to automatically encrypt/decrypt fields
 */
export function createEncryptionMiddleware() {
  return async (params: { model: string; action: string; args: Record<string, unknown> }, next: (params: unknown) => Promise<unknown>) => {
    const { model, action, args } = params

    // Skip if no encryption config for this model
    if (!ENCRYPTED_FIELDS[model as keyof typeof ENCRYPTED_FIELDS]) {
      return next(params)
    }

    try {
      // Encrypt data before create/update operations
      if (['create', 'update', 'upsert'].includes(action) && args.data) {
        const userId = args.data.userId || args.where?.userId
        const sessionId = args.data.sessionId || args.data.id

        if (action === 'upsert') {
          if (args.create) {
            args.create = encryptFields(args.create, model, userId, sessionId)
          }
          if (args.update) {
            args.update = encryptFields(args.update, model, userId, sessionId)
          }
        } else {
          args.data = encryptFields(args.data, model, userId, sessionId)
        }
      }

      // Execute the query
      const result = await next(params)

      // Decrypt data after read operations
      if (['findUnique', 'findFirst', 'findMany'].includes(action) && result) {
        if (Array.isArray(result)) {
          return result.map((item: Record<string, unknown>) => {
            const userId = item.userId
            const sessionId = item.sessionId || item.id
            return decryptFields(item, model, userId, sessionId)
          })
        } else {
          const userId = result.userId
          const sessionId = result.sessionId || result.id
          return decryptFields(result, model, userId, sessionId)
        }
      }

      return result
    } catch (error) {
      logger.error('Encryption middleware error', { model, action }, error as Error)
      throw error
    }
  }
}

/**
 * Search encrypted fields (for admin/debugging purposes)
 * Note: This is computationally expensive as it requires decrypting all records
 */
export async function searchEncryptedField<T>(
  prisma: Record<string, unknown>,
  model: string,
  fieldName: string,
  searchValue: string,
  limit: number = 100
): Promise<T[]> {
  try {
    logger.warn('Performing encrypted field search', { model, fieldName, limit })
    
    // Get all records (limited)
    const records = await prisma[model].findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Decrypt and filter
    const results: T[] = []
    
    for (const record of records) {
      try {
        const modelConfig = ENCRYPTED_FIELDS[model as keyof typeof ENCRYPTED_FIELDS]
        if (!modelConfig || !modelConfig[fieldName as keyof typeof modelConfig]) {
          continue
        }

        const fieldType = modelConfig[fieldName as keyof typeof modelConfig] as EncryptionContext
        const userId = record.userId
        const sessionId = record.sessionId || record.id
        
        const decryptedValue = decryptField(record[fieldName], fieldType, userId, sessionId)
        
        if (decryptedValue && decryptedValue.toLowerCase().includes(searchValue.toLowerCase())) {
          const decryptedRecord = decryptFields(record, model as keyof typeof ENCRYPTED_FIELDS, userId, sessionId)
          results.push(decryptedRecord as T)
        }
      } catch {
        // Skip records that can't be decrypted
        logger.debug('Skipping record during encrypted search', { recordId: record.id })
        continue
      }
    }

    logger.info('Encrypted field search completed', { 
      model, 
      fieldName, 
      searchValue: '[REDACTED]', 
      totalRecords: records.length, 
      matchingRecords: results.length 
    })

    return results
  } catch (error) {
    logger.error('Encrypted field search failed', { model, fieldName }, error as Error)
    throw new Error('Search operation failed')
  }
}

/**
 * Utility to check if a field is configured for encryption
 */
export function isEncryptedField(modelName: string, fieldName: string): boolean {
  const config = ENCRYPTED_FIELDS[modelName as keyof typeof ENCRYPTED_FIELDS]
  return config ? fieldName in config : false
}

/**
 * Utility to get encryption type for a field
 */
export function getFieldEncryptionType(modelName: string, fieldName: string): EncryptionContext | null {
  const config = ENCRYPTED_FIELDS[modelName as keyof typeof ENCRYPTED_FIELDS]
  return config?.[fieldName as keyof typeof config] as EncryptionContext || null
}

/**
 * Data integrity verification for encrypted fields
 */
export function verifyEncryptedFieldIntegrity(
  encryptedValue: string,
  expectedHash?: string
): boolean {
  if (!expectedHash) return true

  try {
    const encryptedData: EncryptedData = JSON.parse(encryptedValue)
    // Verify integrity with hash comparison
    // const computedHash = encryption.generateHash(encryptedData.encrypted)
    return encryption.verifyHash(encryptedData.encrypted, expectedHash)
  } catch (error) {
    logger.error('Field integrity verification failed', {}, error as Error)
    return false
  }
}

// Export types
export type { EncryptionContext }