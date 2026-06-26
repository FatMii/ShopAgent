'use client'

import { useState, useEffect } from 'react'
import { StatsCards } from '@/components/admin/StatsCards'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardData {
  todaySessions: number
  totalTickets: number
  pendingTickets: number
  resolvedRate: number
  ticketTypeDistribution: {
    refund: number
    exchange: number
    complaint: number
  }
  dailySessionCounts: { date: string; count: number }[]
}

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return <div className="p-6 text-gray-400">加载中...</div>
  }

  const pieData = [
    { name: '退货', value: data.ticketTypeDistribution.refund },
    { name: '换货', value: data.ticketTypeDistribution.exchange },
    { name: '投诉', value: data.ticketTypeDistribution.complaint },
  ].filter((d) => d.value > 0)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">数据看板</h1>

      {/* 统计卡片 */}
      <StatsCards
        todaySessions={data.todaySessions}
        pendingTickets={data.pendingTickets}
        resolvedRate={data.resolvedRate}
        totalTickets={data.totalTickets}
      />

      {/* 图表 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 对话量趋势 */}
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-4">最近 7 天对话量</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.dailySessionCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 工单类型分布 */}
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-4">工单类型分布</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              暂无工单数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
