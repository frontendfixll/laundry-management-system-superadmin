import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export const useAuthValidation = () => {
  const [isValidating, setIsValidating] = useState(true)
  const { token, user, userType, logout, setUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Temporarily disable validation to debug login issue
    console.log('🔐 Auth validation - Token:', !!token)
    console.log('🔐 Auth validation - User:', !!user)
    console.log('🔐 Auth validation - UserType:', userType)
    
    // Just set validation as complete for now
    setIsValidating(false)
    
    // Only redirect if no token at all
    if (!token) {
      console.log('🔐 No token found, redirecting to login')
      router.push('/auth/login')
    }
  }, [token, user, userType, router])

  return { isValidating }
}