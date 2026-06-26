import { TicketTable } from '@/components/admin/TicketTable'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function TicketsPage() {
  return (
    <AuthLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">工单管理</h1>
        <TicketTable />
      </div>
    </AuthLayout>
  )
}
