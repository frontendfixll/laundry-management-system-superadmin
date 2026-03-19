'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  CheckCircle,
  Search,
  Filter,
  Calendar,
  Download,
  DollarSign,
  Building2,
  Clock,
  AlertTriangle,
  Eye,
  TrendingUp,
  CreditCard,
  Banknote,
  Activity
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

interface Settlement {
  _id: string
  settlementId: string
  tenantId: string
  tenantName: string
  businessName: string
  period: {
    startDate: Date
    endDate: Date
  }
  transactions: {
    totalCount: number
    totalAmount: number
    successfulCount: number
    successfulAmount: number
    failedCount: number
    failedAmount: number
    refundCount: number
    refundAmount: number
  }
  fees: {
    platformFee: number
    paymentGatewayFee: number
    processingFee: number
    totalFees: number
  }
  settlement: {
    grossAmount: number
    netAmount: number
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed'
    scheduledDate: Date
    processedDate?: Date
    bankAccount: {
      accountNumber: string
      ifscCode: string
      bankName: string
      accountHolderName: string
    }
    utrNumber?: string
    failureReason?: string
  }
  reconciliation: {
    isReconciled: boolean
    reconciledAt?: Date
    reconciledBy?: string
    discrepancies: {
      type: string
      amount: number
      description: string
    }[]
  }
  auditTrail: {
    action: string
    performedBy: string
    timestamp: Date
    details: string
  }[]
}

export default function SettlementRecordsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalSettlements: 0,
    pendingSettlements: 0,
    completedSettlements: 0,
    totalSettlementAmount: 0,
    totalFees: 0,
    discrepancies: 0,
    avgSettlementTime: 0
  })

  useEffect(() => {
    fetchSettlements()
  }, [page, selectedStatus, dateRange, searchQuery])

  const fetchSettlements = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const data = await superAdminApi.get(`/audit/financial/settlements?${params}`)

      if (data.success) {
        const list = data.data.settlements || data.data.data || []
        setSettlements(list)
        if (data.data.pagination) setTotalPages(data.data.pagination.pages || 1)

        // Calculate stats from real data
        setStats({
          totalSettlements: list.length,
          pendingSettlements: list.filter((s: any) => s.status === 'pending' || s.status === 'partial').length,
          completedSettlements: list.filter((s: any) => s.status === 'completed').length,
          totalSettlementAmount: list.reduce((sum: number, s: any) => sum + (s.amount || 0), 0),
          totalFees: 0,
          discrepancies: list.filter((s: any) => s.failedCount > 0).length,
          avgSettlementTime: 0
        })
      } else {
        throw new Error(data.message || 'Failed to fetch settlements')
      }

    } catch (error: any) {
      console.error('Error fetching settlements:', error?.message || error)
      setSettlements([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'processing': return 'text-blue-700 bg-blue-100'
      case 'completed': return 'text-green-700 bg-green-100'
      case 'failed': return 'text-red-700 bg-red-100'
      case 'disputed': return 'text-purple-700 bg-purple-100'
      default: return 'text-gray-700 bg-gray-100'
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <CheckCircle className="w-8 h-8 mr-3" />
              Settlement Records Audit
            </h1>
            <p className="text-green-100 mt-2">
              Comprehensive tracking of tenant settlements, payouts, and financial reconciliation
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Total Settlements: {stats.totalSettlements}</p>
            <p className="text-xs text-green-200">Financial Oversight</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.totalSettlements}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Pending</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.pendingSettlements}</p>
            </div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Completed</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.completedSettlements}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Total Amount</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{formatCurrency(stats.totalSettlementAmount)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Total Fees</p>
              <p className="text-lg font-bold text-orange-900 mt-1">{formatCurrency(stats.totalFees)}</p>
            </div>
            <CreditCard className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Discrepancies</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.discrepancies}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Avg Time</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.avgSettlementTime}d</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Settlement Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', amount: 1200000, count: 45 },
                { month: 'Feb', amount: 1350000, count: 52 },
                { month: 'Mar', amount: 1180000, count: 48 },
                { month: 'Apr', amount: 1420000, count: 58 },
                { month: 'May', amount: 1380000, count: 55 },
                { month: 'Jun', amount: 0, count: 62 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'amount' ? formatCurrency(value as number) : value,
                  name === 'amount' ? 'Settlement Amount' : 'Settlement Count'
                ]} />
                <Line type="monotone" dataKey="amount" stroke="#10B981" name="amount" />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" name="count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Settlement Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
            Settlement Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats.completedSettlements },
                    { name: 'Pending', value: stats.pendingSettlements },
                    { name: 'Processing', value: 15 },
                    { name: 'Failed', value: 8 },
                    { name: 'Disputed', value: 3 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search settlements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="disputed">Disputed</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        {(settlements || []).length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-600">No Settlement Records</h3>
            <p className="text-gray-400 mt-1">No settlement data found for the selected period</p>
          </div>
        )}
        {(settlements || []).map((settlement: any) => (
          <div key={settlement._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{settlement.date || 'N/A'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(settlement.status || 'completed')}`}>
                    {(settlement.status || 'completed').toUpperCase()}
                  </span>
                  {(settlement.failedCount || 0) > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      {settlement.failedCount} FAILED
                    </span>
                  )}
                </div>

                {/* Tenant Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{settlement.tenantName || 'Unknown Tenant'}</h3>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-blue-700 font-medium">Total Amount</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(settlement.amount || 0)}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-green-700 font-medium">Transactions</p>
                    <p className="text-lg font-bold text-green-900">{settlement.transactionCount || 0}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-emerald-700 font-medium">Successful</p>
                    <p className="text-lg font-bold text-emerald-900">{settlement.successCount || 0}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-red-700 font-medium">Failed</p>
                    <p className="text-lg font-bold text-red-900">{settlement.failedCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
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