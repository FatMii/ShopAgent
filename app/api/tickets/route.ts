import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const where: Record<string, string> = {}
  if (status && status !== 'all') where.status = status
  if (type && type !== 'all') where.type = type

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: { id: true, product: true, amount: true, status: true },
      },
    },
  })

  return NextResponse.json(tickets)
}
