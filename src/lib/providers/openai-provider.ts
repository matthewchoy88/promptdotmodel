import { BaseAIProvider } from './base-provider';
import {
  ModelMetadata,
  CompletionParams,
  CompletionResponse,
  ProviderInfo,
  ProviderName,
} from './types';

/**
 * OpenAI provider implementation
 * Supports GPT models including GPT-4o, GPT-4 Turbo, and GPT-3.5 Turbo
 */
export class OpenAIProvider extends BaseAIProvider {
  readonly info: ProviderInfo = {
    name: 'openai' as ProviderName,
    displayName: 'OpenAI',
    description: 'GPT models by OpenAI, including the latest GPT-4o and GPT-4 Turbo models.',
    website: 'https://openai.com',
    requiresApiKey: true,
    models: [], // Will be populated below
  };

  readonly models: ModelMetadata[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      maxTokens: 128000,
      inputCostPer1kTokens: 0.005,
      outputCostPer1kTokens: 0.015,
      supportsStreaming: true,
      capabilities: {
        vision: true,
        functionCalling: true,
        systemMessages: true,
        maxImages: 10,
      },
    },
    {
      id: 'gpt-4-turbo-2024-04-09',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 128000,
      inputCostPer1kTokens: 0.01,
      outputCostPer1kTokens: 0.03,
      supportsStreaming: true,
      capabilities: {
        vision: true,
        functionCalling: true,
        systemMessages: true,
        maxImages: 10,
      },
    },
    {
      id: 'gpt-3.5-turbo-0125',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 16385,
      inputCostPer1kTokens: 0.0005,
      outputCostPer1kTokens: 0.0015,
      supportsStreaming: true,
      capabilities: {
        vision: false,
        functionCalling: true,
        systemMessages: true,
        maxImages: 0,
      },
    },
  ];

  constructor() {
    super();
    // Update the info with the actual models
    this.info.models = this.models;
  }

  async complete(modelId: string, params: CompletionParams): Promise<CompletionResponse> {
    if (!this.isConfigured() && !process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      throw this.createError('OpenAI provider is not configured. Please provide an API key.');
    }

    const model = this.getModel(modelId);
    if (!model) {
      throw this.createError(`Model not found: ${modelId}`, 'MODEL_NOT_FOUND');
    }

    try {
      // Make actual API call through our route handler
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'openai',
          modelId,
          prompt: params.prompt,
          systemMessage: params.systemMessage,
          temperature: params.temperature,
          maxTokens: params.maxTokens,
          topP: params.topP,
          apiKey: this.config.apiKey,
          useOpenRouter: this.config.useOpenRouter
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'API request failed');
      }

      const data = await response.json();
      
      // Calculate cost based on model pricing
      const cost = this.estimateCost(modelId, data.inputTokens, data.outputTokens);
      
      return {
        ...data,
        cost,
        metadata: {
          ...data.metadata,
          openaiVersion: '2024-02-01',
          modelVersion: model.id,
          systemMessage: params.systemMessage,
          finishReason: 'stop',
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(
          `OpenAI API error: ${error.message}`,
          'API_ERROR',
          undefined,
          { originalError: error }
        );
      }
      throw error;
    }
  }

  /**
   * OpenAI-specific method to validate the model supports the requested features
   */
  validateModelCapabilities(modelId: string, params: CompletionParams): boolean {
    const model = this.getModel(modelId);
    if (!model) {
      return false;
    }

    // Check if system messages are supported (all OpenAI models support this)
    if (params.systemMessage && !model.capabilities.systemMessages) {
      return false;
    }

    return true;
  }

  /**
   * Get the recommended settings for a specific GPT model
   */
  getRecommendedSettings(modelId: string): Partial<CompletionParams> {
    const model = this.getModel(modelId);
    if (!model) {
      throw this.createError(`Model not found: ${modelId}`, 'MODEL_NOT_FOUND');
    }

    const baseSettings: Partial<CompletionParams> = {
      temperature: 0.7,
      topP: 1.0,
      maxTokens: 4096,
    };

    // Model-specific optimizations
    switch (modelId) {
      case 'gpt-4o':
        return {
          ...baseSettings,
          temperature: 0.7,
          maxTokens: 8192, // GPT-4o can handle longer responses efficiently
        };
      case 'gpt-4-turbo-2024-04-09':
        return {
          ...baseSettings,
          temperature: 0.8,
          maxTokens: 4096,
        };
      case 'gpt-3.5-turbo-0125':
        return {
          ...baseSettings,
          temperature: 0.6,
          maxTokens: 2048, // Optimize for speed with 3.5 Turbo
        };
      default:
        return baseSettings;
    }
  }

  /**
   * Convert parameters to OpenAI API format
   */
  private convertParamsToOpenAIFormat(params: CompletionParams) {
    const messages: Array<{ role: string; content: string }> = [];

    if (params.systemMessage) {
      messages.push({ role: 'system', content: params.systemMessage });
    }

    messages.push({ role: 'user', content: params.prompt });

    return {
      messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP,
      stream: params.stream,
      stop: params.stopSequences,
    };
  }

  /**
   * Get token count estimate for OpenAI models
   * This is a rough approximation - in production you'd use tiktoken or similar
   */
  estimateTokenCount(text: string, modelId: string): number {
    // Rough approximation: ~4 characters per token for most models
    // GPT-4 and newer models are generally more efficient
    const baseRatio = 4;
    const modelMultiplier = modelId.includes('gpt-4') ? 0.9 : 1.0;
    
    return Math.ceil((text.length / baseRatio) * modelMultiplier);
  }
}