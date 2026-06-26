import { prisma } from '@/lib/db/prisma'
import { hashPassword, setAuthCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: '请填写完整信息' }, { status: 400 })
  }

  // 检查邮箱是否已注册
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: '该邮箱已注册' }, { status: 400 })
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashPassword(password),
      name,
      role: 'customer',
    },
  })

  await setAuthCookie(user.id)

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
}
