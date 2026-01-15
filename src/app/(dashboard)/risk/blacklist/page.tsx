'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  X
} from 'lucide-react'

interface BlacklistEntry {
  _id: string
  entryId: string
  entityType: string
  identifiers: {
    name?: string
    email?: string
    phone?: string
    deviceId?: string
    ipAddress?: string
  }
  reason: string
  description: string
  severity: string
  status: string
  riskScore: number
  restrictions: {
    blockOrders: boolean
    blockRegistration: boolean
    blockPayments: boolean
  }
  createdAt: string
  createdBy?: { name: string }
}

interface Pagination {
  current: number
  pages: number
  total: number
  limit: number
}

export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState('')
  const [status, setStatus] = useState('')
  const [severity, setSeverity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newEntry, setNewEntry] = useState({
    entityType: 'customer',
    reason: 'fraud',
    description: '',
    severity: 'medium',
    identifiers: { name: '', email: '', phone: '' }
  })

  useEffect(() => {
    fetchEntries()
  }, [pagination.current, entityType, status, severity])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params: any = { page: pagination.current, limit: 20 }
      if (search) params.search = search
      if (entityType) params.entityType = entityType
      if (status) params.status = status
      if (severity) params.severity = severity
      
      const response = await superAdminApi.getBlacklistEntries(params)
      setEntries(response.data.entries)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchEntries()
  }

  const handleCreate = async () => {
    if (!newEntry.description.trim()) return
    try {
      setCreateLoading(true)
      await superAdminApi.createBlacklistEntry(newEntry)
      setShowCreateModal(false)
      setNewEntry({
        entityType: 'customer',
        reason: 'fraud',
        description: '',
        severity: 'medium',
        identifiers: { name: '', email: '', phone: '' }
      })
      fetchEntries()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.medium}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      appealed: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-600'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      customer: 'Customer',
      driver: 'Driver',
      vendor: 'Vendor',
      branch_staff: 'Branch Staff',
      phone_number: 'Phone Number',
      email: 'Email',
      device: 'Device',
      ip_address: 'IP Address'
    }
    return labels[type] || type
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      fraud: 'Fraud',
      payment_default: 'Payment Default',
      abusive_behavior: 'Abusive Behavior',
      fake_orders: 'Fake Orders',
      policy_violation: 'Policy Violation',
      security_threat: 'Security Threat',
      spam: 'Spam',
      identity_theft: 'Identity Theft',
      chargeback_abuse: 'Chargeback Abuse',
      other: 'Other'
    }
    return labels[reason] || reason
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
            <h1 className="text-2xl font-bold text-gray-900">Blacklist Management</h1>
            <p className="text-gray-600">Manage blacklisted entities and restrictions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchEntries()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Entity Types</option>
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="phone_number">Phone Number</option>
              <option value="email">Email</option>
              <option value="device">Device</option>
              <option value="ip_address">IP Address</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="under_review">Under Review</option>
              <option value="appealed">Appealed</option>
            </select>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Entries Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No blacklist entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifiers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.entryId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEntityTypeLabel(entry.entityType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs">
                        {entry.identifiers.name && <div>{entry.identifiers.name}</div>}
                        {entry.identifiers.email && <div className="text-xs">{entry.identifiers.email}</div>}
                        {entry.identifiers.phone && <div className="text-xs">{entry.identifiers.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getReasonLabel(entry.reason)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(entry.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${entry.riskScore >= 80 ? 'bg-red-500' : entry.riskScore >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${entry.riskScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{entry.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
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
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Blacklist Entry</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                <select
                  value={newEntry.entityType}
                  onChange={(e) => setNewEntry({ ...newEntry, entityType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="customer">Customer</option>
                  <option value="driver">Driver</option>
                  <option value="phone_number">Phone Number</option>
                  <option value="email">Email</option>
                  <option value="device">Device</option>
                  <option value="ip_address">IP Address</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="fraud">Fraud</option>
                  <option value="payment_default">Payment Default</option>
                  <option value="abusive_behavior">Abusive Behavior</option>
                  <option value="fake_orders">Fake Orders</option>
                  <option value="policy_violation">Policy Violation</option>
                  <option value="security_threat">Security Threat</option>
                  <option value="spam">Spam</option>
                  <option value="chargeback_abuse">Chargeback Abuse</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={newEntry.severity}
                  onChange={(e) => setNewEntry({ ...newEntry, severity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Identifiers</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newEntry.identifiers.name}
                    onChange={(e) => setNewEntry({ ...newEntry, identifiers: { ...newEntry.identifiers, name: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newEntry.identifiers.email}
                    onChange={(e) => setNewEntry({ ...newEntry, identifiers: { ...newEntry.identifiers, email: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={newEntry.identifiers.phone}
                    onChange={(e) => setNewEntry({ ...newEntry, identifiers: { ...newEntry.identifiers, phone: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe the reason for blacklisting..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading || !newEntry.description.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {createLoading ? 'Adding...' : 'Add to Blacklist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

