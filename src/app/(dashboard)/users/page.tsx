'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Users, Search, Loader2, RefreshCw, Mail, Phone, X, Edit,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserCheck, UserX
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const ITEMS_PER_PAGE = 8

const getAuthToken = () => {
  let token = null
  try {
    const data = localStorage.getItem('superadmin-storage')
    if (data) { const p = JSON.parse(data); token = p.state?.token || p.token }
  } catch (e) {}
  return token || localStorage.getItem('superadmin-token') || localStorage.getItem('token')
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'API request failed')
  return data
}

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
}

const roleColors: Record<string, string> = {
  customer: 'bg-gray-100 text-gray-800',
  staff: 'bg-blue-100 text-blue-800'
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [goToPage, setGoToPage] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUserData, setEditUserData] = useState({ role: '', isActive: true })
  const [updating, setUpdating] = useState(false)

  useEffect(() => { setCurrentPage(1) }, [searchTerm, roleFilter])
  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try { 
      const d = await apiCall('/superadmin/users')
      // Filter out admin role - only show staff and customers
      const allUsers = d.data?.users || d.data || []
      const filteredUsers = allUsers.filter((u: User) => !['admin'].includes(u.role))
      setUsers(filteredUsers)
    } catch { setUsers([]) }
    setLoading(false)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUserData({ role: user.role, isActive: user.isActive })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    setUpdating(true)
    try {
      if (editUserData.isActive !== selectedUser.isActive) {
        await apiCall(`/superadmin/users/${selectedUser._id}/status`, { 
          method: 'PATCH', 
          body: JSON.stringify({ isActive: editUserData.isActive }) 
        })
      }
      if (editUserData.role !== selectedUser.role) {
        await apiCall(`/superadmin/users/${selectedUser._id}/role`, { 
          method: 'PATCH', 
          body: JSON.stringify({ role: editUserData.role }) 
        })
      }
      toast.success('User updated successfully!')
      setShowEditModal(false)
      setUsers(prev => prev.map(u => 
        u._id === selectedUser._id ? { ...u, isActive: editUserData.isActive, role: editUserData.role } : u
      ))
    } catch (e: any) { toast.error(e.message) }
    setUpdating(false)
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await apiCall(`/superadmin/users/${user._id}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify({ isActive: !user.isActive }) 
      })
      toast.success(user.isActive ? 'User deactivated' : 'User activated')
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u))
    } catch (e: any) { toast.error(e.message) }
  }

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) && 
    (roleFilter === 'all' || u.role === roleFilter)
  )

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const handlePageChange = (page: number) => setCurrentPage(page)

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(goToPage)
    if (page >= 1 && page <= totalPages) { setCurrentPage(page); setGoToPage('') }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600">Manage staff and other users</p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'staff').length}</div>
          <div className="text-sm text-blue-100">Staff</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{users.filter(u => u.isActive).length}</div>
          <div className="text-sm text-green-100">Active</div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-sm text-gray-200">Total Users</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Roles</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="font-medium text-gray-900">{user.name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.isActive ? (
                          <button onClick={() => handleToggleStatus(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate">
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleToggleStatus(user)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Activate">
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="hidden sm:flex px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50" title="First Page">
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline ml-1">Previous</span>
                </button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                    ) : (
                      <button key={page} onClick={() => handlePageChange(page as number)} className={`min-w-[36px] px-3 py-1 border rounded-md text-sm ${currentPage === page ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                        {page}
                      </button>
                    )
                  ))}
                </div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">
                  <span className="hidden sm:inline mr-1">Next</span><ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="hidden sm:flex px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50" title="Last Page">
                  <ChevronsRight className="w-4 h-4" />
                </button>
                {totalPages > 10 && (
                  <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                    <span className="text-sm text-gray-600 hidden sm:inline">Go to page</span>
                    <input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} placeholder="#" className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center" />
                    <button type="submit" disabled={!goToPage} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50">Go</button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedUser.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email || ''}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={editUserData.role} 
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditUserData({ ...editUserData, isActive: true })}
                    className={`flex-1 py-2 px-4 rounded-lg border ${editUserData.isActive ? 'bg-green-500 text-white border-green-500' : 'border-gray-300'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setEditUserData({ ...editUserData, isActive: false })}
                    className={`flex-1 py-2 px-4 rounded-lg border ${!editUserData.isActive ? 'bg-red-500 text-white border-red-500' : 'border-gray-300'}`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateUser} disabled={updating} className="bg-purple-500 hover:bg-purple-600">
                {updating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
