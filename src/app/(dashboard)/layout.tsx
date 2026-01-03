'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useSuperAdminStore } from '@/store/superAdminStore'
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar'
import SuperAdminHeader from '@/components/layout/SuperAdminHeader'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { SessionTimeoutModal } from '@/components/SessionTimeoutModal'
import toast from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, admin, sidebarCollapsed } = useSuperAdminStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Session timeout hook (1 hour timeout, 5 min warning)
  const { showWarning, remainingTime, stayLoggedIn, logout: sessionLogout } = useSessionTimeout({
    timeoutMinutes: 60,
    warningMinutes: 5,
    enabled: isAuthenticated
  })

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
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

  // Show loading or redirect for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Timeout Warning Modal */}
      <SessionTimeoutModal
        isOpen={showWarning}
        remainingTime={remainingTime}
        onStayLoggedIn={stayLoggedIn}
        onLogout={sessionLogout}
      />
      
      {/* Sidebar */}
      <SuperAdminSidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Header - Fixed at top */}
        <SuperAdminHeader onMenuClick={() => setMobileMenuOpen(true)} sidebarCollapsed={sidebarCollapsed} />
        
        {/* Page Content - With top padding for fixed header */}
        <main className="pt-20 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
