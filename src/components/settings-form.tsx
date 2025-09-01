"use client"

import * as React from "react"
import { Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProviderSettings } from "@/components/provider-settings"
import { 
  getSupportedProviders, 
  getStoredApiKeys, 
  exportSettings, 
  clearAllApiKeys 
} from "@/lib/api-keys"

interface SettingsFormProps {
  className?: string
}

export function SettingsForm({ className }: SettingsFormProps) {
  const [providers] = React.useState(getSupportedProviders())
  const [apiKeys, setApiKeys] = React.useState(getStoredApiKeys())
  const [isExporting, setIsExporting] = React.useState(false)
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)
  
  // Refresh API keys from storage
  const refreshApiKeys = () => {
    setApiKeys(getStoredApiKeys())
  }
  
  // Handle API key changes
  const handleApiKeyChange = (provider: string, apiKey: string, isValid: boolean) => {
    refreshApiKeys()
  }
  
  // Export settings
  const handleExport = () => {
    try {
      setIsExporting(true)
      const settings = exportSettings()
      
      const blob = new Blob([settings], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `promptmodel-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export settings')
    } finally {
      setIsExporting(false)
    }
  }
  
  // Clear all API keys
  const handleClearAll = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true)
      return
    }
    
    try {
      clearAllApiKeys()
      refreshApiKeys()
      setShowClearConfirm(false)
    } catch (error) {
      console.error('Failed to clear API keys:', error)
      alert('Failed to clear API keys')
    }
  }
  
  // Get configuration summary
  const configurationSummary = React.useMemo(() => {
    const configured = Object.values(apiKeys).filter(key => key.apiKey).length
    const valid = Object.values(apiKeys).filter(key => key.isValid === true).length
    const total = providers.length
    
    return {
      configured,
      valid,
      total,
      hasAnyKeys: configured > 0
    }
  }, [apiKeys, providers.length])
  
  return (
    <div className="space-y-8">
      {/* Security Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-amber-800">Security Notice</h3>
              <p className="text-sm text-amber-700">
                API keys are stored locally in your browser&apos;s localStorage for development purposes. 
                In production, use secure server-side storage or environment variables. Never share 
                your API keys or commit them to version control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Configuration Status
          </CardTitle>
          <CardDescription>
            Overview of your API key configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {configurationSummary.configured}
              </div>
              <div className="text-sm text-gray-600">
                Configured
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {configurationSummary.valid}
              </div>
              <div className="text-sm text-gray-600">
                Validated
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-600">
                {configurationSummary.total}
              </div>
              <div className="text-sm text-gray-600">
                Total Providers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Provider Settings */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">API Key Configuration</h2>
          <p className="text-gray-600 text-sm mb-6">
            Configure your API keys for different AI providers. Each provider requires a valid API key to access their models.
          </p>
        </div>
        
        <div className="grid gap-6">
          {providers.map((provider) => (
            <ProviderSettings
              key={provider.id}
              provider={provider}
              initialApiKey={apiKeys[provider.id]?.apiKey || ""}
              onApiKeyChange={handleApiKeyChange}
            />
          ))}
        </div>
      </div>
      
      {/* Settings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Management</CardTitle>
          <CardDescription>
            Export your settings or clear all stored data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Export Configuration</h4>
                <p className="text-sm text-gray-600">
                  Download your settings (without sensitive data) as JSON
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Settings
                </>
              )}
            </Button>
          </div>
          
          {configurationSummary.hasAnyKeys && (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-red-800">Clear All Data</h4>
                  <p className="text-sm text-red-600">
                    Remove all stored API keys from this browser
                  </p>
                </div>
              </div>
              <Button
                variant={showClearConfirm ? "destructive" : "outline"}
                onClick={handleClearAll}
                className={showClearConfirm ? "" : "border-red-300 text-red-600 hover:bg-red-50"}
              >
                {showClearConfirm ? "Confirm Clear All" : "Clear All Keys"}
              </Button>
            </div>
          )}
          
          {showClearConfirm && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(false)}
                className="text-gray-500"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}