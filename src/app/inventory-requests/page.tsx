'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Eye,
  Building,
  User,
  Calendar,
  DollarSign,
  Truck,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  if (typeof window === 'undefined') return null

  // Try unified auth-storage (new unified store)
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      const token = parsed.state?.token || parsed.token
      if (token) return token
    } catch (e) {
      console.error('Error parsing auth-storage:', e)
    }
  }

  // Try legacy superadmin-storage
  const superAdminData = localStorage.getItem('superadmin-storage')
  if (superAdminData) {
    try {
      const parsed = JSON.parse(superAdminData)
      if (parsed.state?.token) return parsed.state.token
    } catch (e) {
      console.error('Error parsing superadmin-storage:', e)
    }
  }

  // Try other legacy keys
  return localStorage.getItem('superadmin-token') ||
    localStorage.getItem('superAdminToken') ||
    localStorage.getItem('token')
}

interface InventoryRequest {
  _id: string
  itemName: string
  category: string
  description: string
  estimatedQuantity: string
  unit: string
  urgency: 'low' | 'normal' | 'high'
  justification: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestDate: string
  approvedDate?: string
  rejectionReason?: string
  adminNotes?: string
  estimatedCost?: number
  supplier?: string
  expectedDelivery?: string
  requestedBy: {
    name: string
    email: string
  }
  tenancyId: {
    businessName: string
    subdomain: string
  }
  approvedBy?: {
    name: string
    email: string
  }
}

interface RequestStats {
  pending: number
  approved: number
  rejected: number
  completed: number
}

function SuperAdminInventoryRequestsPage() {
  const [requests, setRequests] = useState<InventoryRequest[]>([])
  const [stats, setStats] = useState<RequestStats>({ pending: 0, approved: 0, rejected: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form states for approval/rejection
  const [approvalForm, setApprovalForm] = useState({
    estimatedCost: '',
    supplier: '',
    expectedDelivery: '',
    adminNotes: ''
  })
  const [rejectionForm, setRejectionForm] = useState({
    rejectionReason: '',
    adminNotes: ''
  })

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/superadmin/inventory-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setRequests(data.data.requests || [])
        setStats(data.data.stats || { pending: 0, approved: 0, rejected: 0, completed: 0 })
      }
    } catch (error: any) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async () => {
    if (!selectedRequest || !approvalForm.estimatedCost) {
      toast.error('Please fill in estimated cost')
      return
    }

    try {
      setActionLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/superadmin/inventory-requests/${selectedRequest._id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          estimatedCost: parseFloat(approvalForm.estimatedCost),
          supplier: approvalForm.supplier,
          expectedDelivery: approvalForm.expectedDelivery || null,
          adminNotes: approvalForm.adminNotes
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Request approved successfully')
        setShowModal(false)
        setSelectedRequest(null)
        setApprovalForm({ estimatedCost: '', supplier: '', expectedDelivery: '', adminNotes: '' })
        fetchRequests()
      } else {
        toast.error(data.message || 'Failed to approve request')
      }
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionForm.rejectionReason) {
      toast.error('Please provide rejection reason')
      return
    }

    try {
      setActionLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/superadmin/inventory-requests/${selectedRequest._id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(rejectionForm)
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Request rejected')
        setShowModal(false)
        setSelectedRequest(null)
        setRejectionForm({ rejectionReason: '', adminNotes: '' })
        fetchRequests()
      } else {
        toast.error(data.message || 'Failed to reject request')
      }
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/superadmin/inventory-requests/${selectedRequest._id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          adminNotes: approvalForm.adminNotes
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Request marked as completed')
        setShowModal(false)
        setSelectedRequest(null)
        fetchRequests()
      } else {
        toast.error(data.message || 'Failed to complete request')
      }
    } catch (error) {
      toast.error('Failed to complete request')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Requests</h1>
          <p className="text-gray-600">Manage inventory requests from all tenancies</p>
        </div>
        <Button variant="outline" onClick={fetchRequests}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
          <div className="text-sm text-yellow-100">Pending Review</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.approved}</div>
          <div className="text-sm text-green-100">Approved</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.rejected}</div>
          <div className="text-sm text-red-100">Rejected</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.completed}</div>
          <div className="text-sm text-blue-100">Completed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {tab.label}
              <span className="ml-2 text-xs">
                ({tab.key === 'all' ? requests.length : requests.filter(r => r.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? "No inventory requests have been submitted yet."
              : `No ${filter} requests found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.itemName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency === 'high' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{request.tenancyId.businessName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{request.requestedBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.category && (
                    <p className="text-sm text-gray-500 mb-2">Category: {request.category}</p>
                  )}

                  <p className="text-gray-700 mb-3">{request.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-600">Estimated Quantity:</span>
                      <span className="ml-2">{request.estimatedQuantity} {request.unit}</span>
                    </div>
                    {request.estimatedCost && (
                      <div>
                        <span className="font-medium text-gray-600">Estimated Cost:</span>
                        <span className="ml-2">₹{request.estimatedCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {request.justification && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-600 text-sm">Justification:</span>
                      <p className="text-sm text-gray-700 mt-1">{request.justification}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowModal(true)
                          setApprovalForm({ estimatedCost: '', supplier: '', expectedDelivery: '', adminNotes: '' })
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowModal(true)
                          setRejectionForm({ rejectionReason: '', adminNotes: '' })
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowModal(true)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowModal(true)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedRequest.status === 'pending' ? 'Review Request' : 'Request Details'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRequest(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Request Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                    <p className="text-gray-900">{selectedRequest.itemName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedRequest.category || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <p className="text-gray-900">{selectedRequest.estimatedQuantity} {selectedRequest.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedRequest.urgency)}`}>
                      {selectedRequest.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>

                {selectedRequest.justification && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Justification</label>
                    <p className="text-gray-900">{selectedRequest.justification}</p>
                  </div>
                )}
              </div>

              {/* Action Forms */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Approve Request
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Reject Request
                    </Button>
                  </div>

                  {/* Approval Form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (₹) *</label>
                      <input
                        type="number"
                        value={approvalForm.estimatedCost}
                        onChange={(e) => setApprovalForm({ ...approvalForm, estimatedCost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                      <input
                        type="text"
                        value={approvalForm.supplier}
                        onChange={(e) => setApprovalForm({ ...approvalForm, supplier: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Supplier name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery</label>
                    <input
                      type="date"
                      value={approvalForm.expectedDelivery}
                      onChange={(e) => setApprovalForm({ ...approvalForm, expectedDelivery: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      value={approvalForm.adminNotes}
                      onChange={(e) => setApprovalForm({ ...approvalForm, adminNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes for the tenancy admin..."
                    />
                  </div>

                  {/* Rejection Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                    <textarea
                      value={rejectionForm.rejectionReason}
                      onChange={(e) => setRejectionForm({ ...rejectionForm, rejectionReason: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Explain why this request is being rejected..."
                    />
                  </div>
                </div>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="space-y-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleComplete}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Mark as Completed
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminInventoryRequestsPage