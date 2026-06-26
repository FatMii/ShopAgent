import { runAgent } from '@/lib/agent'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json()
    const lastUserMessage = messages[messages.length - 1]

    // 保存用户消息
    if (sessionId && lastUserMessage?.role === 'user') {
      await prisma.message.create({
        data: { sessionId, role: 'user', content: lastUserMessage.content },
      })
    }

    // 运行 Agent
    const result = await runAgent(sessionId, lastUserMessage.content)

    // 保存 assistant 消息（只存文本）
    if (sessionId && result.text) {
      await prisma.message.create({
        data: { sessionId, role: 'assistant', content: result.text },
      })
    }

    // 返回 JSON：text + toolCalls
    return Response.json({
      text: result.text,
      toolCalls: result.toolCalls,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Chat API error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
