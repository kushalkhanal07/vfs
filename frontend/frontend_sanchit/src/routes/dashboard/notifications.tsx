import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/components/NotificationsPage'

export const Route = createFileRoute('/dashboard/notifications')({
  component: NotificationsPage,
})
