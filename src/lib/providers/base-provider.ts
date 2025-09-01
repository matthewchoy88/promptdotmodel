import {
  ModelMetadata,
  ProviderConfig,
  CompletionParams,
  CompletionResponse,
  ProviderError,
  ProviderName,
  ProviderInfo,
} from './types';

/**
 * Interface that all AI model providers must implement
 */
export interface AIProvider {
  /** Provider information */
  readonly info: ProviderInfo;
  
  /** Available models from this provider */
  readonly models: ModelMetadata[];
  
  /**
   * Initialize the provider with configuration
   */
  initialize(config: ProviderConfig): Promise<void>;
  
  /**
   * Check if the provider is properly configured and ready to use
   */
  isConfigured(): boolean;
  
  /**
   * Validate the API key and connection
   */
  validateConnection(): Promise<boolean>;
  
  /**
   * Get a specific model by ID
   */
  getModel(modelId: string): ModelMetadata | undefined;
  
  /**
   * Generate a completion using the specified model
   */
  complete(modelId: string, params: CompletionParams): Promise<CompletionResponse>;
  
  /**
   * Get the estimated cost for a completion request
   */
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number;
}

/**
 * Abstract base class that provides common functionality for AI providers
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: ProviderConfig = {};
  
  abstract readonly info: ProviderInfo;
  abstract readonly models: ModelMetadata[];
  
  async initialize(config: ProviderConfig): Promise<void> {
    this.config = { ...config };
    
    if (this.info.requiresApiKey && !config.apiKey) {
      throw new ProviderError(`API key is required for ${this.info.displayName}`);
    }
  }
  
  isConfigured(): boolean {
    if (this.info.requiresApiKey) {
      return !!this.config.apiKey;
    }
    return true;
  }
  
  async validateConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }
    
    try {
      // For now, we'll just return true as we're using dummy responses
      // In a real implementation, this would make a test API call
      return true;
    } catch (error) {
      console.error(`Connection validation failed for ${this.info.displayName}:`, error);
      return false;
    }
  }
  
  getModel(modelId: string): ModelMetadata | undefined {
    return this.models.find(model => model.id === modelId);
  }
  
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = this.getModel(modelId);
    if (!model) {
      throw new ProviderError(`Model not found: ${modelId}`);
    }
    
    const inputCost = (inputTokens / 1000) * model.inputCostPer1kTokens;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1kTokens;
    
    return inputCost + outputCost;
  }
  
  abstract complete(modelId: string, params: CompletionParams): Promise<CompletionResponse>;
  
  /**
   * Create a standardized error object
   */
  protected createError(message: string, code?: string, status?: number, details?: Record<string, any>): ProviderError {
    return new ProviderError(message, code, status, details);
  }
  
  /**
   * Generate a dummy response for testing purposes
   */
  protected generateDummyResponse(modelId: string, params: CompletionParams): CompletionResponse {
    const model = this.getModel(modelId);
    if (!model) {
      throw this.createError(`Model not found: ${modelId}`, 'MODEL_NOT_FOUND');
    }
    
    const startTime = Date.now();
    
    // Simulate some processing time
    const processingDelay = Math.random() * 1000 + 500; // 500-1500ms
    
    // Generate dummy response content
    const dummyContent = `This is a placeholder response from ${model.name}. The original prompt was: "${params.prompt.substring(0, 100)}${params.prompt.length > 100 ? '...' : ''}"`;
    
    // Estimate token counts (rough approximation: ~4 characters per token)
    const inputTokens = Math.ceil(params.prompt.length / 4);
    const outputTokens = Math.ceil(dummyContent.length / 4);
    
    const cost = this.estimateCost(modelId, inputTokens, outputTokens);
    
    return {
      content: dummyContent,
      model: modelId,
      inputTokens,
      outputTokens,
      duration: Math.round(processingDelay),
      cost,
      metadata: {
        isDummyResponse: true,
        provider: this.info.name,
        timestamp: new Date().toISOString(),
      },
    };
  }
}