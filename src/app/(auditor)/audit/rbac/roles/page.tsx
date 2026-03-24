'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Shield,
  Search,
  Filter,
  Calendar,
  Download,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Crown,
  UserCheck
} from 'lucide-react'

interface RoleDefinition {
  _id: string
  name: string
  slug: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userCount?: number
  description?: string
  level: 'platform' | 'tenant' | 'system'
}

export default function RBACRolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  useEffect(() => {
    fetchRoles()
  }, [page, selectedLevel, selectedStatus, searchQuery])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(selectedLevel !== 'all' && { level: selectedLevel }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery })
      })

      const data = await superAdminApi.get(`/audit/rbac/permissions?${params}`)
      
      if (data.success) {
        const rolesData = data.data?.data || data.data || []
        setRoles(Array.isArray(rolesData) ? rolesData : [])
        setTotalPages(Math.ceil((Array.isArray(rolesData) ? rolesData.length : 0) / 50))
      } else {
        throw new Error(data.message || 'Failed to fetch role definitions')
      }
      
    } catch (error) {
      console.error('Error fetching role definitions:', error)
      setRoles([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platform': return 'text-purple-700 bg-purple-100'
      case 'tenant': return 'text-blue-700 bg-blue-100'
      case 'system': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platform': return <Crown className="w-4 h-4" />
      case 'tenant': return <Users className="w-4 h-4" />
      case 'system': return <Settings className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getPermissionCount = (role: any) => {
    if (!role) return 0
    // Use backend-enriched permissionCount if available
    if (role.permissionCount !== undefined) return role.permissionCount
    const permissions = role.permissions
    if (!permissions) return 0
    if (Array.isArray(permissions)) return permissions.length
    if (typeof permissions === 'object') {
      return Object.values(permissions).filter((v: any) => v && typeof v === 'string' && v.length > 0).length
    }
    return 0
  }

  const getPermissionsList = (role: any): string[] => {
    if (!role) return []
    // Use backend-enriched enabledPermissions if available
    if (role.enabledPermissions && Array.isArray(role.enabledPermissions)) return role.enabledPermissions
    const permissions = role.permissions
    if (!permissions) return []
    if (Array.isArray(permissions)) return permissions
    if (typeof permissions === 'object') {
      const CODES: Record<string, string> = { r: 'view', c: 'create', u: 'update', d: 'delete', e: 'export' }
      const list: string[] = []
      Object.entries(permissions).forEach(([module, permStr]: [string, any]) => {
        if (typeof permStr === 'string' && permStr.length > 0) {
          const actions = permStr.split('').map((c: string) => CODES[c] || c).join(', ')
          list.push(`${module}: ${actions}`)
        }
      })
      return list
    }
    return []
  }

  const formatDate = (date: any) => {
    if (!date) return '-'
    const d = new Date(date)
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
  }

  const formatTime = (date: any) => {
    if (!date) return ''
    const d = new Date(date)
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              RBAC Role Definitions
            </h1>
            <p className="text-purple-100 mt-2">
              Comprehensive audit of role-based access control definitions and permissions
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Total Roles: {roles.length}</p>
            <p className="text-xs text-purple-200">Security Audit</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Platform Roles</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {roles.filter(r => r.level === 'platform').length}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Tenant Roles</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {roles.filter(r => r.level === 'tenant').length}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active Roles</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {roles.filter(r => r.isActive).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Total Users</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Levels</option>
            <option value="platform">Platform</option>
            <option value="tenant">Tenant</option>
            <option value="system">System</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Roles
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Role Definitions</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed audit of RBAC role definitions and permissions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-500 font-mono">{role.slug}</div>
                      {role.description && (
                        <div className="text-xs text-gray-400 mt-1">{role.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getLevelColor(role.level || 'standard')}`}>
                      {getLevelIcon(role.level || 'standard')}
                      <span className="ml-1">{(role.level || 'standard').toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium mb-1">{getPermissionCount(role)} permissions</div>
                      <div className="max-w-xs">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 text-xs">View permissions</summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-48 overflow-y-auto">
                            {getPermissionsList(role).map((permission: string, index: number) => (
                              <div key={index} className="py-1">
                                <code className="bg-gray-200 px-1 rounded">{permission}</code>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{role.userCount || 0}</div>
                    <div className="text-xs text-gray-500">assigned users</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      role.isActive 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-red-700 bg-red-100'
                    }`}>
                      {role.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          ACTIVE
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 inline mr-1" />
                          INACTIVE
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(role.createdAt)}</div>
                    <div className="text-gray-500 text-xs">{formatTime(role.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(role.updatedAt)}</div>
                    <div className="text-gray-500 text-xs">{formatTime(role.updatedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View role details"
                      onClick={() => setSelectedRole(role)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      title="Export role as JSON"
                      onClick={() => {
                        const exportData = { name: role.name, slug: role.slug, description: role.description, isActive: role.isActive, permissions: getPermissionsList(role), userCount: role.userCount || 0 }
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url; a.download = `role-${role.slug}.json`; a.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Detail Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRole(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selectedRole.name}</h3>
                  <p className="text-purple-200 text-sm font-mono">{selectedRole.slug}</p>
                </div>
                <button onClick={() => setSelectedRole(null)} className="text-white hover:text-purple-200 text-2xl leading-none">&times;</button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {/* Info Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-700">{getPermissionCount(selectedRole)}</p>
                  <p className="text-xs text-purple-600">Permissions</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{selectedRole.userCount || 0}</p>
                  <p className="text-xs text-blue-600">Users</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{selectedRole.isActive ? 'Active' : 'Inactive'}</p>
                  <p className="text-xs text-green-600">Status</p>
                </div>
              </div>

              {/* Description */}
              {selectedRole.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedRole.description}</p>
                </div>
              )}

              {/* Permissions List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Permissions ({getPermissionCount(selectedRole)})</h4>
                <div className="space-y-2">
                  {getPermissionsList(selectedRole).length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No permissions assigned</p>
                  ) : (
                    getPermissionsList(selectedRole).map((perm: string, i: number) => {
                      const [module, actions] = perm.split(': ')
                      return (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-800">{module?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(actions || '').split(', ').map((action: string, j: number) => (
                              <span key={j} className={`px-2 py-0.5 rounded text-xs font-medium ${
                                action === 'delete' ? 'bg-red-100 text-red-700' :
                                action === 'create' ? 'bg-green-100 text-green-700' :
                                action === 'update' ? 'bg-yellow-100 text-yellow-700' :
                                action === 'export' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Created</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedRole.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Last Updated</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedRole.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}