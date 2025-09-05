import { AIProvider } from './base-provider';
import { AnthropicProvider } from './anthropic-provider';
import { OpenAIProvider } from './openai-provider';
import { OpenRouterProvider } from './openrouter-provider';
import {
  ProviderConfig,
  ProviderName,
  ProviderInfo,
  ModelMetadata,
  CompletionParams,
  CompletionResponse,
} from './types';

/**
 * Registry that manages all AI providers and their instances
 */
export class ProviderRegistry {
  private providers: Map<ProviderName, AIProvider> = new Map();
  private static instance: ProviderRegistry;

  private constructor() {
    // Initialize with default providers
    this.registerProvider('anthropic', new AnthropicProvider());
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('openrouter', new OpenRouterProvider());
  }

  /**
   * Get the singleton instance of the provider registry
   */
  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register a new provider
   */
  registerProvider(name: ProviderName, provider: AIProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Get a provider by name
   */
  getProvider(name: ProviderName): AIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get information about all providers
   */
  getProvidersInfo(): ProviderInfo[] {
    return this.getAllProviders().map(provider => provider.info);
  }

  /**
   * Get all available models from all providers
   */
  getAllModels(): ModelMetadata[] {
    const models: ModelMetadata[] = [];
    for (const provider of Array.from(this.providers.values())) {
      models.push(...provider.models);
    }
    return models;
  }

  /**
   * Get models from a specific provider
   */
  getModelsByProvider(providerName: ProviderName): ModelMetadata[] {
    const provider = this.getProvider(providerName);
    return provider ? provider.models : [];
  }

  /**
   * Find a model by its ID across all providers
   */
  findModel(modelId: string): { provider: AIProvider; model: ModelMetadata } | undefined {
    for (const provider of Array.from(this.providers.values())) {
      const model = provider.getModel(modelId);
      if (model) {
        return { provider, model };
      }
    }
    return undefined;
  }

  /**
   * Configure a specific provider
   */
  async configureProvider(providerName: ProviderName, config: ProviderConfig): Promise<void> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }
    
    await provider.initialize(config);
  }

  /**
   * Configure multiple providers at once
   */
  async configureProviders(configs: Record<ProviderName, ProviderConfig>): Promise<void> {
    const configPromises = Object.entries(configs).map(([providerName, config]) =>
      this.configureProvider(providerName as ProviderName, config)
    );
    
    await Promise.all(configPromises);
  }

  /**
   * Check which providers are configured and ready to use
   */
  getConfiguredProviders(): ProviderName[] {
    const configured: ProviderName[] = [];
    for (const [name, provider] of Array.from(this.providers.entries())) {
      if (provider.isConfigured()) {
        configured.push(name);
      }
    }
    return configured;
  }

  /**
   * Validate connections for all configured providers
   */
  async validateAllConnections(): Promise<Record<ProviderName, boolean>> {
    const results: Record<string, boolean> = {};
    
    const validationPromises = Array.from(this.providers.entries()).map(
      async ([name, provider]) => {
        if (provider.isConfigured()) {
          results[name] = await provider.validateConnection();
        } else {
          results[name] = false;
        }
      }
    );
    
    await Promise.all(validationPromises);
    return results as Record<ProviderName, boolean>;
  }

  /**
   * Generate completions from multiple models in parallel
   */
  async compareModels(
    modelIds: string[],
    params: CompletionParams
  ): Promise<Array<{ modelId: string; response: CompletionResponse; error?: Error }>> {
    const completionPromises = modelIds.map(async (modelId) => {
      try {
        const result = this.findModel(modelId);
        if (!result) {
          throw new Error(`Model not found: ${modelId}`);
        }
        
        const { provider } = result;
        const response = await provider.complete(modelId, params);
        return { modelId, response };
      } catch (error) {
        return { modelId, response: null as any, error: error as Error };
      }
    });

    return Promise.all(completionPromises);
  }

  /**
   * Get models that support specific capabilities
   */
  getModelsByCapabilities(capabilities: {
    vision?: boolean;
    functionCalling?: boolean;
    streaming?: boolean;
  }): ModelMetadata[] {
    return this.getAllModels().filter(model => {
      if (capabilities.vision && !model.capabilities.vision) return false;
      if (capabilities.functionCalling && !model.capabilities.functionCalling) return false;
      if (capabilities.streaming && !model.supportsStreaming) return false;
      return true;
    });
  }

  /**
   * Get models within a specific price range
   */
  getModelsByPriceRange(maxInputCostPer1k: number, maxOutputCostPer1k: number): ModelMetadata[] {
    return this.getAllModels().filter(
      model =>
        model.inputCostPer1kTokens <= maxInputCostPer1k &&
        model.outputCostPer1kTokens <= maxOutputCostPer1k
    );
  }

  /**
   * Get the cheapest models for input and output
   */
  getCheapestModels(): {
    cheapestInput: ModelMetadata;
    cheapestOutput: ModelMetadata;
    mostCostEffective: ModelMetadata;
  } {
    const models = this.getAllModels();
    
    const cheapestInput = models.reduce((cheapest, model) =>
      model.inputCostPer1kTokens < cheapest.inputCostPer1kTokens ? model : cheapest
    );
    
    const cheapestOutput = models.reduce((cheapest, model) =>
      model.outputCostPer1kTokens < cheapest.outputCostPer1kTokens ? model : cheapest
    );
    
    // Most cost-effective based on combined input+output cost (assuming equal usage)
    const mostCostEffective = models.reduce((best, model) => {
      const modelTotalCost = model.inputCostPer1kTokens + model.outputCostPer1kTokens;
      const bestTotalCost = best.inputCostPer1kTokens + best.outputCostPer1kTokens;
      return modelTotalCost < bestTotalCost ? model : best;
    });

    return { cheapestInput, cheapestOutput, mostCostEffective };
  }

  /**
   * Reset the registry (useful for testing)
   */
  reset(): void {
    this.providers.clear();
    this.registerProvider('anthropic', new AnthropicProvider());
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('openrouter', new OpenRouterProvider());
  }
}

// Export a default instance for convenience
export const providerRegistry = ProviderRegistry.getInstance();