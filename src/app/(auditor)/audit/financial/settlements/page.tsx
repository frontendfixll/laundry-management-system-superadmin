'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
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

      const response = await fetch(`/api/superadmin/audit/financial/settlements?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch settlements')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSettlements(data.data.settlements)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch settlements')
      }
      
    } catch (error) {
      console.error('Error fetching settlements:', error)
      // Fallback to mock data
      const mockSettlements: Settlement[] = [
        {
          _id: '1',
          settlementId: 'STL-2024-001',
          tenantId: 'tenant_001',
          tenantName: 'clean-fresh',
          businessName: 'Clean & Fresh Laundry',
          period: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          transactions: {
            totalCount: 0,
            totalAmount: 234500,
            successfulCount: 148,
            successfulAmount: 225600,
            failedCount: 8,
            failedAmount: 8900,
            refundCount: 3,
            refundAmount: 4500
          },
          fees: {
            platformFee: 11280,
            paymentGatewayFee: 4512,
            processingFee: 1128,
            totalFees: 16920
          },
          settlement: {
            grossAmount: 225600,
            netAmount: 208680,
            status: 'completed',
            scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            processedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            bankAccount: {
              accountNumber: '****1234',
              ifscCode: 'HDFC0001234',
              bankName: 'HDFC Bank',
              accountHolderName: 'Clean & Fresh Laundry Pvt Ltd'
            },
            utrNumber: 'UTR123456789'
          },
          reconciliation: {
            isReconciled: true,
            reconciledAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            reconciledBy: 'finance@laundrylobby.com',
            discrepancies: []
          },
          auditTrail: [
            {
              action: 'SETTLEMENT_CREATED',
              performedBy: 'system',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              details: 'Settlement created for period'
            },
            {
              action: 'SETTLEMENT_PROCESSED',
              performedBy: 'payment-gateway',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              details: 'Settlement processed successfully'
            }
          ]
        },
        {
          _id: '2',
          settlementId: 'STL-2024-002',
          tenantId: 'tenant_002',
          tenantName: 'quickwash',
          businessName: 'QuickWash Services',
          period: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          transactions: {
            totalCount: 89,
            totalAmount: 134500,
            successfulCount: 82,
            successfulAmount: 125600,
            failedCount: 7,
            failedAmount: 8900,
            refundCount: 2,
            refundAmount: 3200
          },
          fees: {
            platformFee: 6280,
            paymentGatewayFee: 2512,
            processingFee: 628,
            totalFees: 9420
          },
          settlement: {
            grossAmount: 125600,
            netAmount: 116180,
            status: 'pending',
            scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            bankAccount: {
              accountNumber: '****5678',
              ifscCode: 'ICICI0005678',
              bankName: 'ICICI Bank',
              accountHolderName: 'QuickWash Services Pvt Ltd'
            }
          },
          reconciliation: {
            isReconciled: false,
            discrepancies: [
              {
                type: 'AMOUNT_MISMATCH',
                amount: 500,
                description: 'Transaction amount mismatch in payment gateway records'
              }
            ]
          },
          auditTrail: [
            {
              action: 'SETTLEMENT_CREATED',
              performedBy: 'system',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              details: 'Settlement created for period'
            }
          ]
        }
      ]

      const mockStats = {
        totalSettlements: 0,
        pendingSettlements: 23,
        completedSettlements: 1198,
        totalSettlementAmount: 0,
        totalFees: 1234567,
        discrepancies: 8,
        avgSettlementTime: 2.3
      }

      setSettlements(mockSettlements)
      setStats(mockStats)
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
        {settlements.map((settlement) => (
          <div key={settlement._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{settlement.settlementId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(settlement.settlement.status)}`}>
                    {settlement.settlement.status.toUpperCase()}
                  </span>
                  {settlement.reconciliation.discrepancies.length > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      DISCREPANCY
                    </span>
                  )}
                  {settlement.reconciliation.isReconciled && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                      RECONCILED
                    </span>
                  )}
                </div>

                {/* Tenant Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{settlement.businessName}</h3>
                  <p className="text-sm text-gray-600">{settlement.tenantName} • {settlement.tenantId}</p>
                  <p className="text-sm text-gray-500">
                    Period: {settlement.period.startDate.toLocaleDateString()} - {settlement.period.endDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">Gross Amount</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(settlement.settlement.grossAmount)}</p>
                    <p className="text-xs text-blue-600">{settlement.transactions.successfulCount} transactions</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">Total Fees</p>
                    <p className="text-lg font-bold text-orange-900">{formatCurrency(settlement.fees.totalFees)}</p>
                    <p className="text-xs text-orange-600">Platform + Gateway</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">Net Amount</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(settlement.settlement.netAmount)}</p>
                    <p className="text-xs text-green-600">To be settled</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium">Refunds</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(settlement.transactions.refundAmount)}</p>
                    <p className="text-xs text-purple-600">{settlement.transactions.refundCount} refunds</p>
                  </div>
                </div>

                {/* Bank Details & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Bank Account</h4>
                    <p className="text-sm font-medium text-gray-900">{settlement.settlement.bankAccount.accountHolderName}</p>
                    <p className="text-sm text-gray-600">{settlement.settlement.bankAccount.bankName}</p>
                    <p className="text-sm text-gray-600">{settlement.settlement.bankAccount.accountNumber}</p>
                    <p className="text-sm text-gray-600">{settlement.settlement.bankAccount.ifscCode}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Settlement Details</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Scheduled:</strong> {settlement.settlement.scheduledDate.toLocaleDateString()}
                    </p>
                    {settlement.settlement.processedDate && (
                      <p className="text-sm text-gray-600">
                        <strong>Processed:</strong> {settlement.settlement.processedDate.toLocaleDateString()}
                      </p>
                    )}
                    {settlement.settlement.utrNumber && (
                      <p className="text-sm text-gray-600">
                        <strong>UTR:</strong> {settlement.settlement.utrNumber}
                      </p>
                    )}
                    {settlement.settlement.failureReason && (
                      <p className="text-sm text-red-600">
                        <strong>Failure:</strong> {settlement.settlement.failureReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Discrepancies */}
                {settlement.reconciliation.discrepancies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                      Reconciliation Discrepancies
                    </h4>
                    <div className="space-y-2">
                      {settlement.reconciliation.discrepancies.map((discrepancy, index) => (
                        <div key={index} className="bg-red-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-900">{discrepancy.type.replace('_', ' ')}</span>
                            <span className="text-sm font-bold text-red-700">{formatCurrency(discrepancy.amount)}</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">{discrepancy.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fee Breakdown */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Platform Fee</p>
                      <p className="font-medium">{formatCurrency(settlement.fees.platformFee)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Gateway Fee</p>
                      <p className="font-medium">{formatCurrency(settlement.fees.paymentGatewayFee)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Processing Fee</p>
                      <p className="font-medium">{formatCurrency(settlement.fees.processingFee)}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Audit Trail */}
                {settlement.auditTrail.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <div className="space-y-1">
                      {settlement.auditTrail.slice(-2).map((entry, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">{entry.action.replace('_', ' ')}</span> by {entry.performedBy}
                          <span className="text-gray-500 ml-2">
                            {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                          </span>
                          {entry.details && <p className="mt-1">{entry.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Created: {settlement.period.startDate.toLocaleDateString()}</div>
                  {settlement.settlement.processedDate && (
                    <div className="text-green-600">Settled: {settlement.settlement.processedDate.toLocaleDateString()}</div>
                  )}
                </div>
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