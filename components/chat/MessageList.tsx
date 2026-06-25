'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { Bot } from 'lucide-react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
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

  // 判断最后一条消息是否是正在流式输出的 assistant 消息
  const lastMessage = messages[messages.length - 1]
  const isStreaming = isLoading && lastMessage?.role === 'assistant' && lastMessage?.content

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
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}
      {/* 只在等待响应还没开始流式输出时显示"思考中" */}
      {isLoading && !isStreaming && (
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
