import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export const useAuthValidation = () => {
  const [isValidating, setIsValidating] = useState(true)
  const { token, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!_hasHydrated) return

    setIsValidating(false)
    if (!token) {
      router.push('/auth/login')
    }
  }, [_hasHydrated, token, router])

  return { isValidating }
}