import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 简单的密码哈希（演示用，生产环境用 bcrypt）
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

async function main() {
  // 清空旧数据
  await prisma.feedback.deleteMany()
  await prisma.message.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // ========== 用户 ==========
  const customer = await prisma.user.create({
    data: {
      id: 'user_001',
      email: 'zhangsan@test.com',
      password: hashPassword('123456'),
      name: '张三',
      role: 'customer',
      phone: '13800138000',
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      id: 'user_002',
      email: 'lisi@test.com',
      password: hashPassword('123456'),
      name: '李四',
      role: 'customer',
      phone: '13900139000',
    },
  })

  const agent = await prisma.user.create({
    data: {
      id: 'user_003',
      email: 'agent@test.com',
      password: hashPassword('123456'),
      name: '王客服',
      role: 'agent',
    },
  })

  const admin = await prisma.user.create({
    data: {
      id: 'user_004',
      email: 'admin@test.com',
      password: hashPassword('123456'),
      name: '管理员',
      role: 'admin',
    },
  })

  // ========== 张三的订单 ==========
  await prisma.order.createMany({
    data: [
      { id: 'ORD_001', userId: customer.id, product: 'iPhone 15 Pro 手机壳（透明款）', amount: 29.9, status: 'shipped', trackingNo: 'SF1234567890' },
      { id: 'ORD_002', userId: customer.id, product: 'AirPods Pro 2 耳机保护套', amount: 49.9, status: 'completed', trackingNo: 'SF9876543210' },
      { id: 'ORD_003', userId: customer.id, product: 'MacBook Pro 14 防摔保护壳', amount: 129.0, status: 'paid', trackingNo: null },
      { id: 'ORD_004', userId: customer.id, product: 'iPad Air 6 磁吸保护壳', amount: 89.0, status: 'shipped', trackingNo: 'YT2024062500001' },
      { id: 'ORD_005', userId: customer.id, product: '小米手环 9 表带（硅胶款）', amount: 19.9, status: 'completed', trackingNo: 'SF1111111111' },
      { id: 'ORD_006', userId: customer.id, product: 'USB-C 转接头（三合一）', amount: 35.0, status: 'refunded', trackingNo: null },
    ],
  })

  // ========== 李四的订单 ==========
  await prisma.order.createMany({
    data: [
      { id: 'ORD_007', userId: customer2.id, product: 'Redmi K80 手机壳（磨砂黑）', amount: 25.0, status: 'shipped', trackingNo: 'YT2024062500002' },
      { id: 'ORD_008', userId: customer2.id, product: '小米蓝牙耳机 Redmi Buds 6', amount: 199.0, status: 'pending', trackingNo: null },
    ],
  })

  // ========== 工单 ==========
  await prisma.ticket.createMany({
    data: [
      { id: 'TK_001', orderId: 'ORD_006', type: 'refund', reason: '接口松动，无法正常连接', status: 'resolved', priority: 'normal' },
      { id: 'TK_002', orderId: 'ORD_001', type: 'exchange', reason: '收到的颜色和下单的不一致', status: 'processing', priority: 'high' },
      { id: 'TK_003', orderId: 'ORD_003', type: 'complaint', reason: '包装破损，产品有划痕', status: 'pending', priority: 'urgent' },
    ],
  })

  console.log('✅ Seed data created:')
  console.log('   张三 (customer): zhangsan@test.com / 123456')
  console.log('   李四 (customer): lisi@test.com / 123456')
  console.log('   王客服 (agent): agent@test.com / 123456')
  console.log('   管理员 (admin): admin@test.com / 123456')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
