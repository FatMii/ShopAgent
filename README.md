# AI 客服 Agent — 电商场景

> 基于 Next.js 全栈实现的智能客服系统，支持多轮对话、Tool Calling、RAG 知识库检索、工单管理。

## 一、项目概述

### 做什么

一个电商场景的 AI 客服 Agent，能自动处理用户的订单查询、退货退款、物流跟踪、商品咨询等问题。不是简单的问答机器人，而是具备**工具调用能力**的 Agent——能查订单、能建工单、能搜知识库。

### 为什么做

- 客服是 AI Agent 落地最成熟的场景，面试官一听就懂
- 涉及 Agent 核心概念：Tool Calling、Memory、RAG、多轮对话
- 前端能发挥：对话界面、工单管理、数据看板、Tool 调用过程可视化

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 全栈，前后端一体 |
| UI | Tailwind CSS + Shadcn/UI | 组件库，快速搭建界面 |
| Agent | Vercel AI SDK + OpenAI Function Calling | Agent 核心、Tool 调用、流式输出 |
| RAG | LangChain.js + pgvector | 文档切片、向量化、相似度检索 |
| 数据库 | PostgreSQL + Prisma ORM | 业务数据 + 向量数据 |

### npm 依赖

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "ai": "^3.4.0",
    "@ai-sdk/openai": "^0.0.60",
    "openai": "^4.70.0",
    "langchain": "^0.3.0",
    "@langchain/openai": "^0.3.0",
    "@langchain/community": "^0.3.0",
    "@prisma/client": "^5.20.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "prisma": "^5.20.0",
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 二、Function Calling vs MCP：为什么选 Function Calling

### 两种方案对比

| | OpenAI Function Calling | MCP (Model Context Protocol) |
|---|---|---|
| 是什么 | OpenAI 的 Tool 调用机制 | Anthropic 推出的开放协议 |
| 怎么工作 | 把 Tool 的 JSON Schema 传给模型，模型决定调哪个 | 通过标准化协议连接 LLM 和外部工具/数据源 |
| 适用模型 | OpenAI 系列（GPT-4o 等） | Claude 系列为主，其他模型也在接入 |
| 生态成熟度 | 最成熟，文档最多，社区最大 | 较新，生态在快速成长 |
| 面试认知度 | 面试官基本都知道 | 部分面试官可能不了解 |
| 适合场景 | 通用项目、快速出成果 | 需要跨模型、标准化工具协议的场景 |

### 为什么这个项目选 Function Calling

1. **面试通用性**：Function Calling 是目前最主流的 Agent 实现方式，面试官一看就懂
2. **开发效率**：Vercel AI SDK 对 Function Calling 有原生支持，开箱即用
3. **文档丰富**：踩坑容易找到解决方案
4. **够用**：这个项目的 Tool 就 5 个，不需要 MCP 的跨模型、跨平台能力

### 什么时候该用 MCP

- 你要做一个**通用的 Agent 平台**，支持多个模型提供商
- 你的 Tool 需要被**多个 Agent 共享复用**
- 你在做**基础设施层**的东西，而不是业务应用
- 你想在简历上写"实现了 MCP 协议集成"作为加分项

### 如果你想用 MCP

把 Agent 核心换成 Claude + MCP：

```
模型：Claude 3.5 Sonnet（Anthropic API）
Tool 定义：MCP Server（定义 Tool 的 JSON Schema + 执行逻辑）
Agent：Claude 通过 MCP 协议调用 Tool
前端：不变
```

代码层面的变化主要在 Agent 核心，前端和数据库完全不用改。

---

## 三、功能规划

### P0：核心功能（必须做）

#### 1. 智能对话

- 流式输出，打字机效果
- 支持多轮对话，保持上下文
- 对话历史持久化（存数据库）
- 消息类型：文本、Tool 调用卡片、订单卡片

#### 2. Tool Calling（工具调用）

Agent 能调用以下工具：

| Tool | 功能 | 参数 | 返回 |
|------|------|------|------|
| `queryOrder` | 查询订单详情 | orderId / 订单号 | 订单商品、金额、状态 |
| `queryUserOrders` | 查询用户的全部订单 | userId | 订单列表 |
| `createRefund` | 创建退货工单 | orderId, reason | 工单号、状态 |
| `queryLogistics` | 查询物流状态 | trackingNo | 物流轨迹 |
| `searchKnowledge` | 搜索知识库 | query | 相关文档片段 |

#### 3. RAG 知识库

- 支持上传 Markdown / TXT 文档
- 文档自动切片 + 向量化存入 pgvector
- 用户提问时自动检索相关文档，LLM 基于检索结果回答
- 知识库内容管理（增删改查）

#### 4. 工单管理

- 工单列表（支持按状态、类型筛选）
- 工单详情（关联订单、对话记录）
- 状态流转：待处理 → 处理中 → 已解决 / 已关闭

### P1：增强功能（有余力做）

#### 5. Memory 记忆

- 短期记忆：当前会话的上下文（最近 N 轮对话）
- 长期记忆：用户画像（历史订单偏好、常见问题）
- 断点续聊：用户下次来，能接上之前的话题

#### 6. Agent 思考过程可视化

- 展示 Agent 的推理步骤（Chain of Thought）
- 展示 Tool 调用过程（输入参数、返回结果、耗时）
- 展示 Token 消耗

#### 7. 数据看板

- 今日对话数
- 工单数量统计（按状态）
- 平均响应时间
- 用户满意度（简单 thumbs up/down 反馈）

### P2：锦上添花（做了加分）

#### 8. 多角色切换

- 普通客服模式（处理售后问题）
- 导购模式（推荐商品、解答规格问题）
- 可在页面上切换角色，System Prompt 不同

#### 9. 人工兜底

- Agent 无法解决时，自动转人工（创建升级工单）
- 识别用户情绪（负面情绪自动标记优先级）

---

## 四、数据库设计

使用 Prisma + PostgreSQL + pgvector。

### 表结构

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

// 用户（演示阶段预置数据，不做注册登录）
model User {
  id        String    @id @default(cuid())
  name      String
  phone     String?   @unique
  orders    Order[]
  tickets   Ticket[]
  sessions  Session[]
  feedbacks Feedback[]
  createdAt DateTime  @default(now())
}

// 会话（一次客服对话）
model Session {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  status    String    @default("active") // active / closed
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

// 消息
model Message {
  id        String   @id @default(cuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role      String   // user / assistant / system
  content   String
  toolCalls Json?    // Tool 调用记录 [{tool, input, output, duration}]
  createdAt DateTime @default(now())
}

// 订单
model Order {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  product    String
  amount     Float
  status     String   // pending / paid / shipped / completed / refunded
  trackingNo String?
  tickets    Ticket[]
  createdAt  DateTime @default(now())
}

// 工单
model Ticket {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  type      String   // refund / exchange / complaint / escalation
  reason    String
  status    String   @default("pending") // pending / processing / resolved / closed
  priority  String   @default("normal")  // low / normal / high / urgent
  assignee  String?  // 人工客服（P2）
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 用户反馈
model Feedback {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  sessionId String
  rating    Int      // 1=差评, 5=好评
  comment   String?
  createdAt DateTime @default(now())
}

// 知识库文档（元数据，向量存在 pgvector 原生表）
model KnowledgeDoc {
  id        String   @id @default(cuid())
  title     String
  filePath  String
  chunks    Int      @default(0)
  status    String   @default("processing") // processing / ready / failed
  createdAt DateTime @default(now())
}
```

### 向量表（原生 SQL，Prisma 不直接支持 vector 类型）

```sql
-- 启用 pgvector 扩展（Prisma schema 里已声明，也可手动执行）
CREATE EXTENSION IF NOT EXISTS vector;

-- 知识库向量表
CREATE TABLE knowledge_chunks (
  id SERIAL PRIMARY KEY,
  doc_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 向量索引（需要先有数据才能建，seed 脚本里处理）
-- CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Seed 脚本（`prisma/seed.ts`）

开发阶段需要预置测试数据，否则 Tool 调了也查不到东西：

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. 创建测试用户
  const user = await prisma.user.create({
    data: {
      id: 'user_001',
      name: '张三',
      phone: '13800138000',
    },
  })

  // 2. 创建测试订单
  await prisma.order.createMany({
    data: [
      {
        id: 'ORD_001',
        userId: user.id,
        product: 'iPhone 15 Pro 手机壳（透明款）',
        amount: 29.9,
        status: 'shipped',
        trackingNo: 'SF1234567890',
      },
      {
        id: 'ORD_002',
        userId: user.id,
        product: 'AirPods Pro 2 耳机套',
        amount: 49.9,
        status: 'completed',
        trackingNo: 'SF9876543210',
      },
      {
        id: 'ORD_003',
        userId: user.id,
        product: 'MacBook Pro 14 保护壳',
        amount: 129.0,
        status: 'paid',
        trackingNo: null,
      },
    ],
  })

  console.log('Seed data created successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

在 `package.json` 里添加：

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

运行：`npx prisma db seed`

---

## 五、目录结构

```
ShopAgent/
├── app/
│   ├── layout.tsx                        # 全局布局（侧边栏 + 主内容）
│   ├── page.tsx                          # 首页，重定向到 /chat
│   │
│   ├── chat/
│   │   └── page.tsx                      # 对话页面
│   │
│   ├── admin/
│   │   ├── layout.tsx                    # 后台布局（侧边栏导航）
│   │   ├── tickets/
│   │   │   └── page.tsx                  # 工单管理
│   │   ├── knowledge/
│   │   │   └── page.tsx                  # 知识库管理
│   │   └── dashboard/
│   │       └── page.tsx                  # 数据看板
│   │
│   └── api/
│       ├── chat/
│       │   └── route.ts                  # 对话接口（调用 lib/agent）
│       ├── sessions/
│       │   └── route.ts                  # 会话 CRUD
│       ├── tickets/
│       │   └── route.ts                  # 工单 CRUD
│       ├── knowledge/
│       │   ├── route.ts                  # 知识库文档 CRUD
│       │   ├── ingest/route.ts           # 文档向量化入库 API
│       │   └── search/route.ts           # 向量检索 API
│       └── dashboard/
│           └── route.ts                  # 看板统计数据
│
├── lib/
│   ├── agent/
│   │   ├── index.ts                      # Agent 初始化 + 运行入口
│   │   ├── tools.ts                      # 所有 Tool 定义
│   │   ├── prompt.ts                     # System Prompt
│   │   └── memory.ts                     # Memory 管理（短期 + 长期）
│   │
│   ├── rag/
│   │   ├── ingest.ts                     # 文档切片 + 向量化（核心逻辑）
│   │   └── retrieve.ts                   # 相似度检索（核心逻辑）
│   │
│   ├── db/
│   │   └── prisma.ts                     # Prisma 客户端实例
│   │
│   └── utils/
│       └── format.ts                     # 格式化工具
│
├── components/
│   ├── ui/                               # Shadcn/UI 组件（自动生成）
│   │
│   ├── chat/
│   │   ├── ChatWindow.tsx                # 对话窗口容器
│   │   ├── MessageList.tsx               # 消息列表
│   │   ├── MessageBubble.tsx             # 单条消息
│   │   ├── MessageInput.tsx              # 输入框 + 发送按钮
│   │   ├── ToolCallCard.tsx              # Tool 调用过程卡片
│   │   ├── OrderCard.tsx                 # 订单信息卡片
│   │   └── SessionSidebar.tsx            # 会话列表侧边栏
│   │
│   ├── admin/
│   │   ├── TicketTable.tsx               # 工单表格
│   │   ├── TicketDetail.tsx              # 工单详情抽屉
│   │   ├── KnowledgeUploader.tsx         # 知识库文档上传
│   │   ├── KnowledgeList.tsx             # 知识库文档列表
│   │   └── StatsCards.tsx                # 统计卡片
│   │
│   └── layout/
│       ├── Sidebar.tsx                   # 全局侧边栏
│       └── Header.tsx                    # 顶栏
│
├── prisma/
│   ├── schema.prisma                     # 数据库模型定义
│   └── seed.ts                           # 测试数据
│
├── public/
│   └── knowledge/                        # 知识库存储目录
│
├── .env.local                            # 环境变量
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 六、核心模块实现

### 6.1 Agent 核心（`lib/agent/index.ts`）

```ts
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { tools } from './tools'
import { SYSTEM_PROMPT } from './prompt'
import { getMemory } from './memory'
import { retrieveFromKnowledgeBase } from '@/lib/rag/retrieve'

export async function runAgent(sessionId: string, userMessage: string) {
  // 1. 加载历史对话（短期记忆）
  const history = await getMemory(sessionId)

  // 2. RAG 检索相关知识
  const context = await retrieveFromKnowledgeBase(userMessage)

  // 3. 组装 System Prompt
  const systemPrompt = SYSTEM_PROMPT
    .replace('{{knowledge_context}}', context || '暂无相关知识库内容')
    .replace('{{user_history}}', history.length > 0 ? JSON.stringify(history) : '无历史对话')

  // 4. 运行 Agent
  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: [...history, { role: 'user', content: userMessage }],
    tools,
    maxSteps: 5,
    onFinish: async ({ text, toolCalls }) => {
      // 流式结束后，保存 Agent 回复到数据库
      await prisma.message.create({
        data: {
          sessionId,
          role: 'assistant',
          content: text,
          toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
        },
      })
    },
  })

  return result.toDataStreamResponse()
}
```

### 6.2 Memory 管理（`lib/agent/memory.ts`）

```ts
import { prisma } from '@/lib/db/prisma'

/**
 * 短期记忆：获取当前会话的最近 N 轮对话
 */
export async function getMemory(sessionId: string, limit = 10) {
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  // 反转为正序，并转换为 OpenAI messages 格式
  return messages.reverse().map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }))
}

/**
 * 长期记忆：获取用户画像信息（历史订单、常见问题等）
 */
export async function getUserProfile(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const tickets = await prisma.ticket.findMany({
    where: { order: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return {
    totalOrders: orders.length,
    recentProducts: orders.map(o => o.product),
    hasRefundHistory: tickets.some(t => t.type === 'refund'),
    ticketCount: tickets.length,
  }
}
```

### 6.3 Tool 定义（`lib/agent/tools.ts`）

```ts
import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { retrieveFromKnowledgeBase } from '@/lib/rag/retrieve'

export const tools = {
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

  createRefund: tool({
    description: '为用户创建退货退款工单。调用前必须确认订单号和退货原因。',
    parameters: z.object({
      orderId: z.string().describe('要退货的订单号'),
      reason: z.string().describe('退货原因'),
    }),
    execute: async ({ orderId, reason }) => {
      try {
        // 先检查订单是否存在
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

  queryLogistics: tool({
    description: '根据物流单号查询快递状态',
    parameters: z.object({
      trackingNo: z.string().describe('物流单号，如 SF1234567890'),
    }),
    execute: async ({ trackingNo }) => {
      // 模拟物流数据（实际项目对接快递100等 API）
      const mockLogistics: Record<string, any> = {
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
      }
      return mockLogistics[trackingNo] || { error: `未查询到物流单号 ${trackingNo} 的信息` }
    },
  }),

  searchKnowledge: tool({
    description: '搜索知识库获取商品信息、退货政策、常见问题等。商品相关问题优先使用此工具。',
    parameters: z.object({
      query: z.string().describe('搜索内容，如"退货政策"、"手机壳材质"'),
    }),
    execute: async ({ query }) => {
      try {
        const results = await retrieveFromKnowledgeBase(query)
        if (!results) return { message: '未找到相关知识库内容' }
        return { content: results }
      } catch (e) {
        return { error: '搜索知识库时出错' }
      }
    },
  }),
}
```

### 6.4 System Prompt（`lib/agent/prompt.ts`）

```ts
export const SYSTEM_PROMPT = `你是一个专业的电商客服 Agent，名叫"小助手"。

## 你的能力
1. 查询订单详情和用户的全部订单
2. 创建退货退款工单
3. 查询物流状态
4. 搜索知识库回答商品相关问题

## 工作原则
- 回答前先确认用户意图，不要假设
- 需要查订单时，先问用户要订单号；如果用户没给，用 queryUserOrders 查他的订单列表
- 涉及退货退款时，必须先确认订单号和退货原因，再调用 createRefund
- 商品相关问题优先用 searchKnowledge 搜索知识库，不要凭空回答
- 回答简洁明了，不要长篇大论
- 遇到你无法解决的问题，告诉用户"我会为您转接人工客服"
- 当前用户ID是 user_001（演示用）

## 知识库参考内容
{{knowledge_context}}

## 用户历史信息
{{user_history}}
`
```

### 6.5 RAG 实现

#### 文档入库（`lib/rag/ingest.ts`）

```ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { prisma } from '@/lib/db/prisma'

export async function ingestDocument(docId: string, content: string) {
  // 1. 切片
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
  })
  const chunks = await splitter.createDocuments([content])

  // 2. 向量化
  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
  })

  // 3. 逐条存入 pgvector
  for (const chunk of chunks) {
    const vector = await embeddings.embedQuery(chunk.pageContent)
    await prisma.$executeRaw`
      INSERT INTO knowledge_chunks (doc_id, content, embedding)
      VALUES (${docId}, ${chunk.pageContent}, ${JSON.stringify(vector)}::vector)
    `
  }

  // 4. 更新文档元数据
  await prisma.knowledgeDoc.update({
    where: { id: docId },
    data: { chunks: chunks.length, status: 'ready' },
  })

  return { success: true, chunks: chunks.length }
}
```

#### 相似度检索（`lib/rag/retrieve.ts`）

```ts
import { OpenAIEmbeddings } from '@langchain/openai'
import { prisma } from '@/lib/db/prisma'

export async function retrieveFromKnowledgeBase(query: string, k = 3) {
  try {
    const embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
    })

    const queryVector = await embeddings.embedQuery(query)

    const results: { content: string; distance: number }[] = await prisma.$queryRaw`
      SELECT content, embedding <=> ${JSON.stringify(queryVector)}::vector AS distance
      FROM knowledge_chunks
      ORDER BY distance
      LIMIT ${k}
    `

    // 过滤掉相似度太低的（distance > 0.5 表示不太相关）
    const relevant = results.filter(r => r.distance < 0.5)
    if (relevant.length === 0) return null

    return relevant.map(r => r.content).join('\n---\n')
  } catch (e) {
    console.error('RAG retrieve error:', e)
    return null
  }
}
```

### 6.6 对话接口（`app/api/chat/route.ts`）

```ts
import { runAgent } from '@/lib/agent'
import { prisma } from '@/lib/db/prisma'

// 当前演示用户 ID（实际项目从 session/cookie 获取）
const DEMO_USER_ID = 'user_001'

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json()

  // 如果没有 sessionId，创建新会话
  let currentSessionId = sessionId
  if (!currentSessionId) {
    const session = await prisma.session.create({
      data: { userId: DEMO_USER_ID },
    })
    currentSessionId = session.id
  }

  // 取最后一条用户消息
  const lastMessage = messages[messages.length - 1]

  // 保存用户消息
  await prisma.message.create({
    data: {
      sessionId: currentSessionId,
      role: 'user',
      content: lastMessage.content,
    },
  })

  // 运行 Agent（内部会保存 Agent 回复）
  const response = await runAgent(currentSessionId, lastMessage.content)

  // 把 sessionId 写到响应头，前端用来管理会话
  response.headers.set('x-session-id', currentSessionId)

  return response
}
```

### 6.7 知识库上传 API（`app/api/knowledge/ingest/route.ts`）

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ingestDocument } from '@/lib/rag/ingest'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '未上传文件' }, { status: 400 })
    }

    // 1. 保存文件到 public/knowledge/
    const uploadDir = path.join(process.cwd(), 'public', 'knowledge')
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // 2. 创建文档记录
    const doc = await prisma.knowledgeDoc.create({
      data: {
        title: file.name.replace(/\.(md|txt)$/, ''),
        filePath: `knowledge/${file.name}`,
        status: 'processing',
      },
    })

    // 3. 读取文件内容，向量化入库
    const content = buffer.toString('utf-8')
    const result = await ingestDocument(doc.id, content)

    return NextResponse.json({
      success: true,
      docId: doc.id,
      chunks: result.chunks,
    })
  } catch (e) {
    console.error('Ingest error:', e)
    return NextResponse.json({ error: '文档处理失败' }, { status: 500 })
  }
}
```

---

## 七、前端页面设计

### 7.1 对话页面（`/chat`）

```
┌─────────────────────────────────────────────────────┐
│  侧边栏（240px）  │          对话区域                │
│                   │                                  │
│  ┌─────────────┐  │  ┌────────────────────────────┐ │
│  │ + 新对话     │  │  │ 小助手 你好！请问有什么    │ │
│  │             │  │  │ 可以帮你的？                │ │
│  │ 历史会话     │  │  └────────────────────────────┘ │
│  │ ├─ 订单问题  │  │                                  │
│  │ ├─ 退货咨询  │  │  ┌────────────────────────────┐ │
│  │ └─ 物流查询  │  │  │ 我想查一下订单             │ │
│  │             │  │  └────────────────────────────┘ │
│  └─────────────┘  │                                  │
│                   │  ┌────────────────────────────┐ │
│                   │  │ 🔧 调用工具: queryUserOrders│ │
│                   │  │ 参数: {userId: "user_001"} │ │
│                   │  │ 结果: [3个订单]             │ │
│                   │  │ 耗时: 230ms                 │ │
│                   │  └────────────────────────────┘ │
│                   │                                  │
│                   │  ┌────────────────────────────┐ │
│                   │  │ 查询到你有以下订单：        │ │
│                   │  │                            │ │
│                   │  │ ┌──────────────────────┐   │ │
│                   │  │ │ 订单号: ORD_001      │   │ │
│                   │  │ │ 商品: 手机壳         │   │ │
│                   │  │ │ 金额: ¥29.9          │   │ │
│                   │  │ │ 状态: 已发货          │   │ │
│                   │  │ └──────────────────────┘   │ │
│                   │  └────────────────────────────┘ │
│                   │                                  │
│                   │  ┌────────────────────────────┐ │
│                   │  │ 输入消息...        [发送]   │ │
│                   │  └────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 7.2 工单管理页面（`/admin/tickets`）

```
┌─────────────────────────────────────────────────────┐
│  工单管理                              筛选: [全部▾] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  工单号      订单号      类型    原因      状态      │
│  ─────────────────────────────────────────────────  │
│  T001       ORD_001    退货    质量问题   待处理     │
│  T002       ORD_003    退货    不想要了   处理中     │
│  T003       ORD_005    投诉    发错货     已解决     │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ 工单详情（点击展开）                          │   │
│  │                                              │   │
│  │ 工单号：T001                                 │   │
│  │ 关联订单：ORD_001（手机壳，¥29.9）           │   │
│  │ 退货原因：质量有问题，边角有裂痕             │   │
│  │ 状态：待处理                                 │   │
│  │ 创建时间：2024-06-21 14:30                   │   │
│  │                                              │   │
│  │ [标记处理中]  [标记已解决]  [关闭工单]        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 7.3 知识库管理页面（`/admin/knowledge`）

```
┌─────────────────────────────────────────────────────┐
│  知识库管理                        [上传文档]        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  文档名称          切片数    状态      上传时间      │
│  ─────────────────────────────────────────────────  │
│  退货政策.md        12      已就绪    2024-06-20    │
│  常见问题FAQ.md     25      已就绪    2024-06-20    │
│  手机壳说明书.md     8      处理中    2024-06-21    │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ 📤 拖拽上传文档                               │   │
│  │ 支持 .md / .txt 格式                         │   │
│  │                                              │   │
│  │ [选择文件]                                    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 7.4 数据看板（`/admin/dashboard`）

```
┌─────────────────────────────────────────────────────┐
│  数据看板                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ 今日对话  │ │ 待处理工单│ │ 解决率    │ │ 平均响应│ │
│  │   128    │ │    5     │ │   87%    │ │  1.2s  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ 对话量趋势（折线图，最近7天）                 │   │
│  │  ___                                        │   │
│  │ /   \___                                    │   │
│  │/       \___                                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ 工单类型分布（饼图）                          │   │
│  │  退货 60%  换货 20%  投诉 15%  其他 5%       │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 八、开发计划

### 阶段一：项目基础搭建

- [x] 1.1 Next.js 项目初始化
- [x] 1.2 Tailwind CSS 配置
- [x] 1.3 Shadcn/UI 安装初始化
- [x] 1.4 Prisma schema 定义（User、Session、Message、Order、Ticket、Feedback、KnowledgeDoc）
- [x] 1.5 .gitignore 配置
- [x] 1.6 安装剩余依赖：ai、@ai-sdk/openai、langchain、@langchain/openai、recharts、lucide-react
- [x] 1.7 创建 lib/db/prisma.ts（Prisma 客户端单例）
- [x] 1.8 配置 .env.local（DATABASE_URL、OPENAI_API_KEY）
- [x] 1.9 启动 PostgreSQL（Docker）并运行 prisma db push
- [x] 1.10 编写 prisma/seed.ts（测试用户 + 测试订单）并执行

### 阶段二：对话基础功能

- [x] 2.1 创建 app/layout.tsx（全局布局，侧边栏 + 主内容区）
- [x] 2.2 创建 components/layout/Sidebar.tsx（导航菜单：对话、工单、知识库、看板）
- [x] 2.3 创建 app/chat/page.tsx（对话页面壳子）
- [x] 2.4 创建 components/chat/MessageBubble.tsx（单条消息组件，区分 user/assistant，支持 Markdown 渲染）
- [x] 2.5 创建 components/chat/MessageList.tsx（消息列表，自动滚动到底部）
- [x] 2.6 创建 components/chat/MessageInput.tsx（输入框 + 发送按钮，支持回车发送）
- [x] 2.7 创建 components/chat/ChatWindow.tsx（组装 MessageList + MessageInput）
- [x] 2.8 创建 app/api/chat/route.ts（基础对话接口，接入 mimo API，流式响应）
- [x] 2.9 前端对接 /api/chat，实现流式输出打字机效果
- [ ] 2.10 实现会话管理：新建会话、会话列表、切换会话
- [ ] 2.11 创建 components/chat/SessionSidebar.tsx（会话列表侧边栏）
- [ ] 2.12 创建 app/api/sessions/route.ts（会话 CRUD 接口）
- [ ] 2.13 消息持久化：用户消息和 Agent 回复存入 Message 表

### 阶段三：Agent + Tool Calling

- [ ] 3.1 创建 lib/agent/tools.ts，定义 queryOrder Tool（查订单详情）
- [ ] 3.2 定义 queryUserOrders Tool（查用户全部订单）
- [ ] 3.3 定义 createRefund Tool（创建退货工单，含订单校验）
- [ ] 3.4 定义 queryLogistics Tool（查物流状态，mock 数据）
- [ ] 3.5 定义 searchKnowledge Tool（占位，后续接 RAG）
- [ ] 3.6 创建 lib/agent/prompt.ts（System Prompt，含工作原则）
- [ ] 3.7 创建 lib/agent/memory.ts（getMemory：读最近 N 条消息）
- [ ] 3.8 创建 lib/agent/index.ts（runAgent：组装 prompt + memory + tools，调用 streamText）
- [ ] 3.9 改造 app/api/chat/route.ts，调用 runAgent 替代直接调 OpenAI
- [ ] 3.10 创建 components/chat/ToolCallCard.tsx（展示 Tool 名称、参数、返回结果、耗时）
- [ ] 3.11 MessageBubble 区分消息类型：纯文本 / Tool 调用 / 混合
- [ ] 3.12 创建 components/chat/OrderCard.tsx（订单信息卡片，展示订单号、商品、金额、状态）
- [ ] 3.13 Agent 回复中自动识别并渲染 OrderCard
- [ ] 3.14 联调测试：完整对话流程（用户提问 → Agent 调 Tool → 返回结果 → 渲染）

### 阶段四：RAG 知识库

- [ ] 4.1 PostgreSQL 启用 pgvector 扩展（Docker 镜像换 pgvector 版）
- [ ] 4.2 创建 knowledge_chunks 向量表（原生 SQL）
- [ ] 4.3 创建 lib/rag/ingest.ts（文档切片 + OpenAI Embedding + 存入 pgvector）
- [ ] 4.4 创建 app/api/knowledge/ingest/route.ts（文档上传接口）
- [ ] 4.5 创建 lib/rag/retrieve.ts（向量相似度检索，余弦距离 < 0.5）
- [ ] 4.6 创建 app/api/knowledge/search/route.ts（检索接口）
- [ ] 4.7 将 searchKnowledge Tool 对接到 retrieve.ts
- [ ] 4.8 创建 app/admin/knowledge/page.tsx（知识库管理页面壳子）
- [ ] 4.9 创建 components/admin/KnowledgeUploader.tsx（文档上传组件，拖拽 + 选择文件）
- [ ] 4.10 创建 components/admin/KnowledgeList.tsx（文档列表，展示名称、切片数、状态）
- [ ] 4.11 创建 app/api/knowledge/route.ts（文档列表接口 + 删除接口）
- [ ] 4.12 准备测试知识库文档：退货政策.md、常见问题FAQ.md、商品说明.md
- [ ] 4.13 上传测试文档，验证 RAG 检索效果
- [ ] 4.14 调优：切片大小、overlap、相似度阈值

### 阶段五：工单管理

- [ ] 5.1 创建 app/admin/tickets/page.tsx（工单管理页面壳子）
- [ ] 5.2 创建 components/admin/TicketTable.tsx（工单表格，列：工单号、订单号、类型、原因、状态）
- [ ] 5.3 创建 app/api/tickets/route.ts（工单列表接口，支持按状态/类型筛选）
- [ ] 5.4 创建 components/admin/TicketDetail.tsx（工单详情抽屉，展示关联订单信息）
- [ ] 5.5 工单状态流转：待处理 → 处理中 → 已解决 / 已关闭
- [ ] 5.6 创建 app/api/tickets/[id]/route.ts（单个工单接口：查详情、改状态）

### 阶段六：数据看板

- [ ] 6.1 创建 app/admin/dashboard/page.tsx（看板页面壳子）
- [ ] 6.2 创建 app/api/dashboard/route.ts（统计数据接口：对话数、工单数、解决率）
- [ ] 6.3 创建 components/admin/StatsCards.tsx（统计卡片：今日对话、待处理工单、解决率、平均响应）
- [ ] 6.4 对话量趋势折线图（recharts，最近 7 天）
- [ ] 6.5 工单类型分布饼图（recharts）

### 阶段七：Memory 增强

- [ ] 7.1 短期记忆优化：控制上下文窗口大小（最近 10 轮，避免 token 超限）
- [ ] 7.2 长期记忆：getUserProfile 函数，从 Order/Ticket 表生成用户画像摘要
- [ ] 7.3 用户画像注入 System Prompt（买过什么、有没有退过货、偏好等）

### 阶段八：UI 打磨 + 错误处理

- [ ] 8.1 全局 loading 状态：消息发送中、Agent 思考中
- [ ] 8.2 错误处理：API 报错时前端展示友好提示
- [ ] 8.3 空状态处理：无会话、无工单、无知识库文档时的占位 UI
- [ ] 8.4 响应式适配：移动端侧边栏折叠
- [ ] 8.5 消息满意度反馈（thumbs up/down）

### 阶段九：部署上线

- [ ] 9.1 注册 Neon 账号，创建 PostgreSQL 数据库
- [ ] 9.2 运行 prisma db push 同步表结构到云端
- [ ] 9.3 运行 seed 脚本写入测试数据
- [ ] 9.4 Vercel 导入 GitHub 仓库，配置环境变量
- [ ] 9.5 部署并验证：对话、Tool 调用、RAG 检索、工单管理全部跑通
- [ ] 9.6 更新 README：部署地址、演示截图

---

## 九、本地开发环境启动

> ⚠️ 换电脑或重装系统后，按以下步骤恢复开发环境。

### 前置条件

- Node.js 18+
- Docker Desktop

### 启动步骤

```bash
# 1. 启动 PostgreSQL（Docker 容器）
#    首次运行会自动拉取镜像，之后 docker start 即可
docker start shopagent-db 2>/dev/null || docker run -d --name shopagent-db -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=shopagent -p 5432:5432 pgvector/pgvector:pg16

# 2. 安装依赖
npm install

# 3. 同步数据库表结构
npx prisma db push

# 4. 写入测试数据
npm run db:seed

# 5. 启动开发服务器
npm run dev
```

### 停止开发时

```bash
# 停止数据库容器（数据不会丢失）
docker stop shopagent-db
```

### 环境变量

```env
# .env.local

# OpenAI（替换为你自己的 key）
OPENAI_API_KEY=sk-xxx

# PostgreSQL（和 Docker 启动参数一致）
DATABASE_URL=postgresql://postgres:123456@localhost:5432/shopagent
```

---

## 十、部署方案

| 组件 | 平台 | 说明 |
|------|------|------|
| Next.js 应用 | Vercel | 前端 + API Routes，一键部署 |
| PostgreSQL | Neon | 免费额度够用，原生支持 pgvector |

---

## 十一、面试话术参考

**"介绍一下这个项目？"**

> 这是一个电商场景的 AI 客服 Agent。它不是一个简单的问答机器人，而是具备工具调用能力的 Agent——能查订单、建工单、搜知识库。用户说"我要退货"，它会先查订单、确认退货条件、然后自动创建退货工单。

**"Agent 怎么决定调哪个 Tool？"**

> 通过 OpenAI 的 Function Calling 机制。我把所有 Tool 的 JSON Schema 传给模型，模型根据用户意图自动选择调用哪个 Tool、传什么参数。我在 System Prompt 里定义了工作原则，比如"涉及退货先确认订单号"，引导 Agent 按流程处理。每个 Tool 的 execute 函数都有 try-catch，调用失败会返回错误信息让 Agent 告诉用户。

**"RAG 怎么实现的？"**

> 知识库文档用 LangChain 的 RecursiveCharacterTextSplitter 切片，通过 OpenAI 的 text-embedding-3-small 转成 1536 维向量，存入 PostgreSQL 的 pgvector 扩展。用户提问时，先把问题转成向量，用余弦相似度（<=> 操作符）检索最相关的 3 个片段，距离超过 0.5 的过滤掉，然后塞进 System Prompt 让 LLM 参考回答。

**"多轮对话怎么保持上下文？"**

> 两层：短期记忆是从数据库读最近 10 条消息，拼进 messages 数组传给模型；长期记忆是把用户的历史订单和工单信息摘要注入 System Prompt，让 Agent 知道这个用户买过什么、有没有退过货。

**"Tool 调用失败怎么办？"**

> 每个 Tool 内部都有 try-catch，捕获异常后返回错误对象。Agent 拿到错误信息后会告诉用户"查询出错，请稍后重试"。如果连续多次失败，Agent 会建议转人工客服。另外 createRefund 在执行前会先校验订单是否存在、是否已退款，防止重复操作。

**"为什么选 Function Calling 而不是 MCP？"**

> Function Calling 是目前最主流的 Agent Tool 调用方式，Vercel AI SDK 有原生支持，开发效率高，面试官也最熟悉。MCP 是 Anthropic 推出的标准化协议，更适合做跨模型、跨平台的 Agent 基础设施。这个项目是业务应用，Tool 就 5 个，Function Calling 够用。如果要做通用 Agent 平台，我会考虑用 MCP。

---

## 十二、V2 升级计划：迁移到 MCP

V1 用 Function Calling 快速出成果，V2 迁移到 MCP 协议。

### 为什么要升 MCP

| 维度 | V1 Function Calling | V2 MCP |
|------|-------------------|--------|
| Tool 定义 | 写在代码里，和 Agent 耦合 | 独立 MCP Server，可复用 |
| 模型绑定 | 绑死 OpenAI | 支持任意 MCP 兼容模型 |
| Tool 共享 | 不行，每个项目重复造 | 一个 MCP Server 多个 Agent 共用 |
| 简历加分 | "用了 Function Calling" | "实现了 MCP 协议集成" |
| 面试话题 | 一般 | 能聊协议设计、标准化、生态 |

### MCP 核心概念

```
┌─────────────┐     MCP 协议      ┌─────────────┐
│  MCP Client │ ◄──────────────► │  MCP Server  │
│  (Agent)    │                   │  (Tool 提供方)│
└─────────────┘                   └─────────────┘
```

- **MCP Server**：暴露 Tool 的服务，定义 Tool 的 Schema + 执行逻辑
- **MCP Client**：Agent 端，通过协议发现和调用 Server 的 Tool
- **传输方式**：stdio（本地）/ SSE（远程）

### V2 改造方案

#### 改动范围

| 模块 | 改动 | 说明 |
|------|------|------|
| `lib/agent/` | 重写 | 换成 MCP Client，连接 MCP Server |
| `lib/agent/tools.ts` | 拆出去 | 变成独立的 MCP Server |
| 前端 | 不改 | 对话界面、工单管理完全不变 |
| 数据库 | 不改 | Prisma schema 不变 |
| RAG | 不改 | LangChain + pgvector 不变 |

#### 新增：MCP Server（`mcp-server/`）

```
mcp-server/
├── index.ts                  # MCP Server 入口
├── tools/
│   ├── queryOrder.ts         # 订单查询 Tool
│   ├── queryUserOrders.ts    # 用户订单列表 Tool
│   ├── createRefund.ts       # 创建退货工单 Tool
│   ├── queryLogistics.ts     # 物流查询 Tool
│   └── searchKnowledge.ts    # 知识库检索 Tool
├── package.json
└── tsconfig.json
```

#### MCP Server 实现（`mcp-server/index.ts`）

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const server = new McpServer({
  name: 'cs-agent-tools',
  version: '1.0.0',
})

// Tool: 查询订单
server.tool(
  'queryOrder',
  '根据订单号查询订单详情',
  { orderId: z.string().describe('订单号') },
  async ({ orderId }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { tickets: true },
    })
    return {
      content: [{ type: 'text', text: JSON.stringify(order || { error: '未找到订单' }) }],
    }
  }
)

// Tool: 创建退货工单
server.tool(
  'createRefund',
  '创建退货退款工单',
  { orderId: z.string(), reason: z.string() },
  async ({ orderId, reason }) => {
    const ticket = await prisma.ticket.create({
      data: { orderId, type: 'refund', reason, status: 'pending' },
    })
    return {
      content: [{ type: 'text', text: JSON.stringify({ ticketId: ticket.id, message: '工单已创建' }) }],
    }
  }
)

// ... 其他 Tool 同理

// 启动
const transport = new StdioServerTransport()
await server.connect(transport)
```

#### Agent 改造（`lib/agent/index.ts`）

```ts
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { experimental_createMCPClient } from 'ai'
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio'

export async function runAgent(sessionId: string, userMessage: string) {
  // 1. 连接 MCP Server
  const mcpClient = await experimental_createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      command: 'npx',
      args: ['tsx', 'mcp-server/index.ts'],
    }),
  })

  // 2. 从 MCP Server 获取 Tool 列表
  const tools = await mcpClient.tools()

  // 3. 运行 Agent（和 V1 一样，但 Tool 来自 MCP）
  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: [...history, { role: 'user', content: userMessage }],
    tools,
    maxSteps: 5,
    onFinish: async () => {
      await mcpClient.close()
    },
  })

  return result.toDataStreamResponse()
}
```

### V1 → V2 迁移步骤

```
Step 1: 安装 MCP SDK
  npm install @modelcontextprotocol/sdk

Step 2: 创建 mcp-server/ 目录
  把 lib/agent/tools.ts 里的 5 个 Tool 搬到 mcp-server/tools/

Step 3: 改造 lib/agent/index.ts
  从直接调 tools 变成连接 MCP Server 获取 tools

Step 4: 前端和数据库完全不动

Step 5: 测试：确认 Tool 调用、流式输出、错误处理都正常
```

### V2 面试话术

**"为什么要迁移到 MCP？"**

> V1 用 Function Calling 是为了快速验证业务逻辑。V2 迁移到 MCP 有几个好处：1）Tool 变成独立的 MCP Server，和 Agent 解耦，可以被多个 Agent 复用；2）不绑定 OpenAI，换 Claude 或其他模型只改一行配置；3）MCP 是标准化协议，Tool 的定义和实现分离，团队协作更方便。

**"MCP 和 Function Calling 的区别？"**

> Function Calling 是 OpenAI 私有的 Tool 调用机制，Tool 定义和 Agent 代码耦合在一起。MCP 是 Anthropic 推出的开放协议，Tool 以独立 Server 的形式存在，Agent 通过协议发现和调用 Tool。类比的话，Function Calling 像本地函数调用，MCP 像 RPC——一个在进程内，一个跨进程。

**"MCP Server 怎么部署？"**

> 两种方式：本地用 stdio 传输，MCP Server 作为子进程启动；远程用 SSE 传输，MCP Server 部署为独立服务。这个项目用的 stdio，因为 Server 和 Agent 在同一个应用里。如果要做多 Agent 共享 Tool，就用 SSE 部署成远程服务。
