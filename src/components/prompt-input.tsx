"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, RotateCcw } from "lucide-react"

interface PromptInputProps {
  prompt: string
  onPromptChange: (prompt: string) => void
  onRun: () => void
  onClear: () => void
  isRunning: boolean
  disabled?: boolean
}

export function PromptInput({
  prompt,
  onPromptChange,
  onRun,
  onClear,
  isRunning,
  disabled = false
}: PromptInputProps) {
  const maxLength = 4000
  const characterCount = prompt.length
  const isOverLimit = characterCount > maxLength
  
  return (
    <div className="border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="enter prompt to compare across models"
            className="min-h-[80px] resize-none bg-zinc-900 border-zinc-800 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            disabled={disabled || isRunning}
          />
          <div className="flex justify-between items-center mt-2 text-xs font-mono">
            <div className={isOverLimit ? "text-red-400" : "text-zinc-500"}>
              {characterCount}/{maxLength}
            </div>
            {isOverLimit && (
              <div className="text-red-400">limit exceeded</div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onRun}
            disabled={!prompt.trim() || isOverLimit || disabled || isRunning}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs h-8 px-3"
          >
            {isRunning ? (
              <>
                <Square className="w-3 h-3 mr-1" />
                running
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                run
              </>
            )}
          </Button>
          <Button
            onClick={onClear}
            disabled={!prompt.trim() || disabled || isRunning}
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 font-mono text-xs h-8 px-3"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            clear
          </Button>
        </div>
      </div>
    </div>
  )
}