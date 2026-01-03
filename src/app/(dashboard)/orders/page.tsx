'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { 
  Package, 
  Search, 
  Eye,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Building2,
  User,
  MapPin,
  ChevronDown,
  RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

interface Order {
  _id: string
  orderNumber: string
  status: string
  customer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  branch?: {
    _id: string
    name: string
    code: string
  }
  pickupAddress: {
    name: string
    phone: string
    addressLine1: string
    city: string
    pincode: string
  }
  pickupDate: string
  pickupTimeSlot: string
  pricing: {
    total: number
  }
  items: any[]
  isExpress: boolean
  createdAt: string
}

interface Branch {
  _id: string
  name: string
  code: string
}

interface LogisticsPartner {
  _id: string
  companyName: string
  contactPerson: {
    name: string
    phone: string
    email?: string
  }
}

const statusConfig: Record<string, { color: string; bgColor: string; text: string }> = {
  placed: { color: 'text-blue-600', bgColor: 'bg-blue-50', text: 'Placed' },
  assigned_to_branch: { color: 'text-indigo-600', bgColor: 'bg-indigo-50', text: 'Assigned to Branch' },
  assigned_to_logistics_pickup: { color: 'text-cyan-600', bgColor: 'bg-cyan-50', text: 'Pickup Scheduled' },
  picked: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', text: 'Picked Up' },
  in_process: { color: 'text-orange-600', bgColor: 'bg-orange-50', text: 'In Process' },
  ready: { color: 'text-purple-600', bgColor: 'bg-purple-50', text: 'Ready' },
  assigned_to_logistics_delivery: { color: 'text-teal-600', bgColor: 'bg-teal-50', text: 'Out for Delivery' },
  out_for_delivery: { color: 'text-teal-600', bgColor: 'bg-teal-50', text: 'Out for Delivery' },
  delivered: { color: 'text-green-600', bgColor: 'bg-green-50', text: 'Delivered' },
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-50', text: 'Cancelled' },
}

const nextStatusMap: Record<string, string> = {
  placed: 'assigned_to_branch',
  assigned_to_branch: 'assigned_to_logistics_pickup',
  assigned_to_logistics_pickup: 'picked',
  picked: 'in_process',
  in_process: 'ready',
  ready: 'assigned_to_logistics_delivery',
  assigned_to_logistics_delivery: 'out_for_delivery',
  out_for_delivery: 'delivered',
}

export default function SuperAdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [logistics, setLogistics] = useState<LogisticsPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignType, setAssignType] = useState<'branch' | 'logistics'>('branch')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedLogistics, setSelectedLogistics] = useState('')
  const [updating, setUpdating] = useState(false)


  useEffect(() => {
    fetchOrders()
    fetchBranches()
    fetchLogistics()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/superadmin/orders')
      setOrders(response.data.data?.data || response.data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await api.get('/superadmin/branches')
      const branchesData = response.data.data?.branches || response.data.data?.data || response.data.data || []
      // Extract only needed fields to avoid rendering objects
      const simpleBranches = branchesData.map((b: any) => ({
        _id: b._id,
        name: b.name,
        code: b.code
      }))
      setBranches(simpleBranches)
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchLogistics = async () => {
    try {
      const response = await api.get('/superadmin/logistics')
      setLogistics(response.data.data?.data || response.data.data || [])
    } catch (error) {
      console.error('Error fetching logistics:', error)
    }
  }

  const handleAssignBranch = async () => {
    if (!selectedOrder || !selectedBranch) return
    
    try {
      setUpdating(true)
      await api.put(`/superadmin/orders/${selectedOrder._id}/assign-branch`, {
        branchId: selectedBranch
      })
      toast.success('Order assigned to branch successfully')
      setShowAssignModal(false)
      setSelectedOrder(null)
      setSelectedBranch('')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign branch')
    } finally {
      setUpdating(false)
    }
  }

  const handleAssignLogistics = async () => {
    if (!selectedOrder || !selectedLogistics) return
    
    try {
      setUpdating(true)
      await api.put(`/superadmin/orders/${selectedOrder._id}/assign-logistics`, {
        logisticsPartnerId: selectedLogistics
      })
      toast.success('Logistics partner assigned successfully')
      setShowAssignModal(false)
      setSelectedOrder(null)
      setSelectedLogistics('')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign logistics')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true)
      await api.put(`/superadmin/orders/${orderId}/status`, {
        status: newStatus
      })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const customerName = typeof order.customer === 'object' ? order.customer?.name : ''
    const customerPhone = typeof order.customer === 'object' ? order.customer?.phone : ''
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { color: 'text-gray-600', bgColor: 'bg-gray-50', text: status }
  }

  const openAssignModal = (order: Order, type: 'branch' | 'logistics') => {
    setSelectedOrder(order)
    setAssignType(type)
    setShowAssignModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="placed">Placed</option>
            <option value="assigned_to_branch">Assigned to Branch</option>
            <option value="assigned_to_logistics_pickup">Pickup Scheduled</option>
            <option value="picked">Picked Up</option>
            <option value="in_process">In Process</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'placed').length}
          </div>
          <div className="text-sm text-blue-100">New Orders</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'in_process').length}
          </div>
          <div className="text-sm text-orange-100">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'ready').length}
          </div>
          <div className="text-sm text-purple-100">Ready</div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'out_for_delivery').length}
          </div>
          <div className="text-sm text-teal-100">Out for Delivery</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-green-100">Delivered</div>
        </div>
      </div>


      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'No orders have been placed yet'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const nextStatus = nextStatusMap[order.status]
                  
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        {order.isExpress && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                            Express
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {typeof order.customer === 'object' ? order.customer?.name : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {typeof order.customer === 'object' ? order.customer?.phone : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(order.pickupDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">{order.pickupTimeSlot}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.pickupAddress?.city}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {order.branch ? (
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-800">{order.branch.name}</div>
                              <div className="text-xs text-gray-500">{order.branch.code}</div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignModal(order, 'branch')}
                            className="text-xs"
                          >
                            Assign Branch
                          </Button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">₹{order.pricing?.total || 0}</div>
                        <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {order.status === 'assigned_to_branch' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal(order, 'logistics')}
                              className="text-xs"
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Assign Pickup
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal(order, 'logistics')}
                              className="text-xs"
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Assign Delivery
                            </Button>
                          )}
                          {/* Status Change Dropdown */}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateStatus(order._id, e.target.value)
                                }
                              }}
                              disabled={updating}
                              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                            >
                              <option value="">Change Status</option>
                              {order.status === 'placed' && (
                                <>
                                  <option value="assigned_to_branch">Assign to Branch</option>
                                  <option value="in_process">Start Processing</option>
                                </>
                              )}
                              {order.status === 'assigned_to_branch' && (
                                <option value="in_process">Start Processing</option>
                              )}
                              {order.status === 'assigned_to_logistics_pickup' && (
                                <option value="picked">Mark Picked</option>
                              )}
                              {order.status === 'picked' && (
                                <option value="in_process">Start Processing</option>
                              )}
                              {order.status === 'in_process' && (
                                <option value="ready">Mark Ready</option>
                              )}
                              {order.status === 'ready' && (
                                <option value="out_for_delivery">Out for Delivery</option>
                              )}
                              {order.status === 'assigned_to_logistics_delivery' && (
                                <option value="out_for_delivery">Out for Delivery</option>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <option value="delivered">Mark Delivered</option>
                              )}
                              <option value="cancelled">Cancel Order</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {filteredOrders.length > ITEMS_PER_PAGE && (
            <Pagination
              current={currentPage}
              pages={totalPages}
              total={filteredOrders.length}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              itemName="orders"
            />
          )}
        </div>
      )}


      {/* Assign Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {assignType === 'branch' ? 'Assign to Branch' : 'Assign Logistics Partner'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Order: <span className="font-medium">{selectedOrder.orderNumber}</span></div>
              <div className="text-sm text-gray-600">Customer: <span className="font-medium">{typeof selectedOrder.customer === 'object' ? selectedOrder.customer?.name : 'N/A'}</span></div>
              <div className="text-sm text-gray-600">Pickup: <span className="font-medium">{selectedOrder.pickupAddress?.city}</span></div>
            </div>

            {assignType === 'branch' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Choose a branch...</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Logistics Partner</label>
                <select
                  value={selectedLogistics}
                  onChange={(e) => setSelectedLogistics(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Choose a logistics partner...</option>
                  {logistics.map(partner => (
                    <option key={partner._id} value={partner._id}>
                      {partner.companyName} - {partner.contactPerson?.name || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={assignType === 'branch' ? handleAssignBranch : handleAssignLogistics}
                disabled={updating || (assignType === 'branch' ? !selectedBranch : !selectedLogistics)}
                className="flex-1 bg-teal-500 hover:bg-teal-600"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedOrder(null)
                  setSelectedBranch('')
                  setSelectedLogistics('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

