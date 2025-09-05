"use client"

import * as React from "react"
import { PromptInput } from "@/components/prompt-input"
import { ModelSelector } from "@/components/model-selector"
import { ComparisonTable } from "@/components/comparison-table"
import { providerRegistry, ModelMetadata, CompletionResponse } from "@/lib/providers"
import { Switch } from "@/components/ui/switch"
import { Plus, Zap } from "lucide-react"

interface ModelResult {
  model: ModelMetadata
  response: CompletionResponse | null
  error: string | null
  isLoading: boolean
}

export default function Home() {
  const [prompt, setPrompt] = React.useState("")
  const [selectedModels, setSelectedModels] = React.useState<ModelMetadata[]>([])
  const [modelResults, setModelResults] = React.useState<ModelResult[]>([])
  const [isRunning, setIsRunning] = React.useState(false)
  const [useRealAPI, setUseRealAPI] = React.useState(false)
  
  // Get available models from the provider registry
  const availableModels = React.useMemo(() => {
    try {
      return providerRegistry.getAllModels()
    } catch (error) {
      console.error("Error loading models:", error)
      return []
    }
  }, [])
  
  // Initialize with a couple of popular models
  React.useEffect(() => {
    if (availableModels.length > 0 && selectedModels.length === 0) {
      const defaultModels = availableModels.filter(model => 
        model.id.includes('gpt-4o') || model.id.includes('claude-3-5-sonnet')
      ).slice(0, 2)
      
      if (defaultModels.length > 0) {
        setSelectedModels(defaultModels)
        setModelResults(defaultModels.map(model => ({
          model,
          response: null,
          error: null,
          isLoading: false
        })))
      }
    }
  }, [availableModels, selectedModels.length])
  
  const handleModelToggle = (model: ModelMetadata) => {
    const isCurrentlySelected = selectedModels.some(m => m.id === model.id)
    
    if (isCurrentlySelected) {
      // Remove model
      const newSelectedModels = selectedModels.filter(m => m.id !== model.id)
      setSelectedModels(newSelectedModels)
      setModelResults(newSelectedModels.map(m => ({
        model: m,
        response: null,
        error: null,
        isLoading: false
      })))
    } else {
      // Add model
      const newSelectedModels = [...selectedModels, model]
      setSelectedModels(newSelectedModels)
      setModelResults(newSelectedModels.map(m => ({
        model: m,
        response: null,
        error: null,
        isLoading: false
      })))
    }
  }
  
  const handleRemoveModel = (modelId: string) => {
    const newSelectedModels = selectedModels.filter(m => m.id !== modelId)
    setSelectedModels(newSelectedModels)
    setModelResults(newSelectedModels.map(m => ({
      model: m,
      response: null,
      error: null,
      isLoading: false
    })))
  }
  
  const handleRun = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return
    
    setIsRunning(true)
    
    // Set all models to loading state
    setModelResults(prevResults => 
      prevResults.map(result => ({
        ...result,
        isLoading: true,
        error: null,
        response: null
      }))
    )
    
    // Run completions for each model
    const completionPromises = selectedModels.map(async (model) => {
      try {
        let response: CompletionResponse
        
        if (useRealAPI) {
          // Call real API
          const provider = model.provider === 'openrouter' ? 'openrouter' : 
                          model.id.includes('openrouter') ? 'openrouter' :
                          model.id.includes('gpt') ? 'openai' : 
                          model.id.includes('claude') ? 'anthropic' : model.provider
          
          const apiResponse = await fetch('/api/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider,
              modelId: model.id,
              prompt,
              temperature: 0.7,
              maxTokens: 4096,
              useOpenRouter: provider === 'openrouter' || model.id.includes('/')
            }),
          })
          
          if (!apiResponse.ok) {
            const error = await apiResponse.json()
            throw new Error(error.details || error.error || 'API request failed')
          }
          
          response = await apiResponse.json()
        } else {
          // Generate dummy response
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
          
          response = {
            content: `This is a sample response from ${model.name}. In a real implementation, this would be the actual response from the AI model. The response would be generated based on your prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
            model: model.id,
            inputTokens: Math.floor(prompt.length / 4),
            outputTokens: Math.floor(Math.random() * 200) + 50,
            duration: Math.floor(Math.random() * 3000) + 500,
            cost: Math.random() * 0.001,
            metadata: {}
          }
        }
        
        return {
          modelId: model.id,
          response,
          error: null
        }
      } catch (error) {
        return {
          modelId: model.id,
          response: null,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        }
      }
    })
    
    // Wait for all completions and update results as they complete
    const results = await Promise.all(completionPromises)
    
    // Update model results with responses
    setModelResults(prevResults =>
      prevResults.map(result => {
        const completionResult = results.find(r => r.modelId === result.model.id)
        if (completionResult) {
          return {
            ...result,
            response: completionResult.response,
            error: completionResult.error,
            isLoading: false
          }
        }
        return result
      })
    )
    
    setIsRunning(false)
  }
  
  const handleClear = () => {
    setPrompt("")
    setModelResults(prevResults =>
      prevResults.map(result => ({
        ...result,
        response: null,
        error: null,
        isLoading: false
      }))
    )
  }
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-full p-4 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Switch
              checked={useRealAPI}
              onCheckedChange={setUseRealAPI}
              className="data-[state=checked]:bg-green-500"
            />
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${useRealAPI ? 'text-green-500' : 'text-zinc-500'}`} />
              <span className={`text-xs font-mono ${useRealAPI ? 'text-green-500' : 'text-zinc-500'}`}>
                {useRealAPI ? 'Real API' : 'Sample Mode'}
              </span>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            {selectedModels.length} models selected
          </div>
        </div>

        {/* Prompt Input */}
        <PromptInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onRun={handleRun}
          onClear={handleClear}
          isRunning={isRunning}
          disabled={selectedModels.length === 0}
        />

        {/* Comparison Table */}
        <ComparisonTable
          prompt={prompt}
          modelResults={modelResults}
          availableModels={availableModels}
          selectedModels={selectedModels}
          onModelToggle={handleModelToggle}
          disabled={isRunning}
        />
      </div>
    </div>
  )
}