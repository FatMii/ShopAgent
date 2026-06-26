import { prisma } from '@/lib/db/prisma'
import { verifyPassword, setAuthCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }

  if (!verifyPassword(password, user.password)) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }

  await setAuthCookie(user.id)

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
}
