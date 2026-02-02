'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Settings,
  Search,
  Filter,
  Calendar,
  Download,
  Shield,
  Eye,
  Users,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from 'lucide-react'

interface PermissionMapping {
  _id: string
  permissionId: string
  name: string
  slug: string
  description: string
  module: string
  action: string
  resource: string
  scope: 'platform' | 'tenant' | 'global'
  level: 'read' | 'write' | 'admin' | 'super'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  roles: {
    roleId: string
    roleName: string
    roleType: 'platform' | 'tenant'
    userCount: number
    isActive: boolean
  }[]
  usage: {
    totalUsers: number
    activeUsers: number
    lastUsed: Date
    usageFrequency: number
  }
  dependencies: {
    requiredPermissions: string[]
    conflictingPermissions: string[]
    impliedPermissions: string[]
  }
  auditInfo: {
    createdBy: string
    lastModifiedBy: string
    changeHistory: {
      timestamp: Date
      action: string
      performedBy: string
      changes: string
    }[]
  }
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    sensitivityScore: number
    accessCount: number
    privilegeEscalationRisk: boolean
  }
}

export default function PermissionMappingsPage() {
  const [permissions, setPermissions] = useState<PermissionMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [selectedScope, setSelectedScope] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalPermissions: 0,
    activePermissions: 0,
    platformPermissions: 0,
    tenantPermissions: 0,
    highRiskPermissions: 0,
    unusedPermissions: 0,
    totalRoles: 0
  })

  useEffect(() => {
    fetchPermissionMappings()
  }, [page, selectedModule, selectedScope, selectedLevel, selectedRisk, searchQuery])

  const fetchPermissionMappings = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedModule !== 'all' && { module: selectedModule }),
        ...(selectedScope !== 'all' && { scope: selectedScope }),
        ...(selectedLevel !== 'all' && { level: selectedLevel }),
        ...(selectedRisk !== 'all' && { risk: selectedRisk }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/superadmin/audit/rbac/permissions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch permission mappings')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPermissions(data.data.permissions)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch permission mappings')
      }
      
    } catch (error) {
      console.error('Error fetching permission mappings:', error)
      // Fallback to mock data
      const mockPermissions: PermissionMapping[] = [
        {
          _id: '1',
          permissionId: 'PERM-001',
          name: 'View Financial Reports',
          slug: 'financial.reports.view',
          description: 'Allows viewing of financial reports and analytics',
          module: 'Financial',
          action: 'view',
          resource: 'financial_reports',
          scope: 'platform',
          level: 'read',
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          roles: [
            {
              roleId: 'role_001',
              roleName: 'Platform Finance Admin',
              roleType: 'platform',
              userCount: 5,
              isActive: true
            },
            {
              roleId: 'role_002',
              roleName: 'Super Admin',
              roleType: 'platform',
              userCount: 3,
              isActive: true
            }
          ],
          usage: {
            totalUsers: 8,
            activeUsers: 6,
            lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
            usageFrequency: 45
          },
          dependencies: {
            requiredPermissions: ['auth.login'],
            conflictingPermissions: [],
            impliedPermissions: ['financial.dashboard.view']
          },
          auditInfo: {
            createdBy: 'system@laundrylobby.com',
            lastModifiedBy: 'admin@laundrylobby.com',
            changeHistory: [
              {
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                action: 'PERMISSION_UPDATED',
                performedBy: 'admin@laundrylobby.com',
                changes: 'Updated description and scope'
              }
            ]
          },
          riskAssessment: {
            riskLevel: 'high',
            sensitivityScore: 8,
            accessCount: 0,
            privilegeEscalationRisk: false
          }
        },
        {
          _id: '2',
          permissionId: 'PERM-002',
          name: 'Delete User Accounts',
          slug: 'users.delete',
          description: 'Allows permanent deletion of user accounts',
          module: 'User Management',
          action: 'delete',
          resource: 'users',
          scope: 'platform',
          level: 'admin',
          isActive: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          roles: [
            {
              roleId: 'role_002',
              roleName: 'Super Admin',
              roleType: 'platform',
              userCount: 3,
              isActive: true
            }
          ],
          usage: {
            totalUsers: 3,
            activeUsers: 2,
            lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            usageFrequency: 2
          },
          dependencies: {
            requiredPermissions: ['users.view', 'users.edit'],
            conflictingPermissions: ['users.create'],
            impliedPermissions: ['users.suspend']
          },
          auditInfo: {
            createdBy: 'system@laundrylobby.com',
            lastModifiedBy: 'security@laundrylobby.com',
            changeHistory: [
              {
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                action: 'PERMISSION_RESTRICTED',
                performedBy: 'security@laundrylobby.com',
                changes: 'Added additional security restrictions'
              }
            ]
          },
          riskAssessment: {
            riskLevel: 'critical',
            sensitivityScore: 10,
            accessCount: 8,
            privilegeEscalationRisk: true
          }
        },
        {
          _id: '3',
          permissionId: 'PERM-003',
          name: 'View Order Details',
          slug: 'orders.view',
          description: 'Allows viewing of order details and history',
          module: 'Orders',
          action: 'view',
          resource: 'orders',
          scope: 'tenant',
          level: 'read',
          isActive: true,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          roles: [
            {
              roleId: 'role_003',
              roleName: 'Tenant Admin',
              roleType: 'tenant',
              userCount: 247,
              isActive: true
            },
            {
              roleId: 'role_004',
              roleName: 'Tenant User',
              roleType: 'tenant',
              userCount: 1456,
              isActive: true
            }
          ],
          usage: {
            totalUsers: 1703,
            activeUsers: 1234,
            lastUsed: new Date(Date.now() - 5 * 60 * 1000),
            usageFrequency: 2456
          },
          dependencies: {
            requiredPermissions: ['auth.login', 'tenant.access'],
            conflictingPermissions: [],
            impliedPermissions: []
          },
          auditInfo: {
            createdBy: 'system@laundrylobby.com',
            lastModifiedBy: 'system@laundrylobby.com',
            changeHistory: []
          },
          riskAssessment: {
            riskLevel: 'low',
            sensitivityScore: 3,
            accessCount: 0,
            privilegeEscalationRisk: false
          }
        }
      ]

      const mockStats = {
        totalPermissions: 0,
        activePermissions: 142,
        platformPermissions: 45,
        tenantPermissions: 97,
        highRiskPermissions: 12,
        unusedPermissions: 8,
        totalRoles: 23
      }

      setPermissions(mockPermissions)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'platform': return 'text-purple-700 bg-purple-100'
      case 'tenant': return 'text-blue-700 bg-blue-100'
      case 'global': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'text-green-700 bg-green-100'
      case 'write': return 'text-blue-700 bg-blue-100'
      case 'admin': return 'text-orange-700 bg-orange-100'
      case 'super': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Permission Mappings Audit
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive analysis of permission mappings, role assignments, and access control
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Permissions: {stats.totalPermissions}</p>
            <p className="text-xs text-blue-200">Access Control</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalPermissions}</p>
            </div>
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.activePermissions}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Platform</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.platformPermissions}</p>
            </div>
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Tenant</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.tenantPermissions}</p>
            </div>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">High Risk</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.highRiskPermissions}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Unused</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.unusedPermissions}</p>
            </div>
            <XCircle className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Total Roles</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.totalRoles}</p>
            </div>
            <Key className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules</option>
            <option value="Financial">Financial</option>
            <option value="User Management">User Management</option>
            <option value="Orders">Orders</option>
            <option value="Analytics">Analytics</option>
            <option value="Settings">Settings</option>
          </select>

          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Scopes</option>
            <option value="platform">Platform</option>
            <option value="tenant">Tenant</option>
            <option value="global">Global</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="admin">Admin</option>
            <option value="super">Super</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {permissions.map((permission) => (
          <div key={permission._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{permission.permissionId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScopeColor(permission.scope)}`}>
                    {permission.scope.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(permission.level)}`}>
                    {permission.level.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(permission.riskAssessment.riskLevel)}`}>
                    {permission.riskAssessment.riskLevel.toUpperCase()} RISK
                  </span>
                  {permission.isActive ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-700 bg-gray-100">
                      INACTIVE
                    </span>
                  )}
                  {permission.riskAssessment.privilegeEscalationRisk && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      ESCALATION RISK
                    </span>
                  )}
                </div>

                {/* Permission Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{permission.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{permission.slug}</span>
                    <span className="ml-3">Module: {permission.module}</span>
                    <span className="ml-3">Action: {permission.action}</span>
                    <span className="ml-3">Resource: {permission.resource}</span>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">Total Users</p>
                    <p className="text-lg font-bold text-blue-900">{permission.usage.totalUsers}</p>
                    <p className="text-xs text-blue-600">{permission.usage.activeUsers} active</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">Usage Frequency</p>
                    <p className="text-lg font-bold text-green-900">{permission.usage.usageFrequency}</p>
                    <p className="text-xs text-green-600">times/month</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium">Sensitivity Score</p>
                    <p className="text-lg font-bold text-purple-900">{permission.riskAssessment.sensitivityScore}/10</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">Access Count</p>
                    <p className="text-lg font-bold text-orange-900">{permission.riskAssessment.accessCount}</p>
                    <p className="text-xs text-orange-600">total accesses</p>
                  </div>
                </div>

                {/* Assigned Roles */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Roles ({permission.roles.length})</h4>
                  <div className="space-y-2">
                    {permission.roles.map((role, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{role.roleName}</p>
                          <p className="text-xs text-gray-600">{role.roleType} role • {role.userCount} users</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {role.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                {(permission.dependencies.requiredPermissions.length > 0 || 
                  permission.dependencies.conflictingPermissions.length > 0 || 
                  permission.dependencies.impliedPermissions.length > 0) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dependencies</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {permission.dependencies.requiredPermissions.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium mb-1">Required</p>
                          <div className="space-y-1">
                            {permission.dependencies.requiredPermissions.slice(0, 2).map((perm, index) => (
                              <p key={index} className="text-xs text-blue-600 font-mono">{perm}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {permission.dependencies.conflictingPermissions.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs text-red-700 font-medium mb-1">Conflicts</p>
                          <div className="space-y-1">
                            {permission.dependencies.conflictingPermissions.slice(0, 2).map((perm, index) => (
                              <p key={index} className="text-xs text-red-600 font-mono">{perm}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {permission.dependencies.impliedPermissions.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-700 font-medium mb-1">Implied</p>
                          <div className="space-y-1">
                            {permission.dependencies.impliedPermissions.slice(0, 2).map((perm, index) => (
                              <p key={index} className="text-xs text-green-600 font-mono">{perm}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit Information */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Audit Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Created by: <span className="font-medium">{permission.auditInfo.createdBy}</span></p>
                        <p className="text-gray-600">Created: {permission.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last modified by: <span className="font-medium">{permission.auditInfo.lastModifiedBy}</span></p>
                        <p className="text-gray-600">Updated: {permission.updatedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    {permission.usage.lastUsed && (
                      <p className="text-gray-600 mt-2">Last used: {permission.usage.lastUsed.toLocaleDateString()} {permission.usage.lastUsed.toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>

                {/* Change History */}
                {permission.auditInfo.changeHistory.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Changes</h4>
                    <div className="space-y-2">
                      {permission.auditInfo.changeHistory.slice(0, 2).map((change, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-yellow-900">{change.action.replace('_', ' ')}</span>
                            <span className="text-xs text-yellow-600">
                              {change.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-800">By: {change.performedBy}</p>
                          <p className="text-sm text-yellow-700">{change.changes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Status */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Risk: {permission.riskAssessment.riskLevel}</div>
                  <div>Score: {permission.riskAssessment.sensitivityScore}/10</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
  )
}