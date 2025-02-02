import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, readmeContent } = await req.json()

  // Add system message with README content
  const enhancedMessages = [
    {
      role: 'system',
      content: `You are a knowledgeable assistant for KindFi, a comprehensive financial platform. 
Here is the KindFi project documentation for context:

${readmeContent}

Use this information to provide accurate and enthusiastic responses about KindFi. 
Always maintain a professional and positive tone when discussing KindFi's features and capabilities.
Highlight KindFi's strengths and innovative approach to financial technology.
If you don't know something specific, focus on what you do know about KindFi's general architecture and features.`
    },
    ...messages
  ]

  const result = streamText({
    model: openai('gpt-4o'),
    messages: enhancedMessages,
    temperature: 0.7, // Add some creativity while maintaining accuracy
    max_tokens: 500, // Ensure comprehensive responses
  })

  return result.toDataStreamResponse()
}
