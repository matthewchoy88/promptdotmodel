"use client"

import * as React from "react"
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, Trash2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApiKeyInput } from "@/components/api-key-input"
import { 
  saveApiKey, 
  removeApiKey, 
  testApiKey, 
  getProviderStatus, 
  validateApiKeyFormat 
} from "@/lib/api-keys"
import { cn } from "@/lib/utils"

interface ProviderSettingsProps {
  provider: {
    id: string
    name: string
    description: string
    website: string
    keyFormat: string
  }
  initialApiKey?: string
  onApiKeyChange?: (provider: string, apiKey: string, isValid: boolean) => void
  className?: string
}

interface ValidationState {
  isLoading: boolean
  isValid: boolean | null
  error: string | null
}

export function ProviderSettings({ 
  provider, 
  initialApiKey = "", 
  onApiKeyChange,
  className 
}: ProviderSettingsProps) {
  const [apiKey, setApiKey] = React.useState(initialApiKey)
  const [validation, setValidation] = React.useState<ValidationState>({
    isLoading: false,
    isValid: null,
    error: null
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  
  // Load initial validation state
  React.useEffect(() => {
    const status = getProviderStatus(provider.id)
    if (status.configured && status.valid !== undefined) {
      setValidation(prev => ({
        ...prev,
        isValid: status.valid ?? null,
        error: status.valid === false ? "API key validation failed" : null
      }))
    }
  }, [provider.id])
  
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey)
    setHasUnsavedChanges(newKey !== initialApiKey)
    
    // Reset validation when key changes
    if (newKey !== apiKey) {
      setValidation(prev => ({
        ...prev,
        isValid: null,
        error: null
      }))
    }
  }
  
  const handleTest = async () => {
    if (!apiKey.trim()) return
    
    setValidation({
      isLoading: true,
      isValid: null,
      error: null
    })
    
    try {
      const isValid = await testApiKey(provider.id, apiKey)
      setValidation({
        isLoading: false,
        isValid,
        error: isValid ? null : "API key validation failed"
      })
      
      if (onApiKeyChange) {
        onApiKeyChange(provider.id, apiKey, isValid)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setValidation({
        isLoading: false,
        isValid: false,
        error: errorMessage
      })
    }
  }
  
  const handleSave = async () => {
    try {
      if (apiKey.trim()) {
        // Validate format before saving
        if (!validateApiKeyFormat(provider.id, apiKey)) {
          setValidation(prev => ({
            ...prev,
            error: `Invalid key format. Expected format: ${provider.keyFormat}`
          }))
          return
        }
        
        saveApiKey(provider.id, apiKey)
        setHasUnsavedChanges(false)
        
        // Test the key after saving
        await handleTest()
      } else {
        // Remove key if empty
        removeApiKey(provider.id)
        setValidation({
          isLoading: false,
          isValid: null,
          error: null
        })
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save API key"
      setValidation(prev => ({
        ...prev,
        error: errorMessage
      }))
    }
  }
  
  const handleRemove = () => {
    try {
      removeApiKey(provider.id)
      setApiKey("")
      setValidation({
        isLoading: false,
        isValid: null,
        error: null
      })
      setHasUnsavedChanges(false)
      
      if (onApiKeyChange) {
        onApiKeyChange(provider.id, "", false)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove API key"
      setValidation(prev => ({
        ...prev,
        error: errorMessage
      }))
    }
  }
  
  const getStatusIndicator = () => {
    if (validation.isLoading) {
      return (
        <div className="flex items-center text-blue-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Testing...</span>
        </div>
      )
    }
    
    if (validation.isValid === true) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span className="text-sm">Configured</span>
        </div>
      )
    }
    
    if (validation.isValid === false) {
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Invalid</span>
        </div>
      )
    }
    
    if (apiKey.trim()) {
      return (
        <div className="flex items-center text-yellow-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Not tested</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center text-gray-500">
        <XCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Not configured</span>
      </div>
    )
  }
  
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{provider.name}</CardTitle>
            <CardDescription>{provider.description}</CardDescription>
          </div>
          {getStatusIndicator()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ApiKeyInput
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder={`Enter your ${provider.name} API key (${provider.keyFormat})`}
          isValid={validation.isValid}
          isLoading={validation.isLoading}
          onTest={handleTest}
          error={validation.error || undefined}
        />
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(provider.website, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Get API Key
            </Button>
            
            <span className="text-xs text-gray-500">
              Format: {provider.keyFormat}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {apiKey.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
            
            <Button
              variant={hasUnsavedChanges ? "default" : "secondary"}
              size="sm"
              onClick={handleSave}
              disabled={validation.isLoading}
              className={cn(
                hasUnsavedChanges && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
              {hasUnsavedChanges && (
                <span className="ml-1 text-xs">•</span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}