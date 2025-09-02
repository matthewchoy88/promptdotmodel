"use client"

import * as React from "react"
import { ModelMetadata, CompletionResponse } from "@/lib/providers"
import { ModelSelector } from "@/components/model-selector"
import { Clock, DollarSign, Hash } from "lucide-react"

interface ResizableGridProps {
  children: React.ReactNode
  columnWidths: string[]
  rowHeights: string[]
  onColumnResize: (index: number, width: string) => void
  onRowResize: (index: number, height: string) => void
}

function ResizableGrid({ children, columnWidths, rowHeights, onColumnResize, onRowResize }: ResizableGridProps) {
  const [isDragging, setIsDragging] = React.useState<{ type: 'column' | 'row', index: number, startPos: number, startSize: number } | null>(null)
  
  const gridRef = React.useRef<HTMLDivElement>(null)
  
  const handleMouseDown = (e: React.MouseEvent, type: 'column' | 'row', index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const currentSize = parseInt((type === 'column' ? columnWidths : rowHeights)[index].replace('px', ''))
    const startPos = type === 'column' ? e.clientX : e.clientY
    
    setIsDragging({ 
      type, 
      index, 
      startPos,
      startSize: currentSize
    })
    
    document.body.style.cursor = type === 'column' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const currentPos = isDragging.type === 'column' ? e.clientX : e.clientY
      const delta = currentPos - isDragging.startPos
      const newSize = Math.max(150, isDragging.startSize + delta)
      
      if (isDragging.type === 'column') {
        onColumnResize(isDragging.index, `${newSize}px`)
      } else {
        onRowResize(isDragging.index, `${newSize}px`)
      }
    }
    
    const handleMouseUp = () => {
      setIsDragging(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onColumnResize, onRowResize])
  
  // Calculate cumulative positions for resize handles
  const getColumnPosition = (index: number) => {
    return columnWidths.slice(0, index + 1).reduce((acc, width) => {
      return acc + parseInt(width.replace('px', ''))
    }, 0)
  }
  
  const getRowPosition = (index: number) => {
    return rowHeights.slice(0, index + 1).reduce((acc, height) => {
      return acc + parseInt(height.replace('px', ''))
    }, 0)
  }
  
  return (
    <div 
      ref={gridRef}
      className="relative"
      style={{
        display: 'grid',
        gridTemplateColumns: columnWidths.join(' '),
        gridTemplateRows: rowHeights.join(' '),
        gap: '0'
      }}
    >
      {children}
      
      {/* Column resize handles */}
      {columnWidths.slice(0, -1).map((_, index) => (
        <div
          key={`col-${index}`}
          className="absolute top-0 bottom-0 w-2 bg-transparent cursor-col-resize z-20 -ml-1"
          style={{
            left: getColumnPosition(index)
          }}
          onMouseDown={(e) => handleMouseDown(e, 'column', index)}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-0.5 h-8 bg-zinc-600 opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
      
      {/* Row resize handles */}
      {rowHeights.slice(0, -1).map((_, index) => (
        <div
          key={`row-${index}`}
          className="absolute left-0 right-0 h-2 bg-transparent cursor-row-resize z-20 -mt-1"
          style={{
            top: getRowPosition(index)
          }}
          onMouseDown={(e) => handleMouseDown(e, 'row', index)}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-0.5 w-8 bg-zinc-600 opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ModelResult {
  model: ModelMetadata
  response: CompletionResponse | null
  error: string | null
  isLoading: boolean
}

interface ComparisonTableProps {
  prompt: string
  modelResults: ModelResult[]
  availableModels: ModelMetadata[]
  selectedModels: ModelMetadata[]
  onModelToggle: (model: ModelMetadata) => void
  disabled: boolean
}

export function ComparisonTable({ 
  prompt, 
  modelResults, 
  availableModels, 
  selectedModels, 
  onModelToggle, 
  disabled 
}: ComparisonTableProps) {
  // State for column and row sizes
  const [columnWidths, setColumnWidths] = React.useState<string[]>(() => {
    const baseWidth = '320px' // Fixed starting width for model columns
    const testCaseWidth = '200px'
    const addModelWidth = '320px'
    return [testCaseWidth, ...modelResults.map(() => baseWidth), addModelWidth]
  })
  
  const [rowHeights, setRowHeights] = React.useState<string[]>(['80px', '80px', '200px', '100px']) // Header, prompt, response, metrics
  
  // Update column widths when models change
  React.useEffect(() => {
    const baseWidth = '320px'
    const testCaseWidth = '200px'
    const addModelWidth = '320px'
    setColumnWidths([testCaseWidth, ...modelResults.map(() => baseWidth), addModelWidth])
  }, [modelResults])
  
  const handleColumnResize = (index: number, width: string) => {
    setColumnWidths(prev => prev.map((w, i) => i === index ? width : w))
  }
  
  const handleRowResize = (index: number, height: string) => {
    setRowHeights(prev => prev.map((h, i) => i === index ? height : h))
  }
  
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
      <ResizableGrid 
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        onColumnResize={handleColumnResize}
        onRowResize={handleRowResize}
      >
        {/* Header Row */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800 flex items-center">
          Test Case
        </div>
        
        {modelResults.map((result) => (
          <div
            key={`header-${result.model.id}`}
            className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800"
          >
            <div className="space-y-1">
              <div className="text-zinc-100 font-semibold">
                {result.model.name}
              </div>
              <div className="text-zinc-500 lowercase">
                {result.model.provider}
              </div>
            </div>
          </div>
        ))}
        
        {/* Add AI Model Column with dotted border */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-2 border-dashed border-zinc-600 flex items-center justify-center">
          <ModelSelector
            availableModels={availableModels}
            selectedModels={selectedModels}
            onModelToggle={onModelToggle}
            disabled={disabled}
            compact={true}
          />
        </div>
        
        {/* Prompt Row */}
        <div className="px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 border-b border-zinc-800 flex items-start hover:bg-zinc-900/50">
          prompt_001
        </div>
        
        {modelResults.map((result) => (
          <div
            key={`prompt-${result.model.id}`}
            className="px-4 py-4 border-r border-zinc-800 border-b border-zinc-800 hover:bg-zinc-900/50"
          >
            <div className="text-xs font-mono text-zinc-500 mb-2 break-words">
              {prompt.length > 100 ? `${prompt.slice(0, 100)}...` : prompt}
            </div>
          </div>
        ))}
        
        <div className="px-4 py-4 border-b border-zinc-800 border-2 border-dashed border-zinc-600 hover:bg-zinc-900/50"></div>
        
        {/* Response Row */}
        <div className="px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 border-b border-zinc-800 flex items-start hover:bg-zinc-900/50">
          response
        </div>
        
        {modelResults.map((result) => (
          <div
            key={`response-${result.model.id}`}
            className="px-4 py-4 border-r border-zinc-800 border-b border-zinc-800 hover:bg-zinc-900/50 overflow-auto"
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
          </div>
        ))}
        
        <div className="px-4 py-4 border-b border-zinc-800 border-2 border-dashed border-zinc-600 hover:bg-zinc-900/50 flex items-center justify-center text-zinc-500 text-sm">
          awaiting_input
        </div>
        
        {/* Metrics Row */}
        <div className="px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 flex items-start hover:bg-zinc-900/50">
          metrics
        </div>
        
        {modelResults.map((result) => (
          <div
            key={`metrics-${result.model.id}`}
            className="px-4 py-4 border-r border-zinc-800 hover:bg-zinc-900/50"
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
          </div>
        ))}
        
        <div className="px-4 py-4 border-2 border-dashed border-zinc-600 hover:bg-zinc-900/50 flex items-center justify-center text-zinc-500 text-sm">
          no_metrics
        </div>
      </ResizableGrid>
    </div>
  )
}