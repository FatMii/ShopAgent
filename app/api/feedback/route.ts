import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: Request) {
  try {
    const { messageId, sessionId, rating } = await req.json()

    if (!messageId || !sessionId || !rating) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 获取当前用户（演示用，实际项目从 session/cookie 获取）
    const userId = 'user_001'

    // 保存反馈
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        sessionId,
        rating,
        comment: messageId, // 暂时用 comment 字段存储 messageId
      },
    })

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: '保存反馈失败' },
      { status: 500 }
    )
  }
}
