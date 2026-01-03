'use client'

import { useAuthStore } from '@/store/authStore'

/**
 * Permission hook for Center Admin pages
 * Center Admin has default full access to their branch, but Super Admin can restrict permissions
 */
export function useCenterAdminPermissions(defaultModule?: string) {
  const { user, _hasHydrated } = useAuthStore()

  // Center Admin default permissions - full access to branch operations
  const defaultCenterAdminPermissions: Record<string, Record<string, boolean>> = {
    orders: { view: true, create: true, update: true, delete: false, assign: true, cancel: true },
    services: { view: true, create: true, update: true, delete: true },
    staff: { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true, delete: true },
    performance: { view: true, export: true },
    settings: { view: true, update: true }
  }

  const hasPermission = (module: string, action: string): boolean => {
    if (!_hasHydrated) return false
    if (!user) return false

    // If user has explicit permissions set by Super Admin, use those ONLY
    // This ensures RBAC is enforced - Super Admin controls what Center Admin can do
    if (user.permissions && Object.keys(user.permissions).length > 0) {
      return user.permissions[module]?.[action] === true
    }

    // Only use default permissions if NO explicit permissions are set at all
    // This is for backward compatibility with existing Center Admins without RBAC
    return defaultCenterAdminPermissions[module]?.[action] === true
  }

  // If a default module is provided, create shortcuts for that module
  const canView = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'view')) 
    : (module: string) => hasPermission(module, 'view')
  const canCreate = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'create')) 
    : (module: string) => hasPermission(module, 'create')
  const canUpdate = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'update')) 
    : (module: string) => hasPermission(module, 'update')
  const canDelete = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'delete')) 
    : (module: string) => hasPermission(module, 'delete')
  const canAssign = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'assign')) 
    : (module: string) => hasPermission(module, 'assign')
  const canExport = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'export')) 
    : (module: string) => hasPermission(module, 'export')

  return {
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canAssign,
    canExport,
    permissions: user?.permissions || defaultCenterAdminPermissions,
    isHydrated: _hasHydrated
  }
}
