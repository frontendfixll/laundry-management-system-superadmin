'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { superAdminApi } from '@/lib/superAdminApi'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  Copy,
  Eye,
  IndianRupee,
  Tag,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react'

interface PricingConfiguration {
  _id: string
  name: string
  version: string
  isActive: boolean
  isDefault: boolean
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  serviceItems: any[]
  expressCharges: any[]
  holidayPricing: any[]
  discountPolicies: any[]
  settings: {
    currency: string
    taxRate: number
    deliveryCharges: {
      freeDeliveryThreshold: number
      standardCharge: number
      expressCharge: number
    }
    minimumOrderValue: number
  }
  createdBy?: {
    name: string
    email: string
  } | string
  approvedBy?: {
    name: string
    email: string
  } | string
  createdAt: string
  updatedAt: string
}

export default function PricingManagementPage() {
  const { token, isAuthenticated } = useSuperAdminStore()
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedConfig, setSelectedConfig] = useState<PricingConfiguration | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  })

  // Wait for store hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only fetch when hydrated, authenticated and token is available
    if (isHydrated && isAuthenticated && token) {
      fetchPricingConfigurations()
    } else if (isHydrated && !isAuthenticated) {
      // Not authenticated after hydration - stop loading
      setLoading(false)
    }
  }, [filters, isAuthenticated, token, isHydrated])

  const fetchPricingConfigurations = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Double-check token is available
      const superAdminData = localStorage.getItem('superadmin-storage')
      if (!superAdminData) {
        console.log('No superadmin-storage found, skipping fetch')
        setLoading(false)
        return
      }
      
      const response = await superAdminApi.getPricingConfigurations(filters)
      setPricingConfigs(response.data.pricingConfigs || [])
    } catch (err: any) {
      console.error('Fetch pricing error:', err)
      setError(err.message || 'Failed to fetch pricing configurations')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (pricingId: string, makeActive: boolean = false) => {
    try {
      setActionLoading(`approve-${pricingId}`)
      await superAdminApi.approvePricingConfiguration(pricingId, makeActive)
      await fetchPricingConfigurations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleActivate = async (pricingId: string) => {
    try {
      setActionLoading(`activate-${pricingId}`)
      await superAdminApi.activatePricingConfiguration(pricingId)
      await fetchPricingConfigurations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleClone = async (pricingId: string, newVersion: string, newName?: string) => {
    try {
      setActionLoading(`clone-${pricingId}`)
      await superAdminApi.clonePricingConfiguration(pricingId, newVersion, newName)
      await fetchPricingConfigurations()
      setShowCloneModal(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (config: PricingConfiguration) => {
    if (config.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
    }
    
    switch (config.approvalStatus) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Approved</span>
      case 'pending_approval':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600">Manage service pricing, discounts, and policies</p>
        </div>
        <Link
          href="/superadmin/pricing/create"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Pricing
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search by name or version..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pricing Configurations List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items & Policies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingConfigs.map((config) => (
                <tr key={config._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{config.name}</div>
                      <div className="text-sm text-gray-500">Version: {config.version}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(config)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4 text-gray-400" />
                          {config.serviceItems.length} items
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                          {config.discountPolicies.length} discounts
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Tax: {config.settings.taxRate}%</div>
                      <div>Min Order: ₹{config.settings.minimumOrderValue}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>{typeof config.createdBy === 'object' && config.createdBy?.name ? config.createdBy.name : 'System'}</div>
                      <div className="text-gray-500">
                        {new Date(config.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedConfig(config)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {config.approvalStatus === 'draft' && (
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      
                      {config.approvalStatus === 'draft' && (
                        <button
                          onClick={() => handleApprove(config._id)}
                          disabled={actionLoading === `approve-${config._id}`}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      
                      {config.approvalStatus === 'approved' && !config.isActive && (
                        <button
                          onClick={() => handleActivate(config._id)}
                          disabled={actionLoading === `activate-${config._id}`}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          title="Activate"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedConfig(config)
                          setShowCloneModal(true)
                        }}
                        className="text-orange-600 hover:text-orange-900"
                        title="Clone"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Details Modal */}
      {selectedConfig && !showCloneModal && (
        <PricingDetailsModal
          config={selectedConfig}
          onClose={() => setSelectedConfig(null)}
        />
      )}

      {/* Clone Modal */}
      {showCloneModal && selectedConfig && (
        <ClonePricingModal
          config={selectedConfig}
          onClose={() => {
            setShowCloneModal(false)
            setSelectedConfig(null)
          }}
          onClone={handleClone}
          loading={actionLoading === `clone-${selectedConfig._id}`}
        />
      )}
    </div>
  )
}

// Pricing Details Modal Component
function PricingDetailsModal({ 
  config, 
  onClose 
}: { 
  config: PricingConfiguration
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {config.name} - {config.version}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Items ({config.serviceItems.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.serviceItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.basePrice}</div>
                        <div className="text-sm text-gray-600">{item.unit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Policies */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Discount Policies ({config.discountPolicies.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.discountPolicies.map((policy, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-sm text-gray-600">{policy.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {policy.type === 'percentage' ? `${policy.value}%` : `₹${policy.value}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Settings</h3>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Currency:</span>
                  <span className="font-medium">{config.settings.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Rate:</span>
                  <span className="font-medium">{config.settings.taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Order Value:</span>
                  <span className="font-medium">₹{config.settings.minimumOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Free Delivery Threshold:</span>
                  <span className="font-medium">₹{config.settings.deliveryCharges.freeDeliveryThreshold}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Delivery:</span>
                  <span className="font-medium">₹{config.settings.deliveryCharges.standardCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Delivery:</span>
                  <span className="font-medium">₹{config.settings.deliveryCharges.expressCharge}</span>
                </div>
              </div>
            </div>

            {/* Express Charges */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Express Charges ({config.expressCharges.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.expressCharges.map((charge, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{charge.name}</div>
                        <div className="text-sm text-gray-600">{charge.deliveryTime}h delivery</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {charge.type === 'percentage' ? `${charge.value}%` : `₹${charge.value}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {charge.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Clone Pricing Modal Component
function ClonePricingModal({ 
  config, 
  onClose, 
  onClone, 
  loading 
}: { 
  config: PricingConfiguration
  onClose: () => void
  onClone: (pricingId: string, newVersion: string, newName?: string) => void
  loading: boolean
}) {
  const [newVersion, setNewVersion] = useState('')
  const [newName, setNewName] = useState(`${config.name} (Copy)`)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newVersion.trim()) {
      onClone(config._id, newVersion.trim(), newName.trim() || undefined)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Clone Pricing Configuration</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Configuration
              </label>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{config.name}</div>
                <div className="text-sm text-gray-600">Version: {config.version}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Version *
              </label>
              <input
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="e.g., v2.0, 2024-Q1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Optional new name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newVersion.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Clone Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
