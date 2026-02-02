'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  IndianRupee,
  Calendar,
  Users,
  Target,
  RefreshCw,
  Search
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

interface FinanceStats {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  payments: {
    total: number
    successful: number
    pendingRefunds: number
    successRate: number
    avgTransactionValue: number
  }
}

interface RecentTransaction {
  _id: string
  customer?: {
    name: string
    email: string
  }
  tenancy?: {
    name: string
  }
  amount: number
  type: 'payment' | 'refund' | 'settlement' | 'commission' | 'penalty' | 'bonus' | 'adjustment'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  createdAt: string
  description?: string
}

export default function FinanceDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [timeframe, setTimeframe] = useState('30d')

  useEffect(() => {
    fetchFinancialData()
  }, [timeframe])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Fetching financial overview...')
      
      // Fetch financial overview
      const overviewResponse = await superAdminApi.getFinancialOverview(timeframe)
      console.log('📊 Financial overview response:', overviewResponse)
      
      if (overviewResponse.success && overviewResponse.data?.overview) {
        const overview = overviewResponse.data.overview
        
        // Map the API response to our stats structure
        setStats({
          revenue: {
            total: overview.totalRevenue || 0,
            thisMonth: overview.monthlyRevenue || 0,
            lastMonth: overview.lastMonthRevenue || 0,
            growth: overview.revenueGrowth || 0
          },
          payments: {
            total: overview.totalTransactions || 0,
            successful: overview.successfulTransactions || 0,
            pendingRefunds: overview.pendingRefunds || 0,
            successRate: overview.successRate || 0,
            avgTransactionValue: overview.avgTransactionValue || 0
          }
        })
      }

      // Fetch recent transactions
      console.log('💳 Fetching recent transactions...')
      const transactionsResponse = await superAdminApi.getTransactions({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      console.log('💳 Transactions response:', transactionsResponse)
      
      if (transactionsResponse.success && transactionsResponse.data?.transactions) {
        setRecentTransactions(transactionsResponse.data.transactions)
      }

    } catch (error: any) {
      console.error('❌ Error fetching financial data:', error)
      setError(error.message || 'Failed to fetch financial data')
      
      // Set empty state on error
      setStats({
        revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
        payments: { total: 0, successful: 0, pendingRefunds: 0, successRate: 0, avgTransactionValue: 0 }
      })
      setRecentTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      case 'refunded': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-blue-100 text-blue-700'
      case 'refund': return 'bg-orange-100 text-orange-700'
      case 'settlement': return 'bg-purple-100 text-purple-700'
      case 'commission': return 'bg-green-100 text-green-700'
      case 'penalty': return 'bg-red-100 text-red-700'
      case 'bonus': return 'bg-emerald-100 text-emerald-700'
      case 'adjustment': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-light text-gray-900 tracking-tight">Platform Finance Dashboard</h1>
            <p className="text-gray-600 text-[11px]">
              Welcome back, {user?.name}! Monitor financial performance and transactions.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={fetchFinancialData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading financial data</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-light text-gray-900 tracking-tight">Platform Finance Dashboard</h1>
          <p className="text-gray-600 text-[11px]">
            Welcome back, {user?.name}! Monitor financial performance and transactions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">This Year</option>
          </select>
          <button 
            onClick={fetchFinancialData}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(stats?.revenue.total || 0)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-200" />
                <p className="text-green-100 text-xs">+{stats?.revenue.growth?.toFixed(1) || 0}% from last month</p>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Monthly Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(stats?.revenue.thisMonth || 0)}</p>
              <div className="flex items-center space-x-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-200" />
                <p className="text-blue-100 text-[10px]">+{stats?.revenue.growth?.toFixed(1) || 0}% from last month</p>
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Transactions</p>
              <p className="text-xl font-bold">{stats?.payments.total?.toLocaleString() || 0}</p>
              <p className="text-purple-100 text-[10px]">Success rate: {stats?.payments.successRate?.toFixed(1) || 0}%</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Pending Refunds</p>
              <p className="text-xl font-bold">{stats?.payments.pendingRefunds || 0}</p>
              <p className="text-orange-100 text-[10px]">Requires attention</p>
            </div>
            <Receipt className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs">Avg Transaction</p>
              <p className="text-xl font-bold">{formatCurrency(stats?.payments.avgTransactionValue || 0)}</p>
              <p className="text-indigo-100 text-[10px]">Per transaction</p>
            </div>
            <PieChart className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-xs">Success Rate</p>
              <p className="text-xl font-bold">{stats?.payments.successRate?.toFixed(1) || 0}%</p>
              <div className="flex items-center space-x-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-pink-200" />
                <p className="text-pink-100 text-[10px]">Payment success rate</p>
              </div>
            </div>
            <Receipt className="w-8 h-8 text-pink-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button 
                onClick={() => window.open('/finances/transactions', '_blank')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {transaction._id.substring(0, 8)}...
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-900">
                            {transaction.customer?.name || transaction.description || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.tenancy?.name || transaction.customer?.email || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'refund' || transaction.type === 'penalty' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {transaction.type === 'refund' || transaction.type === 'penalty' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No recent transactions found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Transactions will appear here once they are processed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Financial Summary</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
                  <p className="text-xs text-gray-500">Month over month</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats?.revenue.growth ? `+${stats.revenue.growth.toFixed(1)}%` : '0%'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Success</p>
                  <p className="text-xs text-gray-500">Transaction success rate</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {stats?.payments.successRate?.toFixed(1) || 0}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Avg Transaction</p>
                  <p className="text-xs text-gray-500">Per transaction value</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {formatCurrency(stats?.payments.avgTransactionValue || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Refunds</p>
                  <p className="text-xs text-gray-500">Awaiting processing</p>
                </div>
              </div>
              <span className="text-lg font-bold text-orange-600">
                {stats?.payments.pendingRefunds || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.open('/finances/reports', '_blank')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Receipt className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Generate Report</p>
              <p className="text-xs text-gray-500">Financial reports</p>
            </div>
          </button>

          <button 
            onClick={() => window.open('/finances/transactions?status=refunded', '_blank')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Process Refunds</p>
              <p className="text-xs text-gray-500">{stats?.payments.pendingRefunds || 0} pending</p>
            </div>
          </button>

          <button 
            onClick={() => window.open('/finances/transactions', '_blank')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Transaction Search</p>
              <p className="text-xs text-gray-500">Find transactions</p>
            </div>
          </button>

          <button 
            onClick={() => window.open('/finances', '_blank')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">Financial analytics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}