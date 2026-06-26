import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// 获取某个会话的消息列表
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const messages = await prisma.message.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}
