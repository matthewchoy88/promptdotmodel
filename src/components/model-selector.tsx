"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Check } from "lucide-react"
import { ModelMetadata } from "@/lib/providers"

interface ModelSelectorProps {
  availableModels: ModelMetadata[]
  selectedModels: ModelMetadata[]
  onModelToggle: (model: ModelMetadata) => void
  disabled?: boolean
}

export function ModelSelector({
  availableModels,
  selectedModels,
  onModelToggle,
  disabled = false
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const selectedModelIds = selectedModels.map(m => m.id)
  
  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, ModelMetadata[]>)
  
  const handleModelToggle = (model: ModelMetadata) => {
    onModelToggle(model)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="min-h-[300px] border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-300 group glass hover:shadow-elevated">
          <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 transform duration-300">
              <Plus className="w-8 h-8 text-primary group-hover:text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Add AI Model
              </h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Click to browse and select from premium AI models
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
              {availableModels.length} models available
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden glass-strong border-border/50">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold gradient-text">Select AI Models</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Choose from premium AI models to compare responses. Mix and match different providers for comprehensive analysis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-8">
          {Object.entries(groupedModels).map(([provider, models]) => (
            <div key={provider} className="space-y-4">
              {/* Provider Header */}
              <div className="flex items-center gap-3 pb-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h3 className="text-xl font-bold capitalize text-foreground">{provider}</h3>
                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {models.length} models
                </div>
              </div>
              
              {/* Model Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {models.map((model) => {
                  const isSelected = selectedModelIds.includes(model.id)
                  return (
                    <Card
                      key={model.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-elevated group ${
                        isSelected 
                          ? 'ring-2 ring-primary bg-primary/5 border-primary/50 shadow-glow' 
                          : 'hover:bg-accent/20 border-border/50 glass'
                      }`}
                      onClick={() => handleModelToggle(model)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {model.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground mt-1">
                              <span className="inline-flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground/50'}`}></div>
                                {model.provider} • {model.maxTokens.toLocaleString()} tokens
                              </span>
                            </CardDescription>
                          </div>
                          {isSelected && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-scale-in">
                              <Check className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-4">
                        {/* Pricing */}
                        <div className="flex justify-between items-center text-xs bg-background/30 rounded-lg p-3">
                          <div className="text-muted-foreground">
                            <span className="text-foreground font-medium">Input:</span> ${model.inputCostPer1kTokens.toFixed(4)}/1k
                          </div>
                          <div className="text-muted-foreground">
                            <span className="text-foreground font-medium">Output:</span> ${model.outputCostPer1kTokens.toFixed(4)}/1k
                          </div>
                        </div>
                        
                        {/* Capabilities */}
                        <div className="flex flex-wrap gap-2">
                          {model.capabilities.vision && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                              Vision
                            </span>
                          )}
                          {model.capabilities.functionCalling && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                              Functions
                            </span>
                          )}
                          {model.supportsStreaming && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
                              Streaming
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="border-t border-border/50 pt-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue with Selected Models
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}