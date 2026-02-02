'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function SuperAdminSalesDashboardPage() {
  const router = useRouter()
  const { userType } = useAuthStore()

  useEffect(() => {
    // Redirect SuperAdmin to the actual sales dashboard
    // This acts as a bridge to avoid routing conflicts
    console.log('🔄 SuperAdmin accessing sales dashboard, redirecting...')
    router.push('/sales-dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Sales Dashboard...</p>
      </div>
    </div>
  )
}