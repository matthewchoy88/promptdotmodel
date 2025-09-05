# PromptDotModel - AI Model Comparison Platform

## Project Vision
A modern web application for comparing AI model responses side-by-side. Users write a prompt once and run it against multiple LLM models simultaneously to compare outputs, costs, and performance.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI**: Shadcn UI + Radix UI components
- **Styling**: Tailwind CSS 4.x
- **State**: React Hooks (no external state management)
- **API Integration**: Axios for HTTP requests
- **Icons**: Lucide React

## Architecture

### Core Components
- `src/app/page.tsx` - Main comparison interface
- `src/app/settings/page.tsx` - API key management 
- `src/components/comparison-table.tsx` - Results display grid
- `src/components/model-selector.tsx` - Model selection dialog
- `src/components/prompt-input.tsx` - Prompt input area

### Provider System (`src/lib/providers/`)
Extensible architecture for AI model providers:
- `base-provider.ts` - Abstract base class for all providers
- `anthropic-provider.ts` - Claude models (3.5 Sonnet, 3 Opus, 3 Haiku)
- `openai-provider.ts` - GPT models (4o, 4 Turbo, 3.5 Turbo)
- `openrouter-provider.ts` - Universal provider for multiple models
- `provider-registry.ts` - Central registry for managing providers
- `types.ts` - TypeScript interfaces and types

### Key Interfaces
```typescript
interface ModelMetadata {
  id: string
  name: string
  provider: string
  maxTokens: number
  inputCostPer1kTokens: number
  outputCostPer1kTokens: number
  supportsStreaming: boolean
  capabilities: ModelCapabilities
}

interface CompletionResponse {
  content: string
  model: string
  inputTokens: number
  outputTokens: number
  duration: number
  cost: number
}
```

## Running the Project

### Development
```bash
npm install
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
```

### API Keys Setup
Create `.env.local` with provider API keys:
```bash
# Recommended: Single key for all models
OPENROUTER_API_KEY=sk-or-...

# Or individual provider keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

API key sources:
- OpenRouter: https://openrouter.ai/keys (recommended)
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys

### Configuration
1. Set up API keys in `.env.local`
2. Restart dev server to load environment variables
3. Navigate to `/settings` to verify API key configuration
4. Select models on main page to start comparing

## Development Guidelines

### Adding New Providers
1. Extend `BaseAIProvider` class
2. Implement `complete()` method for API calls
3. Define model metadata with pricing
4. Register in `provider-registry.ts`

### Code Patterns
- Use TypeScript strictly with proper interfaces
- Follow existing component patterns in `src/components/`
- Maintain provider abstraction for extensibility
- Handle errors gracefully with `ProviderError` class
- Use React hooks for state management
- Follow Tailwind utility-first styling

### Security
- API keys stored server-side only (Next.js API routes)
- Never expose keys to client-side code
- `.env.local` in `.gitignore`
- Use environment variables for configuration

## Key Features
- **Multi-Model Comparison**: Run prompts against multiple models simultaneously
- **Real API Integration**: Actual calls to OpenAI, Anthropic, OpenRouter
- **Cost Tracking**: Token usage and cost estimation per model
- **Dynamic Columns**: Add/remove model columns on demand
- **Responsive Design**: Works on desktop and mobile
- **Provider System**: Extensible architecture for adding new AI providers

## Current Status
- ✅ Real LLM API integration implemented
- ✅ OpenRouter universal provider support
- ✅ Professional UI with resizable grid system
- ✅ Cost tracking and token counting
- ✅ Environment variable configuration

## Testing
No specific test framework configured. Run manual testing:
1. Start dev server: `npm run dev`
2. Configure API keys in settings
3. Select models and enter prompts
4. Verify API responses and cost calculations

## Future Enhancements
- Streaming response support
- Response history and saving
- Advanced prompt templates
- Model fine-tuning parameters
- Export results functionality
- Collaborative features
- Response evaluation metrics