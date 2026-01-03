'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar,
  ShoppingBag,
  IndianRupee,
  Star,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  isVIP: boolean
  totalOrders: number
  totalSpent: number
  createdAt: string
  lastOrderDate?: string
}

interface Stats {
  total: number
  active: number
  inactive: number
  vip: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, vip: 0 })
  const [goToPage, setGoToPage] = useState('')
  const limit = 8

  useEffect(() => {
    fetchCustomers()
  }, [page, statusFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await superAdminApi.getCustomers({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      })
      const customerData = response.data.customers || []
      setCustomers(customerData)
      setTotalPages(response.data.pagination?.totalPages || 1)
      setTotalCustomers(response.data.pagination?.total || 0)
      
      // Use stats from API response (calculated from all customers, not just current page)
      if (response.data.stats) {
        setStats(response.data.stats)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(goToPage, 10)
    if (pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum)
      setGoToPage('')
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const current = page
    const total = totalPages
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCustomers()
  }

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      await superAdminApi.updateCustomerStatus(customerId, !currentStatus)
      toast.success(`Customer ${currentStatus ? 'deactivated' : 'activated'} successfully`)
      
      // Update customer in-place without re-fetching
      setCustomers(prev => prev.map(c => 
        c._id === customerId ? { ...c, isActive: !currentStatus } : c
      ))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: prev.active + (currentStatus ? -1 : 1),
        inactive: prev.inactive + (currentStatus ? 1 : -1)
      }))
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage all registered customers</p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.vip}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="vip">VIP Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            {customer.isVIP && (
                              <Star className="w-4 h-4 text-yellow-500 ml-1" fill="currentColor" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {customer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <ShoppingBag className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.totalOrders || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <IndianRupee className="w-4 h-4 mr-1 text-gray-400" />
                        {(customer.totalSpent || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => toggleCustomerStatus(customer._id, customer.isActive)}
                        className={`px-3 py-1 text-xs rounded-lg ${
                          customer.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {customer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCustomers)} of {totalCustomers} customers
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page */}
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={page === 1}
                className="hidden sm:flex px-2 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              {/* Previous */}
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
                className="flex items-center px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, index) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum as number)}
                      className={`min-w-[36px] px-3 py-1 border rounded-lg ${
                        page === pageNum 
                          ? 'bg-purple-600 text-white border-purple-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>
              
              {/* Next */}
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages}
                className="flex items-center px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Last Page */}
              <button 
                onClick={() => handlePageChange(totalPages)} 
                disabled={page === totalPages}
                className="hidden sm:flex px-2 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
              
              {/* Go to Page - only show when more than 10 pages */}
              {totalPages > 10 && (
                <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    placeholder="#"
                    className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                  />
                  <button type="submit" disabled={!goToPage} className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
                    Go
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
