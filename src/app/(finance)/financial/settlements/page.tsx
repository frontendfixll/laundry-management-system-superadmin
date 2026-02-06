'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react'

interface Settlement {
  _id: string
  settlementId: string
  type: string
  recipientType: string
  recipientId: {
    _id: string
    name: string
  }
  amount: number
  currency: string
  status: string
  period: {
    startDate: string
    endDate: string
  }
  breakdown: {
    grossAmount: number
    deductions: number
    netAmount: number
  }
  createdAt: string
}

interface Pagination {
  current: number
  pages: number
  total: number
  limit: number
}

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [pagination, setPagination] = useState<Pagination>({ current: 1, pages: 1, total: 0, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: '',
    status: '',
    search: ''
  })

  useEffect(() => {
    fetchSettlements()
  }, [filters])

  const fetchSettlements = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getSettlements(filters)
      setSettlements(response.data.settlements)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (settlementId: string) => {
    try {
      setActionLoading(settlementId)
      await superAdminApi.approveSettlement(settlementId)
      fetchSettlements()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string, icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      processing: { color: 'bg-purple-100 text-purple-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }
    const { color, icon: Icon } = config[status] || config.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/financial" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settlements</h1>
            <p className="text-gray-600">Manage branch and partner settlements</p>
          </div>
        </div>
        <button
          onClick={fetchSettlements}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settlements..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="branch_payout">Branch Payout</option>
            <option value="driver_payout">Driver Payout</option>
            <option value="vendor_payout">Vendor Payout</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : settlements.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No settlements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Settlement ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settlements.map((settlement) => (
                  <tr key={settlement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {settlement.settlementId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{settlement.recipientId?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {settlement.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(settlement.breakdown?.netAmount || settlement.amount)}
                        </div>
                        {settlement.breakdown && (
                          <div className="text-xs text-gray-500">
                            Gross: {formatCurrency(settlement.breakdown.grossAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {settlement.period ? (
                        <div>
                          {new Date(settlement.period.startDate).toLocaleDateString()} - 
                          {new Date(settlement.period.endDate).toLocaleDateString()}
                        </div>
                      ) : (
                        new Date(settlement.createdAt).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(settlement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {settlement.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(settlement._id)}
                          disabled={actionLoading === settlement._id}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                      )}
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
              Page {pagination.current} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.pages}
                className="p-2 border rounded-lg disabled:opacity-50"
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

