'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  UserPlus,
  Search,
  Filter,
  Calendar,
  Download,
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  TrendingUp
} from 'lucide-react'

interface RoleAssignment {
  _id: string
  timestamp: Date
  user: string
  userId: string
  assignedBy: string
  assignedByEmail: string
  oldRole: string
  newRole: string
  reason: string
  tenantId: string
  tenantName: string
  action: 'assign' | 'revoke' | 'modify'
  status: 'active' | 'reverted' | 'expired'
}

export default function RBACAssignmentsPage() {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalAssignments: 0,
    newAssignments: 0,
    revokedRoles: 0,
    modifiedRoles: 0
  })

  useEffect(() => {
    fetchAssignments()
  }, [page, selectedAction, dateRange, searchQuery])

  const fetchAssignments = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(selectedAction !== 'all' && { action: selectedAction }),
        ...(dateRange !== 'all' && { dateRange: dateRange }),
        ...(searchQuery && { search: searchQuery })
      })

      const data = await superAdminApi.get(`/audit/rbac/assignments?${params}`)

      if (data.success) {
        const records = data.data?.data || data.data || []
        const recordsArr = Array.isArray(records) ? records : []
        setAssignments(recordsArr)
        setTotalPages(Math.ceil(recordsArr.length / 50))

        // Calculate stats from real data
        const now = Date.now()
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
        const assignActions = ['ASSIGN_ROLE', 'CREATE_PLATFORM_USER']
        const revokeActions = ['REVOKE_ROLE', 'DELETE_PLATFORM_USER']
        const modifyActions = ['UPDATE_PERMISSIONS', 'UPDATE_PLATFORM_USER', 'UPDATE_ROLE']
        setStats({
          totalAssignments: recordsArr.length,
          newAssignments: recordsArr.filter((r: any) => new Date(r.timestamp).getTime() > sevenDaysAgo).length,
          revokedRoles: recordsArr.filter((r: any) => revokeActions.includes(r.action)).length,
          modifiedRoles: recordsArr.filter((r: any) => modifyActions.includes(r.action)).length
        })
      } else {
        throw new Error(data.message || 'Failed to fetch role assignments')
      }

    } catch (error) {
      console.error('Error fetching role assignments:', error)
      setAssignments([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'assign': return 'text-green-700 bg-green-100'
      case 'revoke': return 'text-red-700 bg-red-100'
      case 'modify': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'assign': return <ShieldCheck className="w-4 h-4" />
      case 'revoke': return <ShieldOff className="w-4 h-4" />
      case 'modify': return <ArrowRightLeft className="w-4 h-4" />
      default: return <ShieldAlert className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100'
      case 'reverted': return 'text-orange-700 bg-orange-100'
      case 'expired': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3 inline mr-1" />
      case 'reverted': return <ArrowRightLeft className="w-3 h-3 inline mr-1" />
      case 'expired': return <Clock className="w-3 h-3 inline mr-1" />
      default: return <XCircle className="w-3 h-3 inline mr-1" />
    }
  }

  const formatRole = (role: string) => {
    if (!role) return <span className="text-gray-400 italic">None</span>
    return <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{role}</code>
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
              <UserPlus className="w-8 h-8 mr-3" />
              RBAC Assignment History
            </h1>
            <p className="text-purple-100 mt-2">
              Complete audit trail of role assignments, revocations, and modifications across all tenants
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Total Entries: {assignments.length}</p>
            <p className="text-xs text-purple-200">Assignment Audit</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Total Assignments</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {stats.totalAssignments}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">New Assignments (7d)</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats.newAssignments}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Revoked</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {stats.revokedRoles}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <ShieldOff className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Modified</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {stats.modifiedRoles}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-white" />
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
              placeholder="Search by user, role, tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Actions</option>
            <option value="assign">Assign</option>
            <option value="revoke">Revoke</option>
            <option value="modify">Modify</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Assignments
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Assignment Records</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed audit trail of all RBAC role assignment changes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Old Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment: any) => {
                // Map AuditLog fields to display fields
                const user = assignment.user || assignment.who || assignment.details?.email || '-'
                const userId = assignment.userId || assignment.entityId || ''
                const action = assignment.action || 'UNKNOWN'
                const oldRole = assignment.oldRole || assignment.beforeState?.role || assignment.details?.oldRole || ''
                const newRole = assignment.newRole || assignment.afterState?.role || assignment.details?.newRole || assignment.details?.roles?.[0] || ''
                const assignedBy = assignment.assignedByEmail || assignment.who || '-'
                const tenantName = assignment.tenantName || assignment.tenantId?.businessName || 'Platform'
                const tenantIdStr = typeof assignment.tenantId === 'object' ? assignment.tenantId?._id : assignment.tenantId
                const reason = assignment.reason || assignment.details?.reason || assignment.details?.description || '-'
                const status = assignment.status || assignment.outcome || 'success'
                return (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(assignment.timestamp).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs">{new Date(assignment.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user}</div>
                      {userId && <div className="text-xs text-gray-500 font-mono">{userId}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getActionColor(action)}`}>
                        {getActionIcon(action)}
                        <span className="ml-1">{action.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatRole(oldRole)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatRole(newRole)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenantName}</div>
                      {tenantIdStr && <div className="text-xs text-gray-500 font-mono">{tenantIdStr}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={reason}>
                        {reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )
              })}
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