'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Plus, 
  Trash2, 
  ArrowLeft,
  Info
} from 'lucide-react'

interface ServiceItem {
  name: string
  category: 'wash_fold' | 'dry_cleaning' | 'iron_press' | 'shoe_cleaning' | 'additional'
  basePrice: number
  unit: 'per_piece' | 'per_kg' | 'per_pair' | 'per_set'
  minQuantity: number
  maxQuantity: number
  isActive: boolean
  description: string
  processingTime: number
  specialInstructions: string
}

interface ExpressCharge {
  name: string
  type: 'percentage' | 'fixed_amount' | 'per_item'
  value: number
  minOrderValue: number
  maxOrderValue: number
  deliveryTime: number
  isActive: boolean
  description: string
}

interface DiscountPolicy {
  name: string
  code: string
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bulk_discount'
  value: number
  minOrderValue: number
  maxOrderValue: number
  minQuantity: number
  maxUsagePerCustomer: number
  maxTotalUsage: number
  startDate: string
  endDate: string
  applicableServices: string[]
  customerSegments: string[]
  isActive: boolean
  description: string
}

export default function CreatePricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    version: '',
    description: ''
  })

  // Service Items
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    {
      name: '',
      category: 'wash_fold' as const,
      basePrice: 0,
      unit: 'per_piece' as const,
      minQuantity: 1,
      maxQuantity: 100,
      isActive: true,
      description: '',
      processingTime: 24,
      specialInstructions: ''
    }
  ])

  // Express Charges
  const [expressCharges, setExpressCharges] = useState<ExpressCharge[]>([
    {
      name: '',
      type: 'percentage' as const,
      value: 0,
      minOrderValue: 0,
      maxOrderValue: 0,
      deliveryTime: 6,
      isActive: true,
      description: ''
    }
  ])

  // Discount Policies
  const [discountPolicies, setDiscountPolicies] = useState<DiscountPolicy[]>([])

  // Settings
  const [settings, setSettings] = useState({
    currency: 'INR',
    taxRate: 18,
    deliveryCharges: {
      freeDeliveryThreshold: 500,
      standardCharge: 50,
      expressCharge: 100
    },
    roundingRule: 'round_nearest' as const,
    minimumOrderValue: 100
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!basicInfo.name.trim() || !basicInfo.version.trim()) {
      setError('Name and version are required')
      return
    }

    if (serviceItems.length === 0 || !serviceItems.some(item => item.name.trim())) {
      setError('At least one service item is required')
      return
    }

    try {
      setLoading(true)
      setError('')

      const pricingData = {
        name: basicInfo.name.trim(),
        version: basicInfo.version.trim(),
        serviceItems: serviceItems.filter(item => item.name.trim()),
        expressCharges: expressCharges.filter(charge => charge.name.trim()),
        discountPolicies: discountPolicies.filter(policy => policy.name.trim()),
        settings,
        approvalStatus: 'draft'
      }

      await superAdminApi.createPricingConfiguration(pricingData)
      router.push('/superadmin/pricing')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addServiceItem = () => {
    setServiceItems([...serviceItems, {
      name: '',
      category: 'wash_fold',
      basePrice: 0,
      unit: 'per_piece',
      minQuantity: 1,
      maxQuantity: 100,
      isActive: true,
      description: '',
      processingTime: 24,
      specialInstructions: ''
    }])
  }

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index))
  }

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...serviceItems]
    updated[index] = { ...updated[index], [field]: value }
    setServiceItems(updated)
  }

  const addExpressCharge = () => {
    setExpressCharges([...expressCharges, {
      name: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      maxOrderValue: 0,
      deliveryTime: 6,
      isActive: true,
      description: ''
    }])
  }

  const removeExpressCharge = (index: number) => {
    setExpressCharges(expressCharges.filter((_, i) => i !== index))
  }

  const updateExpressCharge = (index: number, field: keyof ExpressCharge, value: any) => {
    const updated = [...expressCharges]
    updated[index] = { ...updated[index], [field]: value }
    setExpressCharges(updated)
  }

  const addDiscountPolicy = () => {
    setDiscountPolicies([...discountPolicies, {
      name: '',
      code: '',
      type: 'percentage',
      value: 0,
      minOrderValue: 0,
      maxOrderValue: 0,
      minQuantity: 1,
      maxUsagePerCustomer: 0,
      maxTotalUsage: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicableServices: ['all'],
      customerSegments: ['all'],
      isActive: true,
      description: ''
    }])
  }

  const removeDiscountPolicy = (index: number) => {
    setDiscountPolicies(discountPolicies.filter((_, i) => i !== index))
  }

  const updateDiscountPolicy = (index: number, field: keyof DiscountPolicy, value: any) => {
    const updated = [...discountPolicies]
    updated[index] = { ...updated[index], [field]: value }
    setDiscountPolicies(updated)
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Info },
    { id: 'items', name: 'Service Items', icon: Plus },
    { id: 'express', name: 'Express Charges', icon: Plus },
    { id: 'discounts', name: 'Discounts', icon: Plus },
    { id: 'settings', name: 'Settings', icon: Plus }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Pricing Configuration</h1>
          <p className="text-gray-600">Set up service pricing, charges, and discount policies</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Configuration Name *
                    </label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                      placeholder="e.g., Standard Pricing 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version *
                    </label>
                    <input
                      type="text"
                      value={basicInfo.version}
                      onChange={(e) => setBasicInfo({ ...basicInfo, version: e.target.value })}
                      placeholder="e.g., v1.0, 2024-Q1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                    placeholder="Optional description of this pricing configuration"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Service Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Service Items</h3>
                  <button
                    type="button"
                    onClick={addServiceItem}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {serviceItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">Service Item {index + 1}</h4>
                        {serviceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateServiceItem(index, 'name', e.target.value)}
                            placeholder="e.g., T-Shirt, Jeans"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => updateServiceItem(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="wash_fold">Wash & Fold</option>
                            <option value="dry_cleaning">Dry Cleaning</option>
                            <option value="iron_press">Iron & Press</option>
                            <option value="shoe_cleaning">Shoe Cleaning</option>
                            <option value="additional">Additional Services</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Price (₹) *
                          </label>
                          <input
                            type="number"
                            value={item.basePrice}
                            onChange={(e) => updateServiceItem(index, 'basePrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => updateServiceItem(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="per_piece">Per Piece</option>
                            <option value="per_kg">Per KG</option>
                            <option value="per_pair">Per Pair</option>
                            <option value="per_set">Per Set</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Processing Time (hours)
                          </label>
                          <input
                            type="number"
                            value={item.processingTime}
                            onChange={(e) => updateServiceItem(index, 'processingTime', parseInt(e.target.value) || 24)}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.isActive}
                              onChange={(e) => updateServiceItem(index, 'isActive', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                          placeholder="Optional item description"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Global Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.minimumOrderValue}
                      onChange={(e) => setSettings({ ...settings, minimumOrderValue: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Free Delivery Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryCharges.freeDeliveryThreshold}
                      onChange={(e) => setSettings({
                        ...settings,
                        deliveryCharges: {
                          ...settings.deliveryCharges,
                          freeDeliveryThreshold: parseFloat(e.target.value) || 0
                        }
                      })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Standard Delivery Charge (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryCharges.standardCharge}
                      onChange={(e) => setSettings({
                        ...settings,
                        deliveryCharges: {
                          ...settings.deliveryCharges,
                          standardCharge: parseFloat(e.target.value) || 0
                        }
                      })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Express Delivery Charge (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryCharges.expressCharge}
                      onChange={(e) => setSettings({
                        ...settings,
                        deliveryCharges: {
                          ...settings.deliveryCharges,
                          expressCharge: parseFloat(e.target.value) || 0
                        }
                      })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            Create Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
