import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { prisma } from '@/lib/db/prisma'

const mimo = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL!,
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json()

    // 保存用户消息
    const lastUserMessage = messages[messages.length - 1]
    if (sessionId && lastUserMessage?.role === 'user') {
      await prisma.message.create({
        data: {
          sessionId,
          role: 'user',
          content: lastUserMessage.content,
        },
      })
    }

    const result = streamText({
      model: mimo('mimo-v2.5-pro'),
      system: '你是一个专业的电商客服助手，名叫"小助手"。回答简洁明了。',
      messages,
    })

    // 流式返回，结束后保存 assistant 消息
    const response = result.toTextStreamResponse()

    // 用 TransformStream 在流结束后保存消息
    const originalStream = response.body
    if (!originalStream) return response

    let fullContent = ''
    const transform = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        fullContent += text
        controller.enqueue(chunk)
      },
      async flush() {
        // 流结束后保存 assistant 消息
        if (sessionId && fullContent) {
          await prisma.message.create({
            data: {
              sessionId,
              role: 'assistant',
              content: fullContent,
            },
          })
        }
      },
    })

    return new Response(originalStream.pipeThrough(transform), {
      headers: response.headers,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat API error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
