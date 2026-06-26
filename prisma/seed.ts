import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 清空旧数据
  await prisma.feedback.deleteMany()
  await prisma.message.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // ========== 用户 ==========
  const user1 = await prisma.user.create({
    data: { id: 'user_001', name: '张三', phone: '13800138000' },
  })
  const user2 = await prisma.user.create({
    data: { id: 'user_002', name: '李四', phone: '13900139000' },
  })

  // ========== 张三的订单 ==========
  await prisma.order.createMany({
    data: [
      {
        id: 'ORD_001',
        userId: user1.id,
        product: 'iPhone 15 Pro 手机壳（透明款）',
        amount: 29.9,
        status: 'shipped',
        trackingNo: 'SF1234567890',
      },
      {
        id: 'ORD_002',
        userId: user1.id,
        product: 'AirPods Pro 2 耳机保护套',
        amount: 49.9,
        status: 'completed',
        trackingNo: 'SF9876543210',
      },
      {
        id: 'ORD_003',
        userId: user1.id,
        product: 'MacBook Pro 14 防摔保护壳',
        amount: 129.0,
        status: 'paid',
        trackingNo: null,
      },
      {
        id: 'ORD_004',
        userId: user1.id,
        product: 'iPad Air 6 磁吸保护壳',
        amount: 89.0,
        status: 'shipped',
        trackingNo: 'YT2024062500001',
      },
      {
        id: 'ORD_005',
        userId: user1.id,
        product: '小米手环 9 表带（硅胶款）',
        amount: 19.9,
        status: 'completed',
        trackingNo: 'SF1111111111',
      },
      {
        id: 'ORD_006',
        userId: user1.id,
        product: 'USB-C 转接头（三合一）',
        amount: 35.0,
        status: 'refunded',
        trackingNo: null,
      },
    ],
  })

  // ========== 李四的订单 ==========
  await prisma.order.createMany({
    data: [
      {
        id: 'ORD_007',
        userId: user2.id,
        product: 'Redmi K80 手机壳（磨砂黑）',
        amount: 25.0,
        status: 'shipped',
        trackingNo: 'YT2024062500002',
      },
      {
        id: 'ORD_008',
        userId: user2.id,
        product: '小米蓝牙耳机 Redmi Buds 6',
        amount: 199.0,
        status: 'pending',
        trackingNo: null,
      },
    ],
  })

  // ========== 工单 ==========
  await prisma.ticket.createMany({
    data: [
      {
        id: 'TK_001',
        orderId: 'ORD_006',
        type: 'refund',
        reason: '接口松动，无法正常连接',
        status: 'resolved',
        priority: 'normal',
      },
      {
        id: 'TK_002',
        orderId: 'ORD_001',
        type: 'exchange',
        reason: '收到的颜色和下单的不一致',
        status: 'processing',
        priority: 'high',
      },
      {
        id: 'TK_003',
        orderId: 'ORD_003',
        type: 'complaint',
        reason: '包装破损，产品有划痕',
        status: 'pending',
        priority: 'urgent',
      },
    ],
  })

  // ========== 会话 + 消息 ==========
  const session1 = await prisma.session.create({
    data: {
      userId: user1.id,
      messages: {
        create: [
          { role: 'user', content: '我想查一下我的订单' },
          { role: 'assistant', content: '好的，您有 6 个订单，请问您想查哪个？' },
          { role: 'user', content: 'ORD_001 的物流信息' },
          { role: 'assistant', content: 'ORD_001 已发货，物流单号 SF1234567890，运输中。' },
        ],
      },
    },
  })

  await prisma.session.create({
    data: {
      userId: user1.id,
      messages: {
        create: [
          { role: 'user', content: 'ORD_006 的退款什么时候到账？' },
          { role: 'assistant', content: 'ORD_006 已退款，预计 1-3 个工作日到账。' },
        ],
      },
    },
  })

  console.log('✅ Seed data created:')
  console.log('   Users: user_001 (张三), user_002 (李四)')
  console.log('   Orders: ORD_001 ~ ORD_008')
  console.log('   Tickets: TK_001 (退款), TK_002 (换货), TK_003 (投诉)')
  console.log('   Sessions: 2 个历史会话')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
