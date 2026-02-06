'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useSalesUser } from '@/store/authStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users2
} from 'lucide-react'
import NotificationContainer from '@/components/NotificationContainer'
import NotificationBell from '@/components/layout/NotificationBell'
import ProgressLoader from '@/components/ui/ProgressLoader'
import { useLoadingProgress } from '@/hooks/useLoadingProgress'

import { APP_VERSION } from '@/lib/version'

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, userType, logout } = useAuthStore()
  const salesUser = useSalesUser()
  const user = useAuthStore(state => state.user)
  const { isValidating } = useAuthValidation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only run auth checks after hydration with extra delay
    if (!isHydrated) return

    // Add extra delay to ensure auth store is fully loaded
    const timer = setTimeout(() => {
      const currentState = useAuthStore.getState()

      console.log('🔐 Sales Layout Auth Check:', {
        isAuthenticated: currentState.isAuthenticated,
        userType: currentState.userType,
        isValidating,
        hasToken: !!currentState.token,
        hasUser: !!currentState.user
      })

      if (!isValidating && !currentState.isAuthenticated && !currentState.token) {
        console.log('🔐 Not authenticated, redirecting to login')
        router.push('/auth/login')
      } else if (!isValidating && currentState.userType !== 'sales' && currentState.userType !== 'superadmin') {
        console.log('🔐 Wrong user type, redirecting to dashboard')
        router.push('/dashboard')
      }
    }, 200) // Extra delay for safety

    return () => clearTimeout(timer)
  }, [isAuthenticated, userType, router, isValidating, isHydrated])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/sales-dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/sales-leads', icon: Users },
    { name: 'Upgrades', href: '/upgrades', icon: TrendingUp },
    { name: 'Team', href: '/sales-team', icon: Users2 },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Payments', href: '/payments', icon: DollarSign },
  ]

  // Show loading while hydrating or validating auth
  const isReady = !isValidating && isHydrated && isAuthenticated && (userType === 'sales' || userType === 'superadmin')
  const { progress, message, subMessage } = useLoadingProgress(isReady)

  if (!isReady || progress < 100) {
    return (
      <ProgressLoader
        progress={progress}
        message={message}
        subMessage={subMessage}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationContainer />
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">LaundryLobby</h1>
              <p className="text-xs text-blue-600 font-medium">
                {userType === 'superadmin' ? 'LaundryLobby Admin - Sales' : 'Sales Portal'}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Back to LaundryLobby Admin button for SuperAdmin users */}
            {userType === 'superadmin' && (
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all mb-4 border border-gray-200"
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                ← Back to SuperAdmin
              </Link>
            )}

            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-100">
                  <span className="text-white font-semibold text-lg">
                    {userType === 'superadmin'
                      ? user?.name?.charAt(0).toUpperCase()
                      : salesUser?.name?.charAt(0).toUpperCase()
                    }
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userType === 'superadmin' ? user?.name : salesUser?.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {userType === 'superadmin' ? 'LaundryLobby Admin' : salesUser?.designation}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => pathname.startsWith(item.href))?.name || 'Sales Portal'}
              </h2>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              {/* Profile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {userType === 'superadmin'
                      ? user?.name?.charAt(0).toUpperCase()
                      : salesUser?.name?.charAt(0).toUpperCase()
                    }
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userType === 'superadmin' ? user?.name : salesUser?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userType === 'superadmin' ? 'LaundryLobby Admin' : salesUser?.designation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}


