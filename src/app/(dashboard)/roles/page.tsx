'use client'

import { useState, useEffect } from 'react'
import { useRoles } from '@/hooks/useRoles'
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
  MoreVertical,
  UserCheck,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const categoryConfig = {
  management: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Crown, text: 'Management' },
  operations: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Settings, text: 'Operations' },
  support: { color: 'text-green-600 bg-green-50 border-green-200', icon: Users, text: 'Support' },
  custom: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Key, text: 'Custom' }
}

const levelColors = {
  1: 'text-red-600 bg-red-50',
  2: 'text-orange-600 bg-orange-50',
  3: 'text-yellow-600 bg-yellow-50',
  4: 'text-blue-600 bg-blue-50',
  5: 'text-green-600 bg-green-50'
}

// Map old role names to new display names
const roleDisplayNameMap: Record<string, string> = {
  'Branch Manager': 'Center Admin',
  'branch_manager': 'Center Admin',
}

const getDisplayName = (name: string, displayName: string) => {
  return roleDisplayNameMap[displayName] || roleDisplayNameMap[name] || displayName || name
}

export default function RolesPage() {
  const {
    roles,
    loading,
    error,
    pagination,
    fetchRoles,
    deleteRole,
    initializeDefaultRoles,
    clearError
  } = useRoles()

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    isActive: true
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string } | null>(null)
  const [initConfirm, setInitConfirm] = useState(false)

  useEffect(() => {
    fetchRoles({ page: 1, limit: 10, ...filters })
  }, [fetchRoles, filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRoles({ page: 1, limit: 10, ...filters })
  }

  const handlePageChange = (page: number) => {
    fetchRoles({ page, limit: 10, ...filters })
  }

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(roleId)
    } catch (error) {
      console.error('Delete error:', error)
    }
    setDeleteConfirm(null)
  }

  const handleInitializeRoles = async () => {
    try {
      await initializeDefaultRoles()
    } catch (error) {
      console.error('Initialize roles error:', error)
    }
    setInitConfirm(false)
  }

  const getLevelColor = (level: number) => {
    if (level <= 2) return levelColors[1]
    if (level <= 3) return levelColors[2]
    if (level <= 4) return levelColors[3]
    if (level <= 6) return levelColors[4]
    return levelColors[5]
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Roles</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              fetchRoles()
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
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage user roles with granular permissions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {roles.length === 0 && (
            <button
              onClick={() => setInitConfirm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Shield className="w-5 h-5" />
              <span>Initialize Default Roles</span>
            </button>
          )}
          
          <Link
            href="/superadmin/roles/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Role</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles by name or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="management">Management</option>
              <option value="operations">Operations</option>
              <option value="support">Support</option>
              <option value="custom">Custom</option>
            </select>
            
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Levels</option>
              <option value="1">Level 1 (Highest)</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5 (Lowest)</option>
            </select>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Show only active roles</span>
                </label>
              </div>
              
              <button
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  level: '',
                  isActive: true
                })}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
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
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No roles found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.category || filters.level 
                ? 'Try adjusting your search or filters' 
                : 'Start by creating your first role or initialize default roles'
              }
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setInitConfirm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Initialize Default Roles</span>
              </button>
              <Link
                href="/superadmin/roles/new"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Role</span>
              </Link>
            </div>
          </div>
        ) : (
          roles.map((role) => {
            const categoryInfo = categoryConfig[role.category as keyof typeof categoryConfig] || categoryConfig.custom
            const CategoryIcon = categoryInfo.icon
            const levelColor = getLevelColor(role.level)
            
            return (
              <div
                key={role._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryInfo.color}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(role.name, role.displayName)}</h3>
                      <p className="text-sm text-gray-500">{role.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelColor}`}>
                      Level {role.level}
                    </span>
                    
                    {role.isSystemRole && (
                      <Lock className="w-4 h-4 text-gray-400" title="System Role" />
                    )}
                    
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {role.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {role.userCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {role.permissions?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Permissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      ₹{role.financialLimits?.maxRefundAmount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Refund Limit</div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoryInfo.color}`}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {categoryInfo.text}
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

                {/* Key Permissions Preview */}
                {role.permissions && role.permissions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Key Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {permission.module}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/superadmin/roles/${role._id}`}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/superadmin/roles/${role._id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Role"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: role._id, name: role.displayName })}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <Link
                    href={`/superadmin/roles/${role._id}/permissions`}
                    className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    <span>Permissions</span>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  page === pagination.current
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">{roles.length}</div>
          <div className="text-sm text-purple-100">Total Roles</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {roles.filter(r => r.isActive).length}
          </div>
          <div className="text-sm text-green-100">Active</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}
          </div>
          <div className="text-sm text-blue-100">Total Users</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {roles.filter(r => r.isSystemRole).length}
          </div>
          <div className="text-sm text-orange-100">System Roles</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm?.isOpen || false}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteConfirm?.name}"?`}
        confirmText="Delete"
        type="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Initialize Roles Confirmation Dialog */}
      <ConfirmDialog
        isOpen={initConfirm}
        title="Initialize Default Roles"
        message="Initialize default system roles? This will create standard roles like Center Admin, Staff, etc."
        confirmText="Initialize"
        type="info"
        onConfirm={handleInitializeRoles}
        onCancel={() => setInitConfirm(false)}
      />
    </div>
  )
}
