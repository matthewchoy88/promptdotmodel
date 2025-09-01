/**
 * Next.js integration example showing how to use the provider system
 * in a React component
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  providerRegistry, 
  setupProviders, 
  CompletionResponse,
  ModelMetadata 
} from './index';

interface ComparisonResult {
  modelId: string;
  model: ModelMetadata;
  response?: CompletionResponse;
  error?: string;
  loading: boolean;
}

export function ModelComparisonExample() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  // Initialize providers on component mount
  useEffect(() => {
    const initializeProviders = async () => {
      try {
        await setupProviders({
          // In a real app, these would come from environment variables
          // For demo purposes, we're using dummy keys
          openaiApiKey: 'demo-openai-key',
          anthropicApiKey: 'demo-anthropic-key',
        });
        setIsConfigured(true);
      } catch (error) {
        console.error('Failed to initialize providers:', error);
      }
    };

    initializeProviders();
  }, []);

  const handleCompare = async () => {
    if (!prompt.trim()) return;

    setIsComparing(true);
    
    // Select a few models to compare
    const selectedModelIds = [
      'gpt-4o',
      'claude-3-5-sonnet-20241022',
      'gpt-3.5-turbo-0125'
    ];

    // Initialize results with loading state
    const initialResults: ComparisonResult[] = selectedModelIds.map(modelId => {
      const modelInfo = providerRegistry.findModel(modelId);
      return {
        modelId,
        model: modelInfo!.model,
        loading: true,
      };
    });
    setResults(initialResults);

    try {
      // Run the comparison
      const comparisonResults = await providerRegistry.compareModels(
        selectedModelIds,
        {
          prompt,
          maxTokens: 500,
          temperature: 0.7,
        }
      );

      // Update results with actual responses
      const updatedResults = comparisonResults.map(({ modelId, response, error }) => {
        const modelInfo = providerRegistry.findModel(modelId);
        return {
          modelId,
          model: modelInfo!.model,
          response: response || undefined,
          error: error?.message,
          loading: false,
        };
      });

      setResults(updatedResults);
    } catch (error) {
      console.error('Comparison failed:', error);
      // Update all results to show error
      setResults(prev => prev.map(result => ({
        ...result,
        error: 'Comparison failed',
        loading: false,
      })));
    } finally {
      setIsComparing(false);
    }
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Model Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Initializing AI providers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="prompt" className="text-sm font-medium">
              Enter your prompt:
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question or give instructions..."
              className="mt-2"
            />
          </div>
          
          <Button 
            onClick={handleCompare}
            disabled={!prompt.trim() || isComparing}
            className="w-full"
          >
            {isComparing ? 'Comparing Models...' : 'Compare Models'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => (
            <Card key={result.modelId} className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">{result.model.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {result.model.provider} • ${result.model.inputCostPer1kTokens}/1K tokens
                </p>
              </CardHeader>
              <CardContent>
                {result.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm">Generating...</span>
                  </div>
                ) : result.error ? (
                  <div className="text-sm text-destructive">
                    Error: {result.error}
                  </div>
                ) : result.response ? (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium mb-2">Response:</div>
                      <p className="text-muted-foreground leading-relaxed">
                        {result.response.content}
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span>{result.response.inputTokens} in, {result.response.outputTokens} out</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span>${result.response.cost.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{result.response.duration}ms</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No response available
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simple provider status component
 */
export function ProviderStatusExample() {
  const [providers, setProviders] = useState<Array<{
    name: string;
    displayName: string;
    configured: boolean;
    modelCount: number;
  }>>([]);

  useEffect(() => {
    const loadProviderStatus = async () => {
      const allProviders = providerRegistry.getAllProviders();
      const configuredProviders = providerRegistry.getConfiguredProviders();
      
      const status = allProviders.map(provider => ({
        name: provider.info.name,
        displayName: provider.info.displayName,
        configured: configuredProviders.includes(provider.info.name),
        modelCount: provider.models.length,
      }));
      
      setProviders(status);
    };

    loadProviderStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {providers.map((provider) => (
            <div 
              key={provider.name} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <div className="font-medium">{provider.displayName}</div>
                <div className="text-sm text-muted-foreground">
                  {provider.modelCount} models available
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                provider.configured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {provider.configured ? 'Configured' : 'Not Configured'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}