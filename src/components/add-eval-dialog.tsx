"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ModelMetadata } from "@/lib/providers"
import { Gavel, Sparkles, Gauge } from "lucide-react"

export type EvalType = 'llm-judge' | 'sentiment' | 'custom'

export interface LLMJudgeConfig {
  type: 'llm-judge'
  name: string
  prompt: string
  model: ModelMetadata | null
}

export interface SentimentConfig {
  type: 'sentiment'
  name: string
}

export interface CustomEvalConfig {
  type: 'custom'
  name: string
  script: string
}

export type EvalConfig = LLMJudgeConfig | SentimentConfig | CustomEvalConfig

interface AddEvalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEval: (config: EvalConfig) => void
  availableModels: ModelMetadata[]
  initialConfig?: EvalConfig | null
}

export function AddEvalDialog({ 
  open, 
  onOpenChange, 
  onAddEval,
  availableModels,
  initialConfig 
}: AddEvalDialogProps) {
  const [evalType, setEvalType] = React.useState<EvalType>('llm-judge')
  const [evalName, setEvalName] = React.useState('')
  const [judgePrompt, setJudgePrompt] = React.useState('')
  const [selectedModel, setSelectedModel] = React.useState<ModelMetadata | null>(null)
  const [customScript, setCustomScript] = React.useState('')
  
  // Initialize form with existing config when editing
  React.useEffect(() => {
    if (!open) return // Don't update state when dialog is closed
    
    if (initialConfig) {
      setEvalType(initialConfig.type)
      setEvalName(initialConfig.name)
      
      if (initialConfig.type === 'llm-judge') {
        const llmConfig = initialConfig as LLMJudgeConfig
        setJudgePrompt(llmConfig.prompt)
        setSelectedModel(llmConfig.model)
      } else if (initialConfig.type === 'custom') {
        const customConfig = initialConfig as CustomEvalConfig
        setCustomScript(customConfig.script)
      }
    } else {
      // Reset form when not editing
      setEvalType('llm-judge')
      setEvalName('')
      setJudgePrompt('')
      setSelectedModel(null)
      setCustomScript('')
    }
  }, [initialConfig, open])

  const handleSubmit = () => {
    if (!evalName) return

    let config: EvalConfig
    
    switch (evalType) {
      case 'llm-judge':
        if (!judgePrompt || !selectedModel) return
        config = {
          type: 'llm-judge',
          name: evalName,
          prompt: judgePrompt,
          model: selectedModel
        }
        break
      case 'sentiment':
        config = {
          type: 'sentiment',
          name: evalName
        }
        break
      case 'custom':
        if (!customScript) return
        config = {
          type: 'custom',
          name: evalName,
          script: customScript
        }
        break
    }
    
    onAddEval(config)
    
    // Reset form
    setEvalName('')
    setJudgePrompt('')
    setSelectedModel(null)
    setCustomScript('')
    setEvalType('llm-judge')
    onOpenChange(false)
  }

  const isValid = React.useMemo(() => {
    if (!evalName) return false
    
    switch (evalType) {
      case 'llm-judge':
        return !!judgePrompt && !!selectedModel
      case 'sentiment':
        return true
      case 'custom':
        return !!customScript
      default:
        return false
    }
  }, [evalType, evalName, judgePrompt, selectedModel, customScript])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {initialConfig ? 'Edit Evaluation' : 'Add Evaluation Row'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {initialConfig 
              ? 'Modify the configuration for this evaluation metric' 
              : 'Configure a new evaluation metric to run against model outputs'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="eval-name" className="text-zinc-200">
              Evaluation Name
            </Label>
            <input
              id="eval-name"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Accuracy Judge, Tone Analysis"
              value={evalName}
              onChange={(e) => setEvalName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eval-type" className="text-zinc-200">
              Evaluation Type
            </Label>
            <Select value={evalType} onValueChange={(v) => setEvalType(v as EvalType)}>
              <SelectTrigger id="eval-type" className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Select evaluation type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="llm-judge" className="text-zinc-100 focus:bg-zinc-700">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    <span>LLM Judge</span>
                  </div>
                </SelectItem>
                <SelectItem value="sentiment" className="text-zinc-100 focus:bg-zinc-700" disabled>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Sentiment Analysis (Coming Soon)</span>
                  </div>
                </SelectItem>
                <SelectItem value="custom" className="text-zinc-100 focus:bg-zinc-700" disabled>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    <span>Custom Script (Coming Soon)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {evalType === 'llm-judge' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="judge-model" className="text-zinc-200">
                  Judge Model
                </Label>
                <Select 
                  value={selectedModel?.id || ''} 
                  onValueChange={(modelId) => {
                    const model = availableModels.find(m => m.id === modelId)
                    setSelectedModel(model || null)
                  }}
                >
                  <SelectTrigger id="judge-model" className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select a model to act as judge" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[300px]">
                    {availableModels.map((model) => (
                      <SelectItem 
                        key={model.id} 
                        value={model.id}
                        className="text-zinc-100 focus:bg-zinc-700"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-zinc-400">{model.provider}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="judge-prompt" className="text-zinc-200">
                  Judge Prompt Template
                </Label>
                <Textarea
                  id="judge-prompt"
                  className="min-h-[150px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="You are an expert evaluator. Analyze the following:

User's Prompt: {input}

Model's Response: {output}

Please provide:
1. A score from 1-10
2. A brief explanation of your evaluation"
                  value={judgePrompt}
                  onChange={(e) => setJudgePrompt(e.target.value)}
                />
                <p className="text-xs text-zinc-500">
                  Use {'{input}'} and {'{output}'} as placeholders for the prompt and model response
                </p>
              </div>
            </>
          )}

          {evalType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-script" className="text-zinc-200">
                Custom Evaluation Script
              </Label>
              <Textarea
                id="custom-script"
                className="min-h-[150px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 font-mono text-sm"
                placeholder="// JavaScript function that receives (input, output) and returns a result
function evaluate(input, output) {
  // Your evaluation logic here
  return { score: 0, explanation: '' }
}"
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {initialConfig ? 'Update Evaluation' : 'Add Evaluation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}