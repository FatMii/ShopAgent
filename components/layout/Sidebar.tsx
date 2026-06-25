'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Ticket, BookOpen, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/chat', label: '对话', icon: MessageSquare },
  { href: '/admin/tickets', label: '工单', icon: Ticket },
  { href: '/admin/knowledge', label: '知识库', icon: BookOpen },
  { href: '/admin/dashboard', label: '看板', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold">ShopAgent</h1>
        <p className="text-xs text-gray-500">AI 客服助手</p>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t text-xs text-gray-400">
        v0.1.0
      </div>
    </aside>
  )
}
