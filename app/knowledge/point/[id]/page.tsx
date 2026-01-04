'use client'

import { useParams } from 'next/navigation'
import { PointDetailPage } from '@/components/knowledge/PointDetailPage'

export default function KnowledgePointPage() {
  const params = useParams()
  const pointId = params.id as string
  return <PointDetailPage pointId={pointId} />
}

