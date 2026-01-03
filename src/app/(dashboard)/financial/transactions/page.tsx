'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  ArrowLeft,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Search,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface Transaction {
  _id: string
  transactionId: string
  type: string
  subType: string
  amount: number
  netAmount: number
  currency: string
  status: string
  paymentMethod: string
  requiresApproval: boolean
  approvalStatus: string
  customerId?: {
    name: string
    email: string
    phone: string
  }
  branchId?: {
    name: string
    location: string
  }
  orderId?: {
    orderNumber: string
  }
  description: string
  createdAt: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getTransactions(filters)
      setTransactions(response.data.transactions)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRefund = async (transactionId: string) => {
    try {
      setActionLoading(`approve-${transactionId}`)
      await superAdminApi.approveRefund(transactionId)
      await fetchTransactions()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectRefund = async (transactionId: string, reason: string) => {
    try {
      setActionLoading(`reject-${transactionId}`)
      await superAdminApi.rejectRefund(transactionId, reason)
      await fetchTransactions()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: X },
      refunded: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      payment: { color: 'bg-green-100 text-green-800' },
      refund: { color: 'bg-red-100 text-red-800' },
      settlement: { color: 'bg-blue-100 text-blue-800' },
      commission: { color: 'bg-purple-100 text-purple-800' },
      penalty: { color: 'bg-orange-100 text-orange-800' },
      bonus: { color: 'bg-emerald-100 text-emerald-800' },
      adjustment: { color: 'bg-gray-100 text-gray-800' }
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.payment

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/superadmin/financial"
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Monitor and manage all financial transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Transaction ID, description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="settlement">Settlement</option>
              <option value="commission">Commission</option>
              <option value="penalty">Penalty</option>
              <option value="bonus">Bonus</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="net_banking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.transactionId}
                      </div>
                      {transaction.orderId && (
                        <div className="text-sm text-gray-500">
                          Order: {transaction.orderId.orderNumber}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {transaction.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getTypeBadge(transaction.type)}
                      {getStatusBadge(transaction.status)}
                      {transaction.requiresApproval && transaction.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Needs Approval
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.netAmount !== transaction.amount && (
                        <div className="text-sm text-gray-500">
                          Net: {formatCurrency(transaction.netAmount)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {transaction.customerId && (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.customerId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.customerId.email}
                          </div>
                        </div>
                      )}
                      {transaction.branchId && (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.branchId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.branchId.location}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/superadmin/financial/transactions/${transaction._id}`}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {transaction.type === 'refund' && 
                       transaction.requiresApproval && 
                       transaction.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRefund(transaction._id)}
                            disabled={actionLoading === `approve-${transaction._id}`}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Approve Refund"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:')
                              if (reason) {
                                handleRejectRefund(transaction._id, reason)
                              }
                            }}
                            disabled={actionLoading === `reject-${transaction._id}`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Reject Refund"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                    disabled={filters.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
