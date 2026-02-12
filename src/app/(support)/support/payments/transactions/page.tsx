'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  CreditCard,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Download,
  Info,
  DollarSign,
  Receipt,
  Zap
} from 'lucide-react'

interface Transaction {
  id: string
  transactionId: string
  externalTransactionId?: string
  orderId?: string
  orderNumber?: string
  customerId: string
  customer: {
    name: string
    email: string
    phone: string
  }
  branchId?: string
  branch?: {
    name: string
    location: string
  }
  tenancy?: {
    name: string
    slug: string
  }
  type: 'payment' | 'refund' | 'settlement'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod: string
  paymentGateway: string
  gatewayTransactionId?: string
  failureReason?: string
  retryCount: number
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

interface TransactionStats {
  total: number
  successful: number
  failed: number
  pending: number
  totalAmount: number
  failureRate: number
}

export default function TransactionLookupPage() {
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalAmount: 0,
    failureRate: 0
  })
  const [error, setError] = useState<string | null>(null)

  const mapToTransaction = (issue: any): Transaction => ({
    id: issue._id || issue.id,
    transactionId: issue.paymentId || issue.transactionId || `TXN-${String(issue._id).slice(-6)}`,
    externalTransactionId: issue.externalTransactionId,
    orderId: issue.orderId?._id,
    orderNumber: issue.orderId?.orderNumber,
    customerId: issue.customerId?._id || issue.customer?._id,
    customer: {
      name: issue.customerId?.name || issue.customer?.name || 'Unknown',
      email: issue.customerId?.email || issue.customer?.email || 'N/A',
      phone: issue.customerId?.phone || issue.customer?.phone || 'N/A'
    },
    tenancy: issue.tenancy ? { name: issue.tenancy.name || 'Unknown', slug: issue.tenancy.slug || 'unknown' } : undefined,
    type: (issue.type || 'payment') as Transaction['type'],
    amount: issue.amount || issue.pricing?.total || 0,
    currency: issue.currency || 'INR',
    status: (issue.status || issue.paymentStatus) as Transaction['status'],
    paymentMethod: issue.paymentMethod || 'Unknown',
    paymentGateway: issue.paymentGateway || 'Unknown',
    gatewayTransactionId: issue.externalTransactionId,
    failureReason: issue.failureReason,
    retryCount: issue.retryCount || 0,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    metadata: issue.metadata
  })

  useEffect(() => {
    loadRecentTransactions()
  }, [])

  const loadRecentTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/support/payments', { params: { limit: 10 } })
      const data = response.data
      const payload = data?.data || data
      const raw = payload?.paymentIssues || payload?.transactions || []
      const transactions = raw.map(mapToTransaction)

      setRecentTransactions(transactions)
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
      const successful = transactions.filter(t => t.status === 'completed').length
      const failed = transactions.filter(t => t.status === 'failed').length
      const pending = transactions.filter(t => t.status === 'pending').length

      setStats({
        total: transactions.length,
        successful,
        failed,
        pending,
        totalAmount,
        failureRate: transactions.length > 0 ? (failed / transactions.length) * 100 : 0
      })
    } catch (err: any) {
      console.error('Error loading recent transactions:', err)
      setError(err?.response?.data?.message || 'Failed to load transactions')
      setRecentTransactions([])
      setStats({ total: 0, successful: 0, failed: 0, pending: 0, totalAmount: 0, failureRate: 0 })
    } finally {
      setLoading(false)
    }
  }

  const searchTransaction = async () => {
    if (!searchTerm.trim()) return

    try {
      setSearchLoading(true)
      setTransaction(null)
      const response = await api.get(`/support/payments/transactions/${encodeURIComponent(searchTerm.trim())}`)
      const data = response.data
      const payload = data?.data || data
      const txn = payload?.transaction || payload

      if (txn) {
        setTransaction(mapToTransaction(txn))
      } else {
        setTransaction(null)
      }
    } catch (err: any) {
      console.error('Error searching transaction:', err)
      setTransaction(null)
      if (err?.response?.status !== 404) {
        alert(err?.response?.data?.message || 'Error searching transaction')
      }
    } finally {
      setSearchLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      case 'refunded': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'refunded': return <RefreshCw className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Lookup</h1>
          <p className="text-gray-600 mt-1">
            Search and investigate payment transactions
          </p>
        </div>
        
        <button 
          onClick={loadRecentTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadRecentTransactions} className="text-red-600 hover:text-red-800 font-medium">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-xs">Recent activity</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Successful</p>
              <p className="text-3xl font-bold">{stats.successful}</p>
              <p className="text-green-100 text-xs">Completed payments</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Failed</p>
              <p className="text-3xl font-bold">{stats.failed}</p>
              <p className="text-red-100 text-xs">{stats.failureRate.toFixed(1)}% failure rate</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Amount</p>
              <p className="text-3xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
              <p className="text-purple-100 text-xs">Transaction volume</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Transaction</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter transaction ID, order ID, or gateway transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTransaction()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={searchTransaction}
            disabled={searchLoading || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {searchLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search</span>
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Search by: Transaction ID, Order ID, Gateway Transaction ID, or External Reference</p>
          <p className="mt-1">Example: TXN-2026-001, rzp_live_1234567890, ORD-2026-001</p>
        </div>
      </div>

      {/* Transaction Details */}
      {transaction && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
                <span>{transaction.status.toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transaction Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Transaction Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900">{transaction.transactionId}</span>
                      <button onClick={() => copyToClipboard(transaction.transactionId)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {transaction.externalTransactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Gateway Transaction ID</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900">{transaction.externalTransactionId}</span>
                        <button onClick={() => copyToClipboard(transaction.externalTransactionId!)} className="text-gray-400 hover:text-gray-600">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-semibold text-gray-900">₹{transaction.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment Method</span>
                    <span className="text-sm text-gray-900 capitalize">{transaction.paymentMethod}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment Gateway</span>
                    <span className="text-sm text-gray-900">{transaction.paymentGateway}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm text-gray-900 capitalize">{transaction.type}</span>
                  </div>
                  
                  {transaction.failureReason && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Failure Reason</span>
                      <span className="text-sm text-red-600">{transaction.failureReason}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Retry Count</span>
                    <span className="text-sm text-gray-900">{transaction.retryCount}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Created At</span>
                    <span className="text-sm text-gray-900">{new Date(transaction.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900">{new Date(transaction.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Order Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm text-gray-900">{transaction.customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm text-gray-900">{transaction.customer.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm text-gray-900">{transaction.customer.phone}</span>
                  </div>
                </div>
              </div>

              {transaction.orderNumber && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Order Number</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-blue-600">{transaction.orderNumber}</span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transaction.tenancy && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tenant Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tenant Name</span>
                      <span className="text-sm text-gray-900">{transaction.tenancy.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tenant Slug</span>
                      <span className="text-sm font-mono text-gray-900">{transaction.tenancy.slug}</span>
                    </div>
                  </div>
                </div>
              )}

              {transaction.branch && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Branch Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Branch Name</span>
                      <span className="text-sm text-gray-900">{transaction.branch.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm text-gray-900">{transaction.branch.location}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>View in Gateway</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Details</span>
              </button>
              {transaction.status === 'failed' && (
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((txn) => (
              <div key={txn.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setTransaction(txn)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{txn.transactionId}</p>
                      <p className="text-sm text-gray-500">{txn.customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{txn.amount.toLocaleString()}</p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(txn.status)}`}>
                      {getStatusIcon(txn.status)}
                      <span>{txn.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Recent transaction data will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}