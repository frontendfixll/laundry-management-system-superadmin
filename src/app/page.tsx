'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSuperAdminStore } from '@/store/superAdminStore'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useSuperAdminStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
    </div>
  )
}
