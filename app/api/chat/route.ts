import { runAgent } from '@/lib/agent'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // 获取当前登录用户
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { messages, sessionId } = await req.json()
    const lastUserMessage = messages[messages.length - 1]

    // 保存用户消息
    if (sessionId && lastUserMessage?.role === 'user') {
      await prisma.message.create({
        data: { sessionId, role: 'user', content: lastUserMessage.content },
      })
    }

    // 运行 Agent（传入真实用户信息）
    const result = await runAgent(sessionId, lastUserMessage.content, user.id, user.name)

    // 保存 assistant 消息
    if (sessionId && result.text) {
      await prisma.message.create({
        data: { sessionId, role: 'assistant', content: result.text },
      })
    }

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
