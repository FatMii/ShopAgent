'use client'

import { useState, useEffect } from 'react'
import { StatsCards } from '@/components/admin/StatsCards'
import { AuthLayout } from '@/components/layout/AuthLayout'
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

  return (
    <AuthLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">数据看板</h1>

        {!data ? (
          <div className="text-gray-400">加载中...</div>
        ) : (
          <>
            <StatsCards
              todaySessions={data.todaySessions}
              pendingTickets={data.pendingTickets}
              resolvedRate={data.resolvedRate}
              totalTickets={data.totalTickets}
            />

            <div className="grid grid-cols-2 gap-6">
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

              <div className="border rounded-lg p-4">
                <h2 className="font-medium mb-4">工单类型分布</h2>
                {Object.values(data.ticketTypeDistribution).some((v) => v > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '退货', value: data.ticketTypeDistribution.refund },
                          { name: '换货', value: data.ticketTypeDistribution.exchange },
                          { name: '投诉', value: data.ticketTypeDistribution.complaint },
                        ].filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[0, 1, 2].map((i) => (
                          <Cell key={i} fill={COLORS[i]} />
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
          </>
        )}
      </div>
    </AuthLayout>
  )
}
