'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useAuthInfo } from '@/store/authStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket'
import Link from 'next/link'
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  IndianRupee,
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import NotificationContainer from '@/components/NotificationContainer'
import NotificationBell from '@/components/layout/NotificationBell'

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuthStore()
  const { user, userType, roleName, email, name } = useAuthInfo()
  const { isValidating } = useAuthValidation()

  // Connect to live notification engine
  useNotificationsWebSocket()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const timer = setTimeout(() => {
      const currentState = useAuthStore.getState()

      console.log('🔐 Finance Layout Auth Check:', {
        isAuthenticated: currentState.isAuthenticated,
        userType: currentState.userType,
        isValidating,
        hasToken: !!currentState.token,
        hasUser: !!currentState.user
      })

      if (!isValidating && !currentState.isAuthenticated && !currentState.token) {
        console.log('🔐 Not authenticated, redirecting to login')
        router.push('/auth/login')
      } else if (!isValidating && currentState.userType !== 'finance' && currentState.userType !== 'superadmin') {
        console.log('🔐 Wrong user type, redirecting to dashboard')
        router.push('/dashboard')
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [isAuthenticated, userType, router, isValidating, isHydrated])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const navigation = [
    { name: 'Finance Dashboard', href: '/finance-dashboard', icon: LayoutDashboard },
    {
      name: 'Revenue Management',
      icon: DollarSign,
      isExpandable: true,
      permission: 'payments_revenue',
      subItems: [
        { name: 'Platform Revenue', href: '/finances/revenue', icon: DollarSign },
        { name: 'Transactions', href: '/finances/transactions', icon: Receipt },
        { name: 'Refunds', href: '/finances/refunds', icon: RefreshCw },
      ]
    },
    {
      name: 'Subscription Billing',
      icon: Receipt,
      isExpandable: true,
      permission: 'subscription_plans',
      subItems: [
        { name: 'Billing Status', href: '/billing', icon: Receipt },
        { name: 'Payment Failures', href: '/finances/failures', icon: AlertTriangle },
      ]
    },
    {
      name: 'Financial Reports',
      icon: BarChart3,
      isExpandable: true,
      permission: 'payments_revenue',
      subItems: [
        { name: 'Revenue Reports', href: '/finances/reports/revenue', icon: BarChart3 },
        { name: 'Tax Reports', href: '/finances/reports/tax', icon: FileText },
      ]
    }
  ]

  const { hasPermission } = useAuthInfo()

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  // Show loading while hydrating or validating auth
  if (!isHydrated || isValidating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!isHydrated ? 'Loading finance portal...' : 'Validating session...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (userType !== 'finance' && userType !== 'superadmin')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <NotificationContainer />
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-[60] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed with h-full inside */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-900">LaundryLobby</h1>
                <p className="text-xs text-green-600 font-medium">
                  {userType === 'superadmin' ? 'LaundryLobby Admin - Finance' : 'Finance Portal'}
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

              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                if (item.isExpandable && item.subItems) {
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        }`}>
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = pathname === subItem.href
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${isSubActive
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                              <SubIcon className="w-4 h-4 mr-3" />
                              {subItem.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                      ? 'bg-green-600 text-white shadow-md'
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
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center ring-2 ring-green-100">
                    <span className="text-white font-semibold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {roleName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {email}
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

        {/* Right Side Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
          {/* Top bar - Fixed Shell layout header */}
          <div className="sticky top-0 z-40 bg-white border-b shadow-sm w-full">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center">
                  <IndianRupee className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Finance Portal
                  </h2>
                </div>
              </div>

              {/* Right side - Profile */}
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {roleName} • {email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page content - Independent Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}