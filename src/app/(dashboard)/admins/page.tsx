'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CenterAdminPermissionMatrix, getDefaultCenterAdminPermissions, getFullCenterAdminPermissions } from '@/components/rbac/CenterAdminPermissionMatrix'
import { 
  Shield, Search, Loader2, RefreshCw, Mail, Phone, Building2, X, Check,
  UserX, UserCheck, Eye, EyeOff, Edit, Key, Send, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, XCircle, RotateCcw
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
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'API request failed')
  return data
}

interface Admin {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  permissions?: Record<string, Record<string, boolean>>
  permissionSummary?: { modules: number; totalPermissions: number }
  staffCount?: number
  assignedBranch?: { _id: string; name: string; code: string }
}

interface Invitation {
  _id: string
  email: string
  role: string
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
  assignedBranch?: { _id: string; name: string; code: string }
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800'
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [goToPage, setGoToPage] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [newInvite, setNewInvite] = useState({ email: '', assignedBranch: '' })
  const [newAdminPermissions, setNewAdminPermissions] = useState(getDefaultCenterAdminPermissions())
  const [showPermissions, setShowPermissions] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [editPermissions, setEditPermissions] = useState(getDefaultCenterAdminPermissions())
  const [updating, setUpdating] = useState(false)
  const [branches, setBranches] = useState<{_id: string, name: string}[]>([])
  const [activeTab, setActiveTab] = useState<'admins' | 'invitations'>('admins')

  useEffect(() => { setCurrentPage(1) }, [searchTerm])

  useEffect(() => { fetchAdmins(); fetchBranches(); fetchInvitations() }, [])

  const fetchBranches = async () => {
    try { const d = await apiCall('/superadmin/branches'); setBranches(d.data?.branches || d.data || []) } catch {}
  }

  const fetchAdmins = async () => {
    setLoading(true)
    try { const d = await apiCall('/superadmin/admins'); setAdmins(d.data?.admins || []) } catch { setAdmins([]) }
    setLoading(false)
  }

  const fetchInvitations = async () => {
    try { const d = await apiCall('/superadmin/admins/invitations'); setInvitations(d.data?.invitations || []) } catch { setInvitations([]) }
  }

  const handleInviteAdmin = async () => {
    if (!newInvite.email) {
      toast.error('Please enter email address'); return
    }
    if (!newInvite.assignedBranch) { 
      toast.error('Admin must be assigned to a branch'); return 
    }
    const hasP = Object.values(newAdminPermissions).some(m => Object.values(m).some(v => v))
    if (!hasP) { toast.error('Assign at least one permission'); return }
    
    setInviting(true)
    try {
      await apiCall('/superadmin/admins/invite', {
        method: 'POST',
        body: JSON.stringify({ 
          email: newInvite.email,
          role: 'admin',
          permissions: newAdminPermissions,
          assignedBranch: newInvite.assignedBranch
        })
      })
      toast.success('Invitation sent successfully!')
      setShowInviteModal(false)
      setNewInvite({ email: '', assignedBranch: '' })
      setNewAdminPermissions(getDefaultCenterAdminPermissions())
      fetchInvitations()
    } catch (e: any) { toast.error(e.message) }
    setInviting(false)
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await apiCall(`/superadmin/admins/invitations/${invitationId}/resend`, { method: 'POST' })
      toast.success('Invitation resent!')
      fetchInvitations()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await apiCall(`/superadmin/admins/invitations/${invitationId}`, { method: 'DELETE' })
      toast.success('Invitation cancelled')
      fetchInvitations()
    } catch (e: any) { toast.error(e.message) }
  }

  const openEditModal = async (admin: Admin) => {
    try {
      const d = await apiCall(`/superadmin/admins/${admin._id}`)
      setSelectedAdmin(d.data?.admin)
      setEditPermissions(d.data?.admin?.permissions || getDefaultCenterAdminPermissions())
      setShowEditModal(true)
    } catch { toast.error('Failed to load admin') }
  }

  const handleUpdatePermissions = async () => {
    if (!selectedAdmin) return
    setUpdating(true)
    try {
      await apiCall(`/superadmin/admins/${selectedAdmin._id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions: editPermissions }) })
      toast.success('Permissions updated!'); setShowEditModal(false); fetchAdmins()
    } catch (e: any) { toast.error(e.message) }
    setUpdating(false)
  }

  const handleDeactivateAdmin = async (admin: Admin) => {
    try { 
      await apiCall(`/superadmin/admins/${admin._id}`, { method: 'DELETE' })
      toast.success('Admin deactivated')
      setAdmins(prev => prev.map(a => a._id === admin._id ? { ...a, isActive: false } : a))
    } catch (e: any) { toast.error(e.message) }
  }

  const handleReactivateAdmin = async (admin: Admin) => {
    try { 
      await apiCall(`/superadmin/admins/${admin._id}/reactivate`, { method: 'PUT' })
      toast.success('Admin reactivated')
      setAdmins(prev => prev.map(a => a._id === admin._id ? { ...a, isActive: true } : a))
    } catch (e: any) { toast.error(e.message) }
  }

  const filteredAdmins = admins.filter(a => 
    (a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE)
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-gray-600">Manage admins with RBAC permissions and invite new admins</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInviteModal(true)} className="bg-purple-500 hover:bg-purple-600">
            <Send className="w-4 h-4 mr-2" />Invite Admin
          </Button>
          <Button onClick={() => { fetchAdmins(); fetchInvitations() }} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{admins.length}</div>
          <div className="text-sm text-purple-100">Total Admins</div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{admins.filter(a => a.isActive).length}</div>
          <div className="text-sm text-teal-100">Active</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{invitations.filter(i => i.status === 'pending').length}</div>
          <div className="text-sm text-amber-100">Pending Invites</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{admins.filter(a => !a.isActive).length}</div>
          <div className="text-sm text-red-100">Inactive</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'admins' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Admins ({admins.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'invitations' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Invitations ({invitations.length})
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'admins' && (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search admins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
      </div>
      )}

      {/* Admins Table */}
      {activeTab === 'admins' && (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : paginatedAdmins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No admins found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.assignedBranch ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {admin.assignedBranch.name}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {admin.permissionSummary ? (
                        <div className="text-sm">
                          <span className="font-medium">{admin.permissionSummary.modules}</span> modules, 
                          <span className="font-medium ml-1">{admin.permissionSummary.totalPermissions}</span> permissions
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(admin)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Permissions">
                          <Key className="w-4 h-4" />
                        </button>
                        {admin.isActive ? (
                          <button onClick={() => handleDeactivateAdmin(admin)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate">
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleReactivateAdmin(admin)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Reactivate">
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
        {filteredAdmins.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)} of {filteredAdmins.length} admins
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
      )}

      {/* Invitations Table */}
      {activeTab === 'invitations' && (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {invitations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No invitations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invitations.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{inv.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {inv.assignedBranch ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {inv.assignedBranch.name}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${
                        inv.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                        inv.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.status === 'pending' && <Clock className="w-3 h-3" />}
                        {inv.status === 'accepted' && <Check className="w-3 h-3" />}
                        {inv.status === 'expired' && <XCircle className="w-3 h-3" />}
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleResendInvitation(inv._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Resend">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleCancelInvitation(inv._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Invite Admin</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p>An invitation email will be sent to the admin. They will set their own password when accepting the invitation.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input type="email" value={newInvite.email} onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="admin@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign Branch *</label>
                <select value={newInvite.assignedBranch} onChange={(e) => setNewInvite({ ...newInvite, assignedBranch: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <button onClick={() => setShowPermissions(!showPermissions)} className="flex items-center gap-2 text-sm font-medium text-purple-600">
                  {showPermissions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showPermissions ? 'Hide' : 'Configure'} Permissions
                </button>
                {showPermissions && (
                  <div className="mt-4 border rounded-lg p-4">
                    <div className="flex gap-2 mb-4">
                      <button type="button" onClick={() => setNewAdminPermissions(getFullCenterAdminPermissions())} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                        Full Access
                      </button>
                      <button type="button" onClick={() => setNewAdminPermissions(getDefaultCenterAdminPermissions())} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Clear All
                      </button>
                    </div>
                    <CenterAdminPermissionMatrix 
                      permissions={newAdminPermissions} 
                      onChange={setNewAdminPermissions} 
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button onClick={handleInviteAdmin} disabled={inviting} className="bg-purple-500 hover:bg-purple-600">
                {inviting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Invitation</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold">Edit Permissions</h3>
                <p className="text-sm text-gray-500">{selectedAdmin.name} ({selectedAdmin.email})</p>
                {selectedAdmin.assignedBranch && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    {selectedAdmin.assignedBranch.name}
                  </div>
                )}
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setEditPermissions(getFullCenterAdminPermissions())} className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  Full Access
                </button>
                <button type="button" onClick={() => setEditPermissions(getDefaultCenterAdminPermissions())} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Clear All
                </button>
              </div>
              <CenterAdminPermissionMatrix 
                permissions={editPermissions} 
                onChange={setEditPermissions} 
                compact={true}
              />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdatePermissions} disabled={updating} className="bg-purple-500 hover:bg-purple-600">
                {updating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Save Permissions</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
