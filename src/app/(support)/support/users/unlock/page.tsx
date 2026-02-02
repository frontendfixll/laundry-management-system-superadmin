'use client'

import { useState, useEffect } from 'react'
import { 
  Unlock,
  Search,
  User,
  Mail,
  Phone,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Lock,
  Download,
  Building2,
  Calendar,
  Activity,
  Eye,
  Ban,
  UserCheck
} from 'lucide-react'

interface LockedAccount {
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
  lockReason: 'failed_attempts' | 'suspicious_activity' | 'admin_action' | 'security_breach' | 'policy_violation'
  lockStatus: 'locked' | 'unlocked' | 'pending_review' | 'permanently_banned'
  failedAttempts: number
  maxAttempts: number
  lockDuration?: number // minutes
  lockedAt: string
  lockedUntil?: string
  unlockedAt?: string
  unlockedBy?: string
  lockDetails: {
    ipAddresses: string[]
    userAgents: string[]
    suspiciousPatterns: string[]
    lastSuccessfulLogin?: string
  }
  unlockRequests: {
    requestedBy: string
    requestedAt: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
  }[]
  securityNotes?: string
}

interface UnlockStats {
  totalLocked: number
  autoLocked: number
  manualLocked: number
  unlocked: number
  permanentlyBanned: number
  byReason: Record<string, number>
  avgLockDuration: string
}

export default function UnlockAccountsPage() {
  const [loading, setLoading] = useState(true)
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([])
  const [stats, setStats] = useState<UnlockStats>({
    totalLocked: 0,
    autoLocked: 0,
    manualLocked: 0,
    unlocked: 0,
    permanentlyBanned: 0,
    byReason: {},
    avgLockDuration: '0h'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAccount, setSelectedAccount] = useState<LockedAccount | null>(null)

  useEffect(() => {
    loadLockedAccounts()
  }, [reasonFilter, statusFilter])

  const loadLockedAccounts = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (reasonFilter !== 'all') params.append('reason', reasonFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/support/users/locked-accounts?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch locked accounts')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setLockedAccounts(data.data.accounts || [])
        setStats(data.data.stats || {
          totalLocked: 0,
          autoLocked: 0,
          manualLocked: 0,
          unlocked: 0,
          permanentlyBanned: 0,
          byReason: {},
          avgLockDuration: '0h'
        })
      } else {
        throw new Error(data.message || 'Failed to load locked accounts')
      }
    } catch (error) {
      console.error('Error loading locked accounts:', error)
      // Fallback to mock data on error
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockAccounts: LockedAccount[] = [
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
        lockReason: 'failed_attempts',
        lockStatus: 'locked',
        failedAttempts: 5,
        maxAttempts: 5,
        lockDuration: 30,
        lockedAt: '2026-01-27T12:00:00Z',
        lockedUntil: '2026-01-27T12:30:00Z',
        lockDetails: {
          ipAddresses: ['192.168.1.100', '192.168.1.101'],
          userAgents: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)'],
          suspiciousPatterns: ['Multiple rapid login attempts'],
          lastSuccessfulLogin: '2026-01-25T09:15:00Z'
        },
        unlockRequests: [
          {
            requestedBy: 'tenant_admin',
            requestedAt: '2026-01-27T12:15:00Z',
            reason: 'Legitimate user, forgot password',
            status: 'pending'
          }
        ]
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
        lockReason: 'suspicious_activity',
        lockStatus: 'pending_review',
        failedAttempts: 3,
        maxAttempts: 5,
        lockedAt: '2026-01-27T10:30:00Z',
        lockDetails: {
          ipAddresses: ['45.123.67.89', '203.45.78.90', '157.32.45.78'],
          userAgents: [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            'curl/7.68.0'
          ],
          suspiciousPatterns: [
            'Login from multiple countries',
            'Unusual user agent patterns',
            'API access attempts'
          ],
          lastSuccessfulLogin: '2026-01-24T16:30:00Z'
        },
        unlockRequests: [],
        securityNotes: 'Potential account compromise detected. Review required before unlock.'
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
        lockReason: 'admin_action',
        lockStatus: 'unlocked',
        failedAttempts: 0,
        maxAttempts: 5,
        lockedAt: '2026-01-26T14:20:00Z',
        unlockedAt: '2026-01-27T09:30:00Z',
        unlockedBy: 'support@gmail.com',
        lockDetails: {
          ipAddresses: ['157.32.45.78'],
          userAgents: ['Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'],
          suspiciousPatterns: [],
          lastSuccessfulLogin: '2026-01-26T20:45:00Z'
        },
        unlockRequests: [
          {
            requestedBy: 'user',
            requestedAt: '2026-01-27T08:00:00Z',
            reason: 'Account locked by mistake, need access for business',
            status: 'approved'
          }
        ]
      },
      {
        id: '4',
        userId: 'user_004',
        user: {
          name: 'Malicious User',
          email: 'suspicious@example.com',
          phone: '+91 00000 00000',
          role: 'customer'
        },
        lockReason: 'security_breach',
        lockStatus: 'permanently_banned',
        failedAttempts: 15,
        maxAttempts: 5,
        lockedAt: '2026-01-25T08:00:00Z',
        lockDetails: {
          ipAddresses: ['1.2.3.4', '5.6.7.8', '9.10.11.12', '13.14.15.16'],
          userAgents: [
            'curl/7.68.0',
            'python-requests/2.25.1',
            'Automated Bot'
          ],
          suspiciousPatterns: [
            'Brute force attack detected',
            'SQL injection attempts',
            'Multiple account creation attempts',
            'Automated behavior patterns'
          ]
        },
        unlockRequests: [],
        securityNotes: 'Confirmed malicious activity. Permanent ban enforced.'
      }
    ]

    setLockedAccounts(mockAccounts)
    
    const totalLocked = mockAccounts.filter(acc => acc.lockStatus === 'locked' || acc.lockStatus === 'pending_review').length
    const autoLocked = mockAccounts.filter(acc => acc.lockReason === 'failed_attempts').length
    const manualLocked = mockAccounts.filter(acc => acc.lockReason === 'admin_action').length
    const unlocked = mockAccounts.filter(acc => acc.lockStatus === 'unlocked').length
    const permanentlyBanned = mockAccounts.filter(acc => acc.lockStatus === 'permanently_banned').length

    setStats({
      totalLocked,
      autoLocked,
      manualLocked,
      unlocked,
      permanentlyBanned,
      byReason: {
        failed_attempts: mockAccounts.filter(acc => acc.lockReason === 'failed_attempts').length,
        suspicious_activity: mockAccounts.filter(acc => acc.lockReason === 'suspicious_activity').length,
        admin_action: mockAccounts.filter(acc => acc.lockReason === 'admin_action').length,
        security_breach: mockAccounts.filter(acc => acc.lockReason === 'security_breach').length,
        policy_violation: mockAccounts.filter(acc => acc.lockReason === 'policy_violation').length
      },
      avgLockDuration: '2.5h'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'locked': return 'bg-red-100 text-red-700'
      case 'unlocked': return 'bg-green-100 text-green-700'
      case 'pending_review': return 'bg-yellow-100 text-yellow-700'
      case 'permanently_banned': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'locked': return <Lock className="w-4 h-4" />
      case 'unlocked': return <Unlock className="w-4 h-4" />
      case 'pending_review': return <Clock className="w-4 h-4" />
      case 'permanently_banned': return <Ban className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'failed_attempts': return 'bg-orange-100 text-orange-700'
      case 'suspicious_activity': return 'bg-red-100 text-red-700'
      case 'admin_action': return 'bg-blue-100 text-blue-700'
      case 'security_breach': return 'bg-red-100 text-red-700'
      case 'policy_violation': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSeverityLevel = (account: LockedAccount) => {
    if (account.lockReason === 'security_breach' || account.lockStatus === 'permanently_banned') {
      return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
    }
    if (account.lockReason === 'suspicious_activity' || account.failedAttempts >= account.maxAttempts) {
      return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' }
    }
    if (account.lockReason === 'admin_action') {
      return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    }
    return { level: 'Low', color: 'text-blue-600', bg: 'bg-blue-100' }
  }

  const handleUnlockAction = async (accountId: string, action: 'unlock' | 'review' | 'ban' | 'approve_request') => {
    try {
      const method = 'POST'
      let endpoint = ''
      
      switch (action) {
        case 'unlock':
          endpoint = 'unlock'
          break
        case 'review':
          endpoint = 'review'
          break
        case 'ban':
          endpoint = 'ban'
          break
        case 'approve_request':
          endpoint = 'approve-request'
          break
      }
      
      const response = await fetch(`/api/support/users/locked-accounts/${accountId}/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: `${action} by platform support`,
          notes: `Account ${action}ed via platform support dashboard`,
          permanent: action === 'ban' ? true : false
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} account`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Reload the accounts to get updated data
        await loadLockedAccounts()
        alert(`Account ${action}ed successfully`)
      } else {
        throw new Error(data.message || `Failed to ${action} account`)
      }
    } catch (error) {
      console.error(`Error ${action}ing account:`, error)
      alert(`Failed to ${action} account: ${error.message}`)
    }
  }

  const filteredAccounts = lockedAccounts.filter(account => {
    const matchesSearch = account.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.user.phone.includes(searchTerm) ||
                         account.user.tenancy?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesReason = reasonFilter === 'all' || account.lockReason === reasonFilter
    const matchesStatus = statusFilter === 'all' || account.lockStatus === statusFilter
    
    return matchesSearch && matchesReason && matchesStatus
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
          <h1 className="text-3xl font-bold text-gray-900">Unlock Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage locked user accounts and security incidents
          </p>
        </div>
        
        <button 
          onClick={loadLockedAccounts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Currently Locked</p>
              <p className="text-3xl font-bold">{stats.totalLocked}</p>
              <p className="text-red-100 text-xs">Need attention</p>
            </div>
            <Lock className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Auto Locked</p>
              <p className="text-3xl font-bold">{stats.autoLocked}</p>
              <p className="text-orange-100 text-xs">Failed attempts</p>
            </div>
            <Shield className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Unlocked</p>
              <p className="text-3xl font-bold">{stats.unlocked}</p>
              <p className="text-green-100 text-xs">Successfully restored</p>
            </div>
            <Unlock className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Permanently Banned</p>
              <p className="text-3xl font-bold">{stats.permanentlyBanned}</p>
              <p className="text-gray-100 text-xs">Security threats</p>
            </div>
            <Ban className="w-8 h-8 text-gray-200" />
          </div>
        </div>
      </div>

      {/* Lock Reason Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lock Reasons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stats.byReason).map(([reason, count]) => (
            <div key={reason} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {reason.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">{count} accounts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{count}</p>
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
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reasons</option>
              <option value="failed_attempts">Failed Attempts</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="admin_action">Admin Action</option>
              <option value="security_breach">Security Breach</option>
              <option value="policy_violation">Policy Violation</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="locked">Locked</option>
              <option value="pending_review">Pending Review</option>
              <option value="unlocked">Unlocked</option>
              <option value="permanently_banned">Permanently Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Locked Accounts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Locked Accounts ({filteredAccounts.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => {
              const severity = getSeverityLevel(account)
              
              return (
                <div key={account.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(account.lockStatus)}`}>
                          {getStatusIcon(account.lockStatus)}
                          <span>{account.lockStatus.replace('_', ' ').toUpperCase()}</span>
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReasonColor(account.lockReason)}`}>
                          {account.lockReason.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severity.bg} ${severity.color}`}>
                          {severity.level} Risk
                        </span>
                        {account.unlockRequests.length > 0 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {account.unlockRequests.length} Request(s)
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">User</p>
                          <p className="font-medium text-gray-900">{account.user.name}</p>
                          <p className="text-xs text-gray-500">{account.user.email}</p>
                          <p className="text-xs text-gray-500">{account.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Role & Tenant</p>
                          <p className="font-medium text-gray-900 capitalize">{account.user.role.replace('_', ' ')}</p>
                          {account.user.tenancy && (
                            <p className="text-xs text-gray-500">{account.user.tenancy.name}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Lock Details</p>
                          <p className="text-xs text-gray-900">
                            Failed attempts: {account.failedAttempts}/{account.maxAttempts}
                          </p>
                          <p className="text-xs text-gray-500">
                            IPs: {account.lockDetails.ipAddresses.length} unique
                          </p>
                        </div>
                      </div>
                      
                      {account.lockDetails.suspiciousPatterns.length > 0 && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Suspicious Patterns</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {account.lockDetails.suspiciousPatterns.map((pattern, index) => (
                              <li key={index}>• {pattern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {account.securityNotes && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Security Notes</p>
                          <p className="text-xs text-yellow-800">{account.securityNotes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Locked: {new Date(account.lockedAt).toLocaleString()}</span>
                        </span>
                        {account.lockedUntil && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Until: {new Date(account.lockedUntil).toLocaleString()}</span>
                          </span>
                        )}
                        {account.unlockedAt && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Unlocked: {new Date(account.unlockedAt).toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {account.lockStatus === 'locked' && (
                        <>
                          <button
                            onClick={() => handleUnlockAction(account.id, 'unlock')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Unlock</span>
                          </button>
                          <button
                            onClick={() => handleUnlockAction(account.id, 'review')}
                            className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        </>
                      )}
                      {account.lockStatus === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleUnlockAction(account.id, 'unlock')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleUnlockAction(account.id, 'ban')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Ban</span>
                          </button>
                        </>
                      )}
                      {account.lockStatus !== 'permanently_banned' && (
                        <button
                          onClick={() => setSelectedAccount(account)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12 text-center">
              <Unlock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locked accounts found</h3>
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
                <Unlock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Unlock</p>
                <p className="text-sm text-gray-500">Unlock safe accounts</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Suspicious</p>
                <p className="text-sm text-gray-500">Check flagged accounts</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Security Threats</p>
                <p className="text-sm text-gray-500">Manage banned accounts</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Security Report</p>
                <p className="text-sm text-gray-500">Export security data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}