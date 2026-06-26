'use client'

import { MessageSquare, Clock, CheckCircle, BarChart3 } from 'lucide-react'

interface StatsCardsProps {
  todaySessions: number
  pendingTickets: number
  resolvedRate: number
  totalTickets: number
}

export function StatsCards({ todaySessions, pendingTickets, resolvedRate, totalTickets }: StatsCardsProps) {
  const cards = [
    {
      label: '今日对话',
      value: todaySessions,
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: '待处理工单',
      value: pendingTickets,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: '解决率',
      value: `${resolvedRate}%`,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: '总工单数',
      value: totalTickets,
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
