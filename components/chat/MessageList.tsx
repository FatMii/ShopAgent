'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ToolCallCard } from './ToolCallCard'
import { ThinkingIndicator } from '@/components/ui/loading-dots'
import { Bot, MessageSquare } from 'lucide-react'
import type { ToolCallInfo } from './ChatWindow'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallInfo[]
  sessionId?: string
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  sessionId?: string
}

export function MessageList({ messages, isLoading, sessionId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-lg font-medium text-gray-600 mb-2">你好，我是小助手</p>
        <p className="text-sm text-center max-w-md">
          我可以帮你查询订单、处理退货退款、查询物流状态，以及回答商品相关问题。
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm">
          {[
            { icon: '📦', text: '查询我的订单' },
            { icon: '🔄', text: '申请退货退款' },
            { icon: '🚚', text: '查询物流状态' },
            { icon: '❓', text: '商品相关问题' },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="space-y-2">
          {/* Tool 调用卡片（在 assistant 消息上方） */}
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <div className="flex gap-3">
              <div className="w-8 flex-shrink-0" />
              <div className="space-y-2">
                {msg.toolCalls.map((tc, i) => (
                  <ToolCallCard
                    key={i}
                    toolName={tc.toolName}
                    args={tc.args}
                    result={tc.result}
                  />
                ))}
              </div>
            </div>
          )}
          {/* 消息气泡 */}
          <MessageBubble
            role={msg.role}
            content={msg.content}
            messageId={msg.id}
            sessionId={sessionId}
          />
        </div>
      ))}
      {isLoading && <ThinkingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
