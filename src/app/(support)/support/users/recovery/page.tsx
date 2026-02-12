'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  Shield,
  Search,
  User,
  Mail,
  Phone,
  Key,
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
  Activity
} from 'lucide-react'

interface RecoveryRequest {
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
  requestType: 'password_reset' | 'account_unlock' | 'email_verification' | 'phone_verification'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  requestedBy: 'user' | 'tenant_admin' | 'platform_support'
  reason: string
  verificationMethod: 'email' | 'phone' | 'manual' | 'admin_override'
  verificationCode?: string
  verificationExpiry?: string
  completedBy?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

interface RecoveryStats {
  total: number
  pending: number
  completed: number
  failed: number
  byType: Record<string, number>
  avgResolutionTime: string
}

export default function AccountRecoveryPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<RecoveryRequest[]>([])
  const [stats, setStats] = useState<RecoveryStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    byType: {},
    avgResolutionTime: '0h'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<RecoveryRequest | null>(null)
  const [showVerificationCode, setShowVerificationCode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecoveryRequests()
  }, [typeFilter, statusFilter])

  const loadRecoveryRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await api.get(`/support/users/recovery-requests?${params}`)
      const data = response.data
      const payload = data?.data || data

      setRequests(payload?.requests || [])
      setStats(payload?.stats || {
        total: 0,
        pending: 0,
        completed: 0,
        failed: 0,
        byType: {},
        avgResolutionTime: '0h'
      })
    } catch (err: any) {
      console.error('Error loading recovery requests:', err)
      setError(err?.response?.data?.message || 'Failed to load recovery requests')
      setRequests([])
      setStats({ total: 0, pending: 0, completed: 0, failed: 0, byType: {}, avgResolutionTime: '0h' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <RefreshCw className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'password_reset': return <Key className="w-4 h-4" />
      case 'account_unlock': return <Shield className="w-4 h-4" />
      case 'email_verification': return <Mail className="w-4 h-4" />
      case 'phone_verification': return <Phone className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleRecoveryAction = async (requestId: string, action: 'approve' | 'reject' | 'resend') => {
    try {
      const endpoint = action === 'approve' ? 'approve' : action === 'reject' ? 'reject' : 'resend'
      const response = await api.post(`/support/users/recovery-requests/${requestId}/${endpoint}`, {
        reason: `${action} by platform support`,
        action
      })
      const data = response.data
      if (data?.success) {
        await loadRecoveryRequests()
        alert(`Recovery request ${action}ed successfully`)
      } else {
        throw new Error(data.message || `Failed to ${action} recovery request`)
      }
    } catch (err: any) {
      console.error(`Error ${action}ing recovery request:`, err)
      const msg = err?.response?.data?.message || err?.message || `Failed to ${action} recovery request`
      alert(msg)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.phone.includes(searchTerm) ||
                         request.user.tenancy?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
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
          <h1 className="text-3xl font-bold text-gray-900">Account Recovery</h1>
          <p className="text-gray-600 mt-1">
            Help users recover access to their accounts
          </p>
        </div>
        
        <button 
          onClick={loadRecoveryRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadRecoveryRequests} className="text-red-600 hover:text-red-800 font-medium">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Requests</p>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-xs">Recovery requests</p>
            </div>
            <Shield className="w-8 h-8 text-blue-200" />
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
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-green-100 text-xs">Successfully resolved</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Resolution</p>
              <p className="text-3xl font-bold">{stats.avgResolutionTime}</p>
              <p className="text-purple-100 text-xs">Response time</p>
            </div>
            <Activity className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Request Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getTypeIcon(type)}
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {type.replace('_', ' ')}
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="password_reset">Password Reset</option>
              <option value="account_unlock">Account Unlock</option>
              <option value="email_verification">Email Verification</option>
              <option value="phone_verification">Phone Verification</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recovery Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recovery Requests ({filteredRequests.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
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
                        {getTypeIcon(request.requestType)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {request.requestType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status.toUpperCase()}</span>
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        By: {request.requestedBy.replace('_', ' ')}
                      </span>
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
                        <p className="text-sm text-gray-500">Verification</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {request.verificationMethod.replace('_', ' ')}
                        </p>
                        {request.verificationCode && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-blue-600">
                              {showVerificationCode ? request.verificationCode : '******'}
                            </span>
                            <button
                              onClick={() => setShowVerificationCode(!showVerificationCode)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showVerificationCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(request.verificationCode!)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="text-sm text-gray-900">{request.reason}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {new Date(request.createdAt).toLocaleString()}</span>
                      </span>
                      {request.verificationExpiry && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {new Date(request.verificationExpiry).toLocaleString()}</span>
                        </span>
                      )}
                      {request.completedAt && (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed: {new Date(request.completedAt).toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRecoveryAction(request.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRecoveryAction(request.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {request.verificationCode && (
                      <button
                        onClick={() => handleRecoveryAction(request.id, 'resend')}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Resend</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recovery requests found</h3>
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
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Approve</p>
                <p className="text-sm text-gray-500">Approve pending requests</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Resend Codes</p>
                <p className="text-sm text-gray-500">Resend verification codes</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Failed</p>
                <p className="text-sm text-gray-500">Check failed requests</p>
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
                <p className="text-sm text-gray-500">Download recovery data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}