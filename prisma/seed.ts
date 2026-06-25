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

  // 创建测试用户
  const user = await prisma.user.create({
    data: {
      id: 'user_001',
      name: '张三',
      phone: '13800138000',
    },
  })

  // 创建测试订单
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
        product: 'AirPods Pro 2 耳机保护套',
        amount: 49.9,
        status: 'completed',
        trackingNo: 'SF9876543210',
      },
      {
        id: 'ORD_003',
        userId: user.id,
        product: 'MacBook Pro 14 防摔保护壳',
        amount: 129.0,
        status: 'paid',
        trackingNo: null,
      },
    ],
  })

  console.log('✅ Seed data created:')
  console.log('   User: user_001 (张三)')
  console.log('   Orders: ORD_001, ORD_002, ORD_003')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
