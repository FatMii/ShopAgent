'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Ticket, BookOpen, BarChart3, LogOut } from 'lucide-react'

interface SidebarProps {
  user: {
    name: string
    role: string
  }
  onLogout: () => void
}

const roleMap: Record<string, string> = {
  customer: '用户',
  agent: '客服',
  admin: '管理员',
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()

  // 根据角色决定显示哪些菜单
  const navItems = [
    { href: '/chat', label: '对话', icon: MessageSquare, roles: ['customer', 'agent', 'admin'] },
    { href: '/admin/tickets', label: '工单', icon: Ticket, roles: ['agent', 'admin'] },
    { href: '/admin/knowledge', label: '知识库', icon: BookOpen, roles: ['admin'] },
    { href: '/admin/dashboard', label: '看板', icon: BarChart3, roles: ['admin'] },
  ]

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <aside className="w-60 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold">ShopAgent</h1>
        <p className="text-xs text-gray-500">AI 客服助手</p>
      </div>

      <nav className="flex-1 p-2">
        {filteredItems.map((item) => {
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

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{roleMap[user.role] || user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
