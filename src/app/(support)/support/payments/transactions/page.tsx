'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    loadRecentTransactions()
  }, [])

  const loadRecentTransactions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Load recent transactions for context
      const response = await fetch(`${API_URL}/support/payments?limit=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('💳 Recent transactions data:', data)
        
        if (data.success) {
          // Transform payment issues to transaction format
          const transactions = (data.data.paymentIssues || []).map((issue: any) => ({
            id: issue._id,
            transactionId: issue.paymentId || `TXN-${issue._id.slice(-6)}`,
            orderId: issue._id,
            orderNumber: issue.orderNumber,
            customerId: issue.customer?._id,
            customer: {
              name: issue.customer?.name || 'Unknown',
              email: issue.customer?.email || 'unknown@email.com',
              phone: issue.customer?.phone || 'N/A'
            },
            tenancy: {
              name: issue.tenancy?.name || 'Unknown Tenant',
              slug: issue.tenancy?.slug || 'unknown'
            },
            type: 'payment' as const,
            amount: issue.pricing?.total || 0,
            currency: 'INR',
            status: issue.paymentStatus === 'failed' ? 'failed' : 
                   issue.paymentStatus === 'pending' ? 'pending' : 'completed',
            paymentMethod: issue.paymentMethod || 'Unknown',
            paymentGateway: issue.paymentGateway || 'Razorpay',
            retryCount: 0,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt
          }))
          
          setRecentTransactions(transactions)
          
          // Calculate stats
          const totalAmount = transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          const successful = transactions.filter((t: Transaction) => t.status === 'completed').length
          const failed = transactions.filter((t: Transaction) => t.status === 'failed').length
          const pending = transactions.filter((t: Transaction) => t.status === 'pending').length
          
          setStats({
            total: transactions.length,
            successful,
            failed,
            pending,
            totalAmount,
            failureRate: transactions.length > 0 ? (failed / transactions.length) * 100 : 0
          })
        }
      } else {
        console.error('Failed to load recent transactions:', response.status)
        setMockData()
      }
    } catch (error) {
      console.error('Error loading recent transactions:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        transactionId: 'TXN-2026-001',
        externalTransactionId: 'rzp_live_1234567890',
        orderId: 'order_001',
        orderNumber: 'ORD-2026-001',
        customerId: 'cust_001',
        customer: {
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91 98765 43210'
        },
        tenancy: {
          name: 'CleanWash Laundry',
          slug: 'cleanwash'
        },
        type: 'payment',
        amount: 450,
        currency: 'INR',
        status: 'failed',
        paymentMethod: 'card',
        paymentGateway: 'Razorpay',
        gatewayTransactionId: 'rzp_live_1234567890',
        failureReason: 'Insufficient funds',
        retryCount: 2,
        createdAt: '2026-01-27T10:30:00Z',
        updatedAt: '2026-01-27T10:35:00Z'
      },
      {
        id: '2',
        transactionId: 'TXN-2026-002',
        externalTransactionId: 'rzp_live_0987654321',
        orderId: 'order_002',
        orderNumber: 'ORD-2026-002',
        customerId: 'cust_002',
        customer: {
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 87654 32109'
        },
        tenancy: {
          name: 'QuickClean Services',
          slug: 'quickclean'
        },
        type: 'payment',
        amount: 320,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'upi',
        paymentGateway: 'Razorpay',
        gatewayTransactionId: 'rzp_live_0987654321',
        retryCount: 0,
        createdAt: '2026-01-27T09:15:00Z',
        updatedAt: '2026-01-27T09:16:00Z'
      }
    ]

    setRecentTransactions(mockTransactions)
    setStats({
      total: mockTransactions.length,
      successful: 1,
      failed: 1,
      pending: 0,
      totalAmount: 770,
      failureRate: 50
    })
  }

  const searchTransaction = async () => {
    if (!searchTerm.trim()) return

    try {
      setSearchLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      const response = await fetch(`${API_URL}/support/payments/transactions/${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Transaction lookup data:', data)
        
        if (data.success && data.data.transaction) {
          const txn = data.data.transaction
          setTransaction({
            id: txn._id,
            transactionId: txn.transactionId,
            externalTransactionId: txn.externalTransactionId,
            orderId: txn.orderId?._id,
            orderNumber: txn.orderId?.orderNumber,
            customerId: txn.customerId?._id,
            customer: {
              name: txn.customerId?.name || 'Unknown',
              email: txn.customerId?.email || 'unknown@email.com',
              phone: txn.customerId?.phone || 'N/A'
            },
            branch: txn.branchId ? {
              name: txn.branchId.name,
              location: txn.branchId.location
            } : undefined,
            type: txn.type,
            amount: txn.amount,
            currency: txn.currency || 'INR',
            status: txn.status,
            paymentMethod: txn.paymentMethod,
            paymentGateway: txn.paymentGateway,
            gatewayTransactionId: txn.gatewayTransactionId,
            failureReason: txn.failureReason,
            retryCount: txn.retryCount || 0,
            createdAt: txn.createdAt,
            updatedAt: txn.updatedAt,
            metadata: txn.metadata
          })
        } else {
          setTransaction(null)
          alert('Transaction not found')
        }
      } else {
        console.error('Failed to lookup transaction:', response.status)
        // Use mock data for demo
        if (searchTerm.toLowerCase().includes('txn-2026-001') || searchTerm.includes('rzp_live_1234567890')) {
          setTransaction(recentTransactions[0] || null)
        } else {
          setTransaction(null)
          alert('Transaction not found')
        }
      }
    } catch (error) {
      console.error('Error searching transaction:', error)
      setTransaction(null)
      alert('Error searching transaction')
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