import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  // 今日对话数
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySessions = await prisma.session.count({
    where: { createdAt: { gte: today } },
  })

  // 工单统计
  const totalTickets = await prisma.ticket.count()
  const pendingTickets = await prisma.ticket.count({ where: { status: 'pending' } })
  const processingTickets = await prisma.ticket.count({ where: { status: 'processing' } })
  const resolvedTickets = await prisma.ticket.count({ where: { status: 'resolved' } })
  const closedTickets = await prisma.ticket.count({ where: { status: 'closed' } })

  // 解决率
  const resolvedRate = totalTickets > 0
    ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100)
    : 0

  // 工单类型分布
  const refundCount = await prisma.ticket.count({ where: { type: 'refund' } })
  const exchangeCount = await prisma.ticket.count({ where: { type: 'exchange' } })
  const complaintCount = await prisma.ticket.count({ where: { type: 'complaint' } })

  // 最近 7 天对话数
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentSessions = await prisma.session.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  })

  // 按日期分组
  const dailyCounts: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    dailyCounts[key] = 0
  }
  recentSessions.forEach((s) => {
    const key = s.createdAt.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    if (key in dailyCounts) dailyCounts[key]++
  })

  return NextResponse.json({
    todaySessions,
    totalTickets,
    pendingTickets,
    processingTickets,
    resolvedTickets,
    closedTickets,
    resolvedRate,
    ticketTypeDistribution: {
      refund: refundCount,
      exchange: exchangeCount,
      complaint: complaintCount,
    },
    dailySessionCounts: Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    })),
  })
}
