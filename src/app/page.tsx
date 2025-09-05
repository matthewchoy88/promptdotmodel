"use client"

import * as React from "react"
import { PromptInput } from "@/components/prompt-input"
import { ModelSelector } from "@/components/model-selector"
import { ComparisonTable } from "@/components/comparison-table"
import { EvalConfig, LLMJudgeConfig } from "@/components/add-eval-dialog"
import { providerRegistry, ModelMetadata, CompletionResponse } from "@/lib/providers"
import { Switch } from "@/components/ui/switch"
import { Plus, Zap } from "lucide-react"

interface ModelResult {
  model: ModelMetadata
  response: CompletionResponse | null
  error: string | null
  isLoading: boolean
}

interface EvalResult {
  evalId: string
  modelId: string
  result: string | null
  isLoading: boolean
  error: string | null
}

export default function Home() {
  const [prompt, setPrompt] = React.useState("")
  const [selectedModels, setSelectedModels] = React.useState<ModelMetadata[]>([])
  const [modelResults, setModelResults] = React.useState<ModelResult[]>([])
  const [isRunning, setIsRunning] = React.useState(false)
  const [useRealAPI, setUseRealAPI] = React.useState(false)
  const [evals, setEvals] = React.useState<EvalConfig[]>([])
  const [evalResults, setEvalResults] = React.useState<EvalResult[]>([])
  const [autoRunEvals, setAutoRunEvals] = React.useState(false)
  
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
    
    // Auto-run evaluations if enabled
    if (autoRunEvals && evals.length > 0) {
      // Wait for state to update with the new model results
      setTimeout(async () => {
        for (const evalConfig of evals) {
          await handleRunEval(evalConfig)
        }
      }, 100)
    }
    
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
    setEvalResults([])
  }
  
  const handleAddEval = (config: EvalConfig) => {
    setEvals(prev => [...prev, config])
  }
  
  const handleEditEval = (config: EvalConfig) => {
    setEvals(prev => prev.map(e => 
      e.name === config.name ? config : e
    ))
    // Clear any cached results for this eval since config changed
    setEvalResults(prev => prev.filter(r => r.evalId !== config.name))
  }
  
  const handleRunEval = async (evalConfig: EvalConfig) => {
    if (evalConfig.type !== 'llm-judge') return
    
    const judgeConfig = evalConfig as LLMJudgeConfig
    if (!judgeConfig.model) return
    
    // Set loading state for all models for this eval
    setEvalResults(prev => [
      ...prev.filter(r => r.evalId !== evalConfig.name),
      ...modelResults.map(result => ({
        evalId: evalConfig.name,
        modelId: result.model.id,
        result: null,
        isLoading: result.response !== null,
        error: null
      }))
    ])
    
    // Run eval for each model that has a response
    const evalPromises = modelResults
      .filter(result => result.response !== null)
      .map(async (modelResult) => {
        try {
          // Prepare the judge prompt with placeholders replaced (replace all occurrences)
          const judgePrompt = judgeConfig.prompt
            .replace(/\{input\}/g, prompt)
            .replace(/\{output\}/g, modelResult.response?.content || '')
          
          let response: CompletionResponse
          
          if (useRealAPI && judgeConfig.model) {
            const provider = judgeConfig.model.provider === 'openrouter' ? 'openrouter' : 
                            judgeConfig.model.id.includes('openrouter') ? 'openrouter' :
                            judgeConfig.model.id.includes('gpt') ? 'openai' : 
                            judgeConfig.model.id.includes('claude') ? 'anthropic' : judgeConfig.model.provider
            
            const apiResponse = await fetch('/api/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider,
                modelId: judgeConfig.model.id,
                prompt: judgePrompt,
                temperature: 0.3,
                maxTokens: 500,
                useOpenRouter: provider === 'openrouter' || judgeConfig.model.id.includes('/')
              }),
            })
            
            if (!apiResponse.ok) {
              const error = await apiResponse.json()
              throw new Error(error.details || error.error || 'API request failed')
            }
            
            response = await apiResponse.json()
          } else {
            // Generate dummy eval response
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
            
            const scores = [7, 8, 9, 6, 8.5, 7.5]
            const score = scores[Math.floor(Math.random() * scores.length)]
            const evaluations = [
              `Score: ${score}/10\n\nThe response demonstrates good understanding of the prompt with clear and relevant content.`,
              `Score: ${score}/10\n\nWell-structured response that addresses the key points effectively.`,
              `Score: ${score}/10\n\nThe output shows competent handling of the task with minor areas for improvement.`,
            ]
            
            response = {
              content: evaluations[Math.floor(Math.random() * evaluations.length)],
              model: judgeConfig.model?.id || 'unknown',
              inputTokens: Math.floor(judgePrompt.length / 4),
              outputTokens: 50,
              duration: Math.floor(Math.random() * 1000) + 200,
              cost: Math.random() * 0.0001,
              metadata: {}
            }
          }
          
          return {
            evalId: evalConfig.name,
            modelId: modelResult.model.id,
            result: response.content,
            isLoading: false,
            error: null
          }
        } catch (error) {
          return {
            evalId: evalConfig.name,
            modelId: modelResult.model.id,
            result: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    
    const results = await Promise.all(evalPromises)
    
    // Update eval results
    setEvalResults(prev => [
      ...prev.filter(r => r.evalId !== evalConfig.name),
      ...results
    ])
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
          autoRunEvals={autoRunEvals}
          onAutoRunEvalsChange={setAutoRunEvals}
          hasEvals={evals.length > 0}
        />

        {/* Comparison Table */}
        <ComparisonTable
          prompt={prompt}
          modelResults={modelResults}
          availableModels={availableModels}
          selectedModels={selectedModels}
          onModelToggle={handleModelToggle}
          disabled={isRunning}
          evals={evals}
          evalResults={evalResults}
          onAddEval={handleAddEval}
          onRunEvals={handleRunEval}
          onEditEval={handleEditEval}
        />
      </div>
    </div>
  )
}