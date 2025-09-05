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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Check, ChevronUp, ChevronDown, Search } from "lucide-react"
import { ModelMetadata } from "@/lib/providers"

interface ModelSelectorProps {
  availableModels: ModelMetadata[]
  selectedModels: ModelMetadata[]
  onModelToggle: (model: ModelMetadata) => void
  disabled?: boolean
  compact?: boolean
}

type SortField = 'provider' | 'name' | 'inputCost' | 'outputCost'
type SortDirection = 'asc' | 'desc'

export function ModelSelector({
  availableModels,
  selectedModels,
  onModelToggle,
  disabled = false,
  compact = false
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortField, setSortField] = React.useState<SortField>('provider')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')
  const [tableMode, setTableMode] = React.useState<'fit' | 'scroll'>('scroll')
  const [showToggle, setShowToggle] = React.useState(false)
  const tableRef = React.useRef<HTMLTableElement>(null)
  
  const selectedModelIds = selectedModels.map(m => m.id)
  
  const handleModelToggle = (model: ModelMetadata) => {
    onModelToggle(model)
  }
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const filteredAndSortedModels = React.useMemo(() => {
    let filtered = availableModels.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    
    return filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number
      
      switch (sortField) {
        case 'provider':
          aValue = a.provider
          bValue = b.provider
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'inputCost':
          aValue = a.inputCostPer1kTokens
          bValue = b.inputCostPer1kTokens
          break
        case 'outputCost':
          aValue = a.outputCostPer1kTokens
          bValue = b.outputCostPer1kTokens
          break
        default:
          return 0
      }
      
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue as string)
        return sortDirection === 'asc' ? comparison : -comparison
      } else {
        const comparison = aValue - (bValue as number)
        return sortDirection === 'asc' ? comparison : -comparison
      }
    })
  }, [availableModels, searchTerm, sortField, sortDirection])
  
  // Check if table needs toggle button
  React.useEffect(() => {
    const checkTableWidth = () => {
      if (tableRef.current) {
        const containerWidth = tableRef.current.parentElement?.clientWidth || 0
        const tableWidth = tableRef.current.scrollWidth
        setShowToggle(tableWidth > containerWidth)
      }
    }
    
    checkTableWidth()
    const resizeObserver = new ResizeObserver(checkTableWidth)
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current)
    }
    
    return () => resizeObserver.disconnect()
  }, [filteredAndSortedModels.length])
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <button className="flex flex-col items-center justify-center gap-2 text-center h-full w-full hover:bg-zinc-800/50 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center group-hover:bg-zinc-600 transition-colors">
              <Plus className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors">
                Add AI Model
              </div>
              <div className="text-xs text-zinc-500">
                Click to browse and select
              </div>
            </div>
            <div className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
              {availableModels.length} available
            </div>
          </button>
        ) : (
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
        )}
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
        
        {/* Search */}
        <div className="pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search models or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500"
            />
          </div>
        </div>
        
        {/* Table Controls */}
        {showToggle && (
          <div className="flex justify-end pb-2">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
              <button
                onClick={() => setTableMode('fit')}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  tableMode === 'fit' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Fit
              </button>
              <button
                onClick={() => setTableMode('scroll')}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  tableMode === 'scroll' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Scroll
              </button>
            </div>
          </div>
        )}
        
        {/* Model Table */}
        <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className={`max-h-[60vh] ${
            tableMode === 'fit' ? 'overflow-hidden' : 'overflow-x-auto'
          }`}>
            <table ref={tableRef} className={tableMode === 'fit' ? 'w-full table-fixed' : 'w-full'}>
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className={`px-4 py-3 text-left border-r border-zinc-800 bg-zinc-900 z-10 ${
                    tableMode === 'scroll' ? 'sticky left-0' : ''
                  } ${tableMode === 'fit' ? 'w-12' : 'w-12'}`}>
                    <Checkbox
                      checked={selectedModels.length === filteredAndSortedModels.length && filteredAndSortedModels.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          filteredAndSortedModels.forEach(model => {
                            if (!selectedModelIds.includes(model.id)) {
                              handleModelToggle(model)
                            }
                          })
                        } else {
                          filteredAndSortedModels.forEach(model => {
                            if (selectedModelIds.includes(model.id)) {
                              handleModelToggle(model)
                            }
                          })
                        }
                      }}
                    />
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800 bg-zinc-900 z-10 ${
                    tableMode === 'scroll' ? 'sticky left-12' : ''
                  } ${tableMode === 'fit' ? 'w-32' : 'min-w-32'}`}>
                    <button
                      onClick={() => handleSort('provider')}
                      className="flex items-center gap-2 hover:text-zinc-100 transition-colors"
                    >
                      Provider
                      {sortField === 'provider' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 opacity-30"><ChevronUp className="w-3 h-3" /></div>
                      )}
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800 ${
                    tableMode === 'fit' ? 'w-48' : 'min-w-48'
                  }`}>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-zinc-100 transition-colors"
                    >
                      Model Name
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 opacity-30"><ChevronUp className="w-3 h-3" /></div>
                      )}
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide border-r border-zinc-800 ${
                    tableMode === 'fit' ? 'w-32' : 'min-w-32'
                  }`}>
                    <button
                      onClick={() => handleSort('inputCost')}
                      className="flex items-center gap-2 hover:text-zinc-100 transition-colors"
                    >
                      Input Cost
                      {sortField === 'inputCost' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 opacity-30"><ChevronUp className="w-3 h-3" /></div>
                      )}
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide ${
                    tableMode === 'fit' ? 'w-32' : 'min-w-32'
                  }`}>
                    <button
                      onClick={() => handleSort('outputCost')}
                      className="flex items-center gap-2 hover:text-zinc-100 transition-colors"
                    >
                      Output Cost
                      {sortField === 'outputCost' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 opacity-30"><ChevronUp className="w-3 h-3" /></div>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedModels.map((model) => {
                  const isSelected = selectedModelIds.includes(model.id)
                  return (
                    <tr
                      key={model.id}
                      className={`border-b border-zinc-800 hover:bg-zinc-900/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-zinc-900/30' : ''
                      }`}
                      onClick={() => handleModelToggle(model)}
                    >
                      <td 
                        className={`px-4 py-4 border-r border-zinc-800 bg-zinc-950 z-10 ${
                          tableMode === 'scroll' ? 'sticky left-0' : ''
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleModelToggle(model)}
                        />
                      </td>
                      <td className={`px-4 py-4 text-sm font-mono text-zinc-300 border-r border-zinc-800 bg-zinc-950 z-10 capitalize ${
                        tableMode === 'scroll' ? 'sticky left-12' : ''
                      }`}>
                        {model.provider}
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-200 font-mono border-r border-zinc-800">
                        {model.name}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-zinc-200 border-r border-zinc-800">
                        ${model.inputCostPer1kTokens.toFixed(4)}/1k
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-zinc-200">
                        ${model.outputCostPer1kTokens.toFixed(4)}/1k
                      </td>
                    </tr>
                  )
                })}
                {filteredAndSortedModels.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-400 font-mono text-sm">
                      No models found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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