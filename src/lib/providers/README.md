# AI Model Provider Abstraction System

An extensible abstraction layer for AI model providers that makes it easy to integrate and compare multiple AI services like Anthropic Claude and OpenAI GPT models.

## Features

- 🔌 **Extensible Architecture**: Easy to add new providers by implementing the base interface
- 🚀 **Multiple Providers**: Built-in support for Anthropic and OpenAI with more coming
- 📊 **Model Comparison**: Compare responses from multiple models in parallel
- 💰 **Cost Tracking**: Automatic cost estimation and budget-friendly model filtering
- 🎯 **Capability Filtering**: Find models by specific capabilities (vision, function calling, etc.)
- 🛡️ **Error Handling**: Robust error handling with detailed error information
- 📈 **Performance**: Optimized for concurrent requests and efficient resource usage

## Quick Start

```typescript
import { providerRegistry, setupProviders } from '@/lib/providers';

// 1. Configure providers
await setupProviders({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

// 2. Compare models
const results = await providerRegistry.compareModels(
  ['gpt-4o', 'claude-3-5-sonnet-20241022'],
  { 
    prompt: 'Explain quantum computing in simple terms',
    maxTokens: 500 
  }
);

// 3. Process results
results.forEach(({ modelId, response, error }) => {
  if (error) {
    console.log(`❌ ${modelId}: ${error.message}`);
  } else {
    console.log(`✅ ${modelId}: ${response.content}`);
    console.log(`   Cost: $${response.cost.toFixed(6)}`);
  }
});
```

## Supported Models

### Anthropic (Claude)
- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`) - Latest and most capable
- **Claude 3 Opus** (`claude-3-opus-20240229`) - Most intelligent for complex tasks
- **Claude 3 Haiku** (`claude-3-haiku-20240307`) - Fast and cost-effective

### OpenAI (GPT)
- **GPT-4o** (`gpt-4o`) - Latest multimodal model
- **GPT-4 Turbo** (`gpt-4-turbo-2024-04-09`) - High capability with vision
- **GPT-3.5 Turbo** (`gpt-3.5-turbo-0125`) - Fast and cost-effective

## Architecture

```
src/lib/providers/
├── types.ts                 # Core TypeScript types
├── base-provider.ts         # Abstract base class and interface
├── anthropic-provider.ts    # Anthropic Claude implementation
├── openai-provider.ts       # OpenAI GPT implementation
├── provider-registry.ts     # Central registry for all providers
├── index.ts                 # Main exports and convenience functions
├── example-usage.ts         # Usage examples and demos
├── test-providers.ts        # Test suite
└── README.md               # This file
```

## Core Concepts

### Provider Interface

Every provider implements the `AIProvider` interface:

```typescript
interface AIProvider {
  readonly info: ProviderInfo;
  readonly models: ModelMetadata[];
  
  initialize(config: ProviderConfig): Promise<void>;
  isConfigured(): boolean;
  validateConnection(): Promise<boolean>;
  getModel(modelId: string): ModelMetadata | undefined;
  complete(modelId: string, params: CompletionParams): Promise<CompletionResponse>;
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number;
}
```

### Provider Registry

The `ProviderRegistry` manages all providers and provides high-level operations:

- Model discovery and enumeration
- Provider configuration management
- Parallel model comparison
- Capability-based filtering
- Cost analysis

## Usage Examples

### Finding Models by Capabilities

```typescript
// Find models that support vision
const visionModels = providerRegistry.getModelsByCapabilities({ 
  vision: true 
});

// Find budget-friendly models
const budgetModels = providerRegistry.getModelsByPriceRange(0.001, 0.01);

// Get cost analysis
const { cheapest, flagship } = getRecommendedModels();
```

### Working with Specific Providers

```typescript
// Get a specific provider
const anthropicProvider = providerRegistry.getProvider('anthropic');

await anthropicProvider.initialize({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30000,
});

// Use provider directly
const response = await anthropicProvider.complete('claude-3-5-sonnet-20241022', {
  prompt: 'Write a haiku about programming',
  maxTokens: 100,
});
```

### Batch Operations

```typescript
// Configure all providers at once
await providerRegistry.configureProviders({
  openai: { apiKey: process.env.OPENAI_API_KEY },
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
});

// Validate all connections
const status = await providerRegistry.validateAllConnections();
console.log('Provider status:', status);

// Compare all Claude models
const claudeModels = providerRegistry.getModelsByProvider('anthropic');
const results = await providerRegistry.compareModels(
  claudeModels.map(m => m.id),
  { prompt: 'Your prompt here' }
);
```

## Adding New Providers

To add a new provider:

1. **Create the provider class** extending `BaseAIProvider`
2. **Implement the required methods** (especially `complete()`)
3. **Define model metadata** with pricing and capabilities
4. **Register with the registry** in the constructor or initialization

Example:

```typescript
export class NewProvider extends BaseAIProvider {
  readonly info: ProviderInfo = {
    name: 'newprovider',
    displayName: 'New AI Provider',
    description: 'Description of the new provider',
    website: 'https://newprovider.com',
    requiresApiKey: true,
    models: [],
  };

  readonly models: ModelMetadata[] = [
    {
      id: 'new-model-v1',
      name: 'New Model v1',
      provider: 'newprovider',
      maxTokens: 128000,
      inputCostPer1kTokens: 0.002,
      outputCostPer1kTokens: 0.008,
      supportsStreaming: true,
      capabilities: {
        vision: false,
        functionCalling: true,
        systemMessages: true,
      },
    },
  ];

  async complete(modelId: string, params: CompletionParams): Promise<CompletionResponse> {
    // Implement your API integration here
    // For now, return dummy response:
    return this.generateDummyResponse(modelId, params);
  }
}

// Register the provider
providerRegistry.registerProvider('newprovider', new NewProvider());
```

## Environment Variables

Create a `.env.local` file with your API keys:

```bash
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Testing

Run the test suite to verify everything is working:

```typescript
import { testProviderSystem, performanceTest } from '@/lib/providers/test-providers';

// Basic functionality test
await testProviderSystem();

// Performance test
await performanceTest();
```

## Cost Management

The system provides built-in cost tracking and analysis:

```typescript
// Get cost estimates
const model = providerRegistry.getModel('gpt-4o');
const estimatedCost = providerRegistry.estimateCost(
  'gpt-4o', 
  1000, // input tokens
  500   // output tokens
);

// Find cheapest options
const { cheapest, cheapestInput, cheapestOutput } = providerRegistry.getCheapestModels();
```

## Error Handling

The system provides structured error handling:

```typescript
try {
  const response = await provider.complete(modelId, params);
} catch (error) {
  if (error instanceof ProviderError) {
    console.log('Provider error:', error.code, error.message);
    console.log('Status:', error.status);
    console.log('Details:', error.details);
  }
}
```

## Future Enhancements

- [ ] Real API integrations (currently using dummy responses)
- [ ] Streaming response support
- [ ] Image input support for vision models
- [ ] Function calling implementation
- [ ] Rate limiting and retry logic
- [ ] Response caching
- [ ] More providers (Google Gemini, Cohere, etc.)
- [ ] Model benchmarking and performance metrics
- [ ] Cost budgeting and alerts

## Contributing

To add new providers or enhance existing ones:

1. Implement the `AIProvider` interface
2. Add comprehensive model metadata
3. Include proper error handling
4. Add tests for your implementation
5. Update documentation

The architecture is designed to be extensible - adding new providers should be straightforward and not require changes to existing code.