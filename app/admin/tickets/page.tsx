import { TicketTable } from '@/components/admin/TicketTable'

export default function TicketsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">工单管理</h1>
      <TicketTable />
    </div>
  )
}
