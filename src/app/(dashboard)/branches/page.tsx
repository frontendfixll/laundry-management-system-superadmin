'use client'

import { useState, useEffect } from 'react'
import { useBranches } from '@/hooks/useBranches'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  X,
  Loader2,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const statusConfig = {
  active: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, text: 'Active' },
  inactive: { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: XCircle, text: 'Inactive' },
  maintenance: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock, text: 'Maintenance' },
  suspended: { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle, text: 'Suspended' }
}

export default function BranchesPage() {
  const {
    branches,
    loading,
    error,
    pagination,
    fetchBranches,
    deleteBranch,
    clearError
  } = useBranches()

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [managers, setManagers] = useState<any[]>([])
  const [selectedManager, setSelectedManager] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string } | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchBranches({ page: 1, limit: 10, ...filters })
  }, [fetchBranches, filters])

  const fetchManagers = async () => {
    try {
      const response = await api.get('/superadmin/users?role=center_admin')
      const usersData = response.data.data?.users || response.data.data || []
      // Filter managers not already assigned to a branch
      setManagers(usersData.filter((u: any) => !u.assignedBranch || u.assignedBranch === selectedBranch?._id))
    } catch (error) {
      console.error('Error fetching managers:', error)
    }
  }

  const openAssignModal = (branch: any) => {
    setSelectedBranch(branch)
    setSelectedManager(branch.manager?._id || '')
    setShowAssignModal(true)
    fetchManagers()
  }

  const handleAssignManager = async () => {
    if (!selectedBranch || !selectedManager) {
      toast.error('Please select a manager')
      return
    }

    try {
      setAssigning(true)
      await api.post(`/superadmin/branches/${selectedBranch._id}/manager`, {
        managerId: selectedManager
      })
      toast.success('Manager assigned successfully')
      setShowAssignModal(false)
      setSelectedBranch(null)
      setSelectedManager('')
      fetchBranches({ page: pagination.current, limit: 10, ...filters })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign manager')
    } finally {
      setAssigning(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBranches({ page: 1, limit: 10, ...filters })
  }

  const handlePageChange = (page: number) => {
    fetchBranches({ page, limit: 10, ...filters })
  }

  const handleDelete = async (branchId: string) => {
    try {
      await deleteBranch(branchId, false)
    } catch (error) {
      console.error('Delete error:', error)
    }
    setDeleteConfirm(null)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedBranches.length === 0) return
    
    if (action === 'delete') {
      try {
        await Promise.all(selectedBranches.map(id => deleteBranch(id, false)))
        setSelectedBranches([])
      } catch (error) {
        console.error('Bulk delete error:', error)
      }
      setBulkDeleteConfirm(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Branches</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              fetchBranches()
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
          <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600 mt-1">
            Manage branches, assign staff, and monitor performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedBranches.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedBranches.length} selected
              </span>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Deactivate Selected
              </button>
            </div>
          )}
          
          <Link
            href="/superadmin/branches/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Branch</span>
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
              placeholder="Search branches by name, code, or city..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Cities</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">Sort by Created Date</option>
                <option value="name">Sort by Name</option>
                <option value="metrics.totalRevenue">Sort by Revenue</option>
                <option value="metrics.totalOrders">Sort by Orders</option>
              </select>
              
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  city: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Branches Grid */}
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
        ) : branches.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No branches found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.city 
                ? 'Try adjusting your search or filters' 
                : 'Start by creating your first branch'
              }
            </p>
            <Link
              href="/superadmin/branches/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Branch
            </Link>
          </div>
        ) : (
          branches.map((branch) => {
            const statusInfo = statusConfig[branch.status as keyof typeof statusConfig] || statusConfig.active
            const StatusIcon = statusInfo.icon
            
            return (
              <div
                key={branch._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBranches([...selectedBranches, branch._id])
                        } else {
                          setSelectedBranches(selectedBranches.filter(id => id !== branch._id))
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                      <p className="text-sm text-gray-500">{branch.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.text}
                    </span>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === branch._id ? null : branch._id)
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openMenuId === branch._id && (
                        <>
                          {/* Backdrop to close menu */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <Link
                              href={`/superadmin/branches/${branch._id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                            <Link
                              href={`/superadmin/branches/${branch._id}/edit`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Branch
                            </Link>
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                openAssignModal(branch)
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              {branch.manager ? 'Change Manager' : 'Assign Manager'}
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                setDeleteConfirm({ isOpen: true, id: branch._id, name: branch.name })
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deactivate
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    <p>{branch.address.addressLine1}</p>
                    <p>{branch.address.city}, {branch.address.state} - {branch.address.pincode}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {branch.staff?.filter(s => s.isActive).length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Staff</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {branch.metrics?.totalOrders || 0}
                    </div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {branch.metrics?.efficiency || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                </div>

                {/* Manager */}
                {branch.manager ? (
                  <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {branch.manager.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{branch.manager.name}</p>
                      <p className="text-xs text-gray-500">Center Admin</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">No manager assigned</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/superadmin/branches/${branch._id}`}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, id: branch._id, name: branch.name })}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deactivate Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => openAssignModal(branch)}
                    className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{branch.manager ? 'Change Manager' : 'Assign Manager'}</span>
                  </button>
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{branches.length}</div>
            <div className="text-sm text-gray-600">Total Branches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {branches.filter(b => b.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {branches.reduce((sum, b) => sum + (b.staff?.filter(s => s.isActive).length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Staff</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {branches.reduce((sum, b) => sum + (b.metrics?.totalOrders || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </div>
      </div>

      {/* Assign Manager Modal */}
      {showAssignModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Assign Center Admin</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBranch(null)
                  setSelectedManager('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Branch Info */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{selectedBranch.name}</div>
                  <div className="text-sm text-gray-500">{selectedBranch.code}</div>
                </div>
              </div>
            </div>

            {/* Current Manager */}
            {selectedBranch.manager && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Current Manager</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-medium">
                      {selectedBranch.manager.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{selectedBranch.manager.name}</div>
                    <div className="text-xs text-gray-500">{selectedBranch.manager.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Manager Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Manager
              </label>
              {managers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No available Center Admins</p>
                  <p className="text-xs mt-1">Create a user with Center Admin role first</p>
                </div>
              ) : (
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAssignManager}
                disabled={assigning || !selectedManager}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Assign Manager
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBranch(null)
                  setSelectedManager('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm?.isOpen || false}
        title="Deactivate Branch"
        message={`Are you sure you want to deactivate "${deleteConfirm?.name}"?`}
        confirmText="Deactivate"
        type="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Deactivate Selected Branches"
        message={`Deactivate ${selectedBranches.length} selected branches?`}
        confirmText="Deactivate All"
        type="danger"
        onConfirm={() => handleBulkAction('delete')}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  )
}
