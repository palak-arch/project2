import { createFileRoute } from '@tanstack/react-router'
import { ChatModule } from '@/components/chat'

export const Route = createFileRoute('/messages')({
  head: () => ({
    meta: [
      { title: 'Messages | ridegoa' },
      { name: 'description', content: 'Chat with hosts and renters, confirm bookings, share pins and photos.' },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 md:pb-8">
      <ChatModule />
    </div>
  ),
})
