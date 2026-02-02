'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  User,
  Building2,
  CreditCard,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
  Truck,
  Phone,
  Mail,
  AlertCircle,
  X
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  tenant: {
    name: string
    slug: string
  }
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  stuckDuration?: number
  branch?: {
    name: string
  }
}

export default function OrderInvestigationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [stuckOrders, setStuckOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [pageSize, setPageSize] = useState(8)
  const [paginationLoading, setPaginationLoading] = useState(false)
  
  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  // Show first few stuck orders without pagination
  const maxStuckOrdersToShow = 4 // Show 4 stuck orders directly
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    loadOrders()
    loadStuckOrders()
  }, [currentPage, pageSize, statusFilter, paymentFilter])

  useEffect(() => {
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      loadOrders()
    }
  }, [debouncedSearchTerm])

  const loadOrders = async () => {
    try {
      const loadingState = currentPage === 1 ? setLoading : setPaginationLoading
      loadingState(true)
      
      const token = localStorage.getItem('auth-storage')
      if (!token) {
        loadingState(false)
        return
      }

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) {
        loadingState(false)
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { paymentStatus: paymentFilter })
      })
      
      const response = await fetch(`${API_URL}/support/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📦 Orders API Response:', data)
        
        if (data.success && data.data) {
          // Transform backend data to frontend format
          const transformedOrders = (data.data.orders || []).map((order: any) => ({
            id: order._id || order.id,
            orderNumber: order.orderNumber || order.orderCode || `ORD-${(order._id || order.id || '').slice(-6)}`,
            customer: {
              name: order.customer?.name || order.customerName || 'Unknown Customer',
              email: order.customer?.email || order.customerEmail || 'unknown@email.com',
              phone: order.customer?.phone || order.customerPhone || 'No phone'
            },
            tenant: {
              name: order.tenant?.name || order.tenantName || 'Unknown Tenant',
              slug: order.tenant?.slug || order.tenantSlug || 'unknown'
            },
            status: order.status || 'unknown',
            paymentStatus: order.paymentStatus || order.payment?.status || 'unknown',
            totalAmount: order.totalAmount || order.total || order.amount || 0,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            stuckDuration: order.stuckDuration,
            branch: order.branch ? {
              name: order.branch.name || 'Unknown Branch'
            } : undefined
          }))
          
          setOrders(transformedOrders)
          setTotalOrders(data.data.total || transformedOrders.length)
          setTotalPages(Math.ceil((data.data.total || transformedOrders.length) / pageSize))
          
          console.log('✅ Loaded real orders:', transformedOrders.length, 'of', data.data.total)
        } else {
          console.log('⚠️ Invalid orders response format')
          setOrders([])
          setTotalOrders(0)
          setTotalPages(1)
        }
      } else {
        console.log('⚠️ Orders API not available, using empty state')
        setOrders([])
        setTotalOrders(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
      console.log('⚠️ Using empty state due to API error')
      setOrders([])
      setTotalOrders(0)
      setTotalPages(1)
    } finally {
      const loadingState = currentPage === 1 ? setLoading : setPaginationLoading
      loadingState(false)
    }
  }

  const loadStuckOrders = async () => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      const response = await fetch(`${API_URL}/support/orders/stuck?hours=24`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🚨 Stuck Orders API Response:', data)
        
        if (data.success && data.data) {
          // Transform backend data to frontend format
          const transformedStuckOrders = (data.data.stuckOrders || data.data || []).map((order: any) => ({
            id: order._id || order.id,
            orderNumber: order.orderNumber || order.orderCode || `ORD-${(order._id || order.id || '').slice(-6)}`,
            customer: {
              name: order.customer?.name || order.customerName || 'Unknown Customer',
              email: order.customer?.email || order.customerEmail || 'unknown@email.com',
              phone: order.customer?.phone || order.customerPhone || 'No phone'
            },
            tenant: {
              name: order.tenant?.name || order.tenantName || 'Unknown Tenant',
              slug: order.tenant?.slug || order.tenantSlug || 'unknown'
            },
            status: order.status || 'unknown',
            paymentStatus: order.paymentStatus || order.payment?.status || 'unknown',
            totalAmount: order.totalAmount || order.total || order.amount || 0,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            stuckDuration: order.stuckDuration || Math.floor((Date.now() - new Date(order.updatedAt || order.createdAt).getTime()) / (1000 * 60 * 60)),
            branch: order.branch ? {
              name: order.branch.name || 'Unknown Branch'
            } : undefined
          }))
          
          setStuckOrders(transformedStuckOrders)
          console.log('✅ Loaded real stuck orders:', transformedStuckOrders.length)
        } else {
          console.log('⚠️ No stuck orders found')
          setStuckOrders([])
        }
      } else {
        console.log('⚠️ Stuck orders API not available')
        setStuckOrders([])
      }
    } catch (error) {
      console.error('Failed to load stuck orders:', error)
      setStuckOrders([])
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'placed': return 'bg-blue-100 text-blue-700'
      case 'processing': return 'bg-yellow-100 text-yellow-700'
      case 'ready': return 'bg-purple-100 text-purple-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Since we're doing server-side filtering, we don't need client-side filtering
  // The orders are already filtered by the API based on search and filters
  const filteredOrders = orders

  // Show first few stuck orders directly
  const displayedStuckOrders = stuckOrders.slice(0, maxStuckOrdersToShow)

  // Pagination helper functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const getPaginationRange = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Order Investigation</h1>
          <p className="text-gray-600 mt-1">
            Investigate order issues and track order progress across all tenants
            {totalOrders > 0 && (
              <span className="ml-2 text-sm">
                ({totalOrders.toLocaleString()} total orders)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
              <p className="text-blue-100 text-xs">Last 24 hours</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Stuck Orders</p>
              <p className="text-3xl font-bold">{stuckOrders.length}</p>
              <p className="text-red-100 text-xs">Need attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Payment Issues</p>
              <p className="text-3xl font-bold">{orders.filter(o => o.paymentStatus === 'failed').length}</p>
              <p className="text-yellow-100 text-xs">Failed payments</p>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
              <p className="text-green-100 text-xs">Successfully delivered</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Stuck Orders Alert */}
      {stuckOrders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-red-900">Stuck Orders Alert</h3>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  {stuckOrders.length} total
                </span>
              </div>
              <p className="text-red-700 mt-1">
                {stuckOrders.length} orders haven't progressed in the last 24 hours and need immediate attention.
              </p>
              
              {/* Display Stuck Orders */}
              <div className="mt-4 space-y-2">
                {displayedStuckOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-red-600">{order.orderNumber}</span>
                      <span className="text-sm text-gray-600">{order.customer?.name || 'Unknown Customer'}</span>
                      <span className="text-sm text-gray-500">({order.tenant?.name || 'Unknown Tenant'})</span>
                      {order.stuckDuration && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Stuck for {order.stuckDuration}h
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Investigate
                    </button>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              {stuckOrders.length > maxStuckOrdersToShow && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-red-600">
                    Showing {displayedStuckOrders.length} of {stuckOrders.length} stuck orders
                  </p>
                  
                  <button
                    onClick={() => router.push('/support/orders/stuck')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <span>View All Stuck Orders</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
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
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Orders ({filteredOrders.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-lg font-mono font-semibold text-blue-600">{order.orderNumber}</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      {order.stuckDuration && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Stuck {order.stuckDuration}h</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customer?.name || 'Unknown Customer'}</p>
                          <p className="text-xs text-gray-500">{order.customer?.phone || 'No phone'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.tenant?.name || 'Unknown Tenant'}</p>
                          <p className="text-xs text-gray-500">{order.branch?.name || 'No branch'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">₹{order.totalAmount}</p>
                          <p className="text-xs text-gray-500">{order.paymentStatus}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Timeline</span>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalOrders > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalOrders)}</span> of{' '}
                <span className="font-medium">{totalOrders}</span> orders
              </p>
              
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={8}>8 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || paginationLoading}
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
                      disabled={paginationLoading}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  // Show pagination with ellipsis
                  getPaginationRange().map((page, index) => (
                    <span key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          disabled={paginationLoading}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || paginationLoading}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
          
          {paginationLoading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order Investigation</h2>
                  <p className="text-gray-600">{selectedOrder.orderNumber}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                        Contact Customer
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                        Update Status
                      </button>
                      <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors">
                        Request Refund
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors">
                        Escalate Issue
                      </button>
                      <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors">
                        Create Ticket
                      </button>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedOrder.customer?.name || 'Unknown Customer'}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || 'No email'}</p>
                        <p><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || 'No phone'}</p>
                        <div className="pt-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Call Customer
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-green-500" />
                        Business Information
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Tenant:</span> {selectedOrder.tenant?.name || 'Unknown Tenant'}</p>
                        <p><span className="font-medium">Branch:</span> {selectedOrder.branch?.name || 'No branch'}</p>
                        <p><span className="font-medium">Slug:</span> {selectedOrder.tenant?.slug || 'unknown'}</p>
                        <div className="pt-2">
                          <button className="text-green-600 hover:text-green-700 text-sm flex items-center">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Tenant Dashboard
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-purple-500" />
                        Payment Details
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Amount:</span> ₹{selectedOrder.totalAmount}</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </p>
                        <p><span className="font-medium">Method:</span> Online Payment</p>
                        <div className="pt-2">
                          <button className="text-purple-600 hover:text-purple-700 text-sm flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            View Payment Details
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-orange-500" />
                        Order Status
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Current Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        <p><span className="font-medium">Updated:</span> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                        {selectedOrder.stuckDuration && (
                          <p className="text-red-600"><span className="font-medium">Stuck Duration:</span> {selectedOrder.stuckDuration}h</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Investigation Tools */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                      Investigation Tools
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Check Payment Gateway</p>
                              <p className="text-sm text-gray-500">Verify payment status with gateway</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                        
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Track Delivery Status</p>
                              <p className="text-sm text-gray-500">Check with logistics partner</p>
                            </div>
                            <Truck className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                        
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">View Order History</p>
                              <p className="text-sm text-gray-500">Complete order timeline</p>
                            </div>
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Contact Branch</p>
                              <p className="text-sm text-gray-500">Reach out to processing branch</p>
                            </div>
                            <MapPin className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                        
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Send Notification</p>
                              <p className="text-sm text-gray-500">Notify customer about status</p>
                            </div>
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                        
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Generate Report</p>
                              <p className="text-sm text-gray-500">Create investigation report</p>
                            </div>
                            <Download className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Timeline & Actions */}
                <div className="space-y-6">
                  {/* Order Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-500" />
                      Order Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">Order Placed</p>
                          <p className="text-sm text-gray-600">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-green-500' : 
                          selectedOrder.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">Payment {selectedOrder.paymentStatus}</p>
                          <p className="text-sm text-gray-600">Payment gateway response received</p>
                        </div>
                      </div>
                      
                      {selectedOrder.status !== 'placed' && (
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-gray-900">Status Updated to {selectedOrder.status}</p>
                            <p className="text-sm text-gray-600">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.stuckDuration && (
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-red-900">Order Stuck</p>
                            <p className="text-sm text-red-600">No progress for {selectedOrder.stuckDuration} hours</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Investigation Notes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Investigation Notes</h3>
                    <textarea
                      placeholder="Add investigation notes, findings, or action items..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-3 flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Save Notes
                      </button>
                    </div>
                  </div>

                  {/* Related Orders */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Related Orders</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Orders from same customer:</p>
                      <div className="space-y-1">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">ORD260126001</button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">ORD260125003</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}