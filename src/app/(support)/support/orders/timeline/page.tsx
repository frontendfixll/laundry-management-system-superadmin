'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Search,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  MapPin,
  CreditCard,
  Eye,
  RefreshCw,
  ArrowRight
} from 'lucide-react'

interface OrderTimeline {
  orderId: string
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
  branch?: {
    name: string
    address: string
  }
  currentStatus: string
  paymentStatus: string
  timeline: {
    id: string
    action: string
    status: string
    timestamp: Date
    actor: string
    details?: string
  }[]
  investigation: {
    totalStatusChanges: number
    stuckDuration?: number
    lastUpdated: Date
  }
  pricing: {
    subtotal: number
    tax: number
    total: number
  }
}

export default function OrderTimelinePage() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderTimeline, setOrderTimeline] = useState<OrderTimeline | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const authStorage = localStorage.getItem('auth-storage')
      const token = authStorage ? JSON.parse(authStorage).state?.token : null

      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/support/orders/${searchQuery}/timeline`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrderTimeline({
            ...data.data.order,
            timeline: data.data.timeline,
            investigation: data.data.investigation
          })
        }
      } else {
        // Fallback to mock data
        setOrderTimeline({
          orderId: 'order_123',
          orderNumber: 'ORD-2026-001',
          customer: {
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 98765 43210'
          },
          tenant: {
            name: 'CleanWash Laundry',
            slug: 'cleanwash'
          },
          branch: {
            name: 'CleanWash Main Branch',
            address: '123 Main Street, Mumbai'
          },
          currentStatus: 'assigned_to_logistics_pickup',
          paymentStatus: 'completed',
          timeline: [
            {
              id: '1',
              action: 'ORDER_CREATED',
              status: 'placed',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
              actor: 'Customer',
              details: 'Order placed by customer'
            },
            {
              id: '2',
              action: 'PAYMENT_COMPLETED',
              status: 'payment_confirmed',
              timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
              actor: 'Payment Gateway',
              details: 'Payment of ₹250 completed via Razorpay'
            },
            {
              id: '3',
              action: 'ORDER_ASSIGNED_TO_BRANCH',
              status: 'assigned_to_branch',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
              actor: 'System',
              details: 'Order assigned to CleanWash Main Branch'
            },
            {
              id: '4',
              action: 'PICKUP_SCHEDULED',
              status: 'assigned_to_logistics_pickup',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              actor: 'Branch Staff',
              details: 'Pickup scheduled for today 2:00 PM'
            }
          ],
          investigation: {
            totalStatusChanges: 4,
            stuckDuration: 2,
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          pricing: {
            subtotal: 225,
            tax: 25,
            total: 250
          }
        })
      }
    } catch (error) {
      console.error('Error fetching order timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-700'
      case 'payment_confirmed': return 'bg-green-100 text-green-700'
      case 'assigned_to_branch': return 'bg-yellow-100 text-yellow-700'
      case 'assigned_to_logistics_pickup': return 'bg-orange-100 text-orange-700'
      case 'picked_up': return 'bg-purple-100 text-purple-700'
      case 'in_process': return 'bg-indigo-100 text-indigo-700'
      case 'ready_for_delivery': return 'bg-teal-100 text-teal-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ORDER_CREATED': return <Package className="w-4 h-4" />
      case 'PAYMENT_COMPLETED': return <CreditCard className="w-4 h-4" />
      case 'ORDER_ASSIGNED_TO_BRANCH': return <Building2 className="w-4 h-4" />
      case 'PICKUP_SCHEDULED': return <Clock className="w-4 h-4" />
      case 'ORDER_PICKED_UP': return <CheckCircle className="w-4 h-4" />
      case 'ORDER_IN_PROCESS': return <RefreshCw className="w-4 h-4" />
      case 'ORDER_READY': return <CheckCircle className="w-4 h-4" />
      case 'ORDER_DELIVERED': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clock className="w-7 h-7 mr-3 text-blue-600" />
          Order Timeline Investigation
        </h1>
        <p className="text-gray-600 mt-1">
          Track order progress and investigate status changes
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Order ID or Order Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Order Timeline */}
      {orderTimeline && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderTimeline.currentStatus)}`}>
                {orderTimeline.currentStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Order Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-blue-600">{orderTimeline.orderNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className={`px-2 py-1 rounded text-xs ${
                      orderTimeline.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {orderTimeline.paymentStatus}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Total: <span className="font-medium">₹{orderTimeline.pricing.total}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Customer</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{orderTimeline.customer.name}</span>
                  </div>
                  <div className="text-gray-600">{orderTimeline.customer.email}</div>
                  <div className="text-gray-600">{orderTimeline.customer.phone}</div>
                </div>
              </div>

              {/* Tenant & Branch Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Service Provider</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>{orderTimeline.tenant.name}</span>
                  </div>
                  {orderTimeline.branch && (
                    <>
                      <div className="text-gray-600">{orderTimeline.branch.name}</div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span className="text-gray-600">{orderTimeline.branch.address}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Investigation Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Investigation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Status Changes:</span>
                  <span className="ml-2 font-medium">{orderTimeline.investigation.totalStatusChanges}</span>
                </div>
                <div>
                  <span className="text-blue-700">Last Updated:</span>
                  <span className="ml-2 font-medium">{orderTimeline.investigation.lastUpdated.toLocaleString()}</span>
                </div>
                {orderTimeline.investigation.stuckDuration && (
                  <div>
                    <span className="text-blue-700">Stuck Duration:</span>
                    <span className="ml-2 font-medium text-orange-600">
                      {orderTimeline.investigation.stuckDuration} hours
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {orderTimeline.timeline.map((event, index) => (
                  <div key={event.id} className="relative flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm ${
                      index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      <div className={`${index === 0 ? 'text-white' : 'text-gray-600'}`}>
                        {getActionIcon(event.action)}
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {event.action.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.replace(/_/g, ' ')}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">by</span>
                        <span className="text-xs font-medium text-gray-700">{event.actor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Support Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Full Order</p>
                    <p className="text-sm text-gray-500">Complete order details</p>
                  </div>
                </div>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Refresh Status</p>
                    <p className="text-sm text-gray-500">Check for updates</p>
                  </div>
                </div>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Escalate Issue</p>
                    <p className="text-sm text-gray-500">Report to management</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!orderTimeline && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search for an order</h3>
          <p className="text-gray-500">Enter an Order ID or Order Number to view its timeline</p>
        </div>
      )}
    </div>
  )
}