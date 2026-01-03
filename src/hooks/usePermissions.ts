'use client'

import { useAuthStore } from '@/store/authStore'

export function usePermissions(defaultModule?: string) {
  const { user, _hasHydrated } = useAuthStore()

  const hasPermission = (module: string, action: string): boolean => {
    if (!_hasHydrated) return false // Wait for hydration
    if (!user) return false
    if (!user.permissions) return false
    return user.permissions[module]?.[action] === true
  }

  // If a default module is provided, create shortcuts for that module
  // Return false if not hydrated yet to prevent showing buttons before permissions are loaded
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

  // Special permissions
  const canAssign = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'assign')) 
    : (module: string) => hasPermission(module, 'assign')
  const canCancel = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'cancel')) 
    : (module: string) => hasPermission(module, 'cancel')
  const canRefund = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'refund')) 
    : (module: string) => hasPermission(module, 'refund')
  const canApprove = defaultModule 
    ? (_hasHydrated && hasPermission(defaultModule, 'approve')) 
    : (module: string) => hasPermission(module, 'approve')
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
    canCancel,
    canRefund,
    canApprove,
    canExport,
    permissions: user?.permissions || {},
    isHydrated: _hasHydrated
  }
}
