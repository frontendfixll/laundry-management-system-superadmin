'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FinancialPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to overview page
    router.replace('/financial/overview')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
