'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  Globe,
  Search,
  Filter,
  Download,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  Lock,
  Unlock,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react'

interface TenantRoleAnalysis {
  _id: string
  tenantId: string
  businessName: string
  subdomain: string
  adminCount: number
  roles: {
    name: string
    slug: string
    userCount: number
    permissions: string[]
  }[]
  totalUsers: number
  riskLevel: 'low' | 'medium' | 'high'
  lastRoleChange: string
  privilegeEscalationRisk: boolean
  crossTenantAccess: boolean
}

interface Stats {
  totalTenants: number
  highRiskTenants: number
  crossTenantAccessCount: number
  avgRolesPerTenant: number
}

export default function CrossTenantRolesPage() {
  const [tenants, setTenants] = useState<TenantRoleAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<Stats>({
    totalTenants: 0,
    highRiskTenants: 0,
    crossTenantAccessCount: 0,
    avgRolesPerTenant: 0
  })

  useEffect(() => {
    fetchCrossTenantData()
  }, [page, selectedRisk, searchQuery])

  const fetchCrossTenantData = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedRisk !== 'all' && { riskLevel: selectedRisk }),
        ...(searchQuery && { search: searchQuery })
      })

      const data = await superAdminApi.get(`/audit/rbac/cross-tenant?${params}`)

      if (data.success) {
        setTenants(data.data.data)
        setTotalPages(Math.ceil(data.data.total / 20))
        if (data.data.stats) {
          setStats(data.data.stats)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch cross-tenant role data')
      }
    } catch (error) {
      console.error('Error fetching cross-tenant role data:', error)
      // Fallback to mock data
      const mockTenants: TenantRoleAnalysis[] = [
        {
          _id: '1',
          tenantId: 'tenant-001',
          businessName: 'SparkleWash Laundry Co.',
          subdomain: 'sparklewash',
          adminCount: 3,
          roles: [
            {
              name: 'Owner',
              slug: 'owner',
              userCount: 1,
              permissions: [
                'manage_all',
                'manage_users',
                'manage_billing',
                'manage_orders',
                'view_analytics',
                'manage_settings',
                'manage_roles',
                'export_data'
              ]
            },
            {
              name: 'Store Manager',
              slug: 'store-manager',
              userCount: 2,
              permissions: [
                'manage_orders',
                'view_analytics',
                'manage_staff',
                'manage_inventory',
                'view_reports'
              ]
            },
            {
              name: 'Front Desk Staff',
              slug: 'front-desk-staff',
              userCount: 5,
              permissions: [
                'create_orders',
                'view_orders',
                'manage_customers',
                'process_payments'
              ]
            },
            {
              name: 'Delivery Driver',
              slug: 'delivery-driver',
              userCount: 4,
              permissions: [
                'view_assigned_orders',
                'update_delivery_status',
                'view_route'
              ]
            }
          ],
          totalUsers: 12,
          riskLevel: 'low',
          lastRoleChange: '2026-03-10T14:30:00Z',
          privilegeEscalationRisk: false,
          crossTenantAccess: false
        },
        {
          _id: '2',
          tenantId: 'tenant-002',
          businessName: 'FreshFold Express',
          subdomain: 'freshfold',
          adminCount: 7,
          roles: [
            {
              name: 'Super Admin',
              slug: 'super-admin',
              userCount: 3,
              permissions: [
                'manage_all',
                'manage_users',
                'manage_billing',
                'manage_orders',
                'view_analytics',
                'manage_settings',
                'manage_roles',
                'export_data',
                'delete_data',
                'api_access'
              ]
            },
            {
              name: 'Admin',
              slug: 'admin',
              userCount: 4,
              permissions: [
                'manage_users',
                'manage_orders',
                'view_analytics',
                'manage_settings',
                'manage_roles',
                'export_data'
              ]
            },
            {
              name: 'Operator',
              slug: 'operator',
              userCount: 8,
              permissions: [
                'manage_orders',
                'view_analytics',
                'manage_inventory'
              ]
            }
          ],
          totalUsers: 15,
          riskLevel: 'high',
          lastRoleChange: '2026-03-16T09:15:00Z',
          privilegeEscalationRisk: true,
          crossTenantAccess: true
        },
        {
          _id: '3',
          tenantId: 'tenant-003',
          businessName: 'CleanPress Laundromat',
          subdomain: 'cleanpress',
          adminCount: 2,
          roles: [
            {
              name: 'Owner',
              slug: 'owner',
              userCount: 1,
              permissions: [
                'manage_all',
                'manage_users',
                'manage_billing',
                'manage_orders',
                'view_analytics',
                'manage_settings'
              ]
            },
            {
              name: 'Manager',
              slug: 'manager',
              userCount: 1,
              permissions: [
                'manage_orders',
                'view_analytics',
                'manage_staff',
                'manage_inventory',
                'view_reports',
                'manage_customers'
              ]
            },
            {
              name: 'Cashier',
              slug: 'cashier',
              userCount: 3,
              permissions: [
                'create_orders',
                'view_orders',
                'process_payments'
              ]
            },
            {
              name: 'Washer',
              slug: 'washer',
              userCount: 6,
              permissions: [
                'view_assigned_orders',
                'update_order_status'
              ]
            },
            {
              name: 'Delivery',
              slug: 'delivery',
              userCount: 2,
              permissions: [
                'view_assigned_orders',
                'update_delivery_status'
              ]
            }
          ],
          totalUsers: 13,
          riskLevel: 'low',
          lastRoleChange: '2026-02-28T11:45:00Z',
          privilegeEscalationRisk: false,
          crossTenantAccess: false
        },
        {
          _id: '4',
          tenantId: 'tenant-004',
          businessName: 'QuickDry Garment Care',
          subdomain: 'quickdry',
          adminCount: 4,
          roles: [
            {
              name: 'Administrator',
              slug: 'administrator',
              userCount: 2,
              permissions: [
                'manage_all',
                'manage_users',
                'manage_billing',
                'manage_orders',
                'view_analytics',
                'manage_settings',
                'manage_roles',
                'export_data',
                'api_access'
              ]
            },
            {
              name: 'Shift Lead',
              slug: 'shift-lead',
              userCount: 2,
              permissions: [
                'manage_orders',
                'view_analytics',
                'manage_staff',
                'manage_inventory',
                'approve_refunds'
              ]
            },
            {
              name: 'Staff',
              slug: 'staff',
              userCount: 7,
              permissions: [
                'create_orders',
                'view_orders',
                'process_payments',
                'manage_customers'
              ]
            }
          ],
          totalUsers: 11,
          riskLevel: 'medium',
          lastRoleChange: '2026-03-14T16:20:00Z',
          privilegeEscalationRisk: true,
          crossTenantAccess: false
        },
        {
          _id: '5',
          tenantId: 'tenant-005',
          businessName: 'UrbanWash Premium Services',
          subdomain: 'urbanwash',
          adminCount: 5,
          roles: [
            {
              name: 'Platform Admin',
              slug: 'platform-admin',
              userCount: 2,
              permissions: [
                'manage_all',
                'manage_users',
                'manage_billing',
                'manage_orders',
                'view_analytics',
                'manage_settings',
                'manage_roles',
                'export_data',
                'delete_data',
                'api_access',
                'cross_tenant_view'
              ]
            },
            {
              name: 'Branch Manager',
              slug: 'branch-manager',
              userCount: 3,
              permissions: [
                'manage_orders',
                'view_analytics',
                'manage_staff',
                'manage_inventory',
                'view_reports',
                'approve_refunds'
              ]
            },
            {
              name: 'Customer Service',
              slug: 'customer-service',
              userCount: 4,
              permissions: [
                'view_orders',
                'manage_customers',
                'create_tickets',
                'process_payments'
              ]
            },
            {
              name: 'Warehouse Staff',
              slug: 'warehouse-staff',
              userCount: 6,
              permissions: [
                'view_assigned_orders',
                'update_order_status',
                'manage_inventory'
              ]
            }
          ],
          totalUsers: 15,
          riskLevel: 'high',
          lastRoleChange: '2026-03-15T22:10:00Z',
          privilegeEscalationRisk: true,
          crossTenantAccess: true
        },
        {
          _id: '6',
          tenantId: 'tenant-006',
          businessName: 'BrightSpin Laundry Hub',
          subdomain: 'brightspin',
          adminCount: 2,
          roles: [
            {
              name: 'Owner',
              slug: 'owner',
              userCount: 1,
              permissions: [
                'manage_all',
                'manage_users',
                'manage_billing',
                'manage_orders',
                'view_analytics',
                'manage_settings'
              ]
            },
            {
              name: 'Attendant',
              slug: 'attendant',
              userCount: 4,
              permissions: [
                'create_orders',
                'view_orders',
                'process_payments',
                'manage_customers'
              ]
            }
          ],
          totalUsers: 5,
          riskLevel: 'low',
          lastRoleChange: '2026-01-20T08:00:00Z',
          privilegeEscalationRisk: false,
          crossTenantAccess: false
        }
      ]

      // Apply filters to mock data
      let filtered = mockTenants

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.businessName.toLowerCase().includes(query) ||
            t.subdomain.toLowerCase().includes(query) ||
            t.tenantId.toLowerCase().includes(query)
        )
      }

      if (selectedRisk !== 'all') {
        filtered = filtered.filter((t) => t.riskLevel === selectedRisk)
      }

      setTenants(filtered)
      setTotalPages(Math.ceil(filtered.length / 20))

      // Calculate stats from mock data
      setStats({
        totalTenants: mockTenants.length,
        highRiskTenants: mockTenants.filter((t) => t.riskLevel === 'high').length,
        crossTenantAccessCount: mockTenants.filter((t) => t.crossTenantAccess).length,
        avgRolesPerTenant: parseFloat(
          (mockTenants.reduce((sum, t) => sum + t.roles.length, 0) / mockTenants.length).toFixed(1)
        )
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'medium':
        return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Shield className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getRiskCardBg = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50/30'
      case 'medium':
        return 'border-l-4 border-l-orange-500 bg-orange-50/30'
      case 'low':
        return 'border-l-4 border-l-green-500 bg-green-50/30'
      default:
        return 'border-l-4 border-l-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Globe className="w-8 h-8 mr-3" />
              Cross-Tenant Role Analysis
            </h1>
            <p className="text-indigo-100 mt-2">
              Comprehensive analysis of role configurations, privilege escalation risks, and cross-tenant access patterns across all tenants
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Analyzed Tenants: {stats.totalTenants}</p>
            <p className="text-xs text-indigo-200">RBAC Security Audit</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-5 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Total Tenants</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.totalTenants}</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">High Risk Tenants</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.highRiskTenants}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Cross-Tenant Access</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.crossTenantAccessCount}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Unlock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Roles Per Tenant</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgRolesPerTenant}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <ArrowUpDown className="w-6 h-6 text-white" />
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
              placeholder="Search tenants by name, subdomain..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value)
              setPage(1)
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Showing {tenants.length} of {stats.totalTenants} tenants
          </div>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tenant Cards */}
      <div className="space-y-4">
        {tenants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No tenants found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          tenants.map((tenant) => (
            <div
              key={tenant._id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${getRiskCardBg(tenant.riskLevel)}`}
            >
              {/* Tenant Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-2.5 rounded-lg">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{tenant.businessName}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-500 font-mono">{tenant.subdomain}.laundrylobby.com</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">ID: {tenant.tenantId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Cross Tenant Access Indicator */}
                    {tenant.crossTenantAccess ? (
                      <span className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-red-700 bg-red-100 border border-red-200">
                        <Unlock className="w-3.5 h-3.5 mr-1.5" />
                        Cross-Tenant Access
                      </span>
                    ) : (
                      <span className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-green-700 bg-green-100 border border-green-200">
                        <Lock className="w-3.5 h-3.5 mr-1.5" />
                        Isolated
                      </span>
                    )}

                    {/* Privilege Escalation Risk Indicator */}
                    {tenant.privilegeEscalationRisk && (
                      <span className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200">
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                        Escalation Risk
                      </span>
                    )}

                    {/* Risk Level Badge */}
                    <span className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${getRiskColor(tenant.riskLevel)}`}>
                      {getRiskIcon(tenant.riskLevel)}
                      <span className="ml-1.5">{tenant.riskLevel} Risk</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tenant Stats Row */}
              <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1.5 text-indigo-500" />
                    <span className="font-medium text-gray-900">{tenant.totalUsers}</span>
                    <span className="ml-1">total users</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Crown className="w-4 h-4 mr-1.5 text-purple-500" />
                    <span className="font-medium text-gray-900">{tenant.adminCount}</span>
                    <span className="ml-1">admins</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium text-gray-900">{tenant.roles.length}</span>
                    <span className="ml-1">roles defined</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span>Last role change: </span>
                    <span className="font-medium text-gray-900 ml-1">{formatDate(tenant.lastRoleChange)}</span>
                  </div>
                </div>
              </div>

              {/* Roles Breakdown */}
              <div className="px-6 py-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Roles Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tenant.roles.map((role, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{role.name}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono mb-2">{role.slug}</div>
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          {role.permissions.length} permissions
                        </summary>
                        <div className="mt-2 space-y-1">
                          {role.permissions.map((perm, pIndex) => (
                            <div key={pIndex} className="text-xs">
                              <code className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">{perm}</code>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tenant Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Last role change: {formatDateTime(tenant.lastRoleChange)}
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  View Full Audit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1.5 border rounded-md text-sm ${
                  page === pageNum
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}