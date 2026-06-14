import { createFileRoute } from '@tanstack/react-router'
import { RevisionPage } from '@/components/RevisionPage'

export const Route = createFileRoute('/dashboard/revision')({
  component: RevisionPage,
})
