import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Settings, Terminal, GitCompare } from 'lucide-react'

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'prompt.model - AI Model Comparison Tool',
  description: 'Technical tool for comparing AI model responses. Engineered for developers and researchers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
          <div className="flex min-h-screen flex-col">
            {/* Technical Header */}
            <header className="border-b border-zinc-800 bg-zinc-950">
              <div className="max-w-full px-4">
                <div className="flex h-12 items-center justify-between">
                  {/* Logo */}
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    <Link href="/" className="text-sm font-semibold text-zinc-100">
                      prompt.model
                    </Link>
                  </div>

                  {/* Navigation */}
                  <nav className="flex items-center space-x-6">
                    <Link
                      href="/"
                      className="text-xs font-medium text-zinc-300 hover:text-zinc-100"
                    >
                      compare
                    </Link>
                    <Link
                      href="/settings"
                      className="text-xs font-medium text-zinc-400 hover:text-zinc-200"
                    >
                      settings
                    </Link>
                  </nav>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}