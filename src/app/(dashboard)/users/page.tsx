'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface Role {
  _id: string
  name: string
  slug: string
  description: string
  color: string
}

interface User {
  _id: string
  name: string
  email: string
  roles: Role[]
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('auth-storage')
        if (!token) throw new Error('No auth token found')

        const parsed = JSON.parse(token)
        const authToken = parsed.state?.token
        if (!authToken) throw new Error('Invalid auth token')

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        const queryParams = new URLSearchParams({
          page: '1',
          limit: '50',
          ...(searchTerm && { search: searchTerm }),
          ...(filterRole && { role: filterRole }),
          ...(filterStatus && { isActive: filterStatus })
        })

        const response = await fetch(`${API_URL}/superadmin/rbac/users?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        if (data.success) {
          setUsers(data.data.users)
        } else {
          throw new Error(data.message || 'Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [searchTerm, filterRole, filterStatus])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete user')
      }

      // Remove user from list
      setUsers(prev => prev.filter(user => user._id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || user.roles.some(role => role.slug === filterRole)
    const matchesStatus = !filterStatus || user.isActive.toString() === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Platform Users</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 h-20"></div>
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
          <h1 className="text-lg font-bold text-gray-900">Platform Users</h1>
          <p className="text-[11px] text-gray-600">
            Manage platform-level user accounts and roles
          </p>
        </div>
        <Link href="/users/create">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Roles</option>
              <option value="platform-support">Platform Support</option>
              <option value="platform-finance-admin">Platform Finance Admin</option>
              <option value="platform-read-only-auditor">Platform Read-Only Auditor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterRole || filterStatus
                ? 'No users match your current filters.'
                : 'Get started by creating your first platform user.'
              }
            </p>
            {!searchTerm && !filterRole && !filterStatus && (
              <Link href="/users/create">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Create First User
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                        {user.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-gray-600">{user.email}</p>

                      <div className="flex items-center space-x-2 mt-2">
                        {user.roles.map((role) => (
                          <span
                            key={role._id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: role.color + '20',
                              color: role.color,
                              border: `1px solid ${role.color}40`
                            }}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-gray-500">
                      <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                      {user.lastLogin && (
                        <p>Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                      )}
                    </div>

                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Dropdown menu would go here */}
                      <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <Link href={`/users/${user._id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        <Link href={`/users/${user._id}/edit`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}