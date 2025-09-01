import type { Metadata } from 'next'
import { Settings, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsForm } from '@/components/settings-form'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Settings - Prompt Model Comparison',
  description: 'Configure API keys and settings for AI model providers',
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="pl-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Compare
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Settings
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Configure your API keys to enable AI model access. Your keys are stored 
              locally and used to authenticate with AI providers.
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <SettingsForm />
        
        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Check the{' '}
            <a 
              href="https://docs.anthropic.com/claude/docs/getting-started" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anthropic documentation
            </a>
            {' '}or{' '}
            <a 
              href="https://platform.openai.com/docs/quickstart" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenAI documentation
            </a>
            {' '}for API key setup.
          </p>
        </div>
      </div>
    </div>
  )
}