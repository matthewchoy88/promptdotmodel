"use client"

import * as React from "react"
import { ModelMetadata, CompletionResponse } from "@/lib/providers"
import { Clock, DollarSign, Hash } from "lucide-react"

interface ModelResult {
  model: ModelMetadata
  response: CompletionResponse | null
  error: string | null
  isLoading: boolean
}

interface ComparisonTableProps {
  prompt: string
  modelResults: ModelResult[]
}

export function ComparisonTable({ prompt, modelResults }: ComparisonTableProps) {
  if (modelResults.length === 0) {
    return (
      <div className="border border-zinc-800 bg-zinc-950">
        <div className="p-8 text-center">
          <p className="text-zinc-400 font-mono text-sm">
            No models selected. Add models to begin comparison.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-0">
        <table className="w-full table-fixed">
          <thead>
            <tr>
              <th className="w-48 text-left px-4 py-3 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800">
                Test Case
              </th>
              {modelResults.map((result) => (
                <th
                  key={result.model.id}
                  className="min-w-80 text-left px-4 py-3 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800 last:border-r-0"
                >
                  <div className="space-y-1">
                    <div className="text-zinc-100 font-semibold">
                      {result.model.name}
                    </div>
                    <div className="text-zinc-500 lowercase">
                      {result.model.provider}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full table-fixed">
          <tbody>
            {/* Prompt Row */}
            <tr className="border-b border-zinc-800 hover:bg-zinc-900/50">
              <td className="w-48 px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 align-top">
                prompt_001
              </td>
              {modelResults.map((result) => (
                <td
                  key={result.model.id}
                  className="min-w-80 px-4 py-4 border-r border-zinc-800 last:border-r-0 align-top"
                >
                  <div className="text-xs font-mono text-zinc-500 mb-2 break-words">
                    {prompt.length > 100 ? `${prompt.slice(0, 100)}...` : prompt}
                  </div>
                </td>
              ))}
            </tr>

            {/* Response Row */}
            <tr className="border-b border-zinc-800 hover:bg-zinc-900/50">
              <td className="w-48 px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 align-top">
                response
              </td>
              {modelResults.map((result) => (
                <td
                  key={result.model.id}
                  className="min-w-80 px-4 py-4 border-r border-zinc-800 last:border-r-0 align-top"
                >
                  {result.isLoading && (
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                      <div className="w-2 h-2 bg-yellow-500 animate-pulse"></div>
                      generating...
                    </div>
                  )}

                  {result.error && (
                    <div className="text-red-400 font-mono text-sm break-words">
                      ERROR: {result.error}
                    </div>
                  )}

                  {result.response && !result.isLoading && (
                    <div className="space-y-3">
                      <div className="text-sm text-zinc-200 font-mono leading-relaxed break-words whitespace-pre-wrap">
                        {result.response.content}
                      </div>
                    </div>
                  )}

                  {!result.response && !result.isLoading && !result.error && (
                    <div className="text-zinc-500 font-mono text-sm">
                      awaiting_input
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Metrics Row */}
            <tr className="border-b border-zinc-800 hover:bg-zinc-900/50">
              <td className="w-48 px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 align-top">
                metrics
              </td>
              {modelResults.map((result) => (
                <td
                  key={result.model.id}
                  className="min-w-80 px-4 py-4 border-r border-zinc-800 last:border-r-0 align-top"
                >
                  {result.response && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-400">duration:</span>
                        <span className="text-zinc-200">{(result.response.duration / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <Hash className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-400">tokens:</span>
                        <span className="text-zinc-200">{result.response.inputTokens + result.response.outputTokens}</span>
                        <span className="text-zinc-500">({result.response.inputTokens}+{result.response.outputTokens})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <DollarSign className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-400">cost:</span>
                        <span className="text-zinc-200">${result.response.cost?.toFixed(6) || '0.000000'}</span>
                      </div>
                    </div>
                  )}
                  {!result.response && (result.isLoading || result.error) && (
                    <div className="text-zinc-500 font-mono text-xs">
                      no_metrics
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}