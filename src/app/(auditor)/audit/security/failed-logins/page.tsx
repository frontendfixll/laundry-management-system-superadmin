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
  AlertTriangle,
  Eye,
  Clock,
  MapPin,
  Monitor,
  Ban
} from 'lucide-react'

interface FailedLoginAttempt {
  _id: string
  timestamp: Date
  email: string
  ipAddress: string
  userAgent: string
  attempts: number
  blocked: boolean
  location?: string
  reason: string
  tenantId?: string
  tenantName?: string
}

export default function FailedLoginsPage() {
  const [failedLogins, setFailedLogins] = useState<FailedLoginAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('24h')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchFailedLogins()
  }, [page, selectedStatus, dateRange, searchQuery])

  const fetchFailedLogins = async () => {
    try {
      setLoading(true)
      
      const params: any = {
        page,
        limit: 50
      }
      
      if (selectedStatus !== 'all') params.status = selectedStatus
      if (searchQuery) params.search = searchQuery
      
      const data = await superAdminApi.get(`/audit/security/failed-logins?${new URLSearchParams(params)}`)
      
      if (data.success) {
        setFailedLogins(data.data.data)
        setTotalPages(Math.ceil(data.data.data.length / 50))
        
        console.log('✅ Successfully loaded real failed logins data')
      } else {
        throw new Error(data.message || 'Failed to fetch failed login attempts')
      }
      
    } catch (error) {
      console.error('❌ Error fetching failed login attempts:', error)
      
      // Show empty state instead of mock data
      setFailedLogins([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (blocked: boolean, attempts: number) => {
    if (blocked) return 'text-red-700 bg-red-100'
    if (attempts >= 10) return 'text-orange-700 bg-orange-100'
    if (attempts >= 5) return 'text-yellow-700 bg-yellow-100'
    return 'text-blue-700 bg-blue-100'
  }

  const getRiskLevel = (attempts: number, blocked: boolean) => {
    if (blocked || attempts >= 20) return 'Critical'
    if (attempts >= 10) return 'High'
    if (attempts >= 5) return 'Medium'
    return 'Low'
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'text-red-700 bg-red-100'
      case 'High': return 'text-orange-700 bg-orange-100'
      case 'Medium': return 'text-yellow-700 bg-yellow-100'
      case 'Low': return 'text-green-700 bg-green-100'
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
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Failed Login Attempts
            </h1>
            <p className="text-red-100 mt-2">
              Security monitoring of failed authentication attempts across the platform
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Total Attempts: {failedLogins.length}</p>
            <p className="text-xs text-red-200">Security Audit</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Blocked IPs</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {failedLogins.filter(f => f.blocked).length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <Ban className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">High Risk</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {failedLogins.filter(f => f.attempts >= 10).length}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Total Attempts</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {failedLogins.reduce((sum, f) => sum + f.attempts, 0)}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Unique IPs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {new Set(failedLogins.map(f => f.ipAddress)).size}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
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
              placeholder="Search by email or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="blocked">Blocked</option>
            <option value="active">Active</option>
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
            Export Report
          </button>
        </div>
      </div>

      {/* Failed Logins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Failed Login Attempts</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed security audit of authentication failures</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Agent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {failedLogins.map((attempt) => {
                const riskLevel = getRiskLevel(attempt.attempts, attempt.blocked)
                return (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{attempt.timestamp.toLocaleDateString()}</div>
                        <div className="text-gray-500">{attempt.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{attempt.email}</div>
                      <div className="text-sm text-gray-500">{attempt.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{attempt.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {attempt.location || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{attempt.attempts}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}>
                        {riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attempt.blocked, attempt.attempts)}`}>
                        {attempt.blocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{attempt.tenantName || 'Platform'}</div>
                        {attempt.tenantId && (
                          <div className="text-sm text-gray-500 font-mono">{attempt.tenantId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={attempt.userAgent}>
                        <Monitor className="w-4 h-4 inline mr-1 text-gray-400" />
                        {attempt.userAgent}
                      </div>
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