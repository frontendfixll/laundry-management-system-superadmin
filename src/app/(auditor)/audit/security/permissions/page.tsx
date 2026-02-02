'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Shield,
  Search,
  Filter,
  Calendar,
  Download,
  AlertTriangle,
  XCircle,
  Eye,
  Clock,
  User,
  Lock,
  Key,
  Activity,
  Building2,
  Settings
} from 'lucide-react'

interface PermissionDenial {
  _id: string
  timestamp: Date
  userId: string
  userEmail: string
  userName: string
  userRole: string
  userType: string
  attemptedAction: string
  resource: string
  resourceId?: string
  requiredPermission: string
  currentPermissions: string[]
  denialReason: string
  ipAddress: string
  userAgent: string
  location?: string
  tenantId?: string
  tenantName?: string
  sessionId: string
  riskScore: number
  context: {
    previousAttempts: number
    timeWindow: string
    relatedAttempts: string[]
    suspiciousPattern: boolean
  }
  investigation: {
    flagged: boolean
    reviewRequired: boolean
    notes: string[]
    reviewedBy?: string
    reviewedAt?: Date
    resolution?: string
  }
}

export default function PermissionDenialsPage() {
  const [denials, setDenials] = useState<PermissionDenial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [selectedUserType, setSelectedUserType] = useState('all')
  const [selectedResource, setSelectedResource] = useState('all')
  const [dateRange, setDateRange] = useState('24h')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalDenials: 0,
    uniqueUsers: 0,
    highRiskAttempts: 0,
    flaggedForReview: 0,
    mostDeniedAction: '',
    mostTargetedResource: ''
  })

  useEffect(() => {
    fetchPermissionDenials()
  }, [page, selectedRisk, selectedUserType, selectedResource, dateRange, searchQuery])

  const fetchPermissionDenials = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedRisk !== 'all' && { risk: selectedRisk }),
        ...(selectedUserType !== 'all' && { userType: selectedUserType }),
        ...(selectedResource !== 'all' && { resource: selectedResource }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/security/permissions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch permission denials')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDenials(data.data.denials)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch permission denials')
      }
      
    } catch (error) {
      console.error('Error fetching permission denials:', error)
      // Fallback to mock data
      const mockDenials: PermissionDenial[] = [
        {
          _id: '1',
          timestamp: new Date(),
          userId: 'user_123',
          userEmail: 'user@tenant.com',
          userName: 'John Doe',
          userRole: 'Tenant User',
          userType: 'tenant_user',
          attemptedAction: 'DELETE_ORDER',
          resource: 'Order',
          resourceId: 'order_456',
          requiredPermission: 'orders.delete',
          currentPermissions: ['orders.view', 'orders.create', 'orders.update'],
          denialReason: 'Insufficient permissions - missing orders.delete',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Mumbai, India',
          tenantId: 'tenant_001',
          tenantName: 'Clean & Fresh Laundry',
          sessionId: 'sess_abc123',
          riskScore: 2,
          context: {
            previousAttempts: 1,
            timeWindow: '1 hour',
            relatedAttempts: [],
            suspiciousPattern: false
          },
          investigation: {
            flagged: false,
            reviewRequired: false,
            notes: []
          }
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 300000),
          userId: 'user_789',
          userEmail: 'suspicious@tenant.com',
          userName: 'Jane Smith',
          userRole: 'Tenant Admin',
          userType: 'tenant_admin',
          attemptedAction: 'ACCESS_FINANCIAL_REPORTS',
          resource: 'FinancialReport',
          resourceId: 'report_789',
          requiredPermission: 'reports.financial.view',
          currentPermissions: ['orders.manage', 'users.manage', 'settings.view'],
          denialReason: 'Role does not have financial reporting access',
          ipAddress: '10.0.0.1',
          userAgent: 'curl/7.68.0',
          location: 'Unknown Location',
          tenantId: 'tenant_002',
          tenantName: 'QuickWash Services',
          sessionId: 'sess_def456',
          riskScore: 5,
          context: {
            previousAttempts: 15,
            timeWindow: '30 minutes',
            relatedAttempts: ['attempt_001', 'attempt_002', 'attempt_003'],
            suspiciousPattern: true
          },
          investigation: {
            flagged: true,
            reviewRequired: true,
            notes: [
              'Multiple rapid attempts to access financial data',
              'Using automated tools (curl)',
              'IP address not matching usual location'
            ],
            reviewedBy: 'security@laundrylobby.com',
            reviewedAt: new Date(Date.now() - 60000),
            resolution: 'Account temporarily suspended for security review'
          }
        },
        {
          _id: '3',
          timestamp: new Date(Date.now() - 600000),
          userId: 'user_456',
          userEmail: 'support@tenant.com',
          userName: 'Support User',
          userRole: 'Tenant Support',
          userType: 'tenant_support',
          attemptedAction: 'MODIFY_USER_ROLE',
          resource: 'User',
          resourceId: 'user_789',
          requiredPermission: 'users.roles.modify',
          currentPermissions: ['users.view', 'tickets.manage', 'orders.view'],
          denialReason: 'Support users cannot modify user roles',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'Delhi, India',
          tenantId: 'tenant_003',
          tenantName: 'Express Laundry',
          sessionId: 'sess_ghi789',
          riskScore: 3,
          context: {
            previousAttempts: 2,
            timeWindow: '2 hours',
            relatedAttempts: ['attempt_004'],
            suspiciousPattern: false
          },
          investigation: {
            flagged: false,
            reviewRequired: true,
            notes: [
              'Support user attempting role modification',
              'May need additional training on permissions'
            ]
          }
        }
      ]

      const mockStats = {
        totalDenials: 0,
        uniqueUsers: 45,
        highRiskAttempts: 12,
        flaggedForReview: 8,
        mostDeniedAction: 'DELETE_ORDER',
        mostTargetedResource: 'FinancialReport'
      }

      setDenials(mockDenials)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-700 bg-red-100'
    if (score >= 3) return 'text-orange-700 bg-orange-100'
    if (score >= 2) return 'text-yellow-700 bg-yellow-100'
    return 'text-green-700 bg-green-100'
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'superadmin': return 'text-purple-700 bg-purple-100'
      case 'platform_support': return 'text-blue-700 bg-blue-100'
      case 'platform_finance': return 'text-green-700 bg-green-100'
      case 'tenant_admin': return 'text-orange-700 bg-orange-100'
      case 'tenant_user': return 'text-gray-700 bg-gray-100'
      case 'tenant_support': return 'text-indigo-700 bg-indigo-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'order': return <Activity className="w-4 h-4" />
      case 'user': return <User className="w-4 h-4" />
      case 'financialreport': return <Shield className="w-4 h-4" />
      case 'settings': return <Settings className="w-4 h-4" />
      case 'tenant': return <Building2 className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }

  const getResourceColor = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'order': return 'text-blue-700 bg-blue-100'
      case 'user': return 'text-green-700 bg-green-100'
      case 'financialreport': return 'text-red-700 bg-red-100'
      case 'settings': return 'text-purple-700 bg-purple-100'
      case 'tenant': return 'text-orange-700 bg-orange-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Permission Denial Monitoring
            </h1>
            <p className="text-red-100 mt-2">
              Real-time tracking of unauthorized access attempts and permission violations
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Total Denials: {stats.totalDenials}</p>
            <p className="text-xs text-red-200">Security Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Total Denials</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.totalDenials}</p>
            </div>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Unique Users</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.uniqueUsers}</p>
            </div>
            <User className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">High Risk</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.highRiskAttempts}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Flagged</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.flaggedForReview}</p>
            </div>
            <Eye className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Top Action</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{stats.mostDeniedAction}</p>
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Top Resource</p>
              <p className="text-sm font-bold text-green-900 mt-1">{stats.mostTargetedResource}</p>
            </div>
            <Lock className="w-5 h-5 text-green-600" />
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
              placeholder="Search denials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk (4-5)</option>
            <option value="medium">Medium Risk (2-3)</option>
            <option value="low">Low Risk (1)</option>
          </select>

          <select
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All User Types</option>
            <option value="superadmin">Super Admin</option>
            <option value="platform_support">Platform Support</option>
            <option value="platform_finance">Platform Finance</option>
            <option value="tenant_admin">Tenant Admin</option>
            <option value="tenant_user">Tenant User</option>
            <option value="tenant_support">Tenant Support</option>
          </select>

          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Resources</option>
            <option value="Order">Orders</option>
            <option value="User">Users</option>
            <option value="FinancialReport">Financial Reports</option>
            <option value="Settings">Settings</option>
            <option value="Tenant">Tenants</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Permission Denials List */}
      <div className="space-y-4">
        {denials.map((denial) => (
          <div key={denial._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(denial.riskScore)}`}>
                    Risk: {denial.riskScore}/5
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(denial.userType)}`}>
                    {denial.userRole}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getResourceColor(denial.resource)}`}>
                    {getResourceIcon(denial.resource)}
                    <span className="ml-1">{denial.resource}</span>
                  </span>
                  {denial.investigation.flagged && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      FLAGGED
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{denial.userName}</h3>
                  <p className="text-sm text-gray-600">{denial.userEmail} • {denial.userId}</p>
                  {denial.tenantName && (
                    <p className="text-sm text-gray-500">Tenant: {denial.tenantName}</p>
                  )}
                </div>

                {/* Attempted Action */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attempted Action</h4>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-900">{denial.attemptedAction}</p>
                    <p className="text-sm text-red-700 mt-1">Required: <code className="bg-red-100 px-1 rounded">{denial.requiredPermission}</code></p>
                    <p className="text-sm text-red-600 mt-1">{denial.denialReason}</p>
                  </div>
                </div>

                {/* Current Permissions */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {denial.currentPermissions.map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Context & Investigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Context */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Context</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Previous attempts:</strong> {denial.context.previousAttempts} in {denial.context.timeWindow}</p>
                      <p><strong>IP Address:</strong> <code>{denial.ipAddress}</code></p>
                      <p><strong>Location:</strong> {denial.location || 'Unknown'}</p>
                      {denial.context.suspiciousPattern && (
                        <p className="text-red-600 font-medium mt-1">⚠️ Suspicious pattern detected</p>
                      )}
                    </div>
                  </div>

                  {/* Investigation */}
                  {denial.investigation.notes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Investigation</h4>
                      <div className="bg-blue-50 p-3 rounded-lg text-sm">
                        {denial.investigation.reviewedBy && (
                          <p className="text-blue-600 mb-1">
                            <strong>Reviewed by:</strong> {denial.investigation.reviewedBy}
                          </p>
                        )}
                        <div className="space-y-1">
                          {denial.investigation.notes.map((note, index) => (
                            <p key={index} className="text-blue-800">• {note}</p>
                          ))}
                        </div>
                        {denial.investigation.resolution && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-blue-900 font-medium">
                              <strong>Resolution:</strong> {denial.investigation.resolution}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>{denial.timestamp.toLocaleDateString()}</div>
                  <div>{denial.timestamp.toLocaleTimeString()}</div>
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

      {/* Security Summary */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1 mr-4" />
          <div>
            <h4 className="text-lg font-medium text-red-900">Security Analysis Summary</h4>
            <div className="text-sm text-red-800 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">🔒 Access Control Insights:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Most denied action: {stats.mostDeniedAction} (indicates training need)</li>
                  <li>Most targeted resource: {stats.mostTargetedResource} (high-value target)</li>
                  <li>{stats.highRiskAttempts} high-risk attempts require immediate attention</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">📊 Security Metrics:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>{stats.uniqueUsers} unique users involved in denials</li>
                  <li>{stats.flaggedForReview} cases flagged for security review</li>
                  <li>Permission system effectively blocking unauthorized access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}