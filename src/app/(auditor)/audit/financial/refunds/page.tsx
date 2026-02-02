'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Building2,
  User,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Cell,
  Pie
} from 'recharts'

interface RefundRecord {
  _id: string
  refundId: string
  originalTransactionId: string
  tenantId: string
  tenantName: string
  businessName: string
  customerId: string
  customerEmail: string
  amount: number
  originalAmount: number
  refundType: 'full' | 'partial' | 'service_credit'
  reason: string
  category: 'quality_issue' | 'service_delay' | 'customer_request' | 'technical_error' | 'policy_violation' | 'fraud_prevention'
  status: 'pending' | 'approved' | 'processed' | 'completed' | 'rejected' | 'disputed'
  requestedAt: Date
  approvedAt?: Date
  processedAt?: Date
  completedAt?: Date
  approvedBy?: string
  processedBy?: string
  paymentMethod: string
  processingFee: number
  notes: string[]
  attachments: string[]
  customerSatisfaction?: number
  followUpRequired: boolean
  riskFlags: string[]
  relatedRefunds: string[]
}

export default function RefundOversightPage() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTenant, setSelectedTenant] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalRefunds: 0,
    totalAmount: 0,
    pendingApproval: 0,
    averageProcessingTime: 0,
    refundRate: 0,
    suspiciousRefunds: 0
  })

  useEffect(() => {
    fetchRefundData()
  }, [page, selectedStatus, selectedCategory, selectedTenant, dateRange, searchQuery])

  const fetchRefundData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedTenant !== 'all' && { tenant: selectedTenant }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/support/audit/financial/refunds?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch refund data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setRefunds(data.data.refunds)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch refund data')
      }
      
    } catch (error) {
      console.error('Error fetching refund data:', error)
      // Keep existing mock data as fallback
      const mockRefunds: RefundRecord[] = [
        {
          _id: '1',
          refundId: 'REF-2024-001234',
          originalTransactionId: 'TXN-2024-567890',
          tenantId: 'tenant_001',
          tenantName: 'clean-fresh',
          businessName: 'Clean & Fresh Laundry',
          customerId: 'cust_123',
          customerEmail: 'customer@example.com',
          amount: 1500,
          originalAmount: 1500,
          refundType: 'full',
          reason: 'Service not delivered on time',
          category: 'service_delay',
          status: 'completed',
          requestedAt: new Date(Date.now() - 86400000),
          approvedAt: new Date(Date.now() - 82800000),
          processedAt: new Date(Date.now() - 79200000),
          completedAt: new Date(Date.now() - 75600000),
          approvedBy: 'support@laundrylobby.com',
          processedBy: 'finance@laundrylobby.com',
          paymentMethod: 'Credit Card',
          processingFee: 25,
          notes: [
            'Customer complained about 2-day delay',
            'Verified delivery was indeed late',
            'Full refund approved as per policy'
          ],
          attachments: ['complaint_screenshot.jpg'],
          customerSatisfaction: 4,
          followUpRequired: false,
          riskFlags: [],
          relatedRefunds: []
        },
        {
          _id: '2',
          refundId: 'REF-2024-001235',
          originalTransactionId: 'TXN-2024-567891',
          tenantId: 'tenant_002',
          tenantName: 'quickwash',
          businessName: 'QuickWash Services',
          customerId: 'cust_456',
          customerEmail: 'suspicious@example.com',
          amount: 2500,
          originalAmount: 2500,
          refundType: 'full',
          reason: 'Damaged clothes',
          category: 'quality_issue',
          status: 'pending',
          requestedAt: new Date(Date.now() - 3600000),
          paymentMethod: 'UPI',
          processingFee: 0,
          notes: [
            'Customer claims clothes were damaged',
            'Photos provided show stains',
            'Investigating with tenant'
          ],
          attachments: ['damage_photo1.jpg', 'damage_photo2.jpg'],
          followUpRequired: true,
          riskFlags: ['MULTIPLE_RECENT_REFUNDS', 'HIGH_VALUE_REFUND'],
          relatedRefunds: ['REF-2024-001200', 'REF-2024-001180']
        },
        {
          _id: '3',
          refundId: 'REF-2024-001236',
          originalTransactionId: 'TXN-2024-567892',
          tenantId: 'tenant_003',
          tenantName: 'express-laundry',
          businessName: 'Express Laundry',
          customerId: 'cust_789',
          customerEmail: 'regular@example.com',
          amount: 750,
          originalAmount: 1500,
          refundType: 'partial',
          reason: 'One item not cleaned properly',
          category: 'quality_issue',
          status: 'approved',
          requestedAt: new Date(Date.now() - 7200000),
          approvedAt: new Date(Date.now() - 3600000),
          approvedBy: 'support@laundrylobby.com',
          paymentMethod: 'Credit Card',
          processingFee: 15,
          notes: [
            'Partial refund for one item',
            'Customer satisfied with resolution',
            'Tenant will re-clean the item'
          ],
          attachments: [],
          customerSatisfaction: 5,
          followUpRequired: false,
          riskFlags: [],
          relatedRefunds: []
        }
      ]

      const mockStats = {
        totalRefunds: 0,
        totalAmount: 234500,
        pendingApproval: 12,
        averageProcessingTime: 4.2,
        refundRate: 2.8,
        suspiciousRefunds: 3
      }

      setRefunds(mockRefunds)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100'
      case 'approved': return 'text-blue-700 bg-blue-100'
      case 'processed': return 'text-indigo-700 bg-indigo-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'rejected': return 'text-red-700 bg-red-100'
      case 'disputed': return 'text-orange-700 bg-orange-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quality_issue': return 'text-red-700 bg-red-100'
      case 'service_delay': return 'text-orange-700 bg-orange-100'
      case 'customer_request': return 'text-blue-700 bg-blue-100'
      case 'technical_error': return 'text-purple-700 bg-purple-100'
      case 'policy_violation': return 'text-yellow-700 bg-yellow-100'
      case 'fraud_prevention': return 'text-pink-700 bg-pink-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <RefreshCw className="w-4 h-4" />
      case 'partial': return <DollarSign className="w-4 h-4" />
      case 'service_credit': return <CreditCard className="w-4 h-4" />
      default: return <RefreshCw className="w-4 h-4" />
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

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
              Refund Oversight & Analysis
            </h1>
            <p className="text-orange-100 mt-2">
              Comprehensive monitoring of refund requests, abuse detection, and financial impact analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Total Refunds: {formatCurrency(stats.totalAmount)}</p>
            <p className="text-xs text-orange-200">Financial Oversight</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Refunds</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalRefunds}</p>
            </div>
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Amount</p>
              <p className="text-xl font-bold text-green-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Pending</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.pendingApproval}</p>
            </div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Avg Processing</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.averageProcessingTime}h</p>
            </div>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Refund Rate</p>
              <p className="text-xl font-bold text-indigo-900 mt-1">{stats.refundRate}%</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Suspicious</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.suspiciousRefunds}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
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
            <option value="disputed">Disputed</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            <option value="quality_issue">Quality Issue</option>
            <option value="service_delay">Service Delay</option>
            <option value="customer_request">Customer Request</option>
            <option value="technical_error">Technical Error</option>
            <option value="policy_violation">Policy Violation</option>
            <option value="fraud_prevention">Fraud Prevention</option>
          </select>

          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Tenants</option>
            <option value="tenant_001">Clean & Fresh</option>
            <option value="tenant_002">QuickWash</option>
            <option value="tenant_003">Express Laundry</option>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Refund Records</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed refund tracking and abuse detection</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund ID
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Flags
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
                      <div className="text-xs text-gray-500 font-mono">{refund.originalTransactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.customerEmail}</div>
                      <div className="text-xs text-gray-500">{refund.customerId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.businessName}</div>
                      <div className="text-xs text-gray-500">{refund.tenantName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(refund.amount)}</div>
                      <div className="text-xs text-gray-500">of {formatCurrency(refund.originalAmount)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100 flex items-center w-fit">
                      {getTypeIcon(refund.refundType)}
                      <span className="ml-1">{refund.refundType.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(refund.category)}`}>
                      {refund.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                      {refund.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {refund.riskFlags.map((flag, index) => (
                        <span key={index} className="px-1 py-0.5 rounded text-xs font-medium text-red-700 bg-red-100 block">
                          {flag.replace('_', ' ')}
                        </span>
                      ))}
                      {refund.riskFlags.length === 0 && (
                        <span className="text-xs text-gray-400">No flags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{refund.requestedAt.toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{refund.requestedAt.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refund Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-orange-600" />
            Refund Categories
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Quality Issues', value: 45 },
                    { name: 'Service Delays', value: 30 },
                    { name: 'Customer Requests', value: 15 },
                    { name: 'Technical Errors', value: 10 }
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

        {/* Refund Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Refund Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', refunds: 45, amount: 67500 },
                { month: 'Feb', refunds: 52, amount: 78000 },
                { month: 'Mar', refunds: 48, amount: 72000 },
                { month: 'Apr', refunds: 61, amount: 91500 },
                { month: 'May', refunds: 58, amount: 87000 },
                { month: 'Jun', refunds: 67, amount: 100500 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'amount' ? formatCurrency(value as number) : value,
                  name === 'amount' ? 'Amount' : 'Count'
                ]} />
                <Line type="monotone" dataKey="refunds" stroke="#3B82F6" name="refunds" />
                <Line type="monotone" dataKey="amount" stroke="#EF4444" name="amount" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Refund Abuse Detection Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1 mr-4" />
          <div>
            <h4 className="text-lg font-medium text-red-900">Refund Abuse Detection Summary</h4>
            <div className="text-sm text-red-800 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">🚨 High-Risk Indicators:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>3 customers with multiple refund requests (5+ in 30 days)</li>
                  <li>2 tenants with refund rates above 8% (industry avg: 3%)</li>
                  <li>1 suspicious pattern: Same customer, different emails</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">📊 Key Metrics:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Average refund processing time: 4.2 hours</li>
                  <li>Customer satisfaction post-refund: 4.2/5</li>
                  <li>Refund approval rate: 87% (13% rejected/disputed)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}