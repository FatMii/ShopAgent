'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageList, Message } from './MessageList'
import { MessageInput } from './MessageInput'
import { SessionSidebar } from './SessionSidebar'

interface Session {
  id: string
  lastMessage: string
  updatedAt: string
}

export function ChatWindow() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    const res = await fetch('/api/sessions')
    const data = await res.json()
    setSessions(data)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // 加载某个会话的消息
  const loadMessages = useCallback(async (sessionId: string) => {
    const res = await fetch(`/api/sessions/${sessionId}`)
    const data = await res.json()
    const formatted: Message[] = data.map((m: { id: string; role: string; content: string }) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    setMessages(formatted)
  }, [])

  // 切换会话
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId)
      loadMessages(sessionId)
    },
    [loadMessages]
  )

  // 新建会话
  const handleNewSession = useCallback(async () => {
    const res = await fetch('/api/sessions', { method: 'POST' })
    const session = await res.json()
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setMessages([])
  }, [])

  // 发送消息
  const handleSend = async (content: string) => {
    // 如果没有活跃会话，先创建
    let sessionId = activeSessionId
    if (!sessionId) {
      const res = await fetch('/api/sessions', { method: 'POST' })
      const session = await res.json()
      sessionId = session.id
      setActiveSessionId(sessionId)
      setSessions((prev) => [session, ...prev])
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '请求失败' }))
        throw new Error(err.error || '请求失败')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }
      setMessages((prev) => [...prev, assistantMessage])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: assistantContent }
              : m
          )
        )
      }

      // 刷新会话列表（更新最后一条消息预览）
      loadSessions()
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `抱歉，出了点问题：${error instanceof Error ? error.message : '未知错误'}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex min-h-0">
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList messages={messages} isLoading={isLoading} />
        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
