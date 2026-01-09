'use client'

import { useState, useEffect } from 'react'
import { Campaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { useTenancies } from '@/hooks/useCampaigns'
import {
  X,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface EditCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign | null
  onSuccess?: () => void
}

const AUDIENCE_TYPES = [
  { value: 'ALL_USERS', label: 'All Users' },
  { value: 'NEW_USERS', label: 'New Users Only' },
  { value: 'EXISTING_USERS', label: 'Existing Users Only' },
  { value: 'SEGMENT', label: 'User Segment' },
  { value: 'CUSTOM', label: 'Custom Filters' }
]

const BUDGET_TYPES = [
  { value: 'UNLIMITED', label: 'Unlimited Budget' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  { value: 'PER_USER', label: 'Per User Limit' },
  { value: 'PERCENTAGE_OF_REVENUE', label: 'Percentage of Revenue' }
]

const CAMPAIGN_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

const TEMPLATE_CATEGORIES = [
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'RETENTION', label: 'Retention' },
  { value: 'ACQUISITION', label: 'Acquisition' },
  { value: 'LOYALTY', label: 'Loyalty' }
]

export default function EditCampaignModal({ 
  isOpen, 
  onClose, 
  campaign,
  onSuccess 
}: EditCampaignModalProps) {
  const { updateCampaign, loading } = useUpdateCampaign()
  const { tenancies } = useTenancies()
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (campaign && isOpen) {
      // Initialize form with campaign data
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        templateCategory: campaign.templateCategory || 'PROMOTIONAL',
        startDate: format(new Date(campaign.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(campaign.endDate), 'yyyy-MM-dd'),
        priority: campaign.priority,
        status: campaign.status,
        
        triggers: campaign.triggers || [{ type: 'ORDER_CHECKOUT', conditions: {} }],
        
        audience: {
          targetType: campaign.audience?.targetType || 'ALL_USERS',
          userSegments: campaign.audience?.userSegments || [],
          customFilters: campaign.audience?.customFilters || {}
        },
        
        promotions: campaign.promotions || [],
        
        budget: {
          type: campaign.budget?.type || 'UNLIMITED',
          totalAmount: campaign.budget?.totalAmount || 0,
          budgetSource: campaign.budget?.budgetSource || 'PLATFORM_BUDGET'
        },
        
        limits: {
          totalUsageLimit: campaign.limits?.totalUsageLimit || 0,
          perUserLimit: campaign.limits?.perUserLimit || 1,
          dailyLimit: campaign.limits?.dailyLimit || 0
        },
        
        stacking: {
          allowStackingWithCoupons: campaign.stacking?.allowStackingWithCoupons || false,
          allowStackingWithDiscounts: campaign.stacking?.allowStackingWithDiscounts || false,
          allowStackingWithLoyalty: campaign.stacking?.allowStackingWithLoyalty || true,
          stackingPriority: campaign.stacking?.stackingPriority || 0
        },
        
        applicableTenancies: campaign.applicableTenancies?.map(t => t._id) || []
      })
    }
  }, [campaign, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!campaign) return

    // Check if campaign can be edited
    if (campaign.status === 'ACTIVE' && campaign.limits.usedCount > 0) {
      toast.error('Cannot edit active campaign that has been used')
      return
    }

    const result = await updateCampaign(campaign._id, formData)
    
    if (result.success) {
      onSuccess?.()
      onClose()
    }
  }

  const addPromotion = () => {
    setFormData((prev: any) => ({
      ...prev,
      promotions: [
        ...prev.promotions,
        {
          type: 'DISCOUNT',
          promotionId: '',
          promotionModel: 'Discount',
          overrides: {}
        }
      ]
    }))
  }

  const removePromotion = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      promotions: prev.promotions.filter((_: any, i: number) => i !== index)
    }))
  }

  if (!isOpen || !campaign || !formData) return null

  const canEdit = !(campaign.status === 'ACTIVE' && campaign.limits.usedCount > 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Edit Campaign</h2>
            <p className="text-sm text-gray-600 mt-1">{campaign.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!canEdit && (
          <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Limited Editing</p>
              <p className="text-sm text-yellow-700 mt-1">
                This campaign is active and has been used. Only certain fields can be modified.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CAMPAIGN_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          {campaign.campaignScope === 'TEMPLATE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Category
              </label>
              <select
                value={formData.templateCategory}
                onChange={(e) => setFormData({ ...formData, templateCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {TEMPLATE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Applicable Tenancies (for Global campaigns) */}
          {campaign.campaignScope === 'GLOBAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Tenancies
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.applicableTenancies.length === 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, applicableTenancies: [] })
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-green-600">All Tenancies (Global)</span>
                  </label>
                  
                  {tenancies.map((tenancy: any) => (
                    <label key={tenancy._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.applicableTenancies.includes(tenancy._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableTenancies: [...formData.applicableTenancies, tenancy._id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              applicableTenancies: formData.applicableTenancies.filter((id: string) => id !== tenancy._id)
                            })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{tenancy.name} (@{tenancy.slug})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audience Targeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={formData.audience.targetType}
              onChange={(e) => setFormData({ 
                ...formData, 
                audience: { ...formData.audience, targetType: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {AUDIENCE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Budget Configuration */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Budget Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Type
                </label>
                <select
                  value={formData.budget.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    budget: { ...formData.budget, type: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {BUDGET_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.budget.type !== 'UNLIMITED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget.totalAmount}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      budget: { ...formData.budget, totalAmount: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Spent: ${campaign.budget.spentAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Usage Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.limits.totalUsageLimit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, totalUsageLimit: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0 = unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used: {campaign.limits.usedCount}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per User Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.limits.perUserLimit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, perUserLimit: parseInt(e.target.value) || 1 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.limits.dailyLimit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limits: { ...formData.limits, dailyLimit: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0 = unlimited"
                />
              </div>
            </div>
          </div>

          {/* Stacking Rules */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Stacking Rules</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.stacking.allowStackingWithCoupons}
                  onChange={(e) => setFormData({
                    ...formData,
                    stacking: { ...formData.stacking, allowStackingWithCoupons: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Allow stacking with coupons</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.stacking.allowStackingWithDiscounts}
                  onChange={(e) => setFormData({
                    ...formData,
                    stacking: { ...formData.stacking, allowStackingWithDiscounts: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Allow stacking with discounts</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.stacking.allowStackingWithLoyalty}
                  onChange={(e) => setFormData({
                    ...formData,
                    stacking: { ...formData.stacking, allowStackingWithLoyalty: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Allow stacking with loyalty points</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
