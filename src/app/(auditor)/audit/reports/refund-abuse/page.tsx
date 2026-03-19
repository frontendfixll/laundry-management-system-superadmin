'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  AlertTriangle,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Download,
  Calendar,
  Eye,
  Shield,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react'

interface RefundAbuseReport {
  _id: string
  reportId: string
  tenantId: string
  tenantName: string
  customerEmail: string
  customerName: string
  totalRefunds: number
  totalRefundAmount: number
  refundRate: number
  avgOrderValue: number
  avgRefundValue: number
  flaggedOrders: {
    orderId: string
    amount: number
    reason: string
    date: string
  }[]
  riskScore: number
  pattern: 'frequent_refunds' | 'high_value' | 'same_reason' | 'timing_pattern' | 'cross_account'
  status: 'flagged' | 'investigating' | 'confirmed_abuse' | 'false_positive' | 'resolved'
  detectedAt: string
  lastRefundDate: string
}

export default function RefundAbuseDetectionPage() {
  const [reports, setReports] = useState<RefundAbuseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPattern, setSelectedPattern] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalFlagged: 0,
    confirmedAbuse: 0,
    underInvestigation: 0,
    totalRefundAmountAtRisk: 0,
    avgRiskScore: 0,
    falsePositiveRate: 0
  })

  useEffect(() => {
    fetchRefundAbuseReports()
  }, [page, selectedPattern, selectedStatus, dateRange, searchQuery])

  const fetchRefundAbuseReports = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedPattern !== 'all' && { pattern: selectedPattern }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const data = await superAdminApi.get(`/audit/reports/refund-abuse?${params}`)

      if (data.success) {
        setReports(data.data.reports)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch refund abuse reports')
      }

    } catch (error) {
      console.error('Error fetching refund abuse reports:', error)
      // Fallback to mock data
      const mockReports: RefundAbuseReport[] = [
        {
          _id: '1',
          reportId: 'RA-2024-001',
          tenantId: 'tenant_001',
          tenantName: 'SparkleWash Laundry Co.',
          customerEmail: 'priya.sharma@email.com',
          customerName: 'Priya Sharma',
          totalRefunds: 14,
          totalRefundAmount: 8750,
          refundRate: 72.4,
          avgOrderValue: 850,
          avgRefundValue: 625,
          flaggedOrders: [
            { orderId: 'ORD-10234', amount: 950, reason: 'Clothes damaged - color bleeding', date: '2024-01-15' },
            { orderId: 'ORD-10312', amount: 780, reason: 'Clothes damaged - shrinkage', date: '2024-01-22' },
            { orderId: 'ORD-10398', amount: 1200, reason: 'Clothes damaged - torn fabric', date: '2024-01-28' },
            { orderId: 'ORD-10456', amount: 650, reason: 'Clothes damaged - color bleeding', date: '2024-02-03' },
            { orderId: 'ORD-10521', amount: 890, reason: 'Clothes damaged - stains not removed', date: '2024-02-10' }
          ],
          riskScore: 9,
          pattern: 'frequent_refunds',
          status: 'confirmed_abuse',
          detectedAt: '2024-02-12T10:30:00Z',
          lastRefundDate: '2024-02-10T14:20:00Z'
        },
        {
          _id: '2',
          reportId: 'RA-2024-002',
          tenantId: 'tenant_002',
          tenantName: 'FreshFold Express',
          customerEmail: 'rajesh.kumar@email.com',
          customerName: 'Rajesh Kumar',
          totalRefunds: 6,
          totalRefundAmount: 15200,
          refundRate: 45.8,
          avgOrderValue: 2800,
          avgRefundValue: 2533,
          flaggedOrders: [
            { orderId: 'ORD-20145', amount: 3500, reason: 'Premium suit ruined - wrong chemical used', date: '2024-01-10' },
            { orderId: 'ORD-20289', amount: 4200, reason: 'Silk saree damaged beyond repair', date: '2024-01-25' },
            { orderId: 'ORD-20356', amount: 2800, reason: 'Leather jacket discolored', date: '2024-02-05' }
          ],
          riskScore: 8,
          pattern: 'high_value',
          status: 'investigating',
          detectedAt: '2024-02-08T16:45:00Z',
          lastRefundDate: '2024-02-05T09:15:00Z'
        },
        {
          _id: '3',
          reportId: 'RA-2024-003',
          tenantId: 'tenant_003',
          tenantName: 'CleanStar Laundromat',
          customerEmail: 'anita.desai@email.com',
          customerName: 'Anita Desai',
          totalRefunds: 9,
          totalRefundAmount: 5400,
          refundRate: 60.0,
          avgOrderValue: 720,
          avgRefundValue: 600,
          flaggedOrders: [
            { orderId: 'ORD-30102', amount: 600, reason: 'Items missing from order', date: '2024-01-08' },
            { orderId: 'ORD-30198', amount: 600, reason: 'Items missing from order', date: '2024-01-18' },
            { orderId: 'ORD-30267', amount: 600, reason: 'Items missing from order', date: '2024-01-28' },
            { orderId: 'ORD-30345', amount: 600, reason: 'Items missing from order', date: '2024-02-07' }
          ],
          riskScore: 7,
          pattern: 'same_reason',
          status: 'flagged',
          detectedAt: '2024-02-09T08:20:00Z',
          lastRefundDate: '2024-02-07T11:30:00Z'
        },
        {
          _id: '4',
          reportId: 'RA-2024-004',
          tenantId: 'tenant_001',
          tenantName: 'SparkleWash Laundry Co.',
          customerEmail: 'vikram.patel@email.com',
          customerName: 'Vikram Patel',
          totalRefunds: 5,
          totalRefundAmount: 3200,
          refundRate: 38.5,
          avgOrderValue: 900,
          avgRefundValue: 640,
          flaggedOrders: [
            { orderId: 'ORD-10567', amount: 750, reason: 'Delivery delayed - clothes needed urgently', date: '2024-01-12' },
            { orderId: 'ORD-10634', amount: 680, reason: 'Wrong items delivered', date: '2024-01-20' },
            { orderId: 'ORD-10712', amount: 820, reason: 'Clothes not properly ironed', date: '2024-02-01' }
          ],
          riskScore: 5,
          pattern: 'timing_pattern',
          status: 'false_positive',
          detectedAt: '2024-02-04T12:10:00Z',
          lastRefundDate: '2024-02-01T17:45:00Z'
        },
        {
          _id: '5',
          reportId: 'RA-2024-005',
          tenantId: 'tenant_004',
          tenantName: 'QuickDry Services',
          customerEmail: 'meena.reddy@email.com',
          customerName: 'Meena Reddy',
          totalRefunds: 11,
          totalRefundAmount: 9800,
          refundRate: 55.0,
          avgOrderValue: 1100,
          avgRefundValue: 891,
          flaggedOrders: [
            { orderId: 'ORD-40089', amount: 1100, reason: 'Clothes damaged - bleach marks', date: '2024-01-05' },
            { orderId: 'ORD-40145', amount: 950, reason: 'Clothes damaged - burn marks from iron', date: '2024-01-14' },
            { orderId: 'ORD-40223', amount: 1300, reason: 'Entire order lost', date: '2024-01-23' },
            { orderId: 'ORD-40301', amount: 800, reason: 'Clothes damaged - color fading', date: '2024-02-02' }
          ],
          riskScore: 8,
          pattern: 'cross_account',
          status: 'investigating',
          detectedAt: '2024-02-06T14:55:00Z',
          lastRefundDate: '2024-02-02T10:20:00Z'
        },
        {
          _id: '6',
          reportId: 'RA-2024-006',
          tenantId: 'tenant_002',
          tenantName: 'FreshFold Express',
          customerEmail: 'suresh.nair@email.com',
          customerName: 'Suresh Nair',
          totalRefunds: 8,
          totalRefundAmount: 4600,
          refundRate: 50.0,
          avgOrderValue: 750,
          avgRefundValue: 575,
          flaggedOrders: [
            { orderId: 'ORD-20401', amount: 650, reason: 'Clothes smell bad after wash', date: '2024-01-11' },
            { orderId: 'ORD-20478', amount: 550, reason: 'Stains not removed properly', date: '2024-01-19' },
            { orderId: 'ORD-20534', amount: 700, reason: 'Clothes returned damp', date: '2024-01-27' },
            { orderId: 'ORD-20612', amount: 600, reason: 'Wrong detergent used - allergic reaction', date: '2024-02-04' }
          ],
          riskScore: 6,
          pattern: 'frequent_refunds',
          status: 'resolved',
          detectedAt: '2024-02-05T09:30:00Z',
          lastRefundDate: '2024-02-04T13:00:00Z'
        }
      ]

      const mockStats = {
        totalFlagged: 156,
        confirmedAbuse: 34,
        underInvestigation: 47,
        totalRefundAmountAtRisk: 284500,
        avgRiskScore: 6.8,
        falsePositiveRate: 18.5
      }

      setReports(mockReports)
      setStats(mockStats)
      setTotalPages(3)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed_abuse': return 'text-red-700 bg-red-100'
      case 'investigating': return 'text-orange-700 bg-orange-100'
      case 'flagged': return 'text-yellow-700 bg-yellow-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      case 'false_positive': return 'text-gray-700 bg-gray-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'frequent_refunds': return 'text-red-700 bg-red-100'
      case 'high_value': return 'text-purple-700 bg-purple-100'
      case 'same_reason': return 'text-blue-700 bg-blue-100'
      case 'timing_pattern': return 'text-indigo-700 bg-indigo-100'
      case 'cross_account': return 'text-pink-700 bg-pink-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getPatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'frequent_refunds': return 'Frequent Refunds'
      case 'high_value': return 'High Value'
      case 'same_reason': return 'Same Reason'
      case 'timing_pattern': return 'Timing Pattern'
      case 'cross_account': return 'Cross Account'
      default: return pattern
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed_abuse': return 'CONFIRMED ABUSE'
      case 'investigating': return 'INVESTIGATING'
      case 'flagged': return 'FLAGGED'
      case 'resolved': return 'RESOLVED'
      case 'false_positive': return 'FALSE POSITIVE'
      default: return status.toUpperCase()
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-700'
    if (score >= 6) return 'text-orange-700'
    if (score >= 4) return 'text-yellow-700'
    return 'text-green-700'
  }

  const getRiskBarColor = (score: number) => {
    if (score >= 8) return 'bg-red-500'
    if (score >= 6) return 'bg-orange-500'
    if (score >= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3" />
              Refund Abuse Detection
            </h1>
            <p className="text-red-100 mt-2">
              Identify and investigate suspicious refund patterns across tenants and customers
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Total Flagged: {stats.totalFlagged}</p>
            <p className="text-xs text-red-200">Fraud Intelligence</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Total Flagged</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.totalFlagged}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Confirmed Abuse</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.confirmedAbuse}</p>
            </div>
            <Shield className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Under Investigation</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.underInvestigation}</p>
            </div>
            <Eye className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Amount at Risk</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{formatCurrency(stats.totalRefundAmountAtRisk)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Avg Risk Score</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.avgRiskScore}/10</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">False Positive Rate</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.falsePositiveRate}%</p>
            </div>
            <Activity className="w-5 h-5 text-gray-600" />
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
              placeholder="Search by customer, tenant, report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Patterns</option>
            <option value="frequent_refunds">Frequent Refunds</option>
            <option value="high_value">High Value</option>
            <option value="same_reason">Same Reason</option>
            <option value="timing_pattern">Timing Pattern</option>
            <option value="cross_account">Cross Account</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="flagged">Flagged</option>
            <option value="investigating">Investigating</option>
            <option value="confirmed_abuse">Confirmed Abuse</option>
            <option value="false_positive">False Positive</option>
            <option value="resolved">Resolved</option>
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

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{report.reportId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatternColor(report.pattern)}`}>
                    {getPatternLabel(report.pattern).toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>

                {/* Customer & Tenant Info */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gray-600" />
                      {report.customerName}
                    </h3>
                    <span className="text-sm text-gray-500">{report.customerEmail}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tenant: <span className="font-medium text-gray-800">{report.tenantName}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    Tenant ID: <span className="font-mono text-gray-500">{report.tenantId}</span>
                  </p>
                </div>

                {/* Refund Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-xs text-red-700">Total Refunds</p>
                    <p className="text-lg font-bold text-red-900">{report.totalRefunds}</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-xs text-orange-700">Refund Amount</p>
                    <p className="text-lg font-bold text-orange-900">{formatCurrency(report.totalRefundAmount)}</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <p className="text-xs text-yellow-700">Refund Rate</p>
                    <p className="text-lg font-bold text-yellow-900">{report.refundRate}%</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">Avg Order Value</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(report.avgOrderValue)}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xs text-purple-700">Avg Refund Value</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(report.avgRefundValue)}</p>
                  </div>
                </div>

                {/* Risk Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Risk Score
                    </h4>
                    <span className={`text-lg font-bold ${getRiskScoreColor(report.riskScore)}`}>
                      {report.riskScore}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getRiskBarColor(report.riskScore)}`}
                      style={{ width: `${report.riskScore * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Flagged Orders */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Flagged Orders ({report.flaggedOrders.length})</h4>
                  <div className="space-y-2">
                    {report.flaggedOrders.slice(0, 3).map((order, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-sm font-medium text-red-900">{order.orderId}</span>
                            <span className="text-sm font-bold text-red-700">{formatCurrency(order.amount)}</span>
                          </div>
                          <p className="text-sm text-red-800 mt-1">{order.reason}</p>
                        </div>
                        <div className="text-xs text-red-600 ml-4 whitespace-nowrap">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(order.date)}
                        </div>
                      </div>
                    ))}
                    {report.flaggedOrders.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        +{report.flaggedOrders.length - 3} more flagged orders
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Pattern Detected</span>
                          <span className="text-xs text-gray-500">{formatDateTime(report.detectedAt)}</span>
                        </div>
                        <p className="text-gray-600">Automated system flagged suspicious refund activity</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                      <RefreshCw className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Last Refund</span>
                          <span className="text-xs text-gray-500">{formatDateTime(report.lastRefundDate)}</span>
                        </div>
                        <p className="text-gray-600">Most recent refund request from this customer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Detected:</div>
                  <div>{formatDate(report.detectedAt)}</div>
                </div>
                <div className={`text-center px-2 py-1 rounded ${getRiskBarColor(report.riskScore)} bg-opacity-20`}>
                  <p className={`text-xs font-bold ${getRiskScoreColor(report.riskScore)}`}>
                    Risk {report.riskScore}/10
                  </p>
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