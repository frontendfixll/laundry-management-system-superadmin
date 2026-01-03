'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderDetails {
  _id: string
  orderId: string
  orderNumber: string
  status: string
  customer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  branch: {
    _id: string
    name: string
    code: string
  }
  pickupAddress: {
    addressLine1: string
    addressLine2?: string
    city: string
    pincode: string
    phone: string
  }
  deliveryAddress: {
    addressLine1: string
    addressLine2?: string
    city: string
    pincode: string
    phone: string
  }
  items: Array<{
    itemType: string
    service: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  pricing: {
    subtotal: number
    deliveryCharge: number
    tax: number
    discount: number
    total: number
  }
  paymentMethod: string
  paymentStatus: string
  pickupDate: string
  pickupTimeSlot: string
  estimatedDeliveryDate: string
  statusHistory: Array<{
    status: string
    updatedAt: string
    notes?: string
  }>
  createdAt: string
}

const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
  placed: { color: 'text-blue-600 bg-blue-50', icon: Package, text: 'Placed' },
  assigned_to_branch: { color: 'text-indigo-600 bg-indigo-50', icon: Building2, text: 'Assigned' },
  picked: { color: 'text-yellow-600 bg-yellow-50', icon: Truck, text: 'Picked Up' },
  in_process: { color: 'text-orange-600 bg-orange-50', icon: Clock, text: 'Processing' },
  ready: { color: 'text-purple-600 bg-purple-50', icon: CheckCircle, text: 'Ready' },
  out_for_delivery: { color: 'text-teal-600 bg-teal-50', icon: Truck, text: 'Out for Delivery' },
  delivered: { color: 'text-green-600 bg-green-50', icon: CheckCircle, text: 'Delivered' },
  cancelled: { color: 'text-red-600 bg-red-50', icon: AlertCircle, text: 'Cancelled' }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const getAuthToken = () => {
    // First try superadmin-storage (Zustand persist format)
    const superAdminData = localStorage.getItem('superadmin-storage')
    if (superAdminData) {
      try {
        const parsed = JSON.parse(superAdminData)
        if (parsed.state?.token) return parsed.state.token
      } catch (e) {}
    }
    // Fallback to laundry-auth
    const authData = localStorage.getItem('laundry-auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        return parsed.state?.token || parsed.token
      } catch (e) {}
    }
    // Legacy fallback
    return localStorage.getItem('superadmin-token') || localStorage.getItem('token')
  }

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/superadmin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }
      
      const data = await response.json()
      setOrder(data.order || data.data?.order || data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Order Not Found</h2>
          <p className="text-red-600 mb-4">{error || 'Unable to load order details'}</p>
          <Link href="/superadmin/orders">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status] || statusConfig.placed
  const StatusIcon = statusInfo.icon

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/superadmin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber || order.orderId}
            </h1>
            <p className="text-gray-600">
              Created on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
          <StatusIcon className="w-4 h-4 mr-2" />
          {statusInfo.text}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customer?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p className="font-medium">{order.branch?.name || 'Not Assigned'}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Addresses
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pickup Address</p>
                <div className="text-gray-600">
                  <p>{order.pickupAddress?.addressLine1}</p>
                  {order.pickupAddress?.addressLine2 && <p>{order.pickupAddress.addressLine2}</p>}
                  <p>{order.pickupAddress?.city}, {order.pickupAddress?.pincode}</p>
                  <p className="flex items-center mt-1">
                    <Phone className="w-3 h-3 mr-1" />
                    {order.pickupAddress?.phone}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Delivery Address</p>
                <div className="text-gray-600">
                  <p>{order.deliveryAddress?.addressLine1}</p>
                  {order.deliveryAddress?.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                  <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}</p>
                  <p className="flex items-center mt-1">
                    <Phone className="w-3 h-3 mr-1" />
                    {order.deliveryAddress?.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-600" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.itemType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.service?.replace(/_/g, ' ')} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.totalPrice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Status History
            </h3>
            <div className="space-y-4">
              {order.statusHistory?.map((history, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {statusConfig[history.status]?.text || history.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(history.updatedAt).toLocaleString()}
                    </p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.pricing?.subtotal || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>₹{order.pricing?.deliveryCharge || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>₹{order.pricing?.tax || 0}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.pricing.discount}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-purple-600">₹{order.pricing?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
              Payment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Schedule
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Pickup Date</p>
                <p className="font-medium">
                  {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Slot</p>
                <p className="font-medium">{order.pickupTimeSlot || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Delivery</p>
                <p className="font-medium">
                  {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
