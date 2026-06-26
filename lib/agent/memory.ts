import { prisma } from '@/lib/db/prisma'

/**
 * 短期记忆：获取当前会话的最近 N 条消息
 */
export async function getMemory(sessionId: string, limit = 10) {
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return messages.reverse().map((msg) => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }))
}

/**
 * 长期记忆：获取用户画像
 */
export async function getUserProfile(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const tickets = await prisma.ticket.findMany({
    where: { orderId: { in: orders.map((o) => o.id) } },
    orderBy: { createdAt: 'desc' },
  })

  return {
    totalOrders: orders.length,
    recentProducts: orders.slice(0, 5).map((o) => o.product),
    orderStatuses: orders.map((o) => ({ id: o.id, status: o.status })),
    hasRefundHistory: tickets.some((t) => t.type === 'refund'),
    ticketCount: tickets.length,
  }
}
