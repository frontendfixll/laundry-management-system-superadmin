'use client'

import { useState, useEffect } from 'react'
import { 
  Key,
  Search,
  User,
  Mail,
  Phone,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  EyeOff,
  Copy,
  Download,
  Building2,
  Calendar,
  Shield,
  Lock,
  Unlock
} from 'lucide-react'

interface PasswordResetRequest {
  id: string
  userId: string
  user: {
    name: string
    email: string
    phone: string
    role: string
    tenancy?: {
      name: string
      slug: string
    }
  }
  resetMethod: 'email' | 'sms' | 'admin_override' | 'security_questions'
  status: 'pending' | 'sent' | 'used' | 'expired' | 'failed'
  resetToken?: string
  resetExpiry?: string
  temporaryPassword?: string
  requestedBy: 'user' | 'tenant_admin' | 'platform_support'
  reason: string
  ipAddress: string
  userAgent: string
  usedAt?: string
  createdAt: string
  updatedAt: string
  securityLog?: {
    previousLoginAttempts: number
    lastSuccessfulLogin?: string
    suspiciousActivity: boolean
  }
}

interface ResetStats {
  total: number
  pending: number
  successful: number
  expired: number
  failed: number
  byMethod: Record<string, number>
  avgResponseTime: string
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [stats, setStats] = useState<ResetStats>({
    total: 0,
    pending: 0,
    successful: 0,
    expired: 0,
    failed: 0,
    byMethod: {},
    avgResponseTime: '0m'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    loadPasswordResets()
  }, [methodFilter, statusFilter])

  const loadPasswordResets = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (methodFilter !== 'all') params.append('method', methodFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/support/users/password-reset-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch password reset requests')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.data.requests || [])
        setStats(data.data.stats || {
          total: 0,
          pending: 0,
          successful: 0,
          expired: 0,
          failed: 0,
          byMethod: {},
          avgResponseTime: '0m'
        })
      } else {
        throw new Error(data.message || 'Failed to load password reset requests')
      }
    } catch (error) {
      console.error('Error loading password resets:', error)
      // Fallback to mock data on error
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockRequests: PasswordResetRequest[] = [
      {
        id: '1',
        userId: 'user_001',
        user: {
          name: 'Rajesh Kumar',
          email: 'rajesh@cleanwash.com',
          phone: '+91 98765 43210',
          role: 'tenant_admin',
          tenancy: {
            name: 'CleanWash Laundry',
            slug: 'cleanwash'
          }
        },
        resetMethod: 'email',
        status: 'sent',
        resetToken: 'rst_1234567890abcdef',
        resetExpiry: '2026-01-27T13:30:00Z',
        requestedBy: 'user',
        reason: 'Forgot password',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2026-01-27T12:30:00Z',
        updatedAt: '2026-01-27T12:30:00Z',
        securityLog: {
          previousLoginAttempts: 3,
          lastSuccessfulLogin: '2026-01-25T09:15:00Z',
          suspiciousActivity: false
        }
      },
      {
        id: '2',
        userId: 'user_002',
        user: {
          name: 'Priya Sharma',
          email: 'priya@quickclean.in',
          phone: '+91 87654 32109',
          role: 'tenant_staff',
          tenancy: {
            name: 'QuickClean Services',
            slug: 'quickclean'
          }
        },
        resetMethod: 'admin_override',
        status: 'used',
        temporaryPassword: 'TempPass123!',
        requestedBy: 'platform_support',
        reason: 'Account locked, emergency access needed',
        ipAddress: '103.21.58.66',
        userAgent: 'Support Dashboard',
        usedAt: '2026-01-27T11:45:00Z',
        createdAt: '2026-01-27T11:00:00Z',
        updatedAt: '2026-01-27T11:45:00Z',
        securityLog: {
          previousLoginAttempts: 5,
          lastSuccessfulLogin: '2026-01-24T16:30:00Z',
          suspiciousActivity: true
        }
      },
      {
        id: '3',
        userId: 'user_003',
        user: {
          name: 'Amit Singh',
          email: 'amit@express.com',
          phone: '+91 76543 21098',
          role: 'customer'
        },
        resetMethod: 'sms',
        status: 'pending',
        resetToken: 'rst_sms_9876543210',
        resetExpiry: '2026-01-27T13:15:00Z',
        requestedBy: 'user',
        reason: 'Cannot access email',
        ipAddress: '157.32.45.78',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        createdAt: '2026-01-27T12:15:00Z',
        updatedAt: '2026-01-27T12:15:00Z',
        securityLog: {
          previousLoginAttempts: 1,
          lastSuccessfulLogin: '2026-01-26T20:45:00Z',
          suspiciousActivity: false
        }
      },
      {
        id: '4',
        userId: 'user_004',
        user: {
          name: 'Sneha Patel',
          email: 'sneha@freshlaundry.com',
          phone: '+91 65432 10987',
          role: 'tenant_admin',
          tenancy: {
            name: 'Fresh Laundry Co',
            slug: 'freshlaundry'
          }
        },
        resetMethod: 'email',
        status: 'expired',
        resetToken: 'rst_expired_abcd1234',
        resetExpiry: '2026-01-26T18:30:00Z',
        requestedBy: 'user',
        reason: 'Password forgotten',
        ipAddress: '45.123.67.89',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: '2026-01-26T17:30:00Z',
        updatedAt: '2026-01-26T18:30:00Z',
        securityLog: {
          previousLoginAttempts: 2,
          lastSuccessfulLogin: '2026-01-24T14:20:00Z',
          suspiciousActivity: false
        }
      }
    ]

    setRequests(mockRequests)
    
    const totalRequests = mockRequests.length
    const pending = mockRequests.filter(req => req.status === 'pending' || req.status === 'sent').length
    const successful = mockRequests.filter(req => req.status === 'used').length
    const expired = mockRequests.filter(req => req.status === 'expired').length
    const failed = mockRequests.filter(req => req.status === 'failed').length

    setStats({
      total: totalRequests,
      pending,
      successful,
      expired,
      failed,
      byMethod: {
        email: mockRequests.filter(req => req.resetMethod === 'email').length,
        sms: mockRequests.filter(req => req.resetMethod === 'sms').length,
        admin_override: mockRequests.filter(req => req.resetMethod === 'admin_override').length,
        security_questions: mockRequests.filter(req => req.resetMethod === 'security_questions').length
      },
      avgResponseTime: '2.5m'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'used': return 'bg-green-100 text-green-700'
      case 'expired': return 'bg-red-100 text-red-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'used': return <CheckCircle className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <Phone className="w-4 h-4" />
      case 'admin_override': return <Shield className="w-4 h-4" />
      case 'security_questions': return <Key className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handlePasswordAction = async (requestId: string, action: 'generate' | 'resend' | 'expire') => {
    try {
      const method = 'POST'
      
      const response = await fetch(`/api/support/users/password-reset-requests/${requestId}/${action}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'email', // Default method
          reason: `${action} by platform support`
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} password reset`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Reload the requests to get updated data
        await loadPasswordResets()
        alert(`Password reset ${action}ed successfully`)
      } else {
        throw new Error(data.message || `Failed to ${action} password reset`)
      }
    } catch (error) {
      console.error(`Error ${action}ing password reset:`, error)
      alert(`Failed to ${action} password reset: ${error.message}`)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.phone.includes(searchTerm) ||
                         request.user.tenancy?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMethod = methodFilter === 'all' || request.resetMethod === methodFilter
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesMethod && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-1">
            Manage password reset requests and generate temporary passwords
          </p>
        </div>
        
        <button 
          onClick={loadPasswordResets}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Requests</p>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-xs">Password resets</p>
            </div>
            <Key className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-yellow-100 text-xs">Awaiting action</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Successful</p>
              <p className="text-3xl font-bold">{stats.successful}</p>
              <p className="text-green-100 text-xs">Completed resets</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Expired/Failed</p>
              <p className="text-3xl font-bold">{stats.expired + stats.failed}</p>
              <p className="text-red-100 text-xs">Need attention</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Reset Method Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reset Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.byMethod).map(([method, count]) => (
            <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getMethodIcon(method)}
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {method.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">{count} requests</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, phone, tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="admin_override">Admin Override</option>
              <option value="security_questions">Security Questions</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Password Reset Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Password Reset Requests ({filteredRequests.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
              </button>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(request.resetMethod)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {request.resetMethod.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status.toUpperCase()}</span>
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        By: {request.requestedBy.replace('_', ' ')}
                      </span>
                      {request.securityLog?.suspiciousActivity && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Suspicious</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">User</p>
                        <p className="font-medium text-gray-900">{request.user.name}</p>
                        <p className="text-xs text-gray-500">{request.user.email}</p>
                        <p className="text-xs text-gray-500">{request.user.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Role & Tenant</p>
                        <p className="font-medium text-gray-900 capitalize">{request.user.role.replace('_', ' ')}</p>
                        {request.user.tenancy && (
                          <p className="text-xs text-gray-500">{request.user.tenancy.name}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Security Info</p>
                        <p className="text-xs text-gray-900">
                          Failed attempts: {request.securityLog?.previousLoginAttempts || 0}
                        </p>
                        {request.securityLog?.lastSuccessfulLogin && (
                          <p className="text-xs text-gray-500">
                            Last login: {new Date(request.securityLog.lastSuccessfulLogin).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {request.temporaryPassword && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Temporary Password</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900">
                            {showPasswords ? request.temporaryPassword : '••••••••••'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(request.temporaryPassword!)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="text-sm text-gray-900">{request.reason}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {new Date(request.createdAt).toLocaleString()}</span>
                      </span>
                      {request.resetExpiry && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {new Date(request.resetExpiry).toLocaleString()}</span>
                        </span>
                      )}
                      {request.usedAt && (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Used: {new Date(request.usedAt).toLocaleString()}</span>
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        IP: {request.ipAddress}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {(request.status === 'pending' || request.status === 'sent') && (
                      <>
                        <button
                          onClick={() => handlePasswordAction(request.id, 'generate')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <Key className="w-3 h-3" />
                          <span>Generate</span>
                        </button>
                        <button
                          onClick={() => handlePasswordAction(request.id, 'resend')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Resend</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handlePasswordAction(request.id, 'expire')}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Expire</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No password reset requests found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Key className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Generate</p>
                <p className="text-sm text-gray-500">Generate temp passwords</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Resend Links</p>
                <p className="text-sm text-gray-500">Resend reset emails</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Suspicious</p>
                <p className="text-sm text-gray-500">Check flagged requests</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Report</p>
                <p className="text-sm text-gray-500">Download reset data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}