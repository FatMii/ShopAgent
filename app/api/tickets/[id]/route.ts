import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

// 获取工单详情
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      order: true,
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: '工单不存在' }, { status: 404 })
  }

  return NextResponse.json(ticket)
}

// 更新工单状态
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const ticket = await prisma.ticket.update({
    where: { id },
    data: { status: body.status },
  })

  return NextResponse.json(ticket)
}
