'use client'

import { Plus, MessageSquare } from 'lucide-react'

interface Session {
  id: string
  lastMessage: string
  updatedAt: string
}

interface SessionSidebarProps {
  sessions: Session[]
  activeSessionId: string | null
  onSelect: (sessionId: string) => void
  onNew: () => void
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
}: SessionSidebarProps) {
  return (
    <div className="w-60 border-r bg-gray-50 flex flex-col">
      <div className="p-3 border-b">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新对话
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">暂无对话</p>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors flex items-start gap-2 ${
                activeSessionId === session.id
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="truncate">
                {session.lastMessage || '新对话'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
