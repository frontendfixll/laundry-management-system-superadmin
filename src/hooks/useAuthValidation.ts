import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export const useAuthValidation = () => {
  const [isValidating, setIsValidating] = useState(true)
  const { token, user, userType, logout, setUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Add small delay to allow Zustand to hydrate from localStorage
    const timer = setTimeout(() => {
      console.log('🔐 Auth validation - Token:', !!token)
      console.log('🔐 Auth validation - User:', !!user)
      console.log('🔐 Auth validation - UserType:', userType)
      
      // Set validation as complete after delay
      setIsValidating(false)
      
      // Only redirect if no token at all after hydration delay
      if (!token) {
        console.log('🔐 No token found after hydration delay, redirecting to login')
        router.push('/auth/login')
      }
    }, 100) // 100ms delay for hydration
    
    return () => clearTimeout(timer)
  }, [token, user, userType, router])

  return { isValidating }
}