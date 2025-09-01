"use client"

/**
 * API Key Management Utilities
 * 
 * SECURITY WARNING: This implementation stores API keys in localStorage for development purposes.
 * In production, consider using secure server-side storage, encrypted storage, or environment variables.
 */

export interface ApiKeyConfig {
  provider: string
  apiKey: string
  lastValidated?: string
  isValid?: boolean
}

export interface ApiKeyStorage {
  [provider: string]: ApiKeyConfig
}

const STORAGE_KEY = 'promptmodel_api_keys'

/**
 * Get all stored API keys
 */
export function getStoredApiKeys(): ApiKeyStorage {
  if (typeof window === 'undefined') {
    return {}
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading API keys:', error)
    return {}
  }
}

/**
 * Save API key for a specific provider
 */
export function saveApiKey(provider: string, apiKey: string): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const keys = getStoredApiKeys()
    keys[provider] = {
      provider,
      apiKey,
      lastValidated: new Date().toISOString(),
      isValid: undefined // Reset validation status when key changes
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch (error) {
    console.error('Error saving API key:', error)
    throw new Error('Failed to save API key')
  }
}

/**
 * Get API key for a specific provider
 */
export function getApiKey(provider: string): string | null {
  const keys = getStoredApiKeys()
  return keys[provider]?.apiKey || null
}

/**
 * Remove API key for a specific provider
 */
export function removeApiKey(provider: string): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const keys = getStoredApiKeys()
    delete keys[provider]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch (error) {
    console.error('Error removing API key:', error)
    throw new Error('Failed to remove API key')
  }
}

/**
 * Clear all API keys
 */
export function clearAllApiKeys(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing API keys:', error)
    throw new Error('Failed to clear API keys')
  }
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKeyFormat(provider: string, apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false
  }
  
  // Remove whitespace
  const cleanKey = apiKey.trim()
  
  if (cleanKey.length === 0) {
    return false
  }
  
  // Provider-specific validation
  switch (provider) {
    case 'anthropic':
      // Anthropic keys typically start with 'sk-ant-'
      return cleanKey.startsWith('sk-ant-') && cleanKey.length > 20
    
    case 'openai':
      // OpenAI keys typically start with 'sk-'
      return cleanKey.startsWith('sk-') && cleanKey.length > 20
    
    default:
      // Generic validation: non-empty string
      return cleanKey.length > 0
  }
}

/**
 * Mock API key validation (simulates testing the key with the provider)
 * In production, this would make actual API calls to test the keys
 */
export async function testApiKey(provider: string, apiKey: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  // For demo purposes, validate based on format
  const isValidFormat = validateApiKeyFormat(provider, apiKey)
  
  if (!isValidFormat) {
    return false
  }
  
  // Simulate occasional API failures for testing
  if (Math.random() < 0.1) {
    throw new Error('API validation failed: Network error')
  }
  
  // Save validation result
  try {
    const keys = getStoredApiKeys()
    if (keys[provider]) {
      keys[provider].isValid = isValidFormat
      keys[provider].lastValidated = new Date().toISOString()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    }
  } catch (error) {
    console.error('Error saving validation result:', error)
  }
  
  return isValidFormat
}

/**
 * Export settings as JSON
 */
export function exportSettings(): string {
  const keys = getStoredApiKeys()
  
  // Remove sensitive data for export
  const exportData = Object.entries(keys).reduce((acc, [provider, config]) => {
    acc[provider] = {
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      lastValidated: config.lastValidated,
      isValid: config.isValid
    }
    return acc
  }, {} as Record<string, any>)
  
  return JSON.stringify({
    exported: new Date().toISOString(),
    version: '1.0',
    settings: exportData
  }, null, 2)
}

/**
 * Get provider configuration status
 */
export function getProviderStatus(provider: string): {
  configured: boolean
  valid?: boolean
  lastValidated?: string
} {
  const keys = getStoredApiKeys()
  const config = keys[provider]
  
  if (!config || !config.apiKey) {
    return { configured: false }
  }
  
  return {
    configured: true,
    valid: config.isValid,
    lastValidated: config.lastValidated
  }
}

/**
 * Get supported providers list
 */
export function getSupportedProviders(): Array<{
  id: string
  name: string
  description: string
  website: string
  keyFormat: string
}> {
  return [
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude AI models by Anthropic',
      website: 'https://console.anthropic.com/',
      keyFormat: 'sk-ant-...'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models by OpenAI',
      website: 'https://platform.openai.com/api-keys',
      keyFormat: 'sk-...'
    }
  ]
}