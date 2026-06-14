import { createFileRoute } from '@tanstack/react-router'
import { VaultPage } from '@/components/VaultPage'

export const Route = createFileRoute('/dashboard/vault')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VaultPage />
}
