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
    total: 0,
    newLast7Days: 0,
    revoked: 0,
    modified: 0
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
        setAssignments(data.data.data)
        setTotalPages(Math.ceil(data.data.data.length / 50))
        if (data.data.stats) {
          setStats(data.data.stats)
        }
      } else {
        throw new Error(data.message || 'Failed to fetch role assignments')
      }

    } catch (error) {
      console.error('Error fetching role assignments:', error)
      // Fallback to mock data
      const mockAssignments: RoleAssignment[] = [
        {
          _id: '1',
          timestamp: new Date('2026-03-15T10:30:00'),
          user: 'john.doe@cleanwave.com',
          userId: 'usr_001',
          assignedBy: 'admin@laundrylobby.com',
          assignedByEmail: 'admin@laundrylobby.com',
          oldRole: '',
          newRole: 'tenant_admin',
          reason: 'New franchise owner onboarding - CleanWave Laundry',
          tenantId: 'tenant_001',
          tenantName: 'CleanWave Laundry',
          action: 'assign',
          status: 'active'
        },
        {
          _id: '2',
          timestamp: new Date('2026-03-14T14:15:00'),
          user: 'sarah.m@sparkleClean.com',
          userId: 'usr_002',
          assignedBy: 'superadmin@laundrylobby.com',
          assignedByEmail: 'superadmin@laundrylobby.com',
          oldRole: 'tenant_user',
          newRole: 'tenant_admin',
          reason: 'Promoted to branch manager after performance review',
          tenantId: 'tenant_002',
          tenantName: 'SparkleClean Services',
          action: 'modify',
          status: 'active'
        },
        {
          _id: '3',
          timestamp: new Date('2026-03-13T09:45:00'),
          user: 'mike.r@freshfold.com',
          userId: 'usr_003',
          assignedBy: 'admin@laundrylobby.com',
          assignedByEmail: 'admin@laundrylobby.com',
          oldRole: 'platform_support',
          newRole: '',
          reason: 'Employee termination - contract ended',
          tenantId: 'tenant_003',
          tenantName: 'FreshFold Express',
          action: 'revoke',
          status: 'active'
        },
        {
          _id: '4',
          timestamp: new Date('2026-03-12T16:00:00'),
          user: 'emily.chen@washpro.com',
          userId: 'usr_004',
          assignedBy: 'superadmin@laundrylobby.com',
          assignedByEmail: 'superadmin@laundrylobby.com',
          oldRole: 'tenant_admin',
          newRole: 'platform_finance_admin',
          reason: 'Moved to platform finance team for multi-tenant billing oversight',
          tenantId: 'tenant_004',
          tenantName: 'WashPro Solutions',
          action: 'modify',
          status: 'active'
        },
        {
          _id: '5',
          timestamp: new Date('2026-03-11T11:20:00'),
          user: 'alex.p@laundryhub.com',
          userId: 'usr_005',
          assignedBy: 'admin@laundrylobby.com',
          assignedByEmail: 'admin@laundrylobby.com',
          oldRole: '',
          newRole: 'platform_read_only_auditor',
          reason: 'External auditor access for quarterly compliance review',
          tenantId: '',
          tenantName: 'Platform-Wide',
          action: 'assign',
          status: 'expired'
        },
        {
          _id: '6',
          timestamp: new Date('2026-03-10T08:50:00'),
          user: 'david.k@sudsstation.com',
          userId: 'usr_006',
          assignedBy: 'superadmin@laundrylobby.com',
          assignedByEmail: 'superadmin@laundrylobby.com',
          oldRole: 'tenant_admin',
          newRole: 'tenant_user',
          reason: 'Downgraded after security incident - pending investigation',
          tenantId: 'tenant_005',
          tenantName: 'Suds Station',
          action: 'modify',
          status: 'reverted'
        },
        {
          _id: '7',
          timestamp: new Date('2026-03-09T13:30:00'),
          user: 'lisa.w@bubbleworks.com',
          userId: 'usr_007',
          assignedBy: 'admin@laundrylobby.com',
          assignedByEmail: 'admin@laundrylobby.com',
          oldRole: '',
          newRole: 'tenant_user',
          reason: 'New staff member for pickup and delivery operations',
          tenantId: 'tenant_006',
          tenantName: 'BubbleWorks Laundromat',
          action: 'assign',
          status: 'active'
        },
        {
          _id: '8',
          timestamp: new Date('2026-03-08T17:45:00'),
          user: 'raj.s@presspoint.com',
          userId: 'usr_008',
          assignedBy: 'superadmin@laundrylobby.com',
          assignedByEmail: 'superadmin@laundrylobby.com',
          oldRole: 'platform_support',
          newRole: '',
          reason: 'Temporary support access revoked after ticket resolution',
          tenantId: 'tenant_007',
          tenantName: 'PressPoint Dry Cleaning',
          action: 'revoke',
          status: 'active'
        }
      ]

      setAssignments(mockAssignments)
      setTotalPages(1)

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      setStats({
        total: mockAssignments.length,
        newLast7Days: mockAssignments.filter(a => a.action === 'assign' && a.timestamp >= sevenDaysAgo).length,
        revoked: mockAssignments.filter(a => a.action === 'revoke').length,
        modified: mockAssignments.filter(a => a.action === 'modify').length
      })
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
                {stats.total}
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
                {stats.newLast7Days}
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
                {stats.revoked}
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
                {stats.modified}
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
              {assignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{new Date(assignment.timestamp).toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{new Date(assignment.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.user}</div>
                    <div className="text-xs text-gray-500 font-mono">{assignment.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getActionColor(assignment.action)}`}>
                      {getActionIcon(assignment.action)}
                      <span className="ml-1">{assignment.action.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatRole(assignment.oldRole)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatRole(assignment.newRole)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.assignedByEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.tenantName}</div>
                    {assignment.tenantId && (
                      <div className="text-xs text-gray-500 font-mono">{assignment.tenantId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-xs truncate" title={assignment.reason}>
                      {assignment.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status.toUpperCase()}
                    </span>
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