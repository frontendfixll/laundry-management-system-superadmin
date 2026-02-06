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

export default function FinancialOverviewPage() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">Monitor transactions, settlements, and financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Revenue</p>
                  <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-1 lg:mt-2">
                    {overview.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 mr-1" />
                    )}
                    <span className="text-xs lg:text-sm font-medium text-green-700">
                      {formatPercentage(overview.revenueGrowth)}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Transactions</p>
                  <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">
                    {overview.totalTransactions.toLocaleString()}
                  </p>
                  <p className="text-xs lg:text-sm text-blue-600 mt-1 lg:mt-2">
                    Avg: {formatCurrency(overview.averageOrderValue)}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Approvals</p>
                  <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">
                    {overview.pendingApprovals.transactions + overview.pendingApprovals.settlements}
                  </p>
                  <p className="text-xs lg:text-sm text-amber-600 mt-1 lg:mt-2">
                    {formatCurrency(overview.pendingApprovals.totalAmount)}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlement Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 rounded-lg p-3 lg:p-4 text-center">
                <div className="text-xl lg:text-2xl font-bold text-gray-900">
                  {overview.settlementStats.total.count}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 mt-1">Total Settlements</div>
                <div className="text-xs lg:text-sm font-medium text-gray-900 mt-1">
                  {formatCurrency(overview.settlementStats.total.amount)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg p-3 lg:p-4 text-center">
                <div className="text-xl lg:text-2xl font-bold text-green-600">
                  {overview.settlementStats.completed.count}
                </div>
                <div className="text-xs lg:text-sm text-green-700 mt-1">Completed</div>
                <div className="text-xs lg:text-sm font-medium text-green-600 mt-1">
                  {formatCurrency(overview.settlementStats.completed.amount)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-lg p-3 lg:p-4 text-center">
                <div className="text-xl lg:text-2xl font-bold text-orange-600">
                  {overview.settlementStats.pending.count}
                </div>
                <div className="text-xs lg:text-sm text-orange-700 mt-1">Pending</div>
                <div className="text-xs lg:text-sm font-medium text-orange-600 mt-1">
                  {formatCurrency(overview.settlementStats.pending.amount)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-lg p-3 lg:p-4 text-center">
                <div className="text-xl lg:text-2xl font-bold text-red-600">
                  {overview.settlementStats.failed.count}
                </div>
                <div className="text-xs lg:text-sm text-red-700 mt-1">Failed</div>
                <div className="text-xs lg:text-sm font-medium text-red-600 mt-1">
                  {formatCurrency(overview.settlementStats.failed.amount)}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart - Modern Design */}
          {revenueTrend.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                    <p className="text-sm text-gray-600 mt-1">Daily revenue performance over time</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                      <span className="text-gray-600">Revenue</span>
                    </div>
                    <div className="text-gray-500">
                      Total: {formatCurrency(revenueTrend.reduce((sum, item) => sum + item.revenue, 0))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  {/* Chart Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-t border-gray-200"></div>
                    ))}
                  </div>
                  
                  {/* Chart Bars */}
                  <div className="relative h-80 flex items-end justify-between gap-1 px-2">
                    {revenueTrend.map((item, index) => {
                      const maxRevenue = Math.max(...revenueTrend.map(r => r.revenue))
                      const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                      const heightPx = Math.max(8, (heightPercent / 100) * 280) // 280px max height for bars
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end group" style={{ minWidth: '40px' }}>
                          {/* Hover Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg z-10 whitespace-nowrap">
                            <div className="text-center">
                              <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                              <div className="text-gray-300">{item._id}</div>
                              <div className="text-gray-400">{item.transactions} transactions</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                          
                          {/* Bar with Gradient */}
                          <div className="relative w-full max-w-8 group">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
                              style={{ height: `${heightPx}px` }}
                            >
                              {/* Shine Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-500 group-hover:translate-x-full"></div>
                              
                              {/* Top Glow */}
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-200 opacity-60"></div>
                            </div>
                            
                            {/* Base */}
                            <div className="w-full h-1 bg-blue-200 rounded-b-sm"></div>
                          </div>
                          
                          {/* Labels */}
                          <div className="mt-3 text-center">
                            <div className="text-xs text-gray-600 truncate w-full mb-1">
                              {new Date(item._id).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs font-semibold text-gray-900">
                              {item.revenue > 1000000 
                                ? `₹${(item.revenue / 1000000).toFixed(1)}M`
                                : item.revenue > 1000 
                                ? `₹${(item.revenue / 1000).toFixed(0)}K`
                                : formatCurrency(item.revenue)
                              }
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Y-Axis Labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 -ml-12 py-2">
                    {[...Array(6)].map((_, i) => {
                      const maxRevenue = Math.max(...revenueTrend.map(r => r.revenue))
                      const value = (maxRevenue / 5) * (5 - i)
                      return (
                        <div key={i} className="text-right">
                          {value > 1000000 
                            ? `₹${(value / 1000000).toFixed(1)}M`
                            : value > 1000 
                            ? `₹${(value / 1000).toFixed(0)}K`
                            : `₹${Math.round(value)}`
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Chart Statistics */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(Math.max(...revenueTrend.map(r => r.revenue)))}
                      </div>
                      <div className="text-xs text-gray-600">Peak Day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(revenueTrend.reduce((sum, item) => sum + item.revenue, 0) / revenueTrend.length)}
                      </div>
                      <div className="text-xs text-gray-600">Daily Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {revenueTrend.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Total Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round(revenueTrend.reduce((sum, item) => sum + item.transactions, 0) / revenueTrend.length)}
                      </div>
                      <div className="text-xs text-gray-600">Avg Transactions/Day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}