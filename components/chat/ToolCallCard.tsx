'use client'

import { Wrench, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface ToolCallCardProps {
  toolName: string
  args: Record<string, unknown>
  result: unknown
}

const toolNameMap: Record<string, string> = {
  queryOrder: '查询订单',
  queryUserOrders: '查询订单列表',
  createRefund: '创建退货工单',
  queryLogistics: '查询物流',
  searchKnowledge: '搜索知识库',
}

export function ToolCallCard({ toolName, args, result }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-lg bg-gray-50 max-w-sm text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors"
      >
        <Wrench className="w-3 h-3 text-gray-500" />
        <span className="text-gray-600 font-medium">
          {toolNameMap[toolName] || toolName}
        </span>
        <span className="text-gray-400 ml-auto">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t pt-2 space-y-2">
          <div>
            <p className="text-gray-500 mb-1">参数：</p>
            <pre className="bg-white p-2 rounded text-gray-700 overflow-x-auto">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-gray-500 mb-1">结果：</p>
            <pre className="bg-white p-2 rounded text-gray-700 overflow-x-auto max-h-40 overflow-y-auto">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
