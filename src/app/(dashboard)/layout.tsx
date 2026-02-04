'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar'
import SuperAdminHeader from '@/components/layout/SuperAdminHeader'
import NotificationContainer from '@/components/NotificationContainer'
import { PriorityNotificationHandler } from '@/components/notifications/PriorityNotificationHandler'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { SessionTimeoutModal } from '@/components/SessionTimeoutModal'
import ProgressLoader from '@/components/ui/ProgressLoader'
import { useLoadingProgress } from '@/hooks/useLoadingProgress'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, user, token, userType, sidebarCollapsed, logout, clearAll } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Connect to live notification engine
  useNotificationsWebSocket()

  // SuperAdmin-specific Socket.IO notifications
  const { notifications, acknowledgeNotification } = useSocketIONotifications()

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Session timeout hook (1 hour timeout, 5 min warning)
  const { showWarning, remainingTime, stayLoggedIn, logout: sessionLogout } = useSessionTimeout({
    timeoutMinutes: 60,
    warningMinutes: 5,
    enabled: isAuthenticated
  })

  // Validate token and user type on mount - only after hydration
  useEffect(() => {
    if (!isHydrated) return

    const validateToken = async () => {
      if (!isAuthenticated || !token) {
        setIsValidating(false)
        router.push('/auth/login')
        return
      }

      // Redirect sales users to their dashboard
      if (userType === 'sales') {
        console.log('🔄 Layout - Redirecting sales user to /sales-dashboard')
        router.push('/sales-dashboard')
        return
      }

      console.log('🔄 Layout - User type is:', userType, '- proceeding with token validation')

      try {
        // Verify token by calling profile API
        const response = await fetch(`${API_URL}/superadmin/auth/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          // Token is invalid - clear everything and redirect
          console.log('🔴 Token validation failed, logging out...')
          clearAll()
          toast.error('Session expired. Please login again.')
          router.push('/auth/login')
          return
        }

        // Token is valid
        console.log('✅ Token validated successfully')
        setIsValidating(false)
      } catch (error) {
        console.error('Token validation error:', error)
        // Network error - don't logout, just proceed
        setIsValidating(false)
      }
    }

    validateToken()
  }, [isHydrated, isAuthenticated, token, router, clearAll])

  // Check for session expired message
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Your session has expired. Please login again.')
      router.replace('/auth/login')
    }
  }, [searchParams, router])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    // Only check after hydration
    if (!isHydrated) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isHydrated, isAuthenticated, router])

  const { progress, message, subMessage } = useLoadingProgress(!isValidating && isHydrated && isAuthenticated)

  // Show loading while hydrating or validating token
  if (!isHydrated || isValidating || !isAuthenticated || progress < 100) {
    return (
      <ProgressLoader
        progress={progress}
        message={message}
        subMessage={subMessage}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Session Timeout Warning Modal */}
      <SessionTimeoutModal
        isOpen={showWarning}
        remainingTime={remainingTime}
        onStayLoggedIn={stayLoggedIn}
        onLogout={sessionLogout}
      />

      {/* Real-time notification toasts */}
      <NotificationContainer />

      {/* SuperAdmin Priority Notification Handler */}
      <PriorityNotificationHandler
        notifications={notifications}
        onAcknowledge={acknowledgeNotification}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed width, independent scroll if needed */}
        <SuperAdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Right Side - Content Area (Header + Main) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header - Stays at top of the right container */}
          <SuperAdminHeader
            onMenuClick={() => setMobileMenuOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content - Independent Scroll Area */}
          <main className="flex-1 overflow-y-auto outline-none">
            <div className="max-w-7xl mx-auto p-1 sm:p-1.5 lg:p-2">
              <div className="px-0.5 sm:px-1 lg:px-1.5">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
