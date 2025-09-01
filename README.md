# PromptDotModel

A modern, minimalist web application for comparing AI model responses side-by-side. Write a prompt once and run it against multiple models in parallel to compare outputs.

## Features

- **Multi-Model Comparison**: Run prompts against multiple AI models simultaneously
- **Extensible Provider System**: Currently supports Anthropic (Claude) and OpenAI (GPT) models
- **Modern UI**: Clean, minimalist interface built with Next.js and Shadcn UI
- **Dynamic Column Management**: Add/remove model columns on the fly
- **API Key Management**: Secure settings page for configuring provider API keys
- **Cost Tracking**: See estimated costs based on token usage
- **Responsive Design**: Works seamlessly on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for the providers you want to use (Anthropic, OpenAI)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd promptdotmodel
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. Navigate to Settings (gear icon in header)
2. Enter your API keys for the providers you want to use
3. Test the connection to verify your keys are working
4. Return to the main page to start comparing models

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Main comparison interface
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── prompt-input.tsx   # Prompt input area
│   ├── model-column.tsx   # Model result column
│   ├── model-selector.tsx # Model selection dialog
│   └── settings-form.tsx  # Settings management
└── lib/                   # Core utilities
    └── providers/         # Model provider system
        ├── base-provider.ts      # Abstract provider class
        ├── anthropic-provider.ts # Claude models
        ├── openai-provider.ts    # GPT models
        └── provider-registry.ts  # Provider management
```

### Supported Models

**Anthropic:**
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Haiku

**OpenAI:**
- GPT-4o
- GPT-4 Turbo
- GPT-3.5 Turbo

## Adding New Providers

The system is designed to be easily extensible. To add a new provider:

1. Create a new provider class extending `BaseAIProvider`
2. Implement the `complete()` method
3. Define model metadata with pricing and capabilities
4. Register with the provider registry

Example:
```typescript
export class NewProvider extends BaseAIProvider {
  readonly info = {
    name: 'newprovider',
    displayName: 'New Provider',
    // ... configuration
  };

  readonly models = [/* model definitions */];

  async complete(modelId: string, params: CompletionParams) {
    // Your API integration
  }
}
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check
```

## Security Notes

- **Development**: API keys are stored in localStorage (not secure for production)
- **Production**: Use environment variables and server-side API key management
- Never commit API keys to version control
- Consider implementing proper authentication and authorization

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Hooks

## Future Enhancements

- Real API integration (currently using placeholder responses)
- Streaming response support
- Response history and saving
- Advanced prompt templates
- Model fine-tuning parameters
- Export results to various formats
- Collaborative features
- Response evaluation metrics

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.