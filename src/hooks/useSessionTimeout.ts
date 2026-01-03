'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSuperAdminStore } from '@/store/superAdminStore'

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number      // Total timeout duration (default: 60)
  warningMinutes?: number      // Show warning before timeout (default: 5)
  onWarning?: () => void       // Callback when warning should show
  onTimeout?: () => void       // Callback when timeout occurs
  enabled?: boolean            // Enable/disable the hook
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    timeoutMinutes = 60,
    warningMinutes = 5,
    onWarning,
    onTimeout,
    enabled = true
  } = options

  const router = useRouter()
  const { logout, token } = useSuperAdminStore()
  
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeoutMinutes * 60)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    clearTimers()
    setShowWarning(false)
    logout()
    onTimeout?.()
    router.push('/superadmin/auth/login?expired=true')
  }, [clearTimers, logout, onTimeout, router])

  // Handle warning
  const handleWarning = useCallback(() => {
    setShowWarning(true)
    setRemainingTime(warningMinutes * 60)
    onWarning?.()
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [warningMinutes, onWarning, handleTimeout])

  // Reset timers on activity
  const resetTimers = useCallback(() => {
    if (!enabled || !token) return
    
    lastActivityRef.current = Date.now()
    clearTimers()
    setShowWarning(false)
    setRemainingTime(timeoutMinutes * 60)

    // Set warning timer
    warningRef.current = setTimeout(handleWarning, warningMs)
    
    // Set timeout timer
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs)

    // Refresh session on backend (debounced - only every 5 minutes)
    const timeSinceLastRefresh = Date.now() - lastActivityRef.current
    if (timeSinceLastRefresh > 5 * 60 * 1000) {
      refreshSession()
    }
  }, [enabled, token, clearTimers, handleWarning, handleTimeout, timeoutMs, warningMs, timeoutMinutes])

  // Refresh session on backend
  const refreshSession = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/auth/refresh-session`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }

  // Stay logged in (dismiss warning and reset)
  const stayLoggedIn = useCallback(() => {
    resetTimers()
    refreshSession()
  }, [resetTimers])

  // Setup activity listeners
  useEffect(() => {
    if (!enabled || !token) return

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    
    // Debounce activity handler
    let activityTimeout: NodeJS.Timeout | null = null
    const handleActivity = () => {
      if (activityTimeout) return
      activityTimeout = setTimeout(() => {
        activityTimeout = null
        if (!showWarning) {
          resetTimers()
        }
      }, 1000)
    }

    // Add listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial timer setup
    resetTimers()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearTimers()
      if (activityTimeout) clearTimeout(activityTimeout)
    }
  }, [enabled, token, resetTimers, clearTimers, showWarning])

  return {
    showWarning,
    remainingTime,
    stayLoggedIn,
    logout: handleTimeout
  }
}
