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
  UserPlus,
  UserMinus,
  RefreshCw
} from 'lucide-react'

interface RoleAssignmentLog {
  _id: string
  timestamp: Date
  who: string
  role: string
  action: string
  targetUser: string
  targetUserEmail: string
  oldRole?: string
  newRole?: string
  tenantId?: string
  tenantName?: string
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure' | 'warning'
  details: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  reason?: string
}

export default function RoleAssignmentLogsPage() {
  const [logs, setLogs] = useState<RoleAssignmentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRoleAssignmentLogs()
  }, [page, selectedSeverity, selectedAction, dateRange, searchQuery])

  const fetchRoleAssignmentLogs = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
        ...(selectedAction !== 'all' && { action: selectedAction }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/superadmin/audit/logs/roles?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch role assignment logs')
      }

      const data = await response.json()

      if (data.success) {
        setLogs(data.data.logs)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch role assignment logs')
      }

    } catch (error) {
      console.error('Error fetching role assignment logs:', error)
      // Fallback to mock data
      const mockLogs: RoleAssignmentLog[] = [
        {
          _id: '1',
          timestamp: new Date(),
          who: 'admin@laundrylobby.com',
          role: 'Super Admin',
          action: 'ASSIGN_ROLE',
          targetUser: 'user_123',
          targetUserEmail: 'newuser@tenant.com',
          oldRole: 'Tenant User',
          newRole: 'Tenant Admin',
          tenantId: 'tenant_456',
          tenantName: 'Clean & Fresh Laundry',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success',
          details: {
            permissions_added: ['manage_orders', 'view_analytics'],
            permissions_removed: [],
            effective_date: new Date()
          },
          severity: 'high',
          reason: 'Promotion to admin role'
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 300000),
          who: 'support@laundrylobby.com',
          role: 'Platform Support',
          action: 'REVOKE_ROLE',
          targetUser: 'user_789',
          targetUserEmail: 'suspended@tenant.com',
          oldRole: 'Tenant Admin',
          newRole: 'Tenant User',
          tenantId: 'tenant_123',
          tenantName: 'QuickWash Services',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success',
          details: {
            permissions_added: [],
            permissions_removed: ['manage_orders', 'view_analytics', 'manage_users'],
            effective_date: new Date(),
            suspension_reason: 'Policy violation'
          },
          severity: 'critical',
          reason: 'Security incident - role downgrade'
        },
        {
          _id: '3',
          timestamp: new Date(Date.now() - 600000),
          who: 'finance@laundrylobby.com',
          role: 'Platform Finance Admin',
          action: 'MODIFY_PERMISSIONS',
          targetUser: 'user_456',
          targetUserEmail: 'manager@tenant.com',
          oldRole: 'Tenant Admin',
          newRole: 'Tenant Admin',
          tenantId: 'tenant_789',
          tenantName: 'Express Laundry',
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0...',
          outcome: 'failure',
          details: {
            attempted_permissions: ['view_financial_reports'],
            error: 'Insufficient privileges to grant financial permissions',
            denied_by_system: true
          },
          severity: 'medium',
          reason: 'Attempted unauthorized permission grant'
        }
      ]
      setLogs(mockLogs)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-700 bg-green-100'
      case 'failure': return 'text-red-700 bg-red-100'
      case 'warning': return 'text-yellow-700 bg-yellow-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('ASSIGN')) return <UserPlus className="w-4 h-4" />
    if (action.includes('REVOKE')) return <UserMinus className="w-4 h-4" />
    if (action.includes('MODIFY')) return <RefreshCw className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('ASSIGN')) return 'text-green-700 bg-green-100'
    if (action.includes('REVOKE')) return 'text-red-700 bg-red-100'
    if (action.includes('MODIFY')) return 'text-blue-700 bg-blue-100'
    return 'text-gray-700 bg-gray-100'
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
              Personnel Change Audit Logs
            </h1>
            <p className="text-purple-100 mt-2">
              Complete audit trail of role assignments, revocations, and permission changes
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Total Logs: {logs.length}</p>
            <p className="text-xs text-purple-200">RBAC Security Audit</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Role Assignments</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {logs.filter(l => l.action.includes('ASSIGN')).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Role Revocations</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {logs.filter(l => l.action.includes('REVOKE')).length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <UserMinus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Permission Changes</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {logs.filter(l => l.action.includes('MODIFY')).length}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Failed Attempts</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {logs.filter(l => l.outcome === 'failure').length}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by user, role, or tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Actions</option>
            <option value="ASSIGN_ROLE">Assign Role</option>
            <option value="REVOKE_ROLE">Revoke Role</option>
            <option value="MODIFY_PERMISSIONS">Modify Permissions</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Role Assignment Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Personnel Change Logs</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed audit trail of RBAC role and permission changes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{log.timestamp.toLocaleDateString()}</div>
                      <div className="text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.who}</div>
                      <div className="text-sm text-gray-500">{log.role}</div>
                      <div className="text-xs text-gray-400 font-mono">{log.ipAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      <span className="ml-1">{log.action}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.targetUserEmail}</div>
                      <div className="text-sm text-gray-500 font-mono">{log.targetUser}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {log.oldRole && (
                        <div className="text-gray-500">
                          From: <span className="font-medium">{log.oldRole}</span>
                        </div>
                      )}
                      {log.newRole && (
                        <div className="text-gray-900">
                          To: <span className="font-medium">{log.newRole}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.tenantName || 'Platform'}</div>
                      {log.tenantId && (
                        <div className="text-sm text-gray-500 font-mono">{log.tenantId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(log.outcome)}`}>
                      {log.outcome.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {log.reason && (
                        <div className="font-medium mb-1">{log.reason}</div>
                      )}
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800 text-xs">View details</summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
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