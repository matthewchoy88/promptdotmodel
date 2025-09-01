/**
 * Core types for the AI model provider system
 */

export interface ModelMetadata {
  /** Unique identifier for the model */
  id: string;
  /** Human-readable name of the model */
  name: string;
  /** Provider that owns this model */
  provider: string;
  /** Maximum number of tokens the model can handle */
  maxTokens: number;
  /** Input cost per 1k tokens in USD */
  inputCostPer1kTokens: number;
  /** Output cost per 1k tokens in USD */
  outputCostPer1kTokens: number;
  /** Whether the model supports streaming responses */
  supportsStreaming: boolean;
  /** Additional model capabilities */
  capabilities: ModelCapabilities;
}

export interface ModelCapabilities {
  /** Whether the model can process images */
  vision: boolean;
  /** Whether the model can use function calling/tools */
  functionCalling: boolean;
  /** Whether the model can follow system instructions */
  systemMessages: boolean;
  /** Maximum number of images the model can process in one request */
  maxImages?: number;
}

export interface ProviderConfig {
  /** API key for authentication */
  apiKey?: string;
  /** Base URL for the API (if different from default) */
  baseUrl?: string;
  /** Default timeout for requests in milliseconds */
  timeout?: number;
  /** Additional headers to send with requests */
  headers?: Record<string, string>;
}

export interface CompletionParams {
  /** The input prompt/message */
  prompt: string;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Temperature for randomness (0.0 to 1.0) */
  temperature?: number;
  /** Top-p sampling parameter */
  topP?: number;
  /** System message/instructions */
  systemMessage?: string;
  /** Whether to stream the response */
  stream?: boolean;
  /** Stop sequences to end generation */
  stopSequences?: string[];
}

export interface CompletionResponse {
  /** The generated text response */
  content: string;
  /** Model that generated the response */
  model: string;
  /** Number of tokens in the input */
  inputTokens: number;
  /** Number of tokens in the output */
  outputTokens: number;
  /** Time taken to generate the response in milliseconds */
  duration: number;
  /** Cost of the request in USD */
  cost: number;
  /** Any additional metadata from the provider */
  metadata?: Record<string, any>;
}

export class ProviderError extends Error {
  /** Error code from the provider */
  code?: string;
  /** HTTP status code if applicable */
  status?: number;
  /** Additional error details */
  details?: Record<string, any>;
  
  constructor(message: string, code?: string, status?: number, details?: Record<string, any>) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export type ProviderName = 'anthropic' | 'openai';

export interface ProviderInfo {
  /** Name of the provider */
  name: ProviderName;
  /** Display name of the provider */
  displayName: string;
  /** Description of the provider */
  description: string;
  /** URL to the provider's website */
  website: string;
  /** Whether the provider requires an API key */
  requiresApiKey: boolean;
  /** Available models from this provider */
  models: ModelMetadata[];
}