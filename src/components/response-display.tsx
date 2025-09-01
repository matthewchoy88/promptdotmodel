"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Clock, DollarSign, FileText } from "lucide-react"
import { CompletionResponse } from "@/lib/providers"

interface ResponseDisplayProps {
  response: CompletionResponse
  className?: string
}

export function ResponseDisplay({ response, className }: ResponseDisplayProps) {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(response.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [response.content])
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Response</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Response Content */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 bg-gray-50 rounded-lg p-4 border">
              {response.content}
            </div>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3" />
                <span>Tokens</span>
              </div>
              <div className="text-sm font-medium">
                {response.outputTokens.toLocaleString()} output
              </div>
              <div className="text-xs text-muted-foreground">
                {response.inputTokens.toLocaleString()} input
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Time</span>
              </div>
              <div className="text-sm font-medium">
                {(response.duration / 1000).toFixed(2)}s
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                <span>Cost</span>
              </div>
              <div className="text-sm font-medium">
                ${response.cost.toFixed(6)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Model</span>
              </div>
              <div className="text-sm font-medium truncate">
                {response.model}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}