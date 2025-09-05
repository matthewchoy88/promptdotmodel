import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import axios from 'axios'

interface CompletionRequest {
  provider: string
  modelId: string
  prompt: string
  systemMessage?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  apiKey?: string
  useOpenRouter?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: CompletionRequest = await request.json()
    
    const {
      provider,
      modelId,
      prompt,
      systemMessage,
      temperature = 0.7,
      maxTokens = 4096,
      topP = 1.0,
      apiKey,
      useOpenRouter = false
    } = body

    // Use environment variable if no API key provided (for dev)
    const effectiveApiKey = apiKey || 
      (useOpenRouter ? process.env.OPENROUTER_API_KEY : 
       provider === 'openai' ? process.env.OPENAI_API_KEY :
       provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : null)

    if (!effectiveApiKey) {
      return NextResponse.json(
        { error: 'API key required', details: 'Please provide an API key or set up environment variables' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    let response: any
    let inputTokens = 0
    let outputTokens = 0

    if (useOpenRouter) {
      // OpenRouter API call
      const openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: modelId,
          messages: [
            ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
            { role: 'user', content: prompt }
          ],
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
        },
        {
          headers: {
            'Authorization': `Bearer ${effectiveApiKey}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
            'X-Title': 'PromptDotModel',
            'Content-Type': 'application/json'
          }
        }
      )

      const data = openRouterResponse.data
      response = data.choices[0].message.content
      inputTokens = data.usage?.prompt_tokens || 0
      outputTokens = data.usage?.completion_tokens || 0

    } else if (provider === 'openai') {
      // OpenAI API call
      const openai = new OpenAI({ apiKey: effectiveApiKey })
      
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          ...(systemMessage ? [{ role: 'system' as const, content: systemMessage }] : []),
          { role: 'user' as const, content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
      })

      response = completion.choices[0].message.content
      inputTokens = completion.usage?.prompt_tokens || 0
      outputTokens = completion.usage?.completion_tokens || 0

    } else if (provider === 'anthropic') {
      // Anthropic API call
      const anthropicResponse = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: modelId,
          max_tokens: maxTokens,
          temperature,
          system: systemMessage,
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'x-api-key': effectiveApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      )

      const data = anthropicResponse.data
      response = data.content[0].text
      inputTokens = data.usage?.input_tokens || 0
      outputTokens = data.usage?.output_tokens || 0

    } else {
      // Fallback for unsupported providers
      return NextResponse.json(
        { error: 'Unsupported provider', details: `Provider ${provider} is not yet implemented` },
        { status: 400 }
      )
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      content: response,
      model: modelId,
      inputTokens,
      outputTokens,
      duration,
      cost: 0, // Cost calculation would need model-specific pricing
      metadata: {
        provider,
        timestamp: new Date().toISOString(),
        useOpenRouter
      }
    })

  } catch (error: any) {
    console.error('Completion error:', error)
    
    // Handle specific API errors
    if (error.response) {
      return NextResponse.json(
        { 
          error: 'API Error', 
          details: error.response.data?.error?.message || error.response.data?.message || 'Unknown API error',
          status: error.response.status 
        },
        { status: error.response.status || 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}