import { useState, useCallback } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface Permission {
  module: string
  actions: string[]
  restrictions?: {
    maxAmount?: number
    maxDiscount?: number
    timeRestriction?: string
    branchRestriction?: boolean
  }
}

interface Role {
  _id: string
  name: string
  displayName: string
  description: string
  level: number
  category: string
  permissions: Permission[]
  settings: {
    canCreateUsers: boolean
    canAssignRoles: boolean
    canModifyBranch: boolean
    canViewReports: boolean
    canExportData: boolean
    requireApproval: boolean
    sessionTimeout: number
    maxConcurrentSessions: number
  }
  financialLimits: {
    maxRefundAmount: number
    maxDiscountPercent: number
    maxOrderValue: number
    canProcessPayments: boolean
    canViewFinancials: boolean
  }
  operationalLimits: {
    maxOrdersPerDay?: number
    canCancelOrders: boolean
    canModifyOrders: boolean
    canAssignDrivers: boolean
    canManageInventory: boolean
  }
  systemAccess: {
    dashboardAccess: boolean
    mobileAppAccess: boolean
    apiAccess: boolean
    adminPanelAccess: boolean
  }
  isActive: boolean
  isSystemRole: boolean
  parentRole?: {
    _id: string
    name: string
    displayName: string
  }
  childRoles: Array<{
    _id: string
    name: string
    displayName: string
  }>
  stats: {
    userCount: number
    createdAt: string
    lastUsed?: string
  }
  createdAt: string
  updatedAt: string
}

interface RoleFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  level?: number
  isActive?: boolean
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleHierarchy, setRoleHierarchy] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })

  // Fetch roles with filters
  const fetchRoles = useCallback(async (filters: RoleFilters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getRoles(filters)
      setRoles(response.data.roles)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message)
      console.error('Fetch roles error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch single role
  const fetchRole = useCallback(async (roleId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getRole(roleId)
      setSelectedRole(response.data.role)
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Fetch role error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch role hierarchy
  const fetchRoleHierarchy = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getRoleHierarchy()
      setRoleHierarchy(response.data.hierarchy)
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Fetch role hierarchy error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Create role
  const createRole = useCallback(async (roleData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.createRole(roleData)
      
      // Refresh roles list
      await fetchRoles()
      
      return response.data.role
    } catch (err: any) {
      setError(err.message)
      console.error('Create role error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  // Update role
  const updateRole = useCallback(async (roleId: string, roleData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.updateRole(roleId, roleData)
      
      // Update local state
      setRoles(prev => 
        prev.map(role => 
          role._id === roleId ? response.data.role : role
        )
      )
      
      if (selectedRole?._id === roleId) {
        setSelectedRole(response.data.role)
      }
      
      return response.data.role
    } catch (err: any) {
      setError(err.message)
      console.error('Update role error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedRole])

  // Delete role
  const deleteRole = useCallback(async (roleId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await superAdminApi.deleteRole(roleId)
      
      // Remove from local state
      setRoles(prev => prev.filter(role => role._id !== roleId))
      
      if (selectedRole?._id === roleId) {
        setSelectedRole(null)
      }
      
      return true
    } catch (err: any) {
      setError(err.message)
      console.error('Delete role error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedRole])

  // Add permission to role
  const addPermission = useCallback(async (roleId: string, permissionData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.addRolePermission(roleId, permissionData)
      
      // Update local state
      setRoles(prev => 
        prev.map(role => 
          role._id === roleId ? response.data.role : role
        )
      )
      
      if (selectedRole?._id === roleId) {
        setSelectedRole(response.data.role)
      }
      
      return response.data.role
    } catch (err: any) {
      setError(err.message)
      console.error('Add permission error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedRole])

  // Remove permission from role
  const removePermission = useCallback(async (roleId: string, module: string, action?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.removeRolePermission(roleId, module, action)
      
      // Update local state
      setRoles(prev => 
        prev.map(role => 
          role._id === roleId ? response.data.role : role
        )
      )
      
      if (selectedRole?._id === roleId) {
        setSelectedRole(response.data.role)
      }
      
      return response.data.role
    } catch (err: any) {
      setError(err.message)
      console.error('Remove permission error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedRole])

  // Assign role to user
  const assignRole = useCallback(async (userId: string, roleId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.assignRole(userId, roleId)
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Assign role error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize default roles
  const initializeDefaultRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.initializeDefaultRoles()
      
      // Refresh roles list
      await fetchRoles()
      
      return response.data
    } catch (err: any) {
      setError(err.message)
      console.error('Initialize default roles error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  return {
    // Data
    roles,
    selectedRole,
    roleHierarchy,
    loading,
    error,
    pagination,
    
    // Actions
    fetchRoles,
    fetchRole,
    fetchRoleHierarchy,
    createRole,
    updateRole,
    deleteRole,
    addPermission,
    removePermission,
    assignRole,
    initializeDefaultRoles,
    
    // Setters
    setSelectedRole,
    clearError: () => setError(null)
  }
}
