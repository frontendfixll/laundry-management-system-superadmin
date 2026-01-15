'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Package,
  Building2,
  MessageSquare,
  Send,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

interface Complaint {
  _id: string
  complaintId: string
  title: string
  description: string
  category: string
  severity: string
  priority: string
  status: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerId?: { _id: string; name: string; email: string; phone: string }
  branchId?: { _id: string; name: string; location?: any }
  orderId?: { _id: string; orderNumber: string }
  isEscalated: boolean
  escalationLevel: number
  escalationReason?: string
  slaBreached: boolean
  slaTarget?: string
  fraudRisk: string
  resolution?: string
  resolutionType?: string
  resolutionAmount?: number
  resolvedAt?: string
  assignedTo?: any
  actions: Array<{
    actionType: string
    description: string
    timestamp: string
    performedBy?: any
  }>
  createdAt: string
  updatedAt: string
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const complaintId = params.id as string
  
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  // Action modals
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  
  // Form states
  const [escalateReason, setEscalateReason] = useState('')
  const [escalateLevel, setEscalateLevel] = useState(1)
  const [resolution, setResolution] = useState('')
  const [resolutionType, setResolutionType] = useState('apology')
  const [resolutionAmount, setResolutionAmount] = useState(0)

  useEffect(() => {
    fetchComplaint()
  }, [complaintId])

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      const response = await superAdminApi.getComplaint(complaintId)
      setComplaint(response.data.complaint)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEscalate = async () => {
    if (!escalateReason.trim()) return
    try {
      setActionLoading(true)
      await superAdminApi.escalateComplaint(complaintId, escalateReason, escalateLevel)
      setShowEscalateModal(false)
      setEscalateReason('')
      fetchComplaint()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!resolution.trim()) return
    try {
      setActionLoading(true)
      await superAdminApi.resolveComplaint(complaintId, resolution, resolutionType, resolutionAmount || undefined)
      setShowResolveModal(false)
      fetchComplaint()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const config: Record<string, { color: string, icon: any }> = {
      low: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const { color, icon: Icon } = config[severity] || config.medium
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      escalated: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config[status] || config.open}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Complaint Not Found</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/superadmin/risk/complaints">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Back to Complaints</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/risk/complaints" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{complaint.complaintId}</h1>
            <p className="text-gray-600">{complaint.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getSeverityBadge(complaint.severity)}
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      {/* Flags */}
      {(complaint.isEscalated || complaint.slaBreached || complaint.fraudRisk !== 'none') && (
        <div className="flex gap-3">
          {complaint.isEscalated && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Escalated - Level {complaint.escalationLevel}</span>
            </div>
          )}
          {complaint.slaBreached && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">SLA Breached</span>
            </div>
          )}
          {complaint.fraudRisk !== 'none' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Fraud Risk: {complaint.fraudRisk}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Resolution (if resolved) */}
          {complaint.resolution && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Resolution
              </h3>
              <p className="text-green-800 mb-2">{complaint.resolution}</p>
              <div className="flex gap-4 text-sm text-green-700">
                <span>Type: {complaint.resolutionType?.replace('_', ' ')}</span>
                {complaint.resolutionAmount && <span>Amount: ₹{complaint.resolutionAmount}</span>}
              </div>
            </div>
          )}

          {/* Action History */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Action History</h3>
            {complaint.actions?.length > 0 ? (
              <div className="space-y-4">
                {complaint.actions.map((action, index) => (
                  <div key={index} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{action.actionType.replace('_', ' ')}</p>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(action.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No actions recorded yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowEscalateModal(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Escalate
                </button>
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </button>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Customer
            </h3>
            <div className="space-y-2">
              <p className="font-medium">{complaint.customerName}</p>
              <p className="text-gray-600 text-sm">{complaint.customerEmail}</p>
              {complaint.customerPhone && (
                <p className="text-gray-600 text-sm">{complaint.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Related Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Info</h3>
            <div className="space-y-3">
              {complaint.orderId && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Order: {complaint.orderId.orderNumber || complaint.orderId._id}</span>
                </div>
              )}
              {complaint.branchId && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Branch: {complaint.branchId.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Created: {new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Escalate Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Level</label>
                <select
                  value={escalateLevel}
                  onChange={(e) => setEscalateLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter escalation reason..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={actionLoading || !escalateReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Escalating...' : 'Escalate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Resolve Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Type</label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="refund">Refund</option>
                  <option value="replacement">Replacement</option>
                  <option value="compensation">Compensation</option>
                  <option value="apology">Apology</option>
                  <option value="policy_change">Policy Change</option>
                  <option value="no_action">No Action Required</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {['refund', 'compensation'].includes(resolutionType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={resolutionAmount}
                    onChange={(e) => setResolutionAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Details</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the resolution..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={actionLoading || !resolution.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Resolving...' : 'Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
