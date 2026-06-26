'use client'

import { useState, useEffect } from 'react'
import { TicketDetail } from './TicketDetail'

interface Ticket {
  id: string
  orderId: string
  type: string
  reason: string
  status: string
  priority: string
  createdAt: string
  order: {
    id: string
    product: string
    amount: number
    status: string
  }
}

const typeMap: Record<string, string> = {
  refund: '退货',
  exchange: '换货',
  complaint: '投诉',
  escalation: '升级',
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: '已解决', color: 'bg-green-100 text-green-700' },
  closed: { label: '已关闭', color: 'bg-gray-100 text-gray-500' },
}

const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'text-gray-500' },
  normal: { label: '普通', color: 'text-blue-500' },
  high: { label: '高', color: 'text-orange-500' },
  urgent: { label: '紧急', color: 'text-red-500' },
}

export function TicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const loadTickets = async () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)

    const res = await fetch(`/api/tickets?${params}`)
    const data = await res.json()
    setTickets(data)
  }

  useEffect(() => {
    loadTickets()
  }, [statusFilter, typeFilter])

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    loadTickets()
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null)
    }
  }

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="resolved">已解决</option>
          <option value="closed">已关闭</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">全部类型</option>
          <option value="refund">退货</option>
          <option value="exchange">换货</option>
          <option value="complaint">投诉</option>
        </select>
      </div>

      {/* 表格 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">工单号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">订单号</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">类型</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">原因</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">优先级</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <td className="px-4 py-3 font-mono text-xs">{ticket.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{ticket.orderId}</td>
                <td className="px-4 py-3">{typeMap[ticket.type] || ticket.type}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">{ticket.reason}</td>
                <td className="px-4 py-3">
                  <span className={priorityMap[ticket.priority]?.color}>
                    {priorityMap[ticket.priority]?.label || ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusMap[ticket.status]?.color}`}>
                    {statusMap[ticket.status]?.label || ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-blue-500 hover:underline text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTicket(ticket)
                    }}
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && (
          <div className="text-center py-8 text-gray-400">暂无工单</div>
        )}
      </div>

      {/* 详情抽屉 */}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
