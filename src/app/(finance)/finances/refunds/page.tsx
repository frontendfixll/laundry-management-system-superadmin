'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  Building2,
  ArrowUpRight,
  FileText,
  User
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
  Cell,
  AreaChart,
  Area
} from 'recharts'

interface Refund {
  _id: string
  refundId: string
  originalTransactionId: string
  tenantId: string
  tenantName: string
  customerId: string
  customerName: string
  customerEmail: string
  amount: number
  originalAmount: number
  refundType: 'full' | 'partial'
  reason: 'customer_request' | 'service_issue' | 'technical_error' | 'policy_violation' | 'other'
  status: 'pending' | 'approved' | 'processed' | 'completed' | 'rejected' | 'failed'
  requestedBy: {
    id: string
    name: string
    role: string
  }
  approvedBy?: {
    id: string
    name: string
    role: string
    approvedAt: Date
  }
  processedBy?: {
    id: string
    name: string
    processedAt: Date
  }
  gateway: 'razorpay' | 'stripe' | 'payu' | 'cashfree'
  gatewayRefundId?: string
  description: string
  customerReason: string
  internalNotes?: string
  timeline: {
    requestedAt: Date
    approvedAt?: Date
    processedAt?: Date
    completedAt?: Date
  }
  metadata: {
    orderId?: string
    ipAddress: string
    userAgent: string
    failureReason?: string
  }
}

interface RefundStats {
  totalRefunds: number
  totalAmount: number
  pendingRefunds: number
  approvedRefunds: number
  processedRefunds: number
  rejectedRefunds: number
  refundRate: number
  avgRefundAmount: number
  avgProcessingTime: number
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<RefundStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedReason, setSelectedReason] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRefunds()
  }, [page, selectedStatus, selectedReason, selectedType, dateRange, searchQuery])

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: page,
        limit: 20,
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedReason !== 'all' && { reason: selectedReason }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      }

      const data = await superAdminApi.getRefunds(params)
      
      if (data.success) {
        setRefunds(data.data.refunds.map((refund: any) => ({
          ...refund,
          timeline: {
            ...refund.timeline,
            requestedAt: new Date(refund.timeline.requestedAt),
            approvedAt: refund.timeline.approvedAt ? new Date(refund.timeline.approvedAt) : undefined,
            processedAt: refund.timeline.processedAt ? new Date(refund.timeline.processedAt) : undefined,
            completedAt: refund.timeline.completedAt ? new Date(refund.timeline.completedAt) : undefined
          },
          approvedBy: refund.approvedBy ? {
            ...refund.approvedBy,
            approvedAt: new Date(refund.approvedBy.approvedAt)
          } : undefined,
          processedBy: refund.processedBy ? {
            ...refund.processedBy,
            processedAt: new Date(refund.processedBy.processedAt)
          } : undefined
        })))
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch refunds')
      }
      
    } catch (error) {
      console.error('Error fetching refunds:', error)
      
      // Show empty state instead of mock data
      setRefunds([])
      setStats({
        totalRefunds: 0,
        totalAmount: 0,
        pendingRefunds: 0,
        approvedRefunds: 0,
        processedRefunds: 0,
        rejectedRefunds: 0,
        refundRate: 0,
        avgRefundAmount: 0,
        avgProcessingTime: 0
      })
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'processed': return 'text-blue-700 bg-blue-100'
      case 'approved': return 'text-indigo-700 bg-indigo-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'rejected': return 'text-red-700 bg-red-100'
      case 'failed': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'customer_request': return 'text-blue-700 bg-blue-100'
      case 'service_issue': return 'text-orange-700 bg-orange-100'
      case 'technical_error': return 'text-red-700 bg-red-100'
      case 'policy_violation': return 'text-purple-700 bg-purple-100'
      case 'other': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processed': return <RefreshCw className="w-4 h-4 text-blue-600" />
      case 'approved': return <CheckCircle className="w-4 h-4 text-indigo-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <RefreshCw className="w-8 h-8 mr-3" />
              Refund Management
            </h1>
            <p className="text-orange-100 mt-2">
              Monitor and process customer refunds across all tenants
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Refund Rate</p>
            <p className="text-2xl font-bold">{stats?.refundRate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Total Refunds</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {stats?.totalRefunds?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-orange-600">{formatCurrency(stats?.totalAmount || 0)}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {stats?.pendingRefunds || 0}
              </p>
              <p className="text-xs text-yellow-600">Awaiting approval</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats?.processedRefunds || 0}
              </p>
              <p className="text-xs text-green-600">Successfully processed</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Amount</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatCurrency(stats?.avgRefundAmount || 0)}
              </p>
              <p className="text-xs text-purple-600">Per refund</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refund Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-orange-600" />
            Refund Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats?.processedRefunds || 0, color: '#10B981' },
                    { name: 'Approved', value: stats?.approvedRefunds || 0, color: '#6366F1' },
                    { name: 'Pending', value: stats?.pendingRefunds || 0, color: '#F59E0B' },
                    { name: 'Rejected', value: stats?.rejectedRefunds || 0, color: '#EF4444' }
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

        {/* Refund Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ArrowUpRight className="w-5 h-5 mr-2 text-red-600" />
            Refund Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { day: 'Mon', refunds: 12, amount: 2340 },
                { day: 'Tue', refunds: 0, amount: 0 },
                { day: 'Wed', refunds: 15, amount: 2890 },
                { day: 'Thu', refunds: 6, amount: 1120 },
                { day: 'Fri', refunds: 11, amount: 2180 },
                { day: 'Sat', refunds: 9, amount: 1750 },
                { day: 'Sun', refunds: 7, amount: 1340 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'amount' ? formatCurrency(Number(value)) : value,
                  name === 'amount' ? 'Amount' : 'Refunds'
                ]} />
                <Area type="monotone" dataKey="refunds" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
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
              placeholder="Search refunds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Reasons</option>
            <option value="customer_request">Customer Request</option>
            <option value="service_issue">Service Issue</option>
            <option value="technical_error">Technical Error</option>
            <option value="policy_violation">Policy Violation</option>
            <option value="other">Other</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="full">Full Refund</option>
            <option value="partial">Partial Refund</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Refunds</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund
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
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.refundId}</div>
                      <div className="text-sm text-gray-500">{refund.originalTransactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.customerName}</div>
                      <div className="text-sm text-gray-500">{refund.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{refund.tenantName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-red-600">
                        -{formatCurrency(refund.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        of {formatCurrency(refund.originalAmount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      refund.refundType === 'full' ? 'text-red-700 bg-red-100' : 'text-orange-700 bg-orange-100'
                    }`}>
                      {refund.refundType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(refund.reason)}`}>
                      {refund.reason.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(refund.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                        {refund.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{refund.timeline.requestedAt.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">by {refund.requestedBy.name}</div>
                    </div>
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