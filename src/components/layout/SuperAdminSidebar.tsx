'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore, useSuperAdmin } from '@/store/authStore'
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
  TrendingUp
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'analytics' },
  { 
    name: 'Sales Management', 
    icon: Target, 
    permission: 'settings',
    isExpandable: true,
    subItems: [
      { name: 'Sales Dashboard', href: '/sales-dashboard', icon: BarChart3, permission: 'analytics' },
      { name: 'Leads', href: '/sales-leads', icon: UserPlus, permission: 'settings', showBadge: true },
      { name: 'Upgrades', href: '/upgrades', icon: TrendingUp, permission: 'settings' },
      { name: 'Sales Users', href: '/sales-users', icon: Users2, permission: 'users' },
      { name: 'Subscriptions', href: '/subscriptions', icon: Receipt, permission: 'settings' },
      { name: 'Payments', href: '/payments', icon: IndianRupee, permission: 'finances' },
    ]
  },
  { name: 'Tenancies', href: '/tenancies', icon: Crown, permission: 'settings' },
  { name: 'Tenancy Analytics', href: '/tenancy-analytics', icon: PieChart, permission: 'analytics' },
  { name: 'Billing Plans', href: '/billing/plans', icon: Tag, permission: 'settings' },
  { name: 'Logistics Partners', href: '/logistics', icon: Truck, permission: 'branches' },
  { name: 'Branch Admins', href: '/admins', icon: Shield, permission: 'users' },
  { name: 'Users', href: '/users', icon: Users, permission: 'users' },
  { name: 'Services', href: '/services', icon: Sparkles, permission: 'settings' },
  { 
    name: 'Global Programs', 
    icon: Gift, 
    permission: 'settings',
    isExpandable: true,
    subItems: [
      { name: 'Overview', href: '/promotional/overview', icon: BarChart3, permission: 'analytics' },
      { name: 'Campaigns', href: '/campaigns', icon: Target, permission: 'settings' },
      { name: 'Banners', href: '/banners', icon: Image, permission: 'settings' },
      { name: 'Coupons', href: '/promotional/coupons', icon: Tag, permission: 'settings' },
      { name: 'Discounts', href: '/promotional/discounts', icon: Percent, permission: 'settings' },
      { name: 'Referrals', href: '/promotional/referrals', icon: Users2, permission: 'settings' },
      { name: 'Loyalty', href: '/promotional/loyalty', icon: Star, permission: 'settings' },
    ]
  },
  { name: 'Financial', href: '/financial', icon: DollarSign, permission: 'finances' },
  { name: 'Audit Logs', href: '/audit', icon: FileText, permission: 'settings' },
  { name: 'Settings', href: '/settings', icon: Settings, permission: 'settings' }
]

interface SuperAdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function SuperAdminSidebar({ mobileOpen = false, onMobileClose }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const admin = useSuperAdmin()
  const { logout, sidebarCollapsed, setSidebarCollapsed, newLeadsCount, setNewLeadsCount } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Global Programs']) // Programs expanded by default

  // Fetch new leads count on mount and periodically
  useEffect(() => {
    const fetchNewLeadsCount = async () => {
      try {
        const token = localStorage.getItem('auth-storage')
        if (!token) return
        
        const parsed = JSON.parse(token)
        const authToken = parsed.state?.token
        if (!authToken) return

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://LaundryLobby-backend-605c.onrender.com/api'
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

  const hasPermission = (permission: string) => {
    return admin?.permissions[permission as keyof typeof admin.permissions] || false
  }

  // Check if any sub-item is active
  const isParentActive = (item: any) => {
    if (item.href) {
      // For items that have child routes (like /billing has /billing/plans),
      // only match exact path to avoid parent highlighting when child is active
      const hasChildInNavigation = navigation.some(navItem => 
        navItem.href !== item.href && navItem.href?.startsWith(item.href + '/')
      )
      
      if (hasChildInNavigation) {
        // Exact match only for parent items that have children
        return pathname === item.href
      }
      
      // For items without children, allow prefix matching
      return pathname === item.href || pathname.startsWith(item.href + '/')
    }
    if (item.subItems) {
      return item.subItems.some((subItem: any) => 
        pathname === subItem.href || pathname.startsWith(subItem.href + '/')
      )
    }
    return false
  }

  const renderNavItem = (item: any) => {
    if (!hasPermission(item.permission)) return null
    
    const isActive = isParentActive(item)
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.name)

    if (item.isExpandable && item.subItems) {
      return (
        <div key={item.name}>
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${sidebarCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
            {/* Always show text on mobile, conditionally on desktop */}
            <span className={`flex-1 text-left ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
            {!sidebarCollapsed && (
              <span className="lg:block hidden">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </span>
            )}
          </button>

          {/* Sub Items */}
          {!sidebarCollapsed && isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems
                .filter((subItem: any) => hasPermission(subItem.permission))
                .map((subItem: any) => {
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                const SubIcon = subItem.icon

                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={onMobileClose}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isSubActive
                        ? 'bg-purple-100 text-purple-700 border-l-2 border-purple-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <SubIcon className={`flex-shrink-0 w-4 h-4 mr-3 ${isSubActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <span>{subItem.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Regular navigation item
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onMobileClose}
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${sidebarCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
        {/* Always show text on mobile, conditionally on desktop */}
        <span className={`flex-1 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
        {/* Badge for new leads */}
        {item.showBadge && newLeadsCount > 0 && !sidebarCollapsed && (
          <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
            isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
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
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex flex-col w-64 ${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {/* Logo - always show on mobile, conditionally on desktop */}
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
              <p className="text-xs text-gray-500">LaundryLobby</p>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Admin Info - always show on mobile, conditionally on desktop */}
        {admin && (
          <div className={`flex-shrink-0 p-4 border-b border-gray-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
          {navigation.map(renderNavItem)}
        </nav>

        {/* Version Info */}
        <div className={`flex-shrink-0 px-4 py-2 border-t border-gray-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
          <div className="text-xs text-gray-400 text-center">
            v2.1.0
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className={`group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut className={`flex-shrink-0 w-5 h-5 mr-3 ${sidebarCollapsed ? 'lg:mr-0' : ''} text-gray-400 group-hover:text-red-500`} />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
