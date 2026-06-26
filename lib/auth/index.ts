import { prisma } from '@/lib/db/prisma'
import { cookies } from 'next/headers'

// 简单的密码哈希（演示用）
export function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Cookie 操作
export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set('userId', userId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 天
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
}

// 获取当前登录用户
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  })

  return user
}

// 权限检查
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}
