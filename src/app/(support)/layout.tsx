'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useAuthInfo } from '@/store/authStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket'
import Link from 'next/link'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Package,
  DollarSign,
  Shield,
  Activity,
  FileText,
  LogOut,
  Menu,
  X,
  Headphones,
  AlertTriangle,
  Timer,
  UserCircle,
  UserPlus,
  RefreshCw,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react'
import NotificationContainer from '@/components/NotificationContainer'
import NotificationBell from '@/components/layout/NotificationBell'
import ProgressLoader from '@/components/ui/ProgressLoader'
import { useLoadingProgress } from '@/hooks/useLoadingProgress'

import { APP_VERSION } from '@/lib/version'

export default function SupportLayout({
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

      console.log('🔐 Support Layout Auth Check:', {
        isAuthenticated: currentState.isAuthenticated,
        userType: currentState.userType,
        isValidating,
        hasToken: !!currentState.token,
        hasUser: !!currentState.user
      })

      if (!isValidating && !currentState.isAuthenticated && !currentState.token) {
        console.log('🔐 Not authenticated, redirecting to login')
        router.push('/auth/login')
      } else if (!isValidating && currentState.userType !== 'support' && currentState.userType !== 'superadmin') {
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
    { name: 'Support Dashboard', href: '/support-dashboard', icon: LayoutDashboard },
    {
      name: 'Ticket Management',
      icon: FileText,
      isExpandable: true,
      permission: 'view_all_orders',
      subItems: [
        { name: 'All Tickets', href: '/support-tickets', icon: FileText },
        { name: 'My Tickets', href: '/support-tickets/my-tickets', icon: UserCircle },
        { name: 'Create Ticket', href: '/support-tickets/create', icon: UserPlus },
        { name: 'Escalated', href: '/support-tickets/escalated', icon: AlertTriangle },
        { name: 'SLA Breaches', href: '/support-tickets/sla-breaches', icon: Timer },
      ]
    },
    {
      name: 'Live Chat Support',
      icon: MessageSquare,
      isExpandable: true,
      permission: 'view_all_orders',
      subItems: [
        { name: 'Active Chats', href: '/support/chat', icon: MessageSquare },
        { name: 'Chat History', href: '/support/chat/history', icon: FileText },
        { name: 'Customer Lookup', href: '/support/chat/lookup', icon: Users },
      ]
    },
    {
      name: 'Order Investigation',
      icon: Package,
      isExpandable: true,
      permission: 'view_all_orders',
      subItems: [
        { name: 'Search Orders', href: '/support/orders', icon: Package },
        { name: 'Order Timeline', href: '/support/orders/timeline', icon: Activity },
        { name: 'Stuck Orders', href: '/support/orders/stuck', icon: AlertTriangle },
      ]
    },
    {
      name: 'Payment Support',
      icon: DollarSign,
      isExpandable: true,
      permission: 'payments_revenue',
      subItems: [
        { name: 'Payment Issues', href: '/support/payments', icon: DollarSign },
        { name: 'Transaction Lookup', href: '/support/payments/transactions', icon: FileText },
        { name: 'Refund Status', href: '/support/payments/refunds', icon: RefreshCw },
        { name: 'Gateway Logs', href: '/support/payments/gateway-logs', icon: FileText },
      ]
    },
    {
      name: 'User Assistance',
      icon: Users,
      isExpandable: true,
      permission: 'platform_settings',
      subItems: [
        { name: 'User Lookup', href: '/support/users', icon: Users },
        { name: 'Account Recovery', href: '/support/users/recovery', icon: Shield },
        { name: 'Reset Password', href: '/support/users/reset-password', icon: RefreshCw },
        { name: 'Unlock Accounts', href: '/support/users/unlock', icon: CheckCircle },
      ]
    },
    {
      name: 'System Monitoring',
      icon: Activity,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'System Alerts', href: '/support/system/alerts', icon: AlertTriangle },
        { name: 'Platform Health', href: '/support/system/health', icon: Activity },
        { name: 'Tenant Heatmap', href: '/support/system/heatmap', icon: Activity },
      ]
    },
    { name: 'Escalation Matrix', href: '/support/escalation', icon: ArrowUpRight, permission: 'view_all_orders' },
    { name: 'Support Audit Logs', href: '/support/audit', icon: FileText, permission: 'audit_logs' }
  ]

  const { hasPermission } = useAuthInfo()

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  // Show loading while hydrating or validating auth
  const isReady = !isValidating && isHydrated && isAuthenticated && (userType === 'support' || userType === 'superadmin')
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
                {userType === 'superadmin' ? 'LaundryLobby Admin - Support' : 'Support Portal'}
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
                    <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
                              ? 'bg-blue-600 text-white shadow-md'
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
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {name}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - Fixed */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-20 bg-white border-b shadow-sm h-16 transition-all duration-300">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <Headphones className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Support Portal
                </h2>
              </div>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userType === 'superadmin' ? 'LaundryLobby Admin' : 'Support Agent'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content - with padding for fixed header */}
        <main className="p-4 lg:p-6 pt-20 lg:pt-24">{children}</main>
      </div>
    </div>
  )
}