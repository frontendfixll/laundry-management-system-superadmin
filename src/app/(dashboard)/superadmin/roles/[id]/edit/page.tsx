'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function SuperAdminRoleEditRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string

  useEffect(() => {
    if (roleId) {
      // Redirect to new RBAC role edit page
      router.replace(`/rbac/roles/${roleId}/edit`)
    }
  }, [router, roleId])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Edit Platform Role...</p>
      </div>
    </div>
  )
}