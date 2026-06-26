import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

const DEMO_USER_ID = 'user_001'

// 获取会话列表
export async function GET() {
  const sessions = await prisma.session.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { content: true },
      },
    },
  })

  const formatted = sessions.map((s) => ({
    id: s.id,
    status: s.status,
    lastMessage: s.messages[0]?.content ?? '',
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }))

  return NextResponse.json(formatted)
}

// 新建会话
export async function POST() {
  const session = await prisma.session.create({
    data: { userId: DEMO_USER_ID },
  })

  return NextResponse.json(session)
}
