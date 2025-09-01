"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponseDisplay } from "./response-display"
import { X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { ModelMetadata, CompletionResponse } from "@/lib/providers"

interface ModelColumnProps {
  model: ModelMetadata
  response: CompletionResponse | null
  error: string | null
  isLoading: boolean
  onRemove: () => void
  canRemove?: boolean
}

export function ModelColumn({
  model,
  response,
  error,
  isLoading,
  onRemove,
  canRemove = true
}: ModelColumnProps) {
  return (
    <div className="flex flex-col min-w-[340px] w-full max-w-lg">
      {/* Modern Model Header */}
      <Card className="mb-4 glass border-border/50 hover:shadow-elevated transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Model Name & Provider */}
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {model.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {model.provider}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">{model.maxTokens.toLocaleString()}</span> tokens
                </p>
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

              {/* Pricing */}
              <div className="flex justify-between items-center text-xs pt-3 border-t border-border/50">
                <div className="text-muted-foreground">
                  <span className="text-foreground/80 font-medium">Input:</span> ${model.inputCostPer1kTokens.toFixed(4)}/1k
                </div>
                <div className="text-muted-foreground">
                  <span className="text-foreground/80 font-medium">Output:</span> ${model.outputCostPer1kTokens.toFixed(4)}/1k
                </div>
              </div>
            </div>
            
            {/* Remove Button */}
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-200 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Response Content */}
      <div className="flex-1">
        {/* Loading State */}
        {isLoading && (
          <Card className="min-h-[300px] glass border-border/50 animate-glow">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full p-8">
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <div className="absolute inset-0 w-10 h-10 rounded-full bg-primary/20 animate-ping"></div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Generating response...</p>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  AI model is processing your prompt with advanced reasoning
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 glass">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="font-semibold text-foreground">Generation Error</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Response Display */}
        {response && !isLoading && !error && (
          <div className="animate-slide-up">
            <ResponseDisplay response={response} />
          </div>
        )}
        
        {/* Ready State */}
        {!response && !isLoading && !error && (
          <Card className="min-h-[300px] border-dashed border-border/50 glass hover:border-primary/50 transition-all duration-300 group">
            <CardContent className="flex flex-col items-center justify-center text-center h-full p-8 gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CheckCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Ready to Generate</p>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  AI response will appear here after running your prompt
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}