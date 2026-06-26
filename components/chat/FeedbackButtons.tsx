'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { toast } from '@/components/ui/toast'

interface FeedbackButtonsProps {
  messageId: string
  sessionId: string
}

export function FeedbackButtons({ messageId, sessionId }: FeedbackButtonsProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedback = async (value: number) => {
    if (isSubmitting || rating !== null) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          sessionId,
          rating: value,
        }),
      })

      if (!res.ok) {
        throw new Error('提交失败')
      }

      setRating(value)
      toast({
        type: 'success',
        message: '感谢您的反馈！',
      })
    } catch (error) {
      toast({
        type: 'error',
        message: '反馈提交失败，请稍后重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <button
        onClick={() => handleFeedback(1)}
        disabled={isSubmitting || rating !== null}
        className={`p-1 rounded-md transition-colors ${
          rating === 1
            ? 'bg-green-100 text-green-600'
            : rating !== null
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
        }`}
        title="有帮助"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFeedback(-1)}
        disabled={isSubmitting || rating !== null}
        className={`p-1 rounded-md transition-colors ${
          rating === -1
            ? 'bg-red-100 text-red-600'
            : rating !== null
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
        }`}
        title="没帮助"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
