'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Plus,
  Search,
  Filter,
  Users,
  Settings,
  Edit,
  Trash2,
  Eye,
  Crown,
  Key,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Lock,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface PlatformRole {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  isDefault: boolean
  isActive: boolean
  assignmentCount: number
  permissionCount: number
  createdAt: string
  updatedAt: string
}

export default function PlatformRolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    isActive: true
  })

  const fetchPlatformRoles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      const response = await fetch(`${API_URL}/superadmin/rbac/roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setRoles(data.data.roles || [])
      } else {
        throw new Error(data.message || 'Failed to fetch roles')
      }
    } catch (error) {
      console.error('Error fetching platform roles:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformRoles()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search logic here
  }

  const filteredRoles = roles.filter(role => {
    // Hide super-admin role (root admin, not assignable)
    if (role.slug === 'super-admin') {
      return false
    }

    if (filters.search && !role.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !role.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.isActive !== undefined && role.isActive !== filters.isActive) {
      return false
    }
    return true
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Platform Roles</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchPlatformRoles()
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Role Management</h1>
          <p className="text-gray-600 mt-1">
            Manage platform-level roles for SuperAdmin users (Finance Admin, Auditor, Support)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search platform roles by name or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <label className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={filters.isActive}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Active only</span>
            </label>

            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No platform roles found</h3>
            <p className="text-gray-600">
              {filters.search
                ? 'Try adjusting your search criteria'
                : 'Platform roles are predefined. Contact system administrator to add new roles.'
              }
            </p>
          </div>
        ) : (
          filteredRoles.map((role) => {
            return (
              <div
                key={role._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: role.color + '20', color: role.color }}
                    >
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {role.isDefault && (
                      <span title="Default Role">
                        <Star className="w-4 h-4 text-yellow-500" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {role.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {role.assignmentCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Assigned Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {role.permissionCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Permissions</div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: role.color + '20',
                      color: role.color,
                      border: `1px solid ${role.color}40`
                    }}
                  >
                    Platform Role
                  </span>

                  <div className="flex items-center space-x-1">
                    {role.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/rbac/roles/${role._id}`}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {!role.isDefault && (
                      <button
                        onClick={() => {
                          // Handle delete
                          console.log('Delete role:', role._id)
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">{filteredRoles.length}</div>
          <div className="text-sm text-purple-100">Total Platform Roles</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {filteredRoles.filter(r => r.isActive).length}
          </div>
          <div className="text-sm text-green-100">Active</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {filteredRoles.reduce((sum, r) => sum + (r.assignmentCount || 0), 0)}
          </div>
          <div className="text-sm text-blue-100">Total Assignments</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {filteredRoles.filter(r => r.isDefault).length}
          </div>
          <div className="text-sm text-orange-100">Default Roles</div>
        </div>
      </div>
    </div>
  )
}