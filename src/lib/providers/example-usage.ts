/**
 * Example usage of the AI Provider system
 * This file demonstrates how to use the provider abstraction layer
 */

import { 
  providerRegistry, 
  setupProviders, 
  getRecommendedModels,
  validateEnvironment 
} from './index';

/**
 * Example: Basic setup and model comparison
 */
export async function exampleBasicUsage() {
  // 1. Validate environment
  const envCheck = validateEnvironment();
  console.log('Environment validation:', envCheck);

  // 2. Setup providers (in a real app, these would come from environment variables)
  await setupProviders({
    openaiApiKey: 'your-openai-key-here',
    anthropicApiKey: 'your-anthropic-key-here',
  });

  // 3. Get all available models
  const allModels = providerRegistry.getAllModels();
  console.log(`Available models: ${allModels.length}`);
  allModels.forEach(model => {
    console.log(`- ${model.name} (${model.provider}): $${model.inputCostPer1kTokens}/1K input tokens`);
  });

  // 4. Compare responses from multiple models
  const prompt = "Explain quantum computing in simple terms";
  const modelIds = ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gpt-3.5-turbo-0125'];

  console.log(`\nComparing responses for prompt: "${prompt}"`);
  
  const results = await providerRegistry.compareModels(modelIds, {
    prompt,
    maxTokens: 500,
    temperature: 0.7,
  });

  results.forEach(({ modelId, response, error }) => {
    if (error) {
      console.log(`❌ ${modelId}: Error - ${error.message}`);
    } else {
      console.log(`✅ ${modelId}:`);
      console.log(`   Response: ${response.content.substring(0, 100)}...`);
      console.log(`   Tokens: ${response.inputTokens} in, ${response.outputTokens} out`);
      console.log(`   Cost: $${response.cost.toFixed(6)}`);
      console.log(`   Duration: ${response.duration}ms`);
    }
  });
}

/**
 * Example: Working with specific providers
 */
export async function exampleProviderSpecific() {
  // Get a specific provider
  const openaiProvider = providerRegistry.getProvider('openai');
  if (!openaiProvider) {
    console.log('OpenAI provider not available');
    return;
  }

  // Configure the provider
  await openaiProvider.initialize({
    apiKey: 'your-api-key-here',
    timeout: 30000,
  });

  // Check if it's configured
  console.log('OpenAI configured:', openaiProvider.isConfigured());

  // Get a specific model
  const gpt4Model = openaiProvider.getModel('gpt-4o');
  console.log('GPT-4o model:', gpt4Model);

  // Generate a completion
  const response = await openaiProvider.complete('gpt-4o', {
    prompt: 'Write a haiku about programming',
    maxTokens: 100,
    temperature: 0.8,
  });

  console.log('Response:', response.content);
}

/**
 * Example: Finding models by capabilities
 */
export async function exampleCapabilityFiltering() {
  // Find models that support vision
  const visionModels = providerRegistry.getModelsByCapabilities({ vision: true });
  console.log('Vision-capable models:');
  visionModels.forEach(model => console.log(`- ${model.name}`));

  // Find budget-friendly models
  const budgetModels = providerRegistry.getModelsByPriceRange(0.001, 0.01);
  console.log('\nBudget-friendly models (≤$0.001 input, ≤$0.01 output per 1K tokens):');
  budgetModels.forEach(model => {
    console.log(`- ${model.name}: $${model.inputCostPer1kTokens}/$${model.outputCostPer1kTokens} per 1K tokens`);
  });

  // Get recommended models
  const recommended = getRecommendedModels();
  console.log('\nRecommended models:');
  console.log('- Flagship:', recommended.flagship?.name);
  console.log('- Balanced:', recommended.balanced?.name);
  console.log('- Fast:', recommended.fast?.name);
  console.log('- Cheapest:', recommended.cheapest?.name);
}

/**
 * Example: Error handling
 */
export async function exampleErrorHandling() {
  try {
    // Try to use a model that doesn't exist
    const result = providerRegistry.findModel('nonexistent-model');
    console.log('Model found:', result);
  } catch (error) {
    console.log('Expected error for nonexistent model:', error);
  }

  try {
    // Try to complete without configuration
    const unconfiguredProvider = providerRegistry.getProvider('openai');
    await unconfiguredProvider?.complete('gpt-4o', { prompt: 'test' });
  } catch (error) {
    console.log('Expected configuration error:', error);
  }
}

/**
 * Example: Batch operations
 */
export async function exampleBatchOperations() {
  // Configure all providers at once
  await providerRegistry.configureProviders({
    openai: { apiKey: 'openai-key' },
    anthropic: { apiKey: 'anthropic-key' },
  });

  // Validate all connections
  const connectionResults = await providerRegistry.validateAllConnections();
  console.log('Connection validation results:', connectionResults);

  // Get all configured providers
  const configuredProviders = providerRegistry.getConfiguredProviders();
  console.log('Configured providers:', configuredProviders);

  // Run the same prompt across all Claude models
  const claudeModels = providerRegistry.getModelsByProvider('anthropic').map(m => m.id);
  const claudeResults = await providerRegistry.compareModels(claudeModels, {
    prompt: 'What are the benefits of TypeScript over JavaScript?',
    maxTokens: 300,
  });

  console.log('Claude model comparison:');
  claudeResults.forEach(({ modelId, response, error }) => {
    if (!error) {
      const model = providerRegistry.findModel(modelId)?.model;
      console.log(`${model?.name}: ${response.content.length} chars, $${response.cost.toFixed(6)}`);
    }
  });
}

// Export all examples for easy testing
export const examples = {
  basic: exampleBasicUsage,
  providerSpecific: exampleProviderSpecific,
  capabilityFiltering: exampleCapabilityFiltering,
  errorHandling: exampleErrorHandling,
  batchOperations: exampleBatchOperations,
};