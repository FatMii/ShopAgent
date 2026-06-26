'use client'

import { X } from 'lucide-react'

interface TicketDetailProps {
  ticket: {
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
  onClose: () => void
  onStatusChange: (ticketId: string, status: string) => void
}

const typeMap: Record<string, string> = {
  refund: '退货',
  exchange: '换货',
  complaint: '投诉',
  escalation: '升级',
}

const nextStatusMap: Record<string, { label: string; status: string }[]> = {
  pending: [
    { label: '标记处理中', status: 'processing' },
    { label: '直接解决', status: 'resolved' },
    { label: '关闭', status: 'closed' },
  ],
  processing: [
    { label: '标记已解决', status: 'resolved' },
    { label: '关闭', status: 'closed' },
  ],
  resolved: [
    { label: '关闭', status: 'closed' },
  ],
  closed: [],
}

export function TicketDetail({ ticket, onClose, onStatusChange }: TicketDetailProps) {
  const nextStatuses = nextStatusMap[ticket.status] || []

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50" onClick={onClose}>
      <div
        className="w-96 bg-white h-full shadow-lg p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">工单详情</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 工单信息 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-gray-700">工单信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">工单号</span>
                <span className="font-mono">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">类型</span>
                <span>{typeMap[ticket.type] || ticket.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">优先级</span>
                <span>{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态</span>
                <span>{ticket.status}</span>
              </div>
              <div>
                <span className="text-gray-500">原因</span>
                <p className="mt-1 text-gray-800">{ticket.reason}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span>{new Date(ticket.createdAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>

          {/* 关联订单 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-gray-700">关联订单</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">订单号</span>
                <span className="font-mono">{ticket.order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">商品</span>
                <span>{ticket.order.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">金额</span>
                <span>¥{ticket.order.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">订单状态</span>
                <span>{ticket.order.status}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {nextStatuses.length > 0 && (
            <div className="space-y-2">
              {nextStatuses.map((ns) => (
                <button
                  key={ns.status}
                  onClick={() => onStatusChange(ticket.id, ns.status)}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm transition-colors"
                >
                  {ns.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
