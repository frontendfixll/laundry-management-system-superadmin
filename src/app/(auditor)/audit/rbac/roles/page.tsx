'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
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

      const response = await fetch(`/api/superadmin/audit/rbac/roles?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch role definitions')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setRoles(data.data.data)
        setTotalPages(Math.ceil(data.data.data.length / 50))
      } else {
        throw new Error(data.message || 'Failed to fetch role definitions')
      }
      
    } catch (error) {
      console.error('Error fetching role definitions:', error)
      // Fallback to mock data
      const mockRoles: RoleDefinition[] = [
        {
          _id: '1',
          name: 'Super Admin',
          slug: 'super_admin',
          permissions: [
            'manage_tenancies',
            'manage_users',
            'manage_roles',
            'view_analytics',
            'manage_billing',
            'manage_addons',
            'system_settings'
          ],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          userCount: 3,
          description: 'Full platform access with all permissions',
          level: 'platform'
        },
        {
          _id: '2',
          name: 'Platform Support',
          slug: 'platform-support',
          permissions: [
            'view_tickets',
            'manage_tickets',
            'impersonate_users',
            'view_orders',
            'view_payments',
            'reset_passwords'
          ],
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
          userCount: 8,
          description: 'Customer support with limited access',
          level: 'platform'
        },
        {
          _id: '3',
          name: 'Platform Finance Admin',
          slug: 'platform-finance-admin',
          permissions: [
            'view_financials',
            'manage_billing',
            'approve_refunds',
            'view_transactions',
            'generate_reports'
          ],
          isActive: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date(),
          userCount: 2,
          description: 'Financial operations and billing management',
          level: 'platform'
        },
        {
          _id: '4',
          name: 'Platform Read-Only Auditor',
          slug: 'platform-read-only-auditor',
          permissions: [
            'view_audit_logs',
            'view_all_data',
            'export_reports',
            'cross_tenant_visibility'
          ],
          isActive: true,
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date(),
          userCount: 1,
          description: 'Read-only access for auditing and compliance',
          level: 'platform'
        },
        {
          _id: '5',
          name: 'Tenant Admin',
          slug: 'tenant_admin',
          permissions: [
            'manage_tenant_users',
            'view_tenant_orders',
            'manage_tenant_settings',
            'view_tenant_analytics'
          ],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          userCount: 0,
          description: 'Full access within tenant scope',
          level: 'tenant'
        },
        {
          _id: '6',
          name: 'Tenant User',
          slug: 'tenant_user',
          permissions: [
            'view_orders',
            'create_orders',
            'view_customers'
          ],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          userCount: 0,
          description: 'Basic tenant user access',
          level: 'tenant'
        }
      ]
      setRoles(mockRoles)
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

  const getPermissionCount = (permissions: string[]) => {
    return permissions.length
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getLevelColor(role.level)}`}>
                      {getLevelIcon(role.level)}
                      <span className="ml-1">{role.level.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium mb-1">{getPermissionCount(role.permissions)} permissions</div>
                      <div className="max-w-xs">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 text-xs">View permissions</summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {role.permissions.map((permission, index) => (
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
                    <div>{role.createdAt.toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{role.createdAt.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{role.updatedAt.toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{role.updatedAt.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
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
    </div>
  )
}