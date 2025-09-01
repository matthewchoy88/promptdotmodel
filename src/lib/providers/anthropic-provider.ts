import { BaseAIProvider } from './base-provider';
import {
  ModelMetadata,
  CompletionParams,
  CompletionResponse,
  ProviderInfo,
  ProviderName,
} from './types';

/**
 * Anthropic AI provider implementation
 * Supports Claude models including Sonnet, Opus, and Haiku
 */
export class AnthropicProvider extends BaseAIProvider {
  readonly info: ProviderInfo = {
    name: 'anthropic' as ProviderName,
    displayName: 'Anthropic',
    description: 'Claude AI models by Anthropic, known for their helpfulness, harmlessness, and honesty.',
    website: 'https://www.anthropic.com',
    requiresApiKey: true,
    models: [], // Will be populated below
  };

  readonly models: ModelMetadata[] = [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      maxTokens: 200000,
      inputCostPer1kTokens: 0.003,
      outputCostPer1kTokens: 0.015,
      supportsStreaming: true,
      capabilities: {
        vision: true,
        functionCalling: true,
        systemMessages: true,
        maxImages: 20,
      },
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 200000,
      inputCostPer1kTokens: 0.015,
      outputCostPer1kTokens: 0.075,
      supportsStreaming: true,
      capabilities: {
        vision: true,
        functionCalling: true,
        systemMessages: true,
        maxImages: 20,
      },
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      maxTokens: 200000,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.00125,
      supportsStreaming: true,
      capabilities: {
        vision: true,
        functionCalling: true,
        systemMessages: true,
        maxImages: 20,
      },
    },
  ];

  constructor() {
    super();
    // Update the info with the actual models
    this.info.models = this.models;
  }

  async complete(modelId: string, params: CompletionParams): Promise<CompletionResponse> {
    if (!this.isConfigured()) {
      throw this.createError('Anthropic provider is not configured. Please provide an API key.');
    }

    const model = this.getModel(modelId);
    if (!model) {
      throw this.createError(`Model not found: ${modelId}`, 'MODEL_NOT_FOUND');
    }

    try {
      // For now, return a dummy response
      // In a real implementation, this would make an API call to Anthropic's API
      const response = this.generateDummyResponse(modelId, params);
      
      // Add Anthropic-specific metadata
      response.metadata = {
        ...response.metadata,
        anthropicVersion: '2023-06-01',
        modelVersion: model.id,
        systemMessage: params.systemMessage,
      };

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(
          `Anthropic API error: ${error.message}`,
          'API_ERROR',
          undefined,
          { originalError: error }
        );
      }
      throw error;
    }
  }

  /**
   * Anthropic-specific method to validate the model supports the requested features
   */
  validateModelCapabilities(modelId: string, params: CompletionParams): boolean {
    const model = this.getModel(modelId);
    if (!model) {
      return false;
    }

    // Check if system messages are supported
    if (params.systemMessage && !model.capabilities.systemMessages) {
      return false;
    }

    return true;
  }

  /**
   * Get the recommended settings for a specific Claude model
   */
  getRecommendedSettings(modelId: string): Partial<CompletionParams> {
    const model = this.getModel(modelId);
    if (!model) {
      throw this.createError(`Model not found: ${modelId}`, 'MODEL_NOT_FOUND');
    }

    const baseSettings: Partial<CompletionParams> = {
      temperature: 0.7,
      maxTokens: 4096,
    };

    // Model-specific optimizations
    switch (modelId) {
      case 'claude-3-5-sonnet-20241022':
        return {
          ...baseSettings,
          temperature: 0.7,
          maxTokens: 8192, // Sonnet handles longer responses well
        };
      case 'claude-3-opus-20240229':
        return {
          ...baseSettings,
          temperature: 0.8, // Opus benefits from slightly higher creativity
          maxTokens: 4096,
        };
      case 'claude-3-haiku-20240307':
        return {
          ...baseSettings,
          temperature: 0.6, // Haiku is optimized for speed and conciseness
          maxTokens: 2048,
        };
      default:
        return baseSettings;
    }
  }
}