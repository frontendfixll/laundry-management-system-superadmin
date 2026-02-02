'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  XCircle,
  Clock,
  RefreshCw,
  CreditCard,
  DollarSign,
  Users,
  Building2,
  TrendingDown,
  AlertCircle
} from 'lucide-react'

interface PaymentFailure {
  _id: string
  transactionId: string
  tenantId: string
  tenantName: string
  customerId: string
  customerName: string
  customerEmail: string
  amount: number
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet'
  gateway: 'razorpay' | 'stripe' | 'payu' | 'cashfree'
  gatewayTransactionId: string
  failureReason: string
  failureCode: string
  errorMessage: string
  retryAttempts: number
  lastRetryAt?: Date
  status: 'failed' | 'retry_pending' | 'abandoned'
  createdAt: Date
  metadata: {
    orderId?: string
    ipAddress: string
    userAgent: string
    cardType?: string
    bankCode?: string
  }
}

interface FailureStats {
  totalFailures: number
  failureRate: number
  totalFailedAmount: number
  retrySuccessRate: number
  topFailureReasons: {
    reason: string
    count: number
    percentage: number
  }[]
  gatewayFailures: {
    gateway: string
    failures: number
    rate: number
  }[]
}

export default function PaymentFailuresPage() {
  const [failures, setFailures] = useState<PaymentFailure[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FailureStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGateway, setSelectedGateway] = useState('all')
  const [selectedReason, setSelectedReason] = useState('all')
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    fetchPaymentFailures()
  }, [selectedGateway, selectedReason, dateRange, searchQuery])

  const fetchPaymentFailures = async () => {
    try {
      setLoading(true)
      
      const params = {
        ...(selectedGateway !== 'all' && { gateway: selectedGateway }),
        ...(selectedReason !== 'all' && { reason: selectedReason }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      }

      const data = await superAdminApi.getPaymentFailures(params)
      
      if (data.success) {
        setFailures(data.data.failures.map((failure: any) => ({
          ...failure,
          createdAt: new Date(failure.createdAt),
          lastRetryAt: failure.lastRetryAt ? new Date(failure.lastRetryAt) : undefined
        })))
        setStats(data.data.stats)
      } else {
        throw new Error(data.message || 'Failed to fetch payment failures')
      }
      
    } catch (error) {
      console.error('Error fetching payment failures:', error)
      
      // Show empty state instead of mock data
      setFailures([])
      setStats({
        totalFailures: 0,
        failureRate: 0,
        totalFailedAmount: 0,
        retrySuccessRate: 0,
        topFailureReasons: [],
        gatewayFailures: []
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed': return 'text-red-700 bg-red-100'
      case 'retry_pending': return 'text-yellow-700 bg-yellow-100'
      case 'abandoned': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3" />
              Payment Failures Analysis
            </h1>
            <p className="text-red-100 mt-2">
              Monitor and analyze failed payment transactions across all gateways
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Failure Rate</p>
            <p className="text-2xl font-bold">{stats?.failureRate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Total Failures</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {stats?.totalFailures?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-red-600">Payment attempts failed</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Failed Amount</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {formatCurrency(stats?.totalFailedAmount || 0)}
              </p>
              <p className="text-xs text-orange-600">Revenue lost</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Failure Rate</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {stats?.failureRate || 0}%
              </p>
              <p className="text-xs text-yellow-600">Of all transactions</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Retry Success</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats?.retrySuccessRate || 0}%
              </p>
              <p className="text-xs text-green-600">Successful retries</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Failure Reasons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Top Failure Reasons
          </h3>
          <div className="space-y-3">
            {stats?.topFailureReasons.map((reason, index) => (
              <div key={reason.reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reason.reason}</p>
                    <p className="text-xs text-gray-500">{reason.count} failures</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{reason.percentage}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${reason.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gateway Failure Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Gateway Failure Rates
          </h3>
          <div className="space-y-3">
            {stats?.gatewayFailures.map((gateway) => (
              <div key={gateway.gateway} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{gateway.gateway}</p>
                  <p className="text-xs text-gray-500">{gateway.failures} failures</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{gateway.rate}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, gateway.rate * 10)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search failures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={selectedGateway}
            onChange={(e) => setSelectedGateway(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Gateways</option>
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
            <option value="payu">PayU</option>
            <option value="cashfree">Cashfree</option>
          </select>

          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Reasons</option>
            <option value="insufficient_funds">Insufficient Funds</option>
            <option value="card_declined">Card Declined</option>
            <option value="network_error">Network Error</option>
            <option value="invalid_cvv">Invalid CVV</option>
            <option value="expired_card">Expired Card</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Failures Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Payment Failures</h3>
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failure Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {failures.map((failure) => (
                <tr key={failure._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{failure.transactionId}</div>
                      <div className="text-sm text-gray-500">{failure.gatewayTransactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{failure.customerName}</div>
                      <div className="text-sm text-gray-500">{failure.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">
                      {formatCurrency(failure.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{failure.gateway}</div>
                    <div className="text-sm text-gray-500 capitalize">{failure.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{failure.failureReason}</div>
                      <div className="text-sm text-gray-500">{failure.failureCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{failure.retryAttempts}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(failure.status)}`}>
                      {failure.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{failure.createdAt.toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{failure.createdAt.toLocaleTimeString()}</div>
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
    </div>
  )
}