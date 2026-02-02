/**
 * Dashboard Router - Routes users to appropriate dashboard based on their role
 */

export interface UserRole {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  permissions: Record<string, any>
}

export interface User {
  _id: string
  name: string
  email: string
  role?: string // Legacy role field
  roles: UserRole[]
  isActive: boolean
}

/**
 * Determine which dashboard component to show based on user's primary role
 */
export function getDashboardRoute(user: User): string {
  console.log('🎯 Dashboard Router: Analyzing user for routing:', {
    email: user.email,
    legacyRole: user.role,
    rolesCount: user.roles?.length || 0,
    firstRoleName: user.roles?.[0]?.name,
    firstRoleSlug: user.roles?.[0]?.slug
  })

  if (!user.roles || user.roles.length === 0) {
    // Check legacy role field
    if (user.role === 'superadmin') {
      console.log('🎯 Dashboard Router: Using legacy superadmin role → /dashboard')
      return '/dashboard' // SuperAdmin main dashboard
    }
    if (user.role === 'support') {
      console.log('🎯 Dashboard Router: Using legacy support role → /support-tickets')
      return '/support-tickets' // Dedicated Support Tickets Dashboard
    }
    if (user.role === 'auditor') {
      console.log('🎯 Dashboard Router: Using legacy auditor role → /audit')
      return '/audit' // Dedicated audit dashboard
    }
    console.log('🎯 Dashboard Router: No roles, defaulting to /dashboard')
    return '/dashboard' // Default dashboard
  }

  // RBAC ROLE SYSTEM: Check RBAC roles first (takes priority over legacy roles)
  // PRIORITY-BASED ROLE SELECTION (Super Admin gets ABSOLUTE highest priority)
  const rolesByPriority = [
    'super-admin', 'Super Admin',
    'platform-sales', 'Platform Sales',
    'platform-finance-admin', 'Platform Finance Admin',
    'platform-read-only-auditor', 'Platform Read-Only Auditor', 'Platform Auditor',
    'platform-support', 'Platform Support'
  ]

  // Find the highest priority role by checking both slug and name
  let primaryRole = null
  for (const priorityRole of rolesByPriority) {
    primaryRole = user.roles.find(role =>
      role.slug === priorityRole ||
      role.name === priorityRole ||
      (priorityRole === 'super-admin' && (role.slug === 'super_admin' || role.name === 'Super Admin'))
    )
    if (primaryRole) {
      console.log('🎯 Dashboard Router: Found priority RBAC role:', primaryRole.name, 'slug:', primaryRole.slug)
      break
    }
  }

  // If we found a priority RBAC role, use it (overrides legacy role)
  if (primaryRole) {
    const roleSlug = primaryRole.slug
    const roleName = primaryRole.name

    // Super Admin check
    if (roleSlug === 'super-admin' || roleSlug === 'super_admin' || roleName === 'Super Admin') {
      console.log('🎯 Dashboard Router: Routing to SuperAdmin dashboard via RBAC')
      return '/dashboard'
    }

    if (roleSlug === 'platform-finance-admin' || roleName === 'Platform Finance Admin') {
      console.log('🎯 Dashboard Router: Routing to Finance Dashboard via RBAC')
      return '/finance-dashboard'
    }

    if (roleSlug === 'platform-read-only-auditor' || roleName === 'Platform Read-Only Auditor' || roleName === 'Platform Auditor') {
      console.log('🎯 Dashboard Router: Routing to Auditor Dashboard via RBAC')
      return '/audit-dashboard'
    }

    if (roleSlug === 'platform-support' || roleName === 'Platform Support') {
      console.log('🎯 Dashboard Router: Routing to Support Dashboard via RBAC')
      return '/support-dashboard'
    }

    if (roleSlug === 'platform-sales' || roleName === 'Platform Sales') {
      console.log('🎯 Dashboard Router: Routing to Sales Dashboard via RBAC')
      return '/sales-dashboard'
    }
  }

  // LEGACY ROLE SYSTEM: Check legacy role only if no RBAC role found
  if (user.role === 'superadmin') {
    console.log('🎯 Dashboard Router: Using legacy SuperAdmin role (no RBAC override)')
    return '/dashboard' // SuperAdmin main dashboard
  }

  // LEGACY SUPPORT ROLE: Handle legacy support users
  if (user.role === 'support') {
    console.log('🎯 Dashboard Router: Using legacy Support role (no RBAC override)')
    return '/support-tickets' // Dedicated Support Tickets Dashboard
  }

  // If no priority role found, use first role
  if (!primaryRole && user.roles.length > 0) {
    primaryRole = user.roles[0]
    console.log('🎯 Dashboard Router: Using first role as fallback:', primaryRole.name)
  }

  // Route based on role slug AND name (matching roles.md specification)
  if (primaryRole) {
    const roleSlug = primaryRole.slug
    const roleName = primaryRole.name

    // For custom roles, determine by permissions
    console.log('🎯 Dashboard Router: Using permissions-based routing for role:', roleName)
    return getDashboardByPermissions(primaryRole)
  }

  // Default fallback
  return '/dashboard'
}

/**
 * Determine dashboard based on role permissions for custom roles
 */
function getDashboardByPermissions(role: UserRole): string {
  const permissions = role.permissions || {}

  // Check for audit permissions (highest priority)
  if (permissions.audit_logs?.view === true) {
    return '/audit-dashboard'
  }

  // Check for financial permissions
  if (permissions.payments_revenue?.view === true || permissions.billing?.view === true) {
    return '/finance-dashboard'
  }

  // Check for support permissions
  if (permissions.user_impersonation?.view === true || permissions.view_all_orders?.view === true) {
    return '/support-dashboard'
  }

  // Check for sales permissions
  if (permissions.leads?.view === true) {
    return '/sales-dashboard'
  }

  // Default to main dashboard
  return '/dashboard'
}

/**
 * Get dashboard title based on role
 */
export function getDashboardTitle(user: User): string {
  if (!user.roles || user.roles.length === 0) {
    // Check legacy role field
    if (user.role === 'superadmin') {
      return 'Super Admin Dashboard'
    }
    if (user.role === 'support') {
      return 'Support Tickets Dashboard'
    }
    return 'Dashboard'
  }

  // RBAC ROLE SYSTEM: Check RBAC roles first (takes priority over legacy roles)
  // PRIORITY-BASED ROLE SELECTION (same as getDashboardRoute)
  const rolesByPriority = ['super-admin', 'Super Admin', 'platform-sales', 'Platform Sales', 'platform-support', 'Platform Support', 'platform-finance-admin', 'Platform Finance Admin', 'platform-read-only-auditor', 'Platform Read-Only Auditor']

  let primaryRole = null
  for (const priorityRole of rolesByPriority) {
    primaryRole = user.roles.find(role =>
      role.slug === priorityRole ||
      role.name === priorityRole ||
      (priorityRole === 'super-admin' && (role.slug === 'super_admin' || role.name === 'Super Admin')) ||
      (priorityRole === 'Super Admin' && (role.slug === 'super_admin' || role.name === 'Super Admin'))
    )
    if (primaryRole) break
  }

  // If we found a priority RBAC role, use it (overrides legacy role)
  if (primaryRole) {
    const roleSlug = primaryRole.slug
    const roleName = primaryRole.name

    // Super Admin check (multiple variations)
    if (roleSlug === 'super-admin' || roleSlug === 'super_admin' || roleName === 'Super Admin') {
      return 'Super Admin Dashboard'
    }

    if (roleSlug === 'platform-support' || roleName === 'Platform Support') {
      return 'Support Tickets Dashboard'
    }

    if (roleSlug === 'platform-sales' || roleName === 'Platform Sales') {
      return 'Sales Dashboard'
    }

    if (roleSlug === 'platform-finance-admin' || roleName === 'Platform Finance Admin') {
      return 'Finance Dashboard'
    }

    if (roleSlug === 'platform-read-only-auditor' || roleName === 'Platform Read-Only Auditor' || roleName === 'Platform Auditor') {
      return 'Audit Dashboard (Read-Only)'
    }

    return `${primaryRole.name} Dashboard`
  }

  // LEGACY ROLE SYSTEM: Check legacy role only if no RBAC role found
  if (user.role === 'superadmin') {
    return 'Super Admin Dashboard'
  }

  // LEGACY SUPPORT ROLE: Handle legacy support users
  if (user.role === 'support') {
    return 'Support Tickets Dashboard'
  }

  if (!primaryRole && user.roles.length > 0) {
    primaryRole = user.roles[0]
  }

  return primaryRole ? `${primaryRole.name} Dashboard` : 'Dashboard'
}

/**
 * Get role-based theme color
 */
export function getRoleColor(user: User): string {
  if (!user.roles || user.roles.length === 0) {
    return '#6366f1' // Default purple
  }

  const primaryRole = user.roles[0]
  return primaryRole.color || '#6366f1'
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User, module: string, action: string): boolean {
  if (!user.roles || user.roles.length === 0) {
    return false
  }

  // Check all roles for the permission (OR logic)
  return user.roles.some(role => {
    const permissions = role.permissions || {}
    return permissions[module]?.[action] === true
  })
}

/**
 * Get all permissions for user (combined from all roles)
 */
export function getUserPermissions(user: User): Record<string, Record<string, boolean>> {
  if (!user.roles || user.roles.length === 0) {
    return {}
  }

  const combinedPermissions: Record<string, Record<string, boolean>> = {}

  // Combine permissions from all roles using OR logic
  user.roles.forEach(role => {
    const permissions = role.permissions || {}

    Object.entries(permissions).forEach(([module, actions]) => {
      if (!combinedPermissions[module]) {
        combinedPermissions[module] = {}
      }

      if (typeof actions === 'object' && actions !== null) {
        Object.entries(actions).forEach(([action, value]) => {
          if (value === true) {
            combinedPermissions[module][action] = true
          }
        })
      }
    })
  })

  return combinedPermissions
}

/**
 * Role-based menu configuration
 */
export const roleMenus = {
  'super-admin': [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Tenants', path: '/tenants', icon: 'Building2' },
    { name: 'Users', path: '/users', icon: 'Users' },
    { name: 'RBAC', path: '/rbac', icon: 'Shield' },
    { name: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    { name: 'Settings', path: '/settings', icon: 'Settings' }
  ],

  'platform-support': [
    { name: 'Support Tickets', path: '/support-tickets', icon: 'MessageSquare' },
    { name: 'My Tickets', path: '/support-tickets?filter=assigned', icon: 'User' },
    { name: 'Escalated', path: '/support-tickets?filter=escalated', icon: 'ArrowUpRight' },
    { name: 'Reports', path: '/support-tickets/reports', icon: 'FileText' },
    { name: 'Knowledge Base', path: '/support-tickets/kb', icon: 'BookOpen' }
  ],

  'platform-finance-admin': [
    { name: 'Dashboard', path: '/dashboard/finance', icon: 'LayoutDashboard' },
    { name: 'Payments', path: '/finance/payments', icon: 'CreditCard' },
    { name: 'Refunds', path: '/finance/refunds', icon: 'RefreshCw' },
    { name: 'Reports', path: '/finance/reports', icon: 'FileBarChart' },
    { name: 'Billing', path: '/finance/billing', icon: 'Receipt' }
  ],

  'platform-read-only-auditor': [
    { name: 'Audit Dashboard', path: '/audit', icon: 'Shield' },
    { name: 'Audit Logs', path: '/audit/logs', icon: 'FileText' },
    { name: 'Security Monitoring', path: '/audit/security', icon: 'AlertTriangle' },
    { name: 'Financial Integrity', path: '/audit/financial', icon: 'DollarSign' },
    { name: 'Cross-Tenant View', path: '/audit/tenants', icon: 'Building2' },
    { name: 'Compliance Reports', path: '/audit/compliance', icon: 'FileBarChart' },
    { name: 'Export Data', path: '/audit/export', icon: 'Download' }
  ]
}

/**
 * Get menu items for user's role
 */
export function getMenuItems(user: User): Array<{ name: string, path: string, icon: string }> {
  if (!user.roles || user.roles.length === 0) {
    return roleMenus['super-admin'] // Default menu
  }

  const primaryRole = user.roles[0]
  return roleMenus[primaryRole.slug as keyof typeof roleMenus] || roleMenus['super-admin']
}