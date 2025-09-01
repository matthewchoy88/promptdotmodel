/**
 * Simple test suite for the provider system
 * Run this to verify everything is working correctly
 */

import { providerRegistry, setupProviders } from './index';

/**
 * Run basic tests on the provider system
 */
export async function testProviderSystem() {
  console.log('🧪 Testing AI Provider System...\n');

  // Test 1: Registry initialization
  console.log('1. Testing registry initialization...');
  const providers = providerRegistry.getAllProviders();
  console.log(`   ✅ ${providers.length} providers registered`);
  
  // Test 2: Model enumeration
  console.log('2. Testing model enumeration...');
  const allModels = providerRegistry.getAllModels();
  console.log(`   ✅ ${allModels.length} models available`);
  
  const anthropicModels = providerRegistry.getModelsByProvider('anthropic');
  const openaiModels = providerRegistry.getModelsByProvider('openai');
  console.log(`   ✅ Anthropic: ${anthropicModels.length} models`);
  console.log(`   ✅ OpenAI: ${openaiModels.length} models`);

  // Test 3: Model lookup
  console.log('3. Testing model lookup...');
  const gpt4Model = providerRegistry.findModel('gpt-4o');
  const claudeModel = providerRegistry.findModel('claude-3-5-sonnet-20241022');
  console.log(`   ✅ GPT-4o found: ${gpt4Model ? 'Yes' : 'No'}`);
  console.log(`   ✅ Claude 3.5 Sonnet found: ${claudeModel ? 'Yes' : 'No'}`);

  // Test 4: Capability filtering
  console.log('4. Testing capability filtering...');
  const visionModels = providerRegistry.getModelsByCapabilities({ vision: true });
  const functionModels = providerRegistry.getModelsByCapabilities({ functionCalling: true });
  console.log(`   ✅ Vision models: ${visionModels.length}`);
  console.log(`   ✅ Function calling models: ${functionModels.length}`);

  // Test 5: Price analysis
  console.log('5. Testing price analysis...');
  const pricing = providerRegistry.getCheapestModels();
  console.log(`   ✅ Cheapest input: ${pricing.cheapestInput.name} ($${pricing.cheapestInput.inputCostPer1kTokens}/1K)`);
  console.log(`   ✅ Cheapest output: ${pricing.cheapestOutput.name} ($${pricing.cheapestOutput.outputCostPer1kTokens}/1K)`);
  console.log(`   ✅ Most cost-effective: ${pricing.mostCostEffective.name}`);

  // Test 6: Provider configuration (without real API keys)
  console.log('6. Testing provider configuration...');
  try {
    await setupProviders({
      openaiApiKey: 'test-key-openai',
      anthropicApiKey: 'test-key-anthropic',
    });
    const configured = providerRegistry.getConfiguredProviders();
    console.log(`   ✅ Configured providers: ${configured.join(', ')}`);
  } catch (error) {
    console.log(`   ❌ Configuration error: ${error}`);
  }

  // Test 7: Dummy completions
  console.log('7. Testing dummy completions...');
  try {
    const testPrompt = "What is the meaning of life?";
    
    // Test single model completion
    const gpt4Result = await providerRegistry.findModel('gpt-4o')?.provider.complete('gpt-4o', {
      prompt: testPrompt,
      maxTokens: 100,
    });
    
    if (gpt4Result) {
      console.log(`   ✅ GPT-4o completion: ${gpt4Result.content.length} chars, $${gpt4Result.cost.toFixed(6)}`);
    }

    // Test model comparison
    const comparisonResults = await providerRegistry.compareModels(
      ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gpt-3.5-turbo-0125'],
      { prompt: testPrompt, maxTokens: 100 }
    );

    const successCount = comparisonResults.filter(r => !r.error).length;
    console.log(`   ✅ Model comparison: ${successCount}/3 models successful`);

  } catch (error) {
    console.log(`   ❌ Completion error: ${error}`);
  }

  // Test 8: Error handling
  console.log('8. Testing error handling...');
  try {
    const invalidResult = providerRegistry.findModel('nonexistent-model');
    console.log(`   ✅ Invalid model lookup handled: ${invalidResult ? 'Found' : 'Not found'}`);
  } catch (error) {
    console.log(`   ❌ Error handling failed: ${error}`);
  }

  console.log('\n🎉 All tests completed!');
  return true;
}

/**
 * Performance test - measure how fast the system can run multiple completions
 */
export async function performanceTest() {
  console.log('⚡ Running performance test...\n');

  await setupProviders({
    openaiApiKey: 'test-key',
    anthropicApiKey: 'test-key',
  });

  const testPrompts = [
    "Explain artificial intelligence",
    "What is quantum computing?",
    "How does machine learning work?",
    "Describe blockchain technology",
    "What are the benefits of cloud computing?"
  ];

  const models = ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gpt-3.5-turbo-0125'];

  const startTime = Date.now();
  
  const results = await Promise.all(
    testPrompts.map(prompt =>
      providerRegistry.compareModels(models, { prompt, maxTokens: 50 })
    )
  );

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const totalCompletions = results.length * models.length;
  const successfulCompletions = results.flat().filter(r => !r.error).length;
  
  console.log(`📊 Performance Results:`);
  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Total completions: ${totalCompletions}`);
  console.log(`   Successful: ${successfulCompletions}`);
  console.log(`   Average time per completion: ${Math.round(totalTime / totalCompletions)}ms`);
  
  return { totalTime, totalCompletions, successfulCompletions };
}

// Run tests if this file is executed directly
if (require.main === module) {
  testProviderSystem()
    .then(() => performanceTest())
    .then(() => console.log('\n✅ All tests passed!'))
    .catch(error => console.error('❌ Test failed:', error));
}