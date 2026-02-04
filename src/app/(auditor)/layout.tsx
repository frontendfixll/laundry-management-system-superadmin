'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useAuthInfo } from '@/store/authStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Globe,
  DollarSign,
  Shield,
  MessageSquare,
  Users,
  Settings,
  Download,
  Clock,
  LogOut,
  Menu,
  X,
  Activity,
  AlertTriangle,
  UserCircle,
  UserPlus,
  CheckCircle,
  RefreshCw,
  Timer,
  ArrowUpRight,
  BarChart3
} from 'lucide-react'
import NotificationContainer from '@/components/NotificationContainer'
import NotificationBell from '@/components/layout/NotificationBell'
import ProgressLoader from '@/components/ui/ProgressLoader'
import { useLoadingProgress } from '@/hooks/useLoadingProgress'

export default function AuditorLayout({
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

      console.log('🔐 Auditor Layout Auth Check:', {
        isAuthenticated: currentState.isAuthenticated,
        userType: currentState.userType,
        isValidating,
        hasToken: !!currentState.token,
        hasUser: !!currentState.user
      })

      if (!isValidating && !currentState.isAuthenticated && !currentState.token) {
        console.log('🔐 Not authenticated, redirecting to login')
        router.push('/auth/login')
      } else if (!isValidating && currentState.userType !== 'auditor' && currentState.userType !== 'superadmin') {
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
    { name: 'Audit Dashboard', href: '/audit-dashboard', icon: LayoutDashboard },
    {
      name: 'Audit Trail Access',
      icon: FileText,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'Complete Audit Logs', href: '/audit/logs', icon: FileText },
        { name: 'User Actions', href: '/audit/logs/users', icon: Users },
        { name: 'Personnel Logs', href: '/audit/logs/roles', icon: Shield },
        { name: 'System Events', href: '/audit/logs/system', icon: Activity },
        { name: 'Login Attempts', href: '/audit/logs/auth', icon: UserCircle },
      ]
    },
    {
      name: 'Cross-Tenant Visibility',
      icon: Globe,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'All Tenants Overview', href: '/audit/tenants', icon: Globe },
        { name: 'Tenant Financials', href: '/audit/tenants/financials', icon: DollarSign },
        { name: 'Behavior Patterns', href: '/audit/tenants/patterns', icon: BarChart3 },
        { name: 'Anomaly Detection', href: '/audit/tenants/anomalies', icon: AlertTriangle },
      ]
    },
    {
      name: 'Financial Transparency',
      icon: DollarSign,
      isExpandable: true,
      permission: 'payments_revenue',
      subItems: [
        { name: 'Payment Integrity', href: '/audit/financial/payments', icon: DollarSign },
        { name: 'Refund Oversight', href: '/audit/financial/refunds', icon: RefreshCw },
        { name: 'Settlement Records', href: '/audit/financial/settlements', icon: CheckCircle },
        { name: 'Ledger Balance', href: '/audit/financial/ledger', icon: BarChart3 },
      ]
    },
    {
      name: 'Security Monitoring',
      icon: Shield,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'Failed Login Attempts', href: '/audit/security/failed-logins', icon: AlertTriangle },
        { name: 'Permission Denials', href: '/audit/security/permissions', icon: Shield },
        { name: 'Suspicious Patterns', href: '/audit/security/suspicious', icon: AlertTriangle },
        { name: 'Data Export Events', href: '/audit/security/exports', icon: Download },
      ]
    },
    {
      name: 'Support & Ticket Oversight',
      icon: MessageSquare,
      isExpandable: true,
      permission: 'view_all_orders',
      subItems: [
        { name: 'All Tickets', href: '/audit/support/tickets', icon: MessageSquare },
        { name: 'SLA Compliance', href: '/audit/support/sla', icon: Timer },
        { name: 'Escalation History', href: '/audit/support/escalations', icon: ArrowUpRight },
        { name: 'Impersonation Logs', href: '/audit/support/impersonation', icon: UserCircle },
      ]
    },
    {
      name: 'RBAC Audit',
      icon: Users,
      isExpandable: true,
      permission: 'platform_settings',
      subItems: [
        { name: 'Role Definitions', href: '/audit/rbac/roles', icon: Shield },
        { name: 'Permission Mappings', href: '/audit/rbac/permissions', icon: Settings },
        { name: 'Audit Personnel', href: '/audit/rbac/assignments', icon: UserPlus },
        { name: 'Cross-Tenant Roles', href: '/audit/rbac/cross-tenant', icon: Globe },
      ]
    },
    {
      name: 'Compliance & Reports',
      icon: FileText,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'Financial Audit Reports', href: '/audit/reports/financial', icon: DollarSign },
        { name: 'Refund Abuse Reports', href: '/audit/reports/refund-abuse', icon: AlertTriangle },
        { name: 'Tenant Behavior Analysis', href: '/audit/reports/tenant-behavior', icon: BarChart3 },
        { name: 'SLA & Support Reports', href: '/audit/reports/sla-support', icon: MessageSquare },
        { name: 'Security Reports', href: '/audit/reports/security', icon: Shield },
      ]
    },
    {
      name: 'Export Capabilities',
      icon: Download,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'Watermarked PDF Export', href: '/audit/export/pdf', icon: FileText },
        { name: 'CSV Data Export', href: '/audit/export/csv', icon: Download },
        { name: 'Excel Reports', href: '/audit/export/excel', icon: BarChart3 },
        { name: 'Export History', href: '/audit/export/history', icon: Clock },
      ]
    }
  ]

  const { hasPermission } = useAuthInfo()

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true
    return hasPermission(item.permission)
  })

  // Show loading while hydrating or validating auth
  const isReady = !isValidating && isHydrated && isAuthenticated && (userType === 'auditor' || userType === 'superadmin')
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
              <p className="text-xs text-purple-600 font-medium">
                {userType === 'superadmin' ? 'LaundryLobby Admin - Auditor' : 'Audit Portal'}
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
                    <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
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
                              ? 'bg-purple-600 text-white shadow-md'
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
                    ? 'bg-purple-600 text-white shadow-md'
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
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center ring-2 ring-purple-100">
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
        {/* Top bar */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Audit Portal
                </h2>
              </div>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userType === 'superadmin' ? 'LaundryLobby Admin' : 'Platform Auditor'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6 mt-16">{children}</main>
      </div>
    </div>
  )
}