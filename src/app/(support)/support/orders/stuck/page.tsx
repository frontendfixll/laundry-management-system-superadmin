'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle,
  Clock,
  Package,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Timer,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface StuckOrder {
  id: string
  orderNumber: string
  customer: {
    name: string
    phone: string
    email: string
  }
  tenancy: {
    name: string
    slug: string
  }
  branch?: {
    name: string
    address: string
  }
  status: string
  paymentStatus: string
  stuckDuration: number // hours
  lastStatusChange: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

interface StuckOrdersStats {
  total: number
  byStatus: Record<string, number>
  oldestStuck: string
  avgStuckTime: number
}

export default function StuckOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [stuckOrders, setStuckOrders] = useState<StuckOrder[]>([])
  const [stats, setStats] = useState<StuckOrdersStats>({
    total: 0,
    byStatus: {},
    oldestStuck: '',
    avgStuckTime: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hoursFilter, setHoursFilter] = useState('24')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12) // 12 orders per page for smarter pagination

  useEffect(() => {
    loadStuckOrders()
  }, [hoursFilter])

  const loadStuckOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      const response = await fetch(`${API_URL}/support/orders/stuck?hours=${hoursFilter}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Stuck orders data:', data)
        
        if (data.success) {
          setStuckOrders(data.data.stuckOrders || [])
          setStats({
            total: data.data.summary?.total || 0,
            byStatus: data.data.summary?.byStatus || {},
            oldestStuck: data.data.summary?.oldestStuck || '',
            avgStuckTime: 0 // Calculate if needed
          })
        }
      } else {
        console.error('Failed to load stuck orders:', response.status)
        // Use mock data for demo
        setMockData()
      }
    } catch (error) {
      console.error('Error loading stuck orders:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockOrders: StuckOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-2026-001',
        customer: {
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          email: 'rajesh@example.com'
        },
        tenancy: {
          name: 'CleanWash Laundry',
          slug: 'cleanwash'
        },
        branch: {
          name: 'Main Branch',
          address: 'MG Road, Bangalore'
        },
        status: 'assigned_to_branch',
        paymentStatus: 'completed',
        stuckDuration: 36,
        lastStatusChange: '2026-01-26T10:30:00Z',
        totalAmount: 450,
        createdAt: '2026-01-25T14:20:00Z',
        updatedAt: '2026-01-26T10:30:00Z'
      },
      {
        id: '2',
        orderNumber: 'ORD-2026-002',
        customer: {
          name: 'Priya Sharma',
          phone: '+91 87654 32109',
          email: 'priya@example.com'
        },
        tenancy: {
          name: 'QuickClean Services',
          slug: 'quickclean'
        },
        status: 'placed',
        paymentStatus: 'completed',
        stuckDuration: 48,
        lastStatusChange: '2026-01-25T08:15:00Z',
        totalAmount: 320,
        createdAt: '2026-01-25T08:15:00Z',
        updatedAt: '2026-01-25T08:15:00Z'
      }
    ]

    setStuckOrders(mockOrders)
    setStats({
      total: mockOrders.length,
      byStatus: {
        'assigned_to_branch': 1,
        'placed': 1
      },
      oldestStuck: '2026-01-25T08:15:00Z',
      avgStuckTime: 42
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-700'
      case 'assigned_to_branch': return 'bg-yellow-100 text-yellow-700'
      case 'assigned_to_logistics_pickup': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStuckSeverity = (hours: number) => {
    if (hours >= 48) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' }
    if (hours >= 24) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' }
    if (hours >= 12) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' }
    return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Low' }
  }

  const filteredOrders = stuckOrders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tenancy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setCurrentPage(1)
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, hoursFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Stuck Orders</h1>
          <p className="text-gray-600 mt-1">
            Orders that haven't progressed in their workflow
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={hoursFilter}
            onChange={(e) => setHoursFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="12">Last 12 hours</option>
            <option value="24">Last 24 hours</option>
            <option value="48">Last 48 hours</option>
            <option value="72">Last 72 hours</option>
          </select>
          <button 
            onClick={loadStuckOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Stuck</p>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-red-100 text-xs">Orders need attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Critical (48h+)</p>
              <p className="text-3xl font-bold">
                {filteredOrders.filter(o => o.stuckDuration >= 48).length}
              </p>
              <p className="text-orange-100 text-xs">Immediate action</p>
            </div>
            <Timer className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">High Priority (24h+)</p>
              <p className="text-3xl font-bold">
                {filteredOrders.filter(o => o.stuckDuration >= 24 && o.stuckDuration < 48).length}
              </p>
              <p className="text-yellow-100 text-xs">Review needed</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Avg Stuck Time</p>
              <p className="text-3xl font-bold">{stats.avgStuckTime || 0}h</p>
              <p className="text-blue-100 text-xs">Across all orders</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stuck Orders by Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          ))}
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
                placeholder="Search orders, customers, tenants..."
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
              <option value="placed">Placed</option>
              <option value="assigned_to_branch">Assigned to Branch</option>
              <option value="assigned_to_logistics_pickup">Assigned to Logistics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Stuck Orders ({filteredOrders.length})
            </h2>
            <div className="text-sm text-gray-500">
              Showing orders stuck for {hoursFilter}+ hours • Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const severity = getStuckSeverity(order.stuckDuration)
              
              return (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-blue-600">{order.orderNumber}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status || 'unknown')}`}>
                          {(order.status || 'unknown').replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severity.bg} ${severity.color}`}>
                          {severity.label} - {order.stuckDuration}h stuck
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium text-gray-900">{order.customer?.name || 'Unknown Customer'}</p>
                          <p className="text-xs text-gray-500">{order.customer?.phone || 'No phone'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tenant</p>
                          <p className="font-medium text-gray-900">{order.tenant?.name || order.tenancy?.name || 'Unknown Tenant'}</p>
                          {order.branch && (
                            <p className="text-xs text-gray-500">{order.branch?.name || 'Unknown Branch'}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium text-gray-900">₹{order.totalAmount || 0}</p>
                          <p className="text-xs text-gray-500">Payment: {order.paymentStatus || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Last update: {new Date(order.updatedAt).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Timer className="w-3 h-3" />
                          <span>Stuck for: {order.stuckDuration} hours</span>
                        </span>
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
              )
            })
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stuck orders found</h3>
              <p className="text-gray-500">All orders are progressing normally in their workflow</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredOrders.length)}</span> of{' '}
                <span className="font-medium">{filteredOrders.length}</span> stuck orders
              </p>
              
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={36}>36 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  // Show pagination with ellipsis for many pages
                  <>
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                      </>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (page <= totalPages) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === page
                                ? 'bg-red-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      }
                      return null
                    })}
                    
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Escalate Critical</p>
                <p className="text-sm text-gray-500">48+ hour orders</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Bulk Update</p>
                <p className="text-sm text-gray-500">Update multiple orders</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mark Resolved</p>
                <p className="text-sm text-gray-500">Close resolved orders</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Report</p>
                <p className="text-sm text-gray-500">Download CSV</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}