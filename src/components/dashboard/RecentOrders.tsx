'use client'

import Link from 'next/link'
import { 
  Package, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Eye
} from 'lucide-react'

interface Order {
  _id: string
  orderId: string
  status: string
  totalAmount: number
  createdAt: string
  items: Array<{ service: string; quantity: number }>
  customerId: {
    name: string
    email: string
  }
  branchId: {
    name: string
    code: string
  }
}

interface RecentOrdersProps {
  orders: Order[]
  loading?: boolean
}

const statusConfig = {
  placed: { 
    color: 'text-blue-600 bg-blue-50 border-blue-200', 
    icon: Package,
    text: 'Placed'
  },
  picked_up: { 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    icon: Truck,
    text: 'Picked Up'
  },
  in_progress: { 
    color: 'text-orange-600 bg-orange-50 border-orange-200', 
    icon: Clock,
    text: 'In Progress'
  },
  ready: { 
    color: 'text-purple-600 bg-purple-50 border-purple-200', 
    icon: CheckCircle,
    text: 'Ready'
  },
  delivered: { 
    color: 'text-green-600 bg-green-50 border-green-200', 
    icon: CheckCircle,
    text: 'Delivered'
  },
  cancelled: { 
    color: 'text-red-600 bg-red-50 border-red-200', 
    icon: AlertCircle,
    text: 'Cancelled'
  }
}

export default function RecentOrders({ orders, loading }: RecentOrdersProps) {
  // Add null check for safety and limit to 5 orders
  const safeOrders = (orders || []).slice(0, 5)
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <Link 
          href="/superadmin/orders"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {safeOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent orders found</p>
          </div>
        ) : (
          safeOrders.map((order) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.placed
            const StatusIcon = statusInfo.icon
            const totalItems = Array.isArray(order.items) 
              ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
              : (order.items?.length || 0)
            const displayItems = totalItems || 1 // Prevent division by zero
            
            return (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Order Icon */}
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {order.orderId}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="truncate">
                        {order.customerId?.name || 'Unknown Customer'}
                      </span>
                      <span>•</span>
                      <span>
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>
                        {order.branchId?.name || 'Unknown Branch'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Amount and Action */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₹{Math.round((order.totalAmount || 0) / displayItems)} per item
                    </div>
                  </div>
                  
                  <Link
                    href={`/superadmin/orders/${order._id}`}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary */}
      {safeOrders.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {safeOrders.length}
              </div>
              <div className="text-xs text-gray-500">Recent Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{safeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{Math.round(safeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / (safeOrders.length || 1)).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Average Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
