import { useState, useCallback } from 'react'
import { customerAPI, servicesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface OrderItem {
  itemType: string
  service: string
  category: string
  quantity: number
  specialInstructions?: string
}

interface CreateOrderData {
  items: OrderItem[]
  pickupAddressId?: string
  deliveryAddressId?: string
  pickupDate: string
  pickupTimeSlot: string
  paymentMethod: 'online' | 'cod'
  isExpress: boolean
  specialInstructions?: string
  branchId?: string
  // Service type for self drop-off / self pickup
  serviceType?: 'full_service' | 'self_drop_self_pickup' | 'self_drop_home_delivery' | 'home_pickup_self_pickup'
  selectedBranchId?: string
  deliveryDetails?: {
    distance: number | null
    deliveryCharge: number
    isFallbackPricing?: boolean
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pricingLoading, setPricingLoading] = useState(false)
  const router = useRouter()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getOrders()
      // Response structure: { success, data: { data: orders[], pagination: {...} }, message }
      const ordersData = response.data.data?.data || response.data.data?.orders || []
      setOrders(ordersData)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      const message = err.response?.data?.message || 'Failed to fetch orders'
      toast.error(message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = async (orderData: CreateOrderData) => {
    try {
      setLoading(true)
      const response = await customerAPI.createOrder(orderData)
      const order = response.data.data.order
      
      toast.success('Order placed successfully!')
      
      // Redirect to order confirmation page
      router.push(`/customer/orders/${order._id}?success=true`)
      
      return order
    } catch (err: any) {
      console.error('Error creating order:', err)
      const message = err.response?.data?.message || 'Failed to create order'
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const calculatePricing = useCallback(async (items: OrderItem[], isExpress: boolean = false) => {
    try {
      setPricingLoading(true)
      const response = await servicesAPI.calculatePricing(items, isExpress)
      return response.data.data
    } catch (err: any) {
      console.error('Error calculating pricing:', err)
      const message = err.response?.data?.message || 'Failed to calculate pricing'
      toast.error(message)
      throw err
    } finally {
      setPricingLoading(false)
    }
  }, [])

  const getTimeSlots = async () => {
    try {
      const response = await servicesAPI.getTimeSlots()
      return response.data.data.timeSlots
    } catch (err: any) {
      console.error('Error fetching time slots:', err)
      return [
        '09:00-11:00',
        '11:00-13:00',
        '13:00-15:00',
        '15:00-17:00',
        '17:00-19:00'
      ]
    }
  }

  const checkServiceAvailability = async (pincode: string) => {
    try {
      const response = await servicesAPI.checkServiceAvailability(pincode)
      return response.data.data
    } catch (err: any) {
      console.error('Error checking service availability:', err)
      return { available: false, message: 'Unable to check service availability' }
    }
  }

  return {
    orders,
    fetchOrders,
    createOrder,
    calculatePricing,
    getTimeSlots,
    checkServiceAvailability,
    loading,
    pricingLoading
  }
}
