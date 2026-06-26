import { runAgent } from '@/lib/agent'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: Request) {
  try {
    console.log('=== Chat API 开始 ===')

    const { messages, sessionId } = await req.json()
    console.log('sessionId:', sessionId)
    console.log('messages count:', messages?.length)

    const lastUserMessage = messages[messages.length - 1]
    console.log('用户消息:', lastUserMessage?.content)

    // 保存用户消息
    if (sessionId && lastUserMessage?.role === 'user') {
      console.log('保存用户消息...')
      await prisma.message.create({
        data: {
          sessionId,
          role: 'user',
          content: lastUserMessage.content,
        },
      })
      console.log('用户消息已保存')
    }

    // 运行 Agent
    console.log('调用 runAgent...')
    const result = await runAgent(sessionId, lastUserMessage.content)
    console.log('runAgent 返回，text:', result.text?.substring(0, 100))

    const responseText = result.text

    // 保存 assistant 消息
    if (sessionId && responseText) {
      console.log('保存 assistant 消息...')
      await prisma.message.create({
        data: {
          sessionId,
          role: 'assistant',
          content: responseText,
        },
      })
      console.log('assistant 消息已保存')
    }

    console.log('=== Chat API 结束 ===')
    return new Response(responseText, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('=== Chat API 错误 ===', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
