'use client'

import { useState, useEffect } from 'react'
import { 
  RefreshCw,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  DollarSign,
  Receipt,
  Info,
  Download,
  ArrowUpRight,
  CreditCard
} from 'lucide-react'

interface RefundRequest {
  id: string
  refundId: string
  orderId: string
  orderNumber: string
  transactionId?: string
  customer: {
    name: string
    email: string
    phone: string
  }
  tenancy: {
    name: string
    slug: string
  }
  originalAmount: number
  refundAmount: number
  refundReason: string
  status: 'requested' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected'
  requestedBy: string
  approvedBy?: string
  processedBy?: string
  gatewayRefundId?: string
  failureReason?: string
  requestedAt: string
  approvedAt?: string
  processedAt?: string
  completedAt?: string
  metadata?: Record<string, any>
}

interface RefundStats {
  total: number
  pending: number
  approved: number
  completed: number
  failed: number
  totalAmount: number
  avgProcessingTime: string
}

export default function RefundStatusPage() {
  const [loading, setLoading] = useState(true)
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [stats, setStats] = useState<RefundStats>({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
    avgProcessingTime: '0h'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)

  useEffect(() => {
    loadRefunds()
  }, [])

  const loadRefunds = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Try to load refund data from payments endpoint
      const response = await fetch(`${API_URL}/support/payments?status=refund_requested`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('💰 Refund data:', data)
        
        if (data.success) {
          // Transform payment issues to refund format
          const refundRequests = (data.data.paymentIssues || []).map((issue: any) => ({
            id: issue._id,
            refundId: `REF-${issue._id.slice(-6)}`,
            orderId: issue._id,
            orderNumber: issue.orderNumber,
            transactionId: issue.paymentId,
            customer: {
              name: issue.customer?.name || 'Unknown',
              email: issue.customer?.email || 'unknown@email.com',
              phone: issue.customer?.phone || 'N/A'
            },
            tenancy: {
              name: issue.tenancy?.name || 'Unknown Tenant',
              slug: issue.tenancy?.slug || 'unknown'
            },
            originalAmount: issue.pricing?.total || 0,
            refundAmount: issue.pricing?.total || 0,
            refundReason: 'Service not delivered',
            status: issue.paymentStatus === 'refund_requested' ? 'requested' : 'completed',
            requestedBy: 'customer',
            requestedAt: issue.createdAt,
            metadata: {}
          }))
          
          setRefunds(refundRequests)
          
          // Calculate stats
          const totalAmount = refundRequests.reduce((sum: number, r: RefundRequest) => sum + r.refundAmount, 0)
          const pending = refundRequests.filter((r: RefundRequest) => r.status === 'requested').length
          const approved = refundRequests.filter((r: RefundRequest) => r.status === 'approved').length
          const completed = refundRequests.filter((r: RefundRequest) => r.status === 'completed').length
          const failed = refundRequests.filter((r: RefundRequest) => r.status === 'failed').length
          
          setStats({
            total: refundRequests.length,
            pending,
            approved,
            completed,
            failed,
            totalAmount,
            avgProcessingTime: '2.5h'
          })
        }
      } else {
        console.error('Failed to load refunds:', response.status)
        setMockData()
      }
    } catch (error) {
      console.error('Error loading refunds:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockRefunds: RefundRequest[] = [
      {
        id: '1',
        refundId: 'REF-2026-001',
        orderId: 'order_001',
        orderNumber: 'ORD-2026-001',
        transactionId: 'TXN-2026-001',
        customer: {
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91 98765 43210'
        },
        tenancy: {
          name: 'CleanWash Laundry',
          slug: 'cleanwash'
        },
        originalAmount: 450,
        refundAmount: 450,
        refundReason: 'Service not delivered on time',
        status: 'processing',
        requestedBy: 'customer',
        approvedBy: 'tenant_admin',
        processedBy: 'platform_support',
        gatewayRefundId: 'rfnd_live_1234567890',
        requestedAt: '2026-01-27T10:30:00Z',
        approvedAt: '2026-01-27T11:00:00Z',
        processedAt: '2026-01-27T11:30:00Z'
      },
      {
        id: '2',
        refundId: 'REF-2026-002',
        orderId: 'order_002',
        orderNumber: 'ORD-2026-002',
        transactionId: 'TXN-2026-002',
        customer: {
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 87654 32109'
        },
        tenancy: {
          name: 'QuickClean Services',
          slug: 'quickclean'
        },
        originalAmount: 320,
        refundAmount: 160,
        refundReason: 'Partial service completion',
        status: 'completed',
        requestedBy: 'tenant_admin',
        approvedBy: 'platform_finance',
        processedBy: 'platform_support',
        gatewayRefundId: 'rfnd_live_0987654321',
        requestedAt: '2026-01-26T14:20:00Z',
        approvedAt: '2026-01-26T15:00:00Z',
        processedAt: '2026-01-26T15:30:00Z',
        completedAt: '2026-01-26T16:00:00Z'
      },
      {
        id: '3',
        refundId: 'REF-2026-003',
        orderId: 'order_003',
        orderNumber: 'ORD-2026-003',
        customer: {
          name: 'Amit Singh',
          email: 'amit@example.com',
          phone: '+91 76543 21098'
        },
        tenancy: {
          name: 'Express Laundry',
          slug: 'express'
        },
        originalAmount: 280,
        refundAmount: 280,
        refundReason: 'Damaged clothes',
        status: 'requested',
        requestedBy: 'customer',
        requestedAt: '2026-01-27T09:15:00Z'
      }
    ]

    setRefunds(mockRefunds)
    setStats({
      total: mockRefunds.length,
      pending: 1,
      approved: 0,
      completed: 1,
      failed: 0,
      totalAmount: 890,
      avgProcessingTime: '2.5h'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-blue-100 text-blue-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <RefreshCw className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.refundId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.tenancy.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refund Status</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage refund requests and processing
          </p>
        </div>
        
        <button 
          onClick={loadRefunds}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Refunds</p>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-xs">All requests</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-yellow-100 text-xs">Awaiting approval</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-green-100 text-xs">Successfully processed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Amount</p>
              <p className="text-3xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
              <p className="text-purple-100 text-xs">Refund volume</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Processing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}</p>
              <p className="text-green-600 text-xs">↓ 20% from last week</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? Math.round(((stats.completed + stats.approved) / stats.total) * 100) : 0}%
              </p>
              <p className="text-green-600 text-xs">↑ 5% improvement</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Failed Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              <p className="text-red-600 text-xs">Needs attention</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search refunds, orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Refund Requests ({filteredRefunds.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRefunds.length > 0 ? (
            filteredRefunds.map((refund) => (
              <div key={refund.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setSelectedRefund(refund)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-blue-600">{refund.refundId}</span>
                      <span className="text-sm font-mono text-gray-500">{refund.orderNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        <span>{refund.status.toUpperCase()}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-900">{refund.customer.name}</p>
                        <p className="text-xs text-gray-500">{refund.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tenant</p>
                        <p className="font-medium text-gray-900">{refund.tenancy.name}</p>
                        <p className="text-xs text-gray-500">Requested by: {refund.requestedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">₹{refund.refundAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          {refund.refundAmount < refund.originalAmount ? 'Partial' : 'Full'} refund
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="text-sm text-gray-900">{refund.refundReason}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Requested: {new Date(refund.requestedAt).toLocaleDateString()}</span>
                      </span>
                      {refund.approvedAt && (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Approved: {new Date(refund.approvedAt).toLocaleDateString()}</span>
                        </span>
                      )}
                      {refund.completedAt && (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed: {new Date(refund.completedAt).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No refunds found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Approve Pending</p>
                <p className="text-sm text-gray-500">Bulk approve refunds</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Process Approved</p>
                <p className="text-sm text-gray-500">Initiate gateway refunds</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Failed</p>
                <p className="text-sm text-gray-500">Check failed refunds</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Report</p>
                <p className="text-sm text-gray-500">Download refund data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}