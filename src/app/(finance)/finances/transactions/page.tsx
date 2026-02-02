'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  CreditCard,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Building2
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Transaction {
  _id: string
  transactionId: string
  tenantId: string
  tenantName: string
  customerId: string
  customerName: string
  customerEmail: string
  amount: number
  type: 'payment' | 'refund' | 'commission' | 'payout'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet'
  gateway: 'razorpay' | 'stripe' | 'payu' | 'cashfree'
  gatewayTransactionId: string
  description: string
  createdAt: Date
  updatedAt: Date
  metadata: {
    orderId?: string
    ipAddress: string
    userAgent: string
    failureReason?: string
  }
}

interface TransactionStats {
  totalTransactions: number
  totalAmount: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  successRate: number
  avgTransactionValue: number
  todayTransactions: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedGateway, setSelectedGateway] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTransactions()
  }, [page, selectedStatus, selectedType, selectedGateway, dateRange, searchQuery])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: page,
        limit: 20,
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedGateway !== 'all' && { gateway: selectedGateway }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      }

      const data = await superAdminApi.getFinanceTransactions(params)
      
      if (data.success) {
        setTransactions(data.data.transactions.map((txn: any) => ({
          ...txn,
          createdAt: new Date(txn.createdAt),
          updatedAt: new Date(txn.updatedAt)
        })))
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch transactions')
      }
      
    } catch (error) {
      console.error('Error fetching transactions:', error)
      
      // Show empty state instead of mock data
      setTransactions([])
      setStats({
        totalTransactions: 0,
        totalAmount: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        successRate: 0,
        avgTransactionValue: 0,
        todayTransactions: 0
      })
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'failed': return 'text-red-700 bg-red-100'
      case 'cancelled': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'text-blue-700 bg-blue-100'
      case 'refund': return 'text-orange-700 bg-orange-100'
      case 'commission': return 'text-purple-700 bg-purple-100'
      case 'payout': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <ArrowDownRight className="w-4 h-4 text-green-600" />
      case 'refund': return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case 'commission': return <DollarSign className="w-4 h-4 text-purple-600" />
      case 'payout': return <ArrowUpRight className="w-4 h-4 text-blue-600" />
      default: return <CreditCard className="w-4 h-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <CreditCard className="w-8 h-8 mr-3" />
              Transaction Management
            </h1>
            <p className="text-blue-100 mt-2">
              Monitor and analyze all platform transactions in real-time
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Success Rate</p>
            <p className="text-2xl font-bold">{stats?.successRate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Transactions</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats?.totalTransactions?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-green-600">+{stats?.todayTransactions || 0} today</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(stats?.totalAmount || 0)}
              </p>
              <p className="text-xs text-blue-600">All transactions</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Success Rate</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {stats?.successRate || 0}%
              </p>
              <p className="text-xs text-yellow-600">{stats?.successfulTransactions || 0} successful</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Transaction</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatCurrency(stats?.avgTransactionValue || 0)}
              </p>
              <p className="text-xs text-purple-600">Per transaction</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <ArrowDownRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Transaction Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats?.successfulTransactions || 0, color: '#10B981' },
                    { name: 'Pending', value: stats?.pendingTransactions || 0, color: '#F59E0B' },
                    { name: 'Failed', value: stats?.failedTransactions || 0, color: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ArrowDownRight className="w-5 h-5 mr-2 text-blue-600" />
            Transaction Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { day: 'Mon', transactions: 145, amount: 28450 },
                { day: 'Tue', transactions: 167, amount: 32890 },
                { day: 'Wed', transactions: 134, amount: 26780 },
                { day: 'Thu', transactions: 189, amount: 37650 },
                { day: 'Fri', transactions: 203, amount: 41230 },
                { day: 'Sat', transactions: 234, amount: 47890 },
                { day: 'Sun', transactions: 198, amount: 39560 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
            <option value="commission">Commission</option>
            <option value="payout">Payout</option>
          </select>

          <select
            value={selectedGateway}
            onChange={(e) => setSelectedGateway(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Gateways</option>
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
            <option value="payu">PayU</option>
            <option value="cashfree">Cashfree</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.transactionId}</div>
                      <div className="text-sm text-gray-500">{transaction.gatewayTransactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                      <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.tenantName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(transaction.type)}
                      <span className={`ml-2 text-sm font-medium ${
                        transaction.type === 'refund' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'refund' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(transaction.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{transaction.gateway}</div>
                    <div className="text-sm text-gray-500 capitalize">{transaction.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.createdAt.toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{transaction.createdAt.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}