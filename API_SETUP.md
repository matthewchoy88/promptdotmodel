# API Setup Guide

## Features Implemented

✅ **Real LLM API Integration** - The app now makes actual API calls to OpenAI, Anthropic, and OpenRouter
✅ **Environment Variable Support** - Configure API keys via `.env.local` for development
✅ **OpenRouter Universal Provider** - Access multiple models with a single API key

## Quick Start

### 1. Set up API Keys

Edit `.env.local` and add your API keys:

```bash
# Option A: Individual provider keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Option B: OpenRouter (recommended - single key for all models)
OPENROUTER_API_KEY=sk-or-...
```

### 2. Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **OpenRouter** (Recommended): https://openrouter.ai/keys

### 3. Restart the dev server

The server automatically loads environment variables from `.env.local`:

```bash
npm run dev
```

## Available Providers

### OpenRouter (Recommended)
- Single API key for all models
- Access to OpenAI, Anthropic, Google, Meta, and Mistral models
- Unified billing and usage tracking

### Direct Providers
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku

## Security Notes

- Never commit `.env.local` (already in .gitignore)
- API keys are only used server-side via Next.js API routes
- Keys are never exposed to the client

## Testing

1. Start the dev server
2. Go to http://localhost:3001
3. Select models to compare
4. Enter a prompt
5. Click "Run Comparison" to see real API responses

## Troubleshooting

- If you get API errors, check that your keys are valid
- OpenRouter requires credits to be added to your account
- Some models may have rate limits or usage restrictions