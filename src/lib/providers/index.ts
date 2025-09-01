/**
 * AI Model Provider Abstraction System
 * 
 * This module provides an extensible abstraction layer for AI model providers,
 * making it easy to integrate multiple AI services like Anthropic and OpenAI
 * into your application.
 * 
 * @example
 * ```typescript
 * import { providerRegistry } from '@/lib/providers';
 * 
 * // Configure providers
 * await providerRegistry.configureProvider('openai', {
 *   apiKey: process.env.OPENAI_API_KEY
 * });
 * 
 * // Get all available models
 * const models = providerRegistry.getAllModels();
 * 
 * // Compare responses from multiple models
 * const results = await providerRegistry.compareModels(
 *   ['gpt-4o', 'claude-3-5-sonnet-20241022'],
 *   { prompt: 'What is artificial intelligence?' }
 * );
 * ```
 */

// Core types and interfaces
export type {
  ModelMetadata,
  ModelCapabilities,
  ProviderConfig,
  CompletionParams,
  CompletionResponse,
  ProviderError,
  ProviderName,
  ProviderInfo,
} from './types';

// Base provider interface and abstract class
export type { AIProvider } from './base-provider';
export { BaseAIProvider } from './base-provider';

// Specific provider implementations
export { AnthropicProvider } from './anthropic-provider';
export { OpenAIProvider } from './openai-provider';

// Provider registry
export { ProviderRegistry, providerRegistry } from './provider-registry';

// Import for internal use
import { providerRegistry } from './provider-registry';
import { ModelMetadata } from './types';

// Convenience functions for common operations

/**
 * Quick setup function to configure all providers with API keys
 */
export async function setupProviders(config: {
  anthropicApiKey?: string;
  openaiApiKey?: string;
}) {
  const configurations: Record<string, any> = {};
  
  if (config.anthropicApiKey) {
    configurations.anthropic = { apiKey: config.anthropicApiKey };
  }
  
  if (config.openaiApiKey) {
    configurations.openai = { apiKey: config.openaiApiKey };
  }
  
  await providerRegistry.configureProviders(configurations);
}

/**
 * Get all models grouped by provider
 */
export function getModelsByProvider() {
  const providers = providerRegistry.getProvidersInfo();
  return providers.reduce((acc, provider) => {
    acc[provider.name] = provider.models;
    return acc;
  }, {} as Record<string, ModelMetadata[]>);
}

/**
 * Get recommended models for different use cases
 */
export function getRecommendedModels() {
  const pricing = providerRegistry.getCheapestModels();
  const allModels = providerRegistry.getAllModels();
  
  // Find models with best capabilities
  const visionModels = providerRegistry.getModelsByCapabilities({ vision: true });
  const functionCallingModels = providerRegistry.getModelsByCapabilities({ functionCalling: true });
  
  return {
    // Cost-effective options
    cheapest: pricing.mostCostEffective,
    cheapestInput: pricing.cheapestInput,
    cheapestOutput: pricing.cheapestOutput,
    
    // Capability-based recommendations
    bestForVision: visionModels[0], // First vision-capable model
    bestForFunctionCalling: functionCallingModels[0], // First function-calling model
    
    // Performance tiers
    flagship: allModels.find(m => m.name.includes('GPT-4o') || m.name.includes('Claude 3.5 Sonnet')),
    balanced: allModels.find(m => m.name.includes('GPT-4 Turbo') || m.name.includes('Claude 3 Opus')),
    fast: allModels.find(m => m.name.includes('GPT-3.5') || m.name.includes('Claude 3 Haiku')),
  };
}

/**
 * Utility to validate that required environment variables are set
 */
export function validateEnvironment(): {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
} {
  const missingKeys: string[] = [];
  const warnings: string[] = [];
  
  if (!process.env.OPENAI_API_KEY) {
    missingKeys.push('OPENAI_API_KEY');
  }
  
  if (!process.env.ANTHROPIC_API_KEY) {
    missingKeys.push('ANTHROPIC_API_KEY');
  }
  
  if (missingKeys.length > 0) {
    warnings.push(
      `Missing API keys: ${missingKeys.join(', ')}. ` +
      'These providers will not be available until configured.'
    );
  }
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    warnings,
  };
}