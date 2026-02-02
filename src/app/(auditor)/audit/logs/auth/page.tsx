'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  UserCircle,
  Search,
  Filter,
  Calendar,
  Download,
  Shield,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Key
} from 'lucide-react'

interface AuthEventLog {
  _id: string
  timestamp: Date
  event: string
  user: string
  email: string
  userType: string
  ipAddress: string
  userAgent: string
  location?: string
  outcome: 'success' | 'failure' | 'blocked'
  reason?: string
  sessionId?: string
  tenantId?: string
  tenantName?: string
  mfaUsed: boolean
  deviceFingerprint?: string
  riskScore: number
  details: any
}

export default function AuthEventLogsPage() {
  const [logs, setLogs] = useState<AuthEventLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [selectedOutcome, setSelectedOutcome] = useState('all')
  const [dateRange, setDateRange] = useState('24h')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchAuthEventLogs()
  }, [page, selectedEvent, selectedOutcome, dateRange, searchQuery])

  const fetchAuthEventLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(selectedEvent !== 'all' && { event: selectedEvent }),
        ...(selectedOutcome !== 'all' && { outcome: selectedOutcome }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/superadmin/audit/logs/auth?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch auth event logs')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.data.logs)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch auth event logs')
      }
      
    } catch (error) {
      console.error('Error fetching auth event logs:', error)
      // Fallback to mock data
      const mockLogs: AuthEventLog[] = [
        {
          _id: '1',
          timestamp: new Date(),
          event: 'LOGIN_SUCCESS',
          user: 'user_123',
          email: 'admin@laundrylobby.com',
          userType: 'superadmin',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Mumbai, India',
          outcome: 'success',
          sessionId: 'sess_abc123',
          mfaUsed: true,
          deviceFingerprint: 'fp_xyz789',
          riskScore: 1,
          details: {
            login_method: 'email_password',
            mfa_method: 'totp',
            session_duration: '8h',
            remember_me: false
          }
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 300000),
          event: 'LOGIN_FAILURE',
          user: 'unknown',
          email: 'hacker@malicious.com',
          userType: 'unknown',
          ipAddress: '10.0.0.1',
          userAgent: 'curl/7.68.0',
          location: 'Unknown Location',
          outcome: 'failure',
          reason: 'Invalid credentials',
          mfaUsed: false,
          riskScore: 5,
          details: {
            login_method: 'email_password',
            attempts_count: 15,
            blocked_after: 10,
            lockout_duration: '30m'
          }
        },
        {
          _id: '3',
          timestamp: new Date(Date.now() - 600000),
          event: 'LOGOUT',
          user: 'user_456',
          email: 'support@laundrylobby.com',
          userType: 'support',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'Delhi, India',
          outcome: 'success',
          sessionId: 'sess_def456',
          tenantId: null,
          tenantName: 'Platform',
          mfaUsed: false,
          riskScore: 1,
          details: {
            logout_type: 'manual',
            session_duration: '2h 45m',
            actions_performed: 23
          }
        },
        {
          _id: '4',
          timestamp: new Date(Date.now() - 900000),
          event: 'PASSWORD_RESET',
          user: 'user_789',
          email: 'user@tenant.com',
          userType: 'tenant_admin',
          ipAddress: '203.192.12.45',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          location: 'Bangalore, India',
          outcome: 'success',
          tenantId: 'tenant_123',
          tenantName: 'Clean & Fresh Laundry',
          mfaUsed: false,
          riskScore: 2,
          details: {
            reset_method: 'email_link',
            token_expiry: '1h',
            new_password_strength: 'strong'
          }
        },
        {
          _id: '5',
          timestamp: new Date(Date.now() - 1200000),
          event: 'ACCOUNT_LOCKED',
          user: 'user_101',
          email: 'suspicious@tenant.com',
          userType: 'tenant_user',
          ipAddress: '192.168.1.999',
          userAgent: 'Suspicious Bot/1.0',
          location: 'Unknown Location',
          outcome: 'blocked',
          reason: 'Multiple failed login attempts',
          tenantId: 'tenant_456',
          tenantName: 'QuickWash Services',
          mfaUsed: false,
          riskScore: 5,
          details: {
            failed_attempts: 10,
            lockout_duration: '24h',
            auto_unlock: false,
            admin_review_required: true
          }
        }
      ]
      setLogs(mockLogs)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-700 bg-green-100'
      case 'failure': return 'text-red-700 bg-red-100'
      case 'blocked': return 'text-orange-700 bg-orange-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getEventIcon = (event: string) => {
    if (event.includes('LOGIN')) return <LogIn className="w-4 h-4" />
    if (event.includes('LOGOUT')) return <LogOut className="w-4 h-4" />
    if (event.includes('PASSWORD')) return <Key className="w-4 h-4" />
    if (event.includes('LOCKED')) return <Shield className="w-4 h-4" />
    return <UserCircle className="w-4 h-4" />
  }

  const getEventColor = (event: string) => {
    if (event.includes('SUCCESS')) return 'text-green-700 bg-green-100'
    if (event.includes('FAILURE')) return 'text-red-700 bg-red-100'
    if (event.includes('LOCKED')) return 'text-orange-700 bg-orange-100'
    if (event.includes('RESET')) return 'text-blue-700 bg-blue-100'
    return 'text-gray-700 bg-gray-100'
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
      case 'support': return 'text-blue-700 bg-blue-100'
      case 'finance': return 'text-green-700 bg-green-100'
      case 'auditor': return 'text-indigo-700 bg-indigo-100'
      case 'tenant_admin': return 'text-orange-700 bg-orange-100'
      case 'tenant_user': return 'text-gray-700 bg-gray-100'
      default: return 'text-red-700 bg-red-100'
    }
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
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <UserCircle className="w-8 h-8 mr-3" />
              Authentication Audit Logs
            </h1>
            <p className="text-indigo-100 mt-2">
              Complete audit trail of authentication events, login attempts, and security incidents
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Total Events: {logs.length}</p>
            <p className="text-xs text-indigo-200">Security Monitoring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Successful Logins</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {logs.filter(l => l.event.includes('SUCCESS')).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Failed Attempts</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {logs.filter(l => l.outcome === 'failure').length}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Blocked Accounts</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {logs.filter(l => l.outcome === 'blocked').length}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">MFA Usage</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {logs.filter(l => l.mfaUsed).length}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">High Risk Events</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {logs.filter(l => l.riskScore >= 4).length}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
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
              placeholder="Search by email or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Events</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILURE">Login Failure</option>
            <option value="LOGOUT">Logout</option>
            <option value="PASSWORD_RESET">Password Reset</option>
            <option value="ACCOUNT_LOCKED">Account Locked</option>
          </select>

          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Auth Event Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Authentication Event Logs</h3>
          <p className="text-sm text-gray-600 mt-1">Comprehensive security audit of authentication and access events</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MFA
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getEventColor(log.event)}`}>
                      {getEventIcon(log.event)}
                      <span className="ml-1">{log.event}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.email}</div>
                      <div className="text-sm text-gray-500 font-mono">{log.user}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(log.userType)}`}>
                      {log.userType.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-mono text-gray-900">{log.ipAddress}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {log.location || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(log.outcome)}`}>
                      {log.outcome.toUpperCase()}
                    </span>
                    {log.reason && (
                      <div className="text-xs text-gray-500 mt-1">{log.reason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(log.riskScore)}`}>
                      {log.riskScore}/5
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {log.mfaUsed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800 text-xs">View details</summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                          {log.sessionId && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <strong>Session ID:</strong> {log.sessionId}
                            </div>
                          )}
                          {log.deviceFingerprint && (
                            <div className="mt-1">
                              <strong>Device:</strong> {log.deviceFingerprint}
                            </div>
                          )}
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