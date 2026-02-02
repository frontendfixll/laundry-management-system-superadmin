'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore, useAuthInfo } from '@/store/authStore'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Crown,
  Tag,
  Truck,
  Package,
  Sparkles,
  X,
  Receipt,
  PieChart,
  Gift,
  Percent,
  Users2,
  Star,
  Target,
  Image,
  UserPlus,
  IndianRupee,
  TrendingUp,
  Globe,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Timer,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Download,
  Clock,
  Monitor,
  Headphones,
  Bell
} from 'lucide-react'
import { useState, useEffect } from 'react'

const getSidebarNavigationByRole = (
  userRoles: string[],
  legacyRole?: string,
  userType?: string,
  permissions: any = {},
  hasPermission: (module: string, action?: string) => boolean = () => true
) => {
  // Check if user has specific roles (new RBAC system)
  const isSuperAdmin = userRoles.includes('super_admin') || userRoles.includes('Super Admin') || userRoles.includes('super-admin')

  const fullNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Role Dashboards',
      icon: Monitor,
      isExpandable: true,
      subItems: [
        { name: 'Sales Portal', href: '/sales-dashboard', icon: BarChart3, permission: 'platform_settings' },
        { name: 'Support Portal', href: '/support-dashboard', icon: Headphones, permission: 'view_all_orders' },
        { name: 'Finance Portal', href: '/finance-dashboard', icon: IndianRupee, permission: 'payments_revenue' },
        { name: 'Auditor Portal', href: '/audit-dashboard', icon: Shield, permission: 'audit_logs' },
      ].filter(item => hasPermission(item.permission))
    },
    {
      name: 'Tenancy Management',
      icon: Crown,
      isExpandable: true,
      permission: 'tenant_crud',
      subItems: [
        { name: 'Tenancies', href: '/tenancies', icon: Crown },
        { name: 'Tenancy Analytics', href: '/tenancy-analytics', icon: PieChart },
      ]
    },
    {
      name: 'User Management',
      icon: Users,
      isExpandable: true,
      permission: 'platform_settings',
      subItems: [
        { name: 'Branch Admins', href: '/admins', icon: Shield },
        { name: 'Platform Users', href: '/users', icon: Users },
      ]
    },
    {
      name: 'RBAC & Security',
      icon: Shield,
      isExpandable: true,
      permission: 'platform_settings',
      subItems: [
        { name: 'Role Management', href: '/rbac/roles', icon: Shield },
        { name: 'Create Platform User', href: '/users/create', icon: UserCircle },
      ]
    },
    {
      name: 'Platform Management',
      icon: Settings,
      isExpandable: true,
      permission: 'marketplace_control',
      subItems: [
        { name: 'Subdomains', href: '/subdomains', icon: Globe },
        { name: 'Services', href: '/services', icon: Sparkles },
        { name: 'Logistics Partners', href: '/logistics', icon: Truck },
      ]
    },
    {
      name: 'Content Management',
      icon: FileText,
      isExpandable: true,
      permission: 'platform_settings',
      subItems: [
        { name: 'Blog Posts', href: '/blog/posts', icon: FileText },
        { name: 'Categories', href: '/blog/categories', icon: Tag },
        { name: 'Analytics', href: '/blog/analytics', icon: BarChart3 },
      ]
    },
    {
      name: 'Global Programs',
      icon: Gift,
      isExpandable: true,
      permission: 'platform_coupons',
      subItems: [
        { name: 'Overview', href: '/promotional/overview', icon: BarChart3 },
        { name: 'Campaigns', href: '/campaigns', icon: Target },
        { name: 'Banners', href: '/banners', icon: Image },
        { name: 'Coupons', href: '/promotional/coupons', icon: Tag },
        { name: 'Discounts', href: '/promotional/discounts', icon: Percent },
        { name: 'Referrals', href: '/promotional/referrals', icon: Users2 },
        { name: 'Loyalty', href: '/promotional/loyalty', icon: Star },
      ]
    },
    {
      name: 'Financial',
      icon: DollarSign,
      isExpandable: true,
      permission: 'subscription_plans',
      subItems: [
        { name: 'Overview', href: '/financial/overview', icon: BarChart3 },
        { name: 'Billing Plans', href: '/billing/plans', icon: Tag },
        { name: 'Add-ons', href: '/addons', icon: Package },
      ]
    },
    {
      name: 'Notifications',
      icon: Bell,
      isExpandable: true,
      permission: 'audit_logs',
      subItems: [
        { name: 'Priority Management', href: '/notifications/priorities', icon: AlertTriangle },
        { name: 'System Notifications', href: '/notifications/system', icon: Bell },
        { name: 'Notification Logs', href: '/notifications/logs', icon: FileText },
        { name: 'Performance Stats', href: '/notifications/stats', icon: BarChart3 },
      ]
    },
    { name: 'Settings', href: '/settings', icon: Settings, permission: 'platform_settings' }
  ];

  // If SuperAdmin, return everything (after consolidating duplicates)
  if (isSuperAdmin) {
    return fullNavigation;
  }

  // Otherwise, filter based on permissions
  const filteredNavigation = fullNavigation.filter(item => {
    // If item has no permission defined, show it (e.g. Dashboard)
    if (!item.permission) return true;

    // Check module permission
    const hasAccess = hasPermission(item.permission);
    return hasAccess;
  }).filter(item => {
    // Final check: if it's expandable but has no sub-items left, hide it
    // Except if it has a direct href (like Settings)
    if (item.isExpandable && item.subItems && item.subItems.length === 0 && !item.href) return false;
    return true;
  });

  return filteredNavigation.length > 0 ? filteredNavigation : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: UserCircle }
  ];
}

interface SuperAdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function SuperAdminSidebar({ mobileOpen = false, onMobileClose }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const { user, userType, logout, sidebarCollapsed, setSidebarCollapsed, newLeadsCount, setNewLeadsCount } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Support', 'Ticket Management', 'Order Investigation']) // Default expanded items

  // Get user roles from user object (works for all user types)
  const userRoles = (user as any)?.roles?.flatMap((role: any) => [role.name, role.slug].filter(Boolean)) || []
  const legacyRole = user?.role // Legacy role field

  // Debug logging
  console.log('🔍 SuperAdmin Sidebar Debug:')
  console.log('- User Email:', user?.email)
  console.log('- User Type:', userType)
  console.log('- Legacy Role:', legacyRole)
  console.log('- User Roles:', userRoles)
  console.log('- Is SuperAdmin (new):', userRoles.includes('super_admin') || userRoles.includes('Super Admin'))
  console.log('- Is SuperAdmin (legacy):', legacyRole === 'superadmin')
  console.log('- Is Platform Support:', userRoles.includes('platform-support') || userRoles.includes('Platform Support'))
  console.log('- Is Platform Finance:', userRoles.includes('platform-finance-admin') || userRoles.includes('Platform Finance Admin'))
  console.log('- Is Platform Auditor:', userRoles.includes('platform-read-only-auditor') || userRoles.includes('Platform Auditor') || userRoles.includes('Platform Read-Only Auditor'))
  console.log('- Is SuperAdmin (new):', userRoles.includes('super_admin') || userRoles.includes('Super Admin'))
  console.log('- Is SuperAdmin (legacy):', legacyRole === 'superadmin')
  console.log('- Is Platform Support:', userRoles.includes('platform-support') || userRoles.includes('Platform Support'))
  console.log('- Is Platform Finance:', userRoles.includes('platform-finance-admin') || userRoles.includes('Platform Finance Admin'))
  console.log('- Is Platform Auditor:', userRoles.includes('platform-read-only-auditor') || userRoles.includes('Platform Auditor'))

  // Determine which sidebar to show
  const isPlatformSupport = userRoles.includes('platform-support') || userRoles.includes('Platform Support')
  const isPlatformFinance = userRoles.includes('platform-finance-admin') || userRoles.includes('Platform Finance Admin')
  const isPlatformAuditor = userRoles.includes('platform-read-only-auditor') || userRoles.includes('Platform Auditor')

  if (isPlatformSupport) {
    console.log('🎯 SIDEBAR: Showing Platform Support sidebar (RBAC role takes priority)')
  } else if (isPlatformFinance) {
    console.log('🎯 SIDEBAR: Showing Platform Finance sidebar (RBAC role takes priority)')
  } else if (isPlatformAuditor) {
    console.log('🎯 SIDEBAR: Showing Platform Auditor sidebar (RBAC role takes priority)')
  } else {
    console.log('🎯 SIDEBAR: Showing SuperAdmin sidebar (legacy or SuperAdmin RBAC role)')
  }

  // Get information from unified auth helper
  const { roleName, email: authEmail, hasPermission } = useAuthInfo()
  const permissions = (user as any)?.permissions || {}

  // Navigation filtering logic
  const navigation = getSidebarNavigationByRole(userRoles, legacyRole, userType, permissions, hasPermission)

  // Check if any sub-item is active - FIXED to prevent multiple highlights
  const isParentActive = (item: any) => {
    // For expandable items with sub-items, only highlight if a sub-item is active
    if (item.isExpandable && item.subItems) {
      return item.subItems.some((subItem: any) => {
        // Exact match for sub-items to prevent conflicts
        return pathname === subItem.href
      })
    }

    // For regular navigation items with href
    if (item.href) {
      // Exact match only to prevent multiple highlights
      return pathname === item.href
    }

    return false
  }

  // Fetch new leads count on mount and periodically
  useEffect(() => {
    const fetchNewLeadsCount = async () => {
      try {
        const token = localStorage.getItem('auth-storage')
        if (!token) return

        const parsed = JSON.parse(token)
        const authToken = parsed.state?.token
        if (!authToken) return

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
        const response = await fetch(`${API_URL}/superadmin/leads/stats`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.stats?.new !== undefined) {
            setNewLeadsCount(data.data.stats.new)
          }
        }
      } catch (error) {
        console.error('Failed to fetch new leads count:', error)
      }
    }

    fetchNewLeadsCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchNewLeadsCount, 60000)
    return () => clearInterval(interval)
  }, [setNewLeadsCount])

  useEffect(() => {
    const savedExpanded = localStorage.getItem('superadmin-sidebar-expanded')
    if (savedExpanded) {
      setExpandedItems(JSON.parse(savedExpanded))
    }
  }, [])

  const toggleExpanded = (itemName: string) => {
    const newExpanded = expandedItems.includes(itemName)
      ? expandedItems.filter(item => item !== itemName)
      : [...expandedItems, itemName]

    setExpandedItems(newExpanded)
    localStorage.setItem('superadmin-sidebar-expanded', JSON.stringify(newExpanded))
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/auth/login'
  }

  const handleLinkClick = () => {
    // Only close sidebar on mobile devices
    if (window.innerWidth < 1024) {
      onMobileClose?.()
    }
  }

  const renderNavItem = (item: any) => {
    const isActive = isParentActive(item)
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.name)

    if (item.isExpandable && item.subItems) {
      return (
        <div key={item.name}>
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`group flex items-center w-full px-4 py-3 text-sm font-light rounded-lg transition-colors ${isActive
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <Icon className={`flex-shrink-0 w-4 h-4 mr-3 ${sidebarCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            {/* Always show text on mobile, conditionally on desktop */}
            <span className={`flex-1 text-left ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
            {!sidebarCollapsed && (
              <span className="lg:block hidden">
                {isExpanded ? (
                  <ChevronUp className={`w-3 h-3 ml-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                ) : (
                  <ChevronDown className={`w-3 h-3 ml-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </span>
            )}
          </button>

          {/* Sub Items */}
          {!sidebarCollapsed && isExpanded && (
            <div className="ml-8 mt-1 space-y-0">
              {item.subItems.map((subItem: any) => {
                // Exact match only for sub-items to prevent multiple highlights
                const isSubActive = pathname === subItem.href
                const SubIcon = subItem.icon

                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={onMobileClose}
                    className={`group flex items-center px-4 py-2 text-sm font-light rounded-md transition-colors ${isSubActive
                      ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <SubIcon className={`flex-shrink-0 w-3 h-3 mr-3 ${isSubActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span>{subItem.name}</span>
                    {/* Badge for new leads */}
                    {subItem.showBadge && newLeadsCount > 0 && (
                      <span className={`ml-auto px-1.5 py-0.5 text-xs font-light rounded-md ${isSubActive ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white'
                        }`}>
                        {newLeadsCount > 99 ? '99+' : newLeadsCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Regular navigation item - exact match only
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onMobileClose}
        className={`group flex items-center px-4 py-3 text-sm font-light rounded-lg transition-colors ${isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
      >
        <Icon className={`flex-shrink-0 w-4 h-4 mr-3 ${sidebarCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
        {/* Always show text on mobile, conditionally on desktop */}
        <span className={`flex-1 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
        {/* Badge for new leads */}
        {item.showBadge && newLeadsCount > 0 && !sidebarCollapsed && (
          <span className={`ml-auto px-1.5 py-0.5 text-xs font-light rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white'
            }`}>
            {newLeadsCount > 99 ? '99+' : newLeadsCount}
          </span>
        )}
      </Link>
    )
  }

  // On mobile: always show full width (w-64), on desktop: respect sidebarCollapsed
  const sidebarWidth = sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`lg:relative fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 flex flex-col w-64 ${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Fixed Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-gray-100 bg-white">
          {/* Logo - always show on mobile, conditionally on desktop */}
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-light text-gray-900">LaundryLobby</h1>
              <p className="text-xs text-gray-500 font-light">Management Portal</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors hidden lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-0 py-6 space-y-0 overflow-y-auto">
            {navigation.map(renderNavItem)}
          </nav>

          {/* Fixed Footer Elements */}
          <div className="flex-shrink-0">
            {/* Version Info */}
            <div className={`px-6 py-3 border-t border-gray-100 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
              <div className="text-xs text-gray-400 font-light">
                v1.0.0
              </div>
            </div>

            {/* Logout Button */}
            <div className="border-t border-gray-100 p-4">
              <button
                onClick={handleLogout}
                className={`group flex items-center w-full px-4 py-3 text-sm font-light text-gray-600 hover:text-red-600 transition-colors ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
              >
                <LogOut className={`flex-shrink-0 w-4 h-4 mr-3 ${sidebarCollapsed ? 'lg:mr-0' : ''} text-gray-400 group-hover:text-red-500`} />
                <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
