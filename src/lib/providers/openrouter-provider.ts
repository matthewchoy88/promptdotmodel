import { BaseAIProvider } from './base-provider';
import {
  ModelMetadata,
  CompletionParams,
  CompletionResponse,
  ProviderInfo,
  ProviderName,
} from './types';

/**
 * OpenRouter provider implementation
 * Provides access to multiple AI models from different providers through a single API
 */
export class OpenRouterProvider extends BaseAIProvider {
  readonly info: ProviderInfo = {
    name: 'openrouter' as ProviderName,
    displayName: 'OpenRouter',
    description: 'Access multiple AI models from different providers with a single API key.',
    website: 'https://openrouter.ai',
    requiresApiKey: true,
    models: [], // Will be populated below
  };

  readonly models: ModelMetadata[] = [
    // OpenAI Models
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o (OpenRouter)',
      provider: 'openrouter',
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
      id: 'openai/gpt-4-turbo',
      name: 'GPT-4 Turbo (OpenRouter)',
      provider: 'openrouter',
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
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo (OpenRouter)',
      provider: 'openrouter',
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
    // Anthropic Models
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet (OpenRouter)',
      provider: 'openrouter',
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
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus (OpenRouter)',
      provider: 'openrouter',
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
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku (OpenRouter)',
      provider: 'openrouter',
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
    // Google Models
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5 (OpenRouter)',
      provider: 'openrouter',
      maxTokens: 1000000,
      inputCostPer1kTokens: 0.00125,
      outputCostPer1kTokens: 0.005,
      supportsStreaming: true,
      capabilities: {
        vision: true,
        functionCalling: true,
        systemMessages: true,
        maxImages: 10,
      },
    },
    // Meta Models
    {
      id: 'meta-llama/llama-3.1-405b-instruct',
      name: 'Llama 3.1 405B (OpenRouter)',
      provider: 'openrouter',
      maxTokens: 128000,
      inputCostPer1kTokens: 0.003,
      outputCostPer1kTokens: 0.003,
      supportsStreaming: true,
      capabilities: {
        vision: false,
        functionCalling: true,
        systemMessages: true,
        maxImages: 0,
      },
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B (OpenRouter)',
      provider: 'openrouter',
      maxTokens: 128000,
      inputCostPer1kTokens: 0.0008,
      outputCostPer1kTokens: 0.0008,
      supportsStreaming: true,
      capabilities: {
        vision: false,
        functionCalling: true,
        systemMessages: true,
        maxImages: 0,
      },
    },
    // Mistral Models
    {
      id: 'mistralai/mistral-large',
      name: 'Mistral Large (OpenRouter)',
      provider: 'openrouter',
      maxTokens: 128000,
      inputCostPer1kTokens: 0.008,
      outputCostPer1kTokens: 0.024,
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
    if (!this.isConfigured() && !process.env.OPENROUTER_API_KEY) {
      throw this.createError('OpenRouter provider is not configured. Please provide an API key.');
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
          provider: 'openrouter',
          modelId,
          prompt: params.prompt,
          systemMessage: params.systemMessage,
          temperature: params.temperature,
          maxTokens: params.maxTokens,
          topP: params.topP,
          apiKey: this.config.apiKey,
          useOpenRouter: true
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
          openRouterModel: model.id,
          provider: 'openrouter',
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError(
          `OpenRouter API error: ${error.message}`,
          'API_ERROR',
          undefined,
          { originalError: error }
        );
      }
      throw error;
    }
  }

  /**
   * OpenRouter-specific method to check model availability
   */
  async checkModelAvailability(modelId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check the OpenRouter API
      // to see if the model is currently available
      return true;
    } catch (error) {
      console.error(`Failed to check model availability: ${modelId}`, error);
      return false;
    }
  }

  /**
   * Get recommended settings for different model types
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
    if (modelId.includes('claude')) {
      return {
        ...baseSettings,
        temperature: 0.7,
        maxTokens: 8192,
      };
    } else if (modelId.includes('gpt-4')) {
      return {
        ...baseSettings,
        temperature: 0.8,
        maxTokens: 4096,
      };
    } else if (modelId.includes('llama')) {
      return {
        ...baseSettings,
        temperature: 0.6,
        maxTokens: 4096,
      };
    } else if (modelId.includes('gemini')) {
      return {
        ...baseSettings,
        temperature: 0.9,
        maxTokens: 8192,
      };
    }

    return baseSettings;
  }
}