'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ToolCallCard } from './ToolCallCard'
import { Bot } from 'lucide-react'
import type { ToolCallInfo } from './ChatWindow'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallInfo[]
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <Bot className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">你好，我是小助手</p>
        <p className="text-sm">有什么可以帮你的？</p>
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
          <MessageBubble role={msg.role} content={msg.content} />
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-gray-600" />
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500">
            思考中...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
