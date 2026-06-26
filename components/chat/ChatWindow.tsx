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

export interface ToolCallInfo {
  toolName: string
  args: Record<string, unknown>
  result: unknown
}

export function ChatWindow() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadSessions = useCallback(async () => {
    const res = await fetch('/api/sessions')
    const data = await res.json()
    setSessions(data)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

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

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId)
      loadMessages(sessionId)
    },
    [loadMessages]
  )

  const handleNewSession = useCallback(async () => {
    const res = await fetch('/api/sessions', { method: 'POST' })
    const session = await res.json()
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setMessages([])
  }, [])

  const handleSend = async (content: string) => {
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

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
          toolCalls: data.toolCalls || [],
        },
      ])

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
