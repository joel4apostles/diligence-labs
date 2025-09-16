/**
 * End-to-End Encryption Utility for Sensitive Data
 * Provides AES-256-GCM encryption with key derivation and secure key management
 */

import crypto from 'crypto'
import { logger } from './logger'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // For GCM, this is always 16 bytes
const SALT_LENGTH = 32
// const TAG_LENGTH = 16 // Currently unused but kept for future GCM tag verification
const KEY_LENGTH = 32 // 256 bits

// Environment validation
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY
const KEY_DERIVATION_SALT = process.env.KEY_DERIVATION_SALT

if (!MASTER_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_MASTER_KEY environment variable is required in production')
}

if (!KEY_DERIVATION_SALT && process.env.NODE_ENV === 'production') {
  throw new Error('KEY_DERIVATION_SALT environment variable is required in production')
}

interface EncryptedData {
  encrypted: string
  iv: string
  tag: string
  salt: string
  version: string
}

interface EncryptionMetadata {
  algorithm: string
  keyDerivation: string
  timestamp: number
  dataType: 'pii' | 'financial' | 'sensitive' | 'general'
}

class EncryptionService {
  private masterKey: Buffer
  private keyDerivationSalt: Buffer

  constructor() {
    // Use environment keys or generate for development
    this.masterKey = MASTER_KEY 
      ? Buffer.from(MASTER_KEY, 'hex')
      : crypto.randomBytes(KEY_LENGTH)
      
    this.keyDerivationSalt = KEY_DERIVATION_SALT
      ? Buffer.from(KEY_DERIVATION_SALT, 'hex')
      : crypto.randomBytes(SALT_LENGTH)

    if (process.env.NODE_ENV === 'development' && !MASTER_KEY) {
      logger.warn('Using generated encryption key for development. Set ENCRYPTION_MASTER_KEY for production.')
    }
  }

  /**
   * Derive encryption key using PBKDF2 with context-specific salt
   */
  private deriveKey(context: string, userSalt?: Buffer): Buffer {
    const combinedSalt = userSalt 
      ? Buffer.concat([this.keyDerivationSalt, userSalt, Buffer.from(context, 'utf8')])
      : Buffer.concat([this.keyDerivationSalt, Buffer.from(context, 'utf8')])

    return crypto.pbkdf2Sync(this.masterKey, combinedSalt, 100000, KEY_LENGTH, 'sha256')
  }

  /**
   * Encrypt sensitive data with context-specific key derivation
   */
  encrypt(
    data: string, 
    context: string = 'general',
    dataType: EncryptionMetadata['dataType'] = 'general'
  ): EncryptedData {
    try {
      // Generate unique salt for this encryption
      const salt = crypto.randomBytes(SALT_LENGTH)
      const iv = crypto.randomBytes(IV_LENGTH)
      
      // Derive context-specific key
      const derivedKey = this.deriveKey(context, salt)
      
      // Create cipher with IV
      const cipher = crypto.createCipherGCM(ALGORITHM, derivedKey, iv)
      cipher.setAAD(Buffer.from(context, 'utf8')) // Additional authenticated data
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Get authentication tag
      const tag = cipher.getAuthTag()
      
      const result: EncryptedData = {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt.toString('hex'),
        version: '1.0'
      }

      // Log encryption event (without sensitive data)
      logger.info('Data encrypted', {
        context,
        dataType,
        algorithm: ALGORITHM,
        dataLength: data.length
      })

      return result
    } catch (error) {
      logger.error('Encryption failed', { context, dataType }, error as Error)
      throw new Error('Encryption operation failed')
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: EncryptedData, context: string = 'general'): string {
    try {
      const { encrypted, iv, tag, salt, version } = encryptedData
      
      // Validate version compatibility
      if (version !== '1.0') {
        throw new Error(`Unsupported encryption version: ${version}`)
      }

      // Convert hex strings back to buffers
      const ivBuffer = Buffer.from(iv, 'hex')
      const tagBuffer = Buffer.from(tag, 'hex') 
      const saltBuffer = Buffer.from(salt, 'hex')
      
      // Derive the same key used for encryption
      const derivedKey = this.deriveKey(context, saltBuffer)
      
      // Create decipher with IV
      const decipher = crypto.createDecipherGCM(ALGORITHM, derivedKey, ivBuffer)
      decipher.setAuthTag(tagBuffer)
      decipher.setAAD(Buffer.from(context, 'utf8'))
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      logger.debug('Data decrypted successfully', { context })
      
      return decrypted
    } catch (error) {
      logger.error('Decryption failed', { context }, error as Error)
      throw new Error('Decryption operation failed')
    }
  }

  /**
   * Encrypt personally identifiable information (PII)
   */
  encryptPII(data: string, userId?: string): EncryptedData {
    const context = userId ? `pii:${userId}` : 'pii:anonymous'
    return this.encrypt(data, context, 'pii')
  }

  /**
   * Decrypt personally identifiable information (PII)
   */
  decryptPII(encryptedData: EncryptedData, userId?: string): string {
    const context = userId ? `pii:${userId}` : 'pii:anonymous'
    return this.decrypt(encryptedData, context)
  }

  /**
   * Encrypt financial data (payment info, wallet addresses, etc.)
   */
  encryptFinancial(data: string, userId?: string): EncryptedData {
    const context = userId ? `financial:${userId}` : 'financial:anonymous'
    return this.encrypt(data, context, 'financial')
  }

  /**
   * Decrypt financial data
   */
  decryptFinancial(encryptedData: EncryptedData, userId?: string): string {
    const context = userId ? `financial:${userId}` : 'financial:anonymous'
    return this.decrypt(encryptedData, context)
  }

  /**
   * Encrypt consultation data and project details
   */
  encryptConsultation(data: string, sessionId: string, userId?: string): EncryptedData {
    const context = userId ? `consultation:${sessionId}:${userId}` : `consultation:${sessionId}`
    return this.encrypt(data, context, 'sensitive')
  }

  /**
   * Decrypt consultation data
   */
  decryptConsultation(encryptedData: EncryptedData, sessionId: string, userId?: string): string {
    const context = userId ? `consultation:${sessionId}:${userId}` : `consultation:${sessionId}`
    return this.decrypt(encryptedData, context)
  }

  /**
   * Generate a secure hash for data integrity verification
   */
  generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Verify data integrity using hash
   */
  verifyHash(data: string, hash: string): boolean {
    const computedHash = this.generateHash(data)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
  }

  /**
   * Generate encryption keys for development/testing
   */
  static generateKeys(): { masterKey: string; salt: string } {
    return {
      masterKey: crypto.randomBytes(KEY_LENGTH).toString('hex'),
      salt: crypto.randomBytes(SALT_LENGTH).toString('hex')
    }
  }

  /**
   * Rotate encryption keys (for key rotation strategy)
   */
  rotateKeys(oldEncryptedData: EncryptedData, context: string, newMasterKey?: string): EncryptedData {
    try {
      // Decrypt with old key
      const decryptedData = this.decrypt(oldEncryptedData, context)
      
      // If new master key provided, update it temporarily
      const originalKey = this.masterKey
      if (newMasterKey) {
        this.masterKey = Buffer.from(newMasterKey, 'hex')
      }
      
      // Re-encrypt with new key
      const reEncrypted = this.encrypt(decryptedData, context)
      
      // Restore original key if we were just testing
      if (newMasterKey) {
        this.masterKey = originalKey
      }
      
      logger.info('Key rotation completed', { context })
      return reEncrypted
    } catch (error) {
      logger.error('Key rotation failed', { context }, error as Error)
      throw new Error('Key rotation operation failed')
    }
  }
}

// Export singleton instance
export const encryption = new EncryptionService()

// Export utilities for client-side encryption
export const clientEncryption = {
  /**
   * Client-side encryption using Web Crypto API (for browser environments)
   */
  async encryptClientSide(data: string, password: string): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Client-side encryption only available in browser environment')
    }

    const encoder = new TextEncoder()
    // const decoder = new TextDecoder() // Currently unused but kept for future client-side decryption

    // Generate salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Derive key from password
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )

    // Encrypt data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    )

    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length)

    // Return as base64
    return btoa(String.fromCharCode(...combined))
  },

  /**
   * Client-side decryption using Web Crypto API
   */
  async decryptClientSide(encryptedData: string, password: string): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Client-side decryption only available in browser environment')
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    )

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const encrypted = combined.slice(28)

    // Derive key from password
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    // Decrypt data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    return decoder.decode(decryptedBuffer)
  }
}

// Export types for external use
export type { EncryptedData, EncryptionMetadata }