'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  ExternalLink,
  User,
  Building2,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertCircle,
  Info,
  FileText,
  Zap
} from 'lucide-react'

interface PaymentIssue {
  _id: string
  transactionId: string
  orderId?: {
    orderNumber?: string
    _id?: string
  }
  customerId?: {
    name?: string
    email?: string
  }
  branchId?: {
    name?: string
  }
  amount: number
  status: 'failed' | 'pending' | 'cancelled' | 'completed'
  type: string
  paymentMethod: string
  paymentGateway?: string
  failureReason?: string
  createdAt: string
  externalTransactionId?: string
}

interface TransactionDetails {
  transactionId: string
  orderId: string
  amount: number
  status: string
  paymentMethod: string
  gatewayResponse: any
  createdAt: string
  customer: {
    name: string
    email: string
  }
  tenant: {
    name: string
  }
}

export default function PaymentSupportPage() {
  const [loading, setLoading] = useState(true)
  const [paymentIssues, setPaymentIssues] = useState<PaymentIssue[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<PaymentIssue | null>(null)
  const [transactionLookup, setTransactionLookup] = useState('')
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentIssues()
  }, [])

  const loadPaymentIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/support/payments', { params: { limit: 50 } })
      const data = response.data
      const payload = data?.data || data
      setPaymentIssues(payload?.paymentIssues || [])
    } catch (err: any) {
      console.error('Failed to load payment issues:', err)
      setError(err?.response?.data?.message || 'Failed to load payment issues')
      setPaymentIssues([])
    } finally {
      setLoading(false)
    }
  }

  const lookupTransaction = async () => {
    if (!transactionLookup.trim()) return

    setLookupLoading(true)
    setTransactionDetails(null)
    try {
      const response = await api.get(`/support/payments/transactions/${encodeURIComponent(transactionLookup.trim())}`)
      const data = response.data
      const payload = data?.data || data
      setTransactionDetails(payload)
    } catch (err: any) {
      console.error('Failed to lookup transaction:', err)
      setTransactionDetails(null)
    } finally {
      setLookupLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredIssues = paymentIssues.filter(issue => {
    const orderNumber = issue.orderId?.orderNumber || issue.orderId?._id || ''
    const customerName = issue.customerId?.name || ''
    const branchName = issue.branchId?.name || ''
    const transactionId = issue.transactionId || issue.externalTransactionId || ''
    
    const matchesSearch = orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Support</h1>
          <p className="text-gray-600 mt-1">
            Investigate payment issues and transaction failures across all tenants
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={loadPaymentIssues} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button onClick={loadPaymentIssues} className="text-red-600 hover:text-red-800 font-medium">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Failed Payments</p>
              <p className="text-3xl font-bold">{paymentIssues.filter(i => i.status === 'failed').length}</p>
              <p className="text-red-100 text-xs">Need investigation</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Payments</p>
              <p className="text-3xl font-bold">{paymentIssues.filter(i => i.status === 'pending').length}</p>
              <p className="text-yellow-100 text-xs">Awaiting confirmation</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Refund Requests</p>
              <p className="text-3xl font-bold">{paymentIssues.filter(i => i.status === 'refund_requested').length}</p>
              <p className="text-purple-100 text-xs">Pending approval</p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Amount</p>
              <p className="text-3xl font-bold">₹{paymentIssues.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</p>
              <p className="text-blue-100 text-xs">Affected revenue</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Transaction Lookup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Lookup</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter transaction ID, order ID, or payment reference..."
              value={transactionLookup}
              onChange={(e) => setTransactionLookup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && lookupTransaction()}
            />
          </div>
          <button
            onClick={lookupTransaction}
            disabled={lookupLoading || !transactionLookup.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            {lookupLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Lookup</span>
          </button>
        </div>

        {/* Transaction Details */}
        {transactionDetails && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Transaction ID:</span> {transactionDetails.transactionId}</p>
                  <p><span className="font-medium">Order ID:</span> {transactionDetails.orderId}</p>
                  <p><span className="font-medium">Amount:</span> ₹{transactionDetails.amount}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(transactionDetails.status)}`}>
                      {transactionDetails.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Payment Method:</span> {transactionDetails.paymentMethod}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer & Tenant</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Customer:</span> {transactionDetails.customer.name}</p>
                  <p><span className="font-medium">Email:</span> {transactionDetails.customer.email}</p>
                  <p><span className="font-medium">Tenant:</span> {transactionDetails.tenant.name}</p>
                  <p><span className="font-medium">Created:</span> {new Date(transactionDetails.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {transactionDetails.gatewayResponse && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Gateway Response</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(transactionDetails.gatewayResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, customers, transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Issues List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Issues ({filteredIssues.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <div key={issue._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-lg font-mono font-semibold text-blue-600">
                        {issue.orderId?.orderNumber || issue.orderId?._id || issue.transactionId}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 ${getStatusColor(issue.status)}`}>
                        {getStatusIcon(issue.status)}
                        <span>{issue.status.replace('_', ' ')}</span>
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {issue.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{issue.failureReason || 'Payment processing issue'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{issue.customerId?.name || 'Unknown Customer'}</p>
                          <p className="text-xs text-gray-500">Customer</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{issue.branchId?.name || 'Unknown Branch'}</p>
                          <p className="text-xs text-gray-500">Branch</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">₹{issue.amount}</p>
                          <p className="text-xs text-gray-500">Amount</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(issue.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {issue.transactionId && (
                      <div className="mt-3 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Transaction ID: {issue.transactionId}</span>
                      </div>
                    )}
                    
                    {issue.failureReason && (
                      <div className="mt-2 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">Failure Reason: {issue.failureReason}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedIssue(issue)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Investigate</span>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment issues found</h3>
              <p className="text-gray-500">All payments are processing normally</p>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escalation Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Escalate to Finance</p>
                <p className="text-sm text-gray-500">For refund approvals</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Contact Gateway</p>
                <p className="text-sm text-gray-500">Technical issues</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mark Resolved</p>
                <p className="text-sm text-gray-500">Issue fixed</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}