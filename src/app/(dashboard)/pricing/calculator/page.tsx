'use client'

import { useState } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import { useServiceItems, usePriceCalculation } from '@/hooks/usePricing'
import { 
  Plus, 
  Trash2, 
  Calculator,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  name: string
  quantity: number
}

export default function PriceCalculatorPage() {
  const { serviceItems, loading: itemsLoading } = useServiceItems()
  const { calculatePrice, loading: calcLoading } = usePriceCalculation()
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { name: '', quantity: 1 }
  ])
  const [options, setOptions] = useState({
    isExpress: false,
    includeDelivery: true,
    discountCode: '',
    customerInfo: {}
  })
  const [calculation, setCalculation] = useState<any>(null)
  const [error, setError] = useState('')

  const addOrderItem = () => {
    setOrderItems([...orderItems, { name: '', quantity: 1 }])
  }

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index))
    }
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }
    setOrderItems(updated)
  }

  const handleCalculate = async () => {
    try {
      setError('')
      
      // Filter out empty items
      const validItems = orderItems.filter(item => item.name.trim() && item.quantity > 0)
      
      if (validItems.length === 0) {
        setError('Please add at least one valid item')
        return
      }

      const result = await calculatePrice(validItems, options)
      setCalculation(result)
    } catch (err: any) {
      setError(err.message)
      setCalculation(null)
    }
  }

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/superadmin/pricing"
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Calculator</h1>
          <p className="text-gray-600">Test pricing calculations with current active pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Configuration</h2>
          
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Items</h3>
              <button
                onClick={addOrderItem}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Item
                  </label>
                  <select
                    value={item.name}
                    onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select item...</option>
                    {serviceItems.map((serviceItem) => (
                      <option key={serviceItem.name} value={serviceItem.name}>
                        {serviceItem.name} - ₹{serviceItem.basePrice} ({serviceItem.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {orderItems.length > 1 && (
                  <button
                    onClick={() => removeOrderItem(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-900">Options</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.isExpress}
                  onChange={(e) => setOptions({ ...options, isExpress: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Express Service</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeDelivery}
                  onChange={(e) => setOptions({ ...options, includeDelivery: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Delivery</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Code (Optional)
              </label>
              <input
                type="text"
                value={options.discountCode}
                onChange={(e) => setOptions({ ...options, discountCode: e.target.value })}
                placeholder="Enter discount code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={calcLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {calcLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            Calculate Price
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Calculation Results */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h2>
          
          {calculation ? (
            <div className="space-y-4">
              {/* Item Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Items</h3>
                <div className="space-y-2">
                  {calculation.calculation.itemDetails.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{calculation.calculation.subtotal.toFixed(2)}</span>
                </div>
                
                {calculation.calculation.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {calculation.calculation.appliedDiscount && (
                        <span className="text-xs ml-1">
                          ({calculation.calculation.appliedDiscount.name})
                        </span>
                      )}:
                    </span>
                    <span>-₹{calculation.calculation.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax ({calculation.calculation.taxAmount > 0 ? '18%' : '0%'}):</span>
                  <span>₹{calculation.calculation.taxAmount.toFixed(2)}</span>
                </div>
                
                {calculation.calculation.deliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span>₹{calculation.calculation.deliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{calculation.calculation.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pricing Version */}
              <div className="text-xs text-gray-500 mt-4">
                Calculated using pricing version: {calculation.pricingVersion}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Configure your order and click "Calculate Price" to see the breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
