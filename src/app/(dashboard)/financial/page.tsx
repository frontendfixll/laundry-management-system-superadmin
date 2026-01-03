'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface FinancialOverview {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  totalFees: number
  revenueGrowth: number
  settlementStats: {
    total: { count: number; amount: number }
    completed: { count: number; amount: number }
    pending: { count: number; amount: number }
    failed: { count: number; amount: number }
  }
  pendingApprovals: {
    transactions: number
    settlements: number
    totalAmount: number
  }
}

interface RevenueTrend {
  _id: string
  revenue: number
  transactions: number
  fees: number
}

export default function FinancialManagementPage() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchFinancialOverview()
  }, [timeframe])

  const fetchFinancialOverview = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getFinancialOverview(timeframe)
      setOverview(response.data.overview)
      setRevenueTrend(response.data.revenueTrend)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchFinancialOverview()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Monitor transactions, settlements, and financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {overview && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    {overview.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-200 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-200 mr-1" />
                    )}
                    <span className="text-sm font-medium text-green-100">
                      {formatPercentage(overview.revenueGrowth)}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">
                    {overview.totalTransactions.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-100 mt-2">
                    Avg: {formatCurrency(overview.averageOrderValue)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Pending Approvals</p>
                  <p className="text-2xl font-bold text-white">
                    {overview.pendingApprovals.transactions + overview.pendingApprovals.settlements}
                  </p>
                  <p className="text-sm text-orange-100 mt-2">
                    {formatCurrency(overview.pendingApprovals.totalAmount)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlement Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {overview.settlementStats.total.count}
                </div>
                <div className="text-sm text-gray-600">Total Settlements</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(overview.settlementStats.total.amount)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {overview.settlementStats.completed.count}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-sm font-medium text-green-600">
                  {formatCurrency(overview.settlementStats.completed.amount)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {overview.settlementStats.pending.count}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-sm font-medium text-orange-600">
                  {formatCurrency(overview.settlementStats.pending.amount)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overview.settlementStats.failed.count}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-sm font-medium text-red-600">
                  {formatCurrency(overview.settlementStats.failed.amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          {revenueTrend.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {revenueTrend.map((item, index) => {
                  const maxRevenue = Math.max(...revenueTrend.map(r => r.revenue))
                  const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                  const heightPx = Math.max(4, (heightPercent / 100) * 180) // 180px max height for bars
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end" style={{ minWidth: '30px' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t cursor-pointer hover:from-purple-700 hover:to-purple-500 transition-all"
                        style={{ height: `${heightPx}px` }}
                        title={`${item._id}: ${formatCurrency(item.revenue)}`}
                      />
                      <div className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                        {item._id}
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
