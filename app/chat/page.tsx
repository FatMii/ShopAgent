import { ChatWindow } from '@/components/chat/ChatWindow'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function ChatPage() {
  return (
    <AuthLayout>
      <ChatWindow />
    </AuthLayout>
  )
}
