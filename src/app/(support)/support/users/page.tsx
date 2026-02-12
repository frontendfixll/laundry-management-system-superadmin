'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Shield,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Key,
  Unlock,
  RefreshCw,
  Send,
  ExternalLink,
  UserCheck,
  UserX,
  Settings
} from 'lucide-react'

interface UserAccount {
  id: string
  name: string
  email: string
  phone: string
  tenantName: string
  role: string
  status: 'active' | 'inactive' | 'locked'
  lastLogin: string
  createdAt: string
  isEmailVerified: boolean
  phoneVerified: boolean
  loginAttempts?: number
  lockUntil?: string
}

export default function UserAssistancePage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserAccount[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/support/users', { params: { limit: 50 } })
      const data = response.data
      const payload = data?.data || data
      setUsers(payload?.users || [])
    } catch (err: any) {
      console.error('Failed to load users:', err)
      setError(err?.response?.data?.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'resend-otp' | 'unlock' | 'reset-password', reason?: string) => {
    setActionLoading(action)
    try {
      await api.post(`/support/users/${userId}/${action}`, { reason })
      alert(`${action.replace('-', ' ')} completed successfully`)
      loadUsers()
    } catch (err: any) {
      console.error(`Failed to ${action}:`, err)
      const msg = err?.response?.data?.message || err?.message || `Failed to ${action.replace('-', ' ')}`
      alert(msg)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'locked': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <UserX className="w-4 h-4" />
      case 'locked': return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'staff': return 'bg-blue-100 text-blue-700'
      case 'customer': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
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
          <h1 className="text-3xl font-bold text-gray-900">User Assistance</h1>
          <p className="text-gray-600 mt-1">
            Help users with account issues, password resets, and access problems
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={loadUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadUsers} className="text-red-600 hover:text-red-800 font-medium">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-green-100 text-xs">Currently active</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Locked Accounts</p>
              <p className="text-3xl font-bold">{users.filter(u => u.status === 'locked').length}</p>
              <p className="text-red-100 text-xs">Need assistance</p>
            </div>
            <Shield className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Unverified Email</p>
              <p className="text-3xl font-bold">{users.filter(u => !u.isEmailVerified).length}</p>
              <p className="text-yellow-100 text-xs">Email not verified</p>
            </div>
            <Mail className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
              <p className="text-blue-100 text-xs">All accounts</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users, emails, tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              User Accounts ({filteredUsers.length})
            </h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span>{user.status}</span>
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {user.isEmailVerified ? (
                              <span className="text-green-600">✓ Verified</span>
                            ) : (
                              <span className="text-red-600">✗ Not verified</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                          <p className="text-xs text-gray-500">
                            {user.phoneVerified ? (
                              <span className="text-green-600">✓ Verified</span>
                            ) : (
                              <span className="text-red-600">✗ Not verified</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.tenantName}</p>
                          <p className="text-xs text-gray-500">Tenant</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Last login</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Issues */}
                    {user.status === 'locked' && (
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          Account locked due to {user.loginAttempts} failed login attempts
                          {user.lockUntil && ` until ${new Date(user.lockUntil).toLocaleString()}`}
                        </span>
                      </div>
                    )}
                    
                    {!user.isEmailVerified && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Mail className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Email verification pending</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Action Buttons */}
                    {!user.isEmailVerified && (
                      <button
                        onClick={() => handleUserAction(user.id, 'resend-otp', 'Email verification required')}
                        disabled={actionLoading === 'resend-otp'}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors flex items-center space-x-1 text-sm"
                      >
                        {actionLoading === 'resend-otp' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Resend OTP</span>
                      </button>
                    )}
                    
                    {user.status === 'locked' && (
                      <button
                        onClick={() => handleUserAction(user.id, 'unlock', 'Support assistance requested')}
                        disabled={actionLoading === 'unlock'}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-1 text-sm"
                      >
                        {actionLoading === 'unlock' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                        <span>Unlock</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleUserAction(user.id, 'reset-password', 'Password reset requested by support')}
                      disabled={actionLoading === 'reset-password'}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-1 text-sm"
                    >
                      {actionLoading === 'reset-password' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      <span>Reset Password</span>
                    </button>
                    
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Send className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk OTP Resend</p>
                <p className="text-sm text-gray-500">Send to unverified users</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Unlock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Unlock</p>
                <p className="text-sm text-gray-500">Unlock multiple accounts</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Password Policy</p>
                <p className="text-sm text-gray-500">View requirements</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Account Settings</p>
                <p className="text-sm text-gray-500">Manage preferences</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}