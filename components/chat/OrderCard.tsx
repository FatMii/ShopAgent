'use client'

import { Package, Truck, CheckCircle, Clock, RotateCcw } from 'lucide-react'

interface OrderCardProps {
  id: string
  product: string
  amount: number
  status: string
  trackingNo?: string | null
  createdAt?: string
}

const statusMap: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: '待付款', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  paid: { label: '已付款', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  shipped: { label: '已发货', color: 'text-purple-600 bg-purple-50', icon: Truck },
  completed: { label: '已完成', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  refunded: { label: '已退款', color: 'text-gray-600 bg-gray-50', icon: RotateCcw },
}

export function OrderCard({ id, product, amount, status, trackingNo, createdAt }: OrderCardProps) {
  const statusInfo = statusMap[status] || { label: status, color: 'text-gray-600 bg-gray-50', icon: Package }
  const StatusIcon = statusInfo.icon

  return (
    <div className="border rounded-lg p-4 bg-white max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-mono">{id}</span>
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusInfo.label}
        </span>
      </div>
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-800">{product}</p>
        <p className="text-lg font-bold text-gray-900">¥{amount.toFixed(2)}</p>
      </div>
      {trackingNo && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Truck className="w-3 h-3" />
          物流单号：{trackingNo}
        </div>
      )}
      {createdAt && (
        <div className="text-xs text-gray-400 mt-1">
          下单时间：{new Date(createdAt).toLocaleDateString('zh-CN')}
        </div>
      )}
    </div>
  )
}
