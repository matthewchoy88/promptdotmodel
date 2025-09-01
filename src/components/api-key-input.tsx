"use client"

import * as React from "react"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isValid?: boolean | null
  isLoading?: boolean
  onTest?: () => void
  error?: string
  className?: string
  disabled?: boolean
}

export function ApiKeyInput({
  value,
  onChange,
  placeholder = "Enter your API key...",
  isValid = null,
  isLoading = false,
  onTest,
  error,
  className,
  disabled = false
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = React.useState(false)
  
  const toggleVisibility = () => {
    setShowKey(!showKey)
  }
  
  const handleTest = () => {
    if (onTest && !isLoading && value.trim()) {
      onTest()
    }
  }
  
  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    
    if (isValid === true) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    
    if (isValid === false) {
      return <X className="h-4 w-4 text-red-500" />
    }
    
    return null
  }
  
  const getInputBorderClass = () => {
    if (error || isValid === false) {
      return "border-red-300 focus:border-red-500"
    }
    
    if (isValid === true) {
      return "border-green-300 focus:border-green-500"
    }
    
    return ""
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            "pr-24",
            getInputBorderClass()
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {getStatusIcon()}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleVisibility}
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-transparent"
          >
            {showKey ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </Button>
        </div>
      </div>
      
      {onTest && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={!value.trim() || isLoading || disabled}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing connection...
            </>
          ) : (
            "Test API Key"
          )}
        </Button>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
      
      {isValid === true && !error && (
        <p className="text-sm text-green-600 flex items-center">
          <Check className="h-4 w-4 mr-1 flex-shrink-0" />
          API key is valid
        </p>
      )}
    </div>
  )
}