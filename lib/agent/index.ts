import { prisma } from '@/lib/db/prisma'
import { getMemory, getUserProfile } from './memory'
import { SYSTEM_PROMPT } from './prompt'

const MIMO_BASE_URL = process.env.OPENAI_BASE_URL!
const MIMO_API_KEY = process.env.OPENAI_API_KEY!
const MODEL = 'mimo-v2.5-pro'

// Tool 定义（给 mimo 看的 JSON Schema）
const TOOL_SCHEMAS = [
  {
    type: 'function' as const,
    function: {
      name: 'queryOrder',
      description: '根据订单号查询订单详情，包括商品名、金额、状态、物流单号',
      parameters: {
        type: 'object',
        properties: { orderId: { type: 'string', description: '订单号，如 ORD_001' } },
        required: ['orderId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'queryUserOrders',
      description: '查询当前用户的所有订单列表',
      parameters: {
        type: 'object',
        properties: { userId: { type: 'string', description: '用户ID' } },
        required: ['userId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'createRefund',
      description: '为用户创建退货退款工单。调用前必须确认订单号和退货原因。',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: '要退货的订单号' },
          reason: { type: 'string', description: '退货原因' },
        },
        required: ['orderId', 'reason'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'queryLogistics',
      description: '根据物流单号查询快递状态',
      parameters: {
        type: 'object',
        properties: { trackingNo: { type: 'string', description: '物流单号' } },
        required: ['trackingNo'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'searchKnowledge',
      description: '搜索知识库获取商品信息、退货政策、常见问题等',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: '搜索内容' } },
        required: ['query'],
      },
    },
  },
]

// 执行 Tool
async function executeTool(name: string, args: Record<string, unknown>) {
  console.log('执行 Tool:', name, JSON.stringify(args))

  switch (name) {
    case 'queryOrder': {
      const order = await prisma.order.findUnique({
        where: { id: args.orderId as string },
        include: { tickets: true },
      })
      return order || { error: `未找到订单 ${args.orderId}` }
    }
    case 'queryUserOrders': {
      const orders = await prisma.order.findMany({
        where: { userId: args.userId as string },
        orderBy: { createdAt: 'desc' },
      })
      return orders.length ? orders : { message: '暂无订单' }
    }
    case 'createRefund': {
      const order = await prisma.order.findUnique({ where: { id: args.orderId as string } })
      if (!order) return { error: `订单 ${args.orderId} 不存在` }
      if (order.status === 'refunded') return { error: '该订单已退款' }
      const ticket = await prisma.ticket.create({
        data: { orderId: args.orderId as string, type: 'refund', reason: args.reason as string, status: 'pending' },
      })
      return { success: true, ticketId: ticket.id, message: `工单已创建：${ticket.id}` }
    }
    case 'queryLogistics': {
      const mockData: Record<string, unknown> = {
        SF1234567890: { status: '运输中', carrier: '顺丰速运', traces: [{ time: '2024-06-20 10:00', info: '已揽收' }, { time: '2024-06-21 06:00', info: '运输中' }] },
        SF9876543210: { status: '已签收', carrier: '顺丰速运', traces: [{ time: '2024-06-19 16:30', info: '已签收' }] },
        YT2024062500001: { status: '运输中', carrier: '圆通速递', traces: [{ time: '2024-06-25 08:00', info: '到达广州转运中心' }] },
        YT2024062500002: { status: '派件中', carrier: '圆通速递', traces: [{ time: '2024-06-25 09:00', info: '派件中' }] },
        SF1111111111: { status: '已签收', carrier: '顺丰速运', traces: [{ time: '2024-06-21 09:00', info: '已签收' }] },
      }
      return mockData[args.trackingNo as string] || { error: `未查询到 ${args.trackingNo}` }
    }
    case 'searchKnowledge':
      return { message: '知识库暂未接入', query: args.query }
    default:
      return { error: `未知工具: ${name}` }
  }
}

// 调用 mimo API
async function callMimo(messages: Array<{ role: string; content: string | unknown[]; tool_call_id?: string }>) {
  const res = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MIMO_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: TOOL_SCHEMAS,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`mimo API error: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.choices[0].message
}

export interface ToolCallInfo {
  toolName: string
  args: Record<string, unknown>
  result: unknown
}

export interface AgentResult {
  text: string
  toolCalls: ToolCallInfo[]
}

export async function runAgent(sessionId: string, userMessage: string): Promise<AgentResult> {
  const history = await getMemory(sessionId)
  const profile = await getUserProfile('user_001')
  const profileText = `用户有 ${profile.totalOrders} 个订单，最近购买：${profile.recentProducts.join('、')}。${profile.hasRefundHistory ? '有过退款记录。' : ''}${profile.ticketCount > 0 ? `有 ${profile.ticketCount} 个工单。` : ''}`
  const systemPrompt = SYSTEM_PROMPT.replace('{{user_history}}', profileText)

  const messages: Array<{ role: string; content: string | unknown[]; tool_call_id?: string }> = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ]

  const allToolCalls: ToolCallInfo[] = []

  for (let step = 0; step < 5; step++) {
    console.log(`--- Step ${step + 1} ---`)

    const assistantMsg = await callMimo(messages)
    console.log('finishReason:', assistantMsg.tool_calls ? 'tool-calls' : 'stop')
    console.log('text:', assistantMsg.content?.substring(0, 200))

    if (!assistantMsg.tool_calls) {
      console.log('模型直接回复，结束')
      return { text: assistantMsg.content || '', toolCalls: allToolCalls }
    }

    console.log('Tool 调用数:', assistantMsg.tool_calls.length)
    messages.push(assistantMsg)

    for (const tc of assistantMsg.tool_calls) {
      const args = JSON.parse(tc.function.arguments)
      console.log('Tool:', tc.function.name, 'args:', JSON.stringify(args))

      const result = await executeTool(tc.function.name, args)
      console.log('结果:', JSON.stringify(result)?.substring(0, 300))

      allToolCalls.push({ toolName: tc.function.name, args, result })

      messages.push({
        role: 'tool',
        content: JSON.stringify(result),
        tool_call_id: tc.id,
      })
    }
  }

  const finalMsg = await callMimo(messages)
  return { text: finalMsg.content || '', toolCalls: allToolCalls }
}
