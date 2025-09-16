/**
 * Client-Side Encryption for Sensitive Form Data
 * Encrypts data in the browser before transmission to server
 */

'use client'

import { logger } from './logger'

interface EncryptedFormData {
  encrypted: string
  iv: string
  salt: string
  timestamp: number
}

interface ClientEncryptionConfig {
  keyDerivationIterations: number
  keyLength: number
  ivLength: number
  saltLength: number
  algorithm: {
    name: string
    length: number
  }
}

const DEFAULT_CONFIG: ClientEncryptionConfig = {
  keyDerivationIterations: 100000,
  keyLength: 256,
  ivLength: 12,
  saltLength: 16,
  algorithm: {
    name: 'AES-GCM',
    length: 256
  }
}

class ClientEncryption {
  private config: ClientEncryptionConfig
  private isSupported: boolean

  constructor(config: Partial<ClientEncryptionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.isSupported = this.checkWebCryptoSupport()
    
    if (!this.isSupported) {
      logger.warn('Web Crypto API not supported, client-side encryption disabled')
    }
  }

  private checkWebCryptoSupport(): boolean {
    return typeof window !== 'undefined' && 
           'crypto' in window && 
           'subtle' in window.crypto &&
           typeof window.crypto.subtle.encrypt === 'function'
  }

  /**
   * Generate a cryptographic key from a password using PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    
    // Import password as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    // Derive actual encryption key
    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.config.keyDerivationIterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      this.config.algorithm,
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt sensitive form data before sending to server
   */
  async encryptFormData(
    data: Record<string, unknown>, 
    sessionPassword?: string
  ): Promise<EncryptedFormData | Record<string, unknown>> {
    if (!this.isSupported) {
      logger.warn('Returning unencrypted data due to lack of Web Crypto support')
      return data
    }

    try {
      const encoder = new TextEncoder()
      
      // Use session password or generate temporary one
      const password = sessionPassword || this.generateSessionPassword()
      
      // Generate cryptographic materials
      const salt = window.crypto.getRandomValues(new Uint8Array(this.config.saltLength))
      const iv = window.crypto.getRandomValues(new Uint8Array(this.config.ivLength))
      
      // Derive encryption key
      const key = await this.deriveKey(password, salt)
      
      // Prepare data for encryption
      const plaintext = JSON.stringify(data)
      const plaintextBuffer = encoder.encode(plaintext)
      
      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: this.config.algorithm.name,
          iv
        },
        key,
        plaintextBuffer
      )
      
      // Convert to base64 for transmission
      const encrypted = this.arrayBufferToBase64(encryptedBuffer)
      const ivBase64 = this.arrayBufferToBase64(iv.buffer)
      const saltBase64 = this.arrayBufferToBase64(salt.buffer)
      
      const result: EncryptedFormData = {
        encrypted,
        iv: ivBase64,
        salt: saltBase64,
        timestamp: Date.now()
      }
      
      logger.debug('Client-side encryption completed', {
        dataSize: plaintext.length,
        encryptedSize: encrypted.length
      })
      
      return result
    } catch (error) {
      logger.error('Client-side encryption failed', {}, error as Error)
      // Fallback to unencrypted data
      return data
    }
  }

  /**
   * Decrypt form data (typically used for editing previously submitted data)
   */
  async decryptFormData(
    encryptedData: EncryptedFormData,
    sessionPassword?: string
  ): Promise<Record<string, unknown>> {
    if (!this.isSupported) {
      throw new Error('Web Crypto API not supported for decryption')
    }

    try {
      const decoder = new TextDecoder()
      
      // Use provided password or attempt to retrieve from session
      const password = sessionPassword || this.getSessionPassword()
      if (!password) {
        throw new Error('No decryption password available')
      }
      
      // Convert base64 back to buffers
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.encrypted)
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv))
      const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedData.salt))
      
      // Derive the same key used for encryption
      const key = await this.deriveKey(password, salt)
      
      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.config.algorithm.name,
          iv
        },
        key,
        encryptedBuffer
      )
      
      // Parse decrypted JSON
      const decryptedText = decoder.decode(decryptedBuffer)
      const data = JSON.parse(decryptedText)
      
      logger.debug('Client-side decryption completed')
      
      return data
    } catch (error) {
      logger.error('Client-side decryption failed', {}, error as Error)
      throw new Error('Failed to decrypt form data')
    }
  }

  /**
   * Encrypt specific sensitive fields in a form
   */
  async encryptSensitiveFields(
    formData: Record<string, unknown>,
    sensitiveFields: string[],
    sessionPassword?: string
  ): Promise<Record<string, unknown>> {
    if (!this.isSupported || sensitiveFields.length === 0) {
      return formData
    }

    const result = { ...formData }
    const sensitiveData: Record<string, unknown> = {}
    
    // Extract sensitive fields
    for (const field of sensitiveFields) {
      if (field in result && result[field]) {
        sensitiveData[field] = result[field]
        delete result[field]
      }
    }
    
    // Encrypt sensitive data if any exists
    if (Object.keys(sensitiveData).length > 0) {
      const encrypted = await this.encryptFormData(sensitiveData, sessionPassword)
      result._encrypted = encrypted
      result._encryptedFields = sensitiveFields
    }
    
    return result
  }

  /**
   * Generate a secure session password for temporary encryption
   */
  private generateSessionPassword(): string {
    const array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Store session password securely (session storage, not persistent)
   */
  storeSessionPassword(password: string, formId: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`enc_${formId}`, password)
    }
  }

  /**
   * Retrieve session password
   */
  private getSessionPassword(formId?: string): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const key = formId ? `enc_${formId}` : 'enc_default'
      return sessionStorage.getItem(key)
    }
    return null
  }

  /**
   * Clear session password
   */
  clearSessionPassword(formId?: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const key = formId ? `enc_${formId}` : 'enc_default'
      sessionStorage.removeItem(key)
    }
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Check if data is encrypted
   */
  static isEncrypted(data: unknown): data is EncryptedFormData {
    return typeof data === 'object' &&
           data !== null &&
           'encrypted' in data &&
           'iv' in data &&
           'salt' in data &&
           'timestamp' in data
  }

  /**
   * Get encryption status for debugging
   */
  getStatus(): { supported: boolean; config: ClientEncryptionConfig } {
    return {
      supported: this.isSupported,
      config: this.config
    }
  }
}

// Export singleton instance
export const clientEncryption = new ClientEncryption()

// Export React hook for form encryption
export function useFormEncryption(formId?: string) {
  const encryptFormData = async (data: Record<string, unknown>) => {
    return await clientEncryption.encryptFormData(data)
  }

  const encryptSensitiveFields = async (
    data: Record<string, unknown>, 
    sensitiveFields: string[]
  ) => {
    return await clientEncryption.encryptSensitiveFields(data, sensitiveFields)
  }

  const clearPassword = () => {
    clientEncryption.clearSessionPassword(formId)
  }

  return {
    encryptFormData,
    encryptSensitiveFields,
    clearPassword,
    isSupported: clientEncryption.getStatus().supported
  }
}

// Sensitive field definitions for different forms
export const SENSITIVE_FORM_FIELDS = {
  consultation: [
    'projectName',
    'description',
    'title',
    'contactEmail',
    'clientNotes'
  ],
  payment: [
    'cardNumber',
    'cvv',
    'walletAddress',
    'privateKey'
  ],
  profile: [
    'name',
    'email',
    'phone',
    'address',
    'taxId'
  ],
  subscription: [
    'companyName',
    'billingAddress',
    'taxId',
    'contactDetails'
  ]
} as const

// Export types
export type { EncryptedFormData, ClientEncryptionConfig }