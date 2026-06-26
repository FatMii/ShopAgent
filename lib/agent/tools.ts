import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'

export const tools = {
  // 3.1 查单个订单详情
  queryOrder: tool({
    description: '根据订单号查询订单详情，包括商品名、金额、状态、物流单号',
    parameters: z.object({
      orderId: z.string().describe('订单号，如 ORD_001'),
    }),
    execute: async ({ orderId }) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { tickets: true },
        })
        if (!order) return { error: `未找到订单 ${orderId}，请确认订单号是否正确` }
        return order
      } catch (e) {
        return { error: '查询订单时出错，请稍后重试' }
      }
    },
  }),

  // 3.2 查用户全部订单
  queryUserOrders: tool({
    description: '查询当前用户的所有订单列表',
    parameters: z.object({
      userId: z.string().describe('用户ID'),
    }),
    execute: async ({ userId }) => {
      try {
        const orders = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { id: true, product: true, amount: true, status: true, createdAt: true },
        })
        if (orders.length === 0) return { message: '该用户暂无订单记录' }
        return orders
      } catch (e) {
        return { error: '查询订单列表时出错，请稍后重试' }
      }
    },
  }),

  // 3.3 创建退货工单
  createRefund: tool({
    description: '为用户创建退货退款工单。调用前必须确认订单号和退货原因。',
    parameters: z.object({
      orderId: z.string().describe('要退货的订单号'),
      reason: z.string().describe('退货原因'),
    }),
    execute: async ({ orderId, reason }) => {
      try {
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) return { error: `订单 ${orderId} 不存在` }
        if (order.status === 'refunded') return { error: '该订单已退款，不能重复申请' }

        const ticket = await prisma.ticket.create({
          data: { orderId, type: 'refund', reason, status: 'pending' },
        })
        return {
          success: true,
          ticketId: ticket.id,
          message: `退货工单已创建，工单号：${ticket.id}，预计 1-3 个工作日内处理。`,
        }
      } catch (e) {
        return { error: '创建工单时出错，请稍后重试' }
      }
    },
  }),

  // 3.4 查物流状态
  queryLogistics: tool({
    description: '根据物流单号查询快递状态',
    parameters: z.object({
      trackingNo: z.string().describe('物流单号，如 SF1234567890'),
    }),
    execute: async ({ trackingNo }) => {
      // 模拟物流数据
      const mockLogistics: Record<string, unknown> = {
        SF1234567890: {
          status: '运输中',
          carrier: '顺丰速运',
          traces: [
            { time: '2024-06-20 10:00', info: '快件已揽收' },
            { time: '2024-06-20 18:00', info: '到达深圳转运中心' },
            { time: '2024-06-21 06:00', info: '快件发出，下一站合肥' },
          ],
        },
        SF9876543210: {
          status: '已签收',
          carrier: '顺丰速运',
          traces: [
            { time: '2024-06-18 09:00', info: '快件已揽收' },
            { time: '2024-06-19 14:00', info: '派件中' },
            { time: '2024-06-19 16:30', info: '已签收，签收人：本人' },
          ],
        },
        YT2024062500001: {
          status: '运输中',
          carrier: '圆通速递',
          traces: [
            { time: '2024-06-24 12:00', info: '已揽收' },
            { time: '2024-06-25 08:00', info: '到达广州转运中心' },
          ],
        },
        YT2024062500002: {
          status: '派件中',
          carrier: '圆通速递',
          traces: [
            { time: '2024-06-24 15:00', info: '已揽收' },
            { time: '2024-06-25 09:00', info: '派件中，快递员：王师傅 13800000000' },
          ],
        },
        SF1111111111: {
          status: '已签收',
          carrier: '顺丰速运',
          traces: [
            { time: '2024-06-20 10:00', info: '快件已揽收' },
            { time: '2024-06-21 09:00', info: '已签收' },
          ],
        },
      }
      return mockLogistics[trackingNo] || { error: `未查询到物流单号 ${trackingNo} 的信息` }
    },
  }),

  // 3.5 搜索知识库（占位，阶段四接 RAG）
  searchKnowledge: tool({
    description: '搜索知识库获取商品信息、退货政策、常见问题等。商品相关问题优先使用此工具。',
    parameters: z.object({
      query: z.string().describe('搜索内容，如"退货政策"、"手机壳材质"'),
    }),
    execute: async ({ query }) => {
      // 占位：返回固定内容，阶段四接入 RAG 后替换
      return {
        message: '知识库暂未接入，后续版本支持。',
        query,
      }
    },
  }),
}
