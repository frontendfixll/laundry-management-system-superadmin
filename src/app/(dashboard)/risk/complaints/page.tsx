'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  ArrowLeft,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
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
  isEscalated: boolean
  escalationLevel: number
  slaBreached: boolean
  fraudRisk: string
  createdAt: string
  branchId?: { name: string }
  orderId?: { orderNumber: string }
}

interface Pagination {
  current: number
  pages: number
  total: number
  limit: number
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [severity, setSeverity] = useState('')
  const [category, setCategory] = useState('')
  const [isEscalated, setIsEscalated] = useState('')
  const [slaBreached, setSlaBreached] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchComplaints()
  }, [pagination.current, status, severity, category, isEscalated, slaBreached])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params: any = {
        page: pagination.current,
        limit: 20
      }
      
      if (search) params.search = search
      if (status) params.status = status
      if (severity) params.severity = severity
      if (category) params.category = category
      if (isEscalated) params.isEscalated = isEscalated
      if (slaBreached) params.slaBreached = slaBreached
      
      const response = await superAdminApi.getComplaints(params)
      setComplaints(response.data.complaints)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchComplaints()
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
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
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
      closed: 'bg-gray-100 text-gray-800',
      reopened: 'bg-purple-100 text-purple-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[status] || config.open}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      service_quality: 'Service Quality',
      delivery_delay: 'Delivery Delay',
      damaged_items: 'Damaged Items',
      missing_items: 'Missing Items',
      billing_issue: 'Billing Issue',
      staff_behavior: 'Staff Behavior',
      refund_request: 'Refund Request',
      technical_issue: 'Technical Issue',
      fraud_report: 'Fraud Report',
      other: 'Other'
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/risk" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
            <p className="text-gray-600">Manage and resolve customer complaints</p>
          </div>
        </div>
        <button
          onClick={() => fetchComplaints()}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, title, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-purple-50 border-purple-300' : 'border-gray-300'}`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="service_quality">Service Quality</option>
              <option value="delivery_delay">Delivery Delay</option>
              <option value="damaged_items">Damaged Items</option>
              <option value="billing_issue">Billing Issue</option>
              <option value="fraud_report">Fraud Report</option>
            </select>

            <select
              value={isEscalated}
              onChange={(e) => setIsEscalated(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Escalation</option>
              <option value="true">Escalated Only</option>
              <option value="false">Not Escalated</option>
            </select>

            <select
              value={slaBreached}
              onChange={(e) => setSlaBreached(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">SLA Status</option>
              <option value="true">SLA Breached</option>
              <option value="false">Within SLA</option>
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No complaints found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {complaint.complaintId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {complaint.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{complaint.customerName}</div>
                      <div className="text-xs text-gray-400">{complaint.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryLabel(complaint.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(complaint.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {complaint.isEscalated && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            L{complaint.escalationLevel}
                          </span>
                        )}
                        {complaint.slaBreached && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            <Clock className="w-3 h-3 inline" />
                          </span>
                        )}
                        {complaint.fraudRisk !== 'none' && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            Fraud
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/superadmin/risk/complaints/${complaint._id}`}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

