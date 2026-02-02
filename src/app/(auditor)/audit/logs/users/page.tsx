'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Users,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface UserAuditLog {
  _id: string
  timestamp: Date
  who: string
  role: string
  action: string
  entity: string
  entityId: string
  tenantId?: string
  tenantName?: string
  ipAddress: string
  userAgent: string
  outcome: 'success' | 'failure' | 'warning'
  details: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function UserAuditLogsPage() {
  const [logs, setLogs] = useState<UserAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUserAuditLogs()
  }, [page, selectedSeverity, selectedAction, dateRange, searchQuery])

  const fetchUserAuditLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
        ...(selectedAction !== 'all' && { action: selectedAction }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/superadmin/audit/logs/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user audit logs')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data.logs)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch user audit logs')
      }
      
    } catch (error) {
      console.error('Error fetching user audit logs:', error)
      // Fallback to mock data
      const mockLogs: UserAuditLog[] = [
        {
          _id: '1',
          timestamp: new Date(),
          who: 'admin@laundrylobby.com',
          role: 'Super Admin',
          action: 'CREATE_USER',
          entity: 'User',
          entityId: 'user_123',
          tenantId: 'tenant_456',
          tenantName: 'Clean & Fresh Laundry',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success',
          details: { email: 'newuser@tenant.com', role: 'admin' },
          severity: 'medium'
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 300000),
          who: 'support@laundrylobby.com',
          role: 'Platform Support',
          action: 'UPDATE_USER_STATUS',
          entity: 'User',
          entityId: 'user_789',
          tenantId: 'tenant_123',
          tenantName: 'QuickWash Services',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          outcome: 'success',
          details: { oldStatus: 'active', newStatus: 'suspended', reason: 'Policy violation' },
          severity: 'high'
        },
        {
          _id: '3',
          timestamp: new Date(Date.now() - 600000),
          who: 'finance@laundrylobby.com',
          role: 'Platform Finance Admin',
          action: 'DELETE_USER',
          entity: 'User',
          entityId: 'user_456',
          tenantId: 'tenant_789',
          tenantName: 'Express Laundry',
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0...',
          outcome: 'failure',
          details: { reason: 'User has active orders', error: 'Cannot delete user with pending transactions' },
          severity: 'medium'
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
    if (action.includes('CREATE')) return <Users className="w-4 h-4" />
    if (action.includes('UPDATE')) return <RefreshCw className="w-4 h-4" />
    if (action.includes('DELETE')) return <AlertTriangle className="w-4 h-4" />
    return <Eye className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
              <Users className="w-8 h-8 mr-3" />
              User Action Audit Logs
            </h1>
            <p className="text-blue-100 mt-2">
              Complete audit trail of all user-related actions across the platform
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Logs: {logs.length}</p>
            <p className="text-xs text-blue-200">Read-Only Access</p>
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
              placeholder="Search by user, action, or tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="CREATE_USER">Create User</option>
            <option value="UPDATE_USER">Update User</option>
            <option value="DELETE_USER">Delete User</option>
            <option value="SUSPEND_USER">Suspend User</option>
            <option value="ACTIVATE_USER">Activate User</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">User Action Logs</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed audit trail of user management activities</p>
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
                    <div className="flex items-center">
                      <div className="text-blue-600 mr-2">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.entity}</div>
                      <div className="text-sm text-gray-500 font-mono">{log.entityId}</div>
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
                      <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
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