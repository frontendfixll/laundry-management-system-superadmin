'use client'

import { useState, useEffect } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import {
  Target,
  Globe,
  Building2,
  Copy,
  X,
  Calendar,
  Users,
  DollarSign,
  Percent,
  Tag,
  Star,
  Users2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Tenancy {
  _id: string
  name: string
  slug: string
}

interface Promotion {
  _id: string
  name: string
  type: 'DISCOUNT' | 'COUPON' | 'LOYALTY_POINTS' | 'WALLET_CREDIT'
}

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  initialScope?: 'GLOBAL' | 'TEMPLATE' | 'TENANT'
  onSuccess?: () => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CAMPAIGN_SCOPES = [
  { value: 'GLOBAL', label: 'Global Campaign', icon: Globe, description: 'Apply to multiple tenancies' },
  { value: 'TEMPLATE', label: 'Template Campaign', icon: Copy, description: 'Reusable blueprint' },
  { value: 'TENANT', label: 'Tenant Campaign', icon: Building2, description: 'Single tenancy only' }
]

const TEMPLATE_CATEGORIES = [
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'RETENTION', label: 'Retention' },
  { value: 'ACQUISITION', label: 'Acquisition' },
  { value: 'LOYALTY', label: 'Loyalty' }
]

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

const TRIGGER_TYPES = [
  { value: 'ORDER_CHECKOUT', label: 'Order Checkout' },
  { value: 'USER_REGISTRATION', label: 'User Registration' },
  { value: 'TIME_BASED', label: 'Time Based' },
  { value: 'BEHAVIOR_BASED', label: 'Behavior Based' }
]

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  initialScope = 'GLOBAL',
  onSuccess 
}: CreateCampaignModalProps) {
  const { token } = useSuperAdminStore()
  const [step, setStep] = useState<'scope' | 'form'>('scope')
  const [selectedScope, setSelectedScope] = useState<'GLOBAL' | 'TEMPLATE' | 'TENANT'>(initialScope)
  const [loading, setLoading] = useState(false)
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [allPromotions, setAllPromotions] = useState<{
    discounts: any[];
    coupons: any[];
    loyalty: any[];
    referrals: any[];
  }>({
    discounts: [],
    coupons: [],
    loyalty: [],
    referrals: []
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateCategory: 'PROMOTIONAL',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 0,
    
    // Triggers
    triggers: [{ type: 'ORDER_CHECKOUT', conditions: {} }],
    
    // Audience
    audience: {
      targetType: 'ALL_USERS',
      userSegments: [],
      customFilters: {}
    },
    
    // Promotions
    promotions: [],
    
    // Budget
    budget: {
      type: 'UNLIMITED',
      totalAmount: 1000,
      budgetSource: 'PLATFORM_BUDGET'
    },
    
    // Limits
    limits: {
      totalUsageLimit: 0,
      perUserLimit: 1,
      dailyLimit: 0
    },
    
    // Stacking
    stacking: {
      allowStackingWithCoupons: false,
      allowStackingWithDiscounts: false,
      allowStackingWithLoyalty: true,
      stackingPriority: 0
    },
    
    // Applicable tenancies (for global campaigns)
    applicableTenancies: [],
    
    // Auto-approval
    autoApprovalRules: {
      maxBudget: 5000,
      maxDiscountPercentage: 25,
      requiresApproval: true
    }
  })

  useEffect(() => {
    if (isOpen && step === 'form') {
      fetchTenancies()
      fetchPromotions()
    }
  }, [isOpen, step])

  const fetchTenancies = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/tenancies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setTenancies(data.data.tenancies || [])
      }
    } catch (error) {
      console.error('Failed to fetch tenancies:', error)
    }
  }

  const fetchPromotions = async () => {
    try {
      console.log('🔍 Fetching all promotions for campaign...');
      // Fetch all promotions using the same endpoint as banners
      const res = await fetch(`${API_BASE}/superadmin/banners/promotions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      console.log('📦 Promotions response:', data);
      
      if (data.success && data.data) {
        setAllPromotions({
          discounts: data.data.discounts || [],
          coupons: data.data.coupons || [],
          loyalty: data.data.loyalty || [],
          referrals: data.data.referrals || []
        });
        console.log('✅ Promotions loaded:', {
          discounts: data.data.discounts?.length || 0,
          coupons: data.data.coupons?.length || 0,
          loyalty: data.data.loyalty?.length || 0,
          referrals: data.data.referrals?.length || 0
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch promotions:', error)
      toast.error('Failed to load promotions')
    }
  }

  const getPromotionOptions = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return allPromotions.discounts;
      case 'COUPON':
        return allPromotions.coupons;
      case 'LOYALTY_POINTS':
        return allPromotions.loyalty;
      case 'WALLET_CREDIT':
        return allPromotions.referrals; // or create separate wallet credits
      default:
        return [];
    }
  }

  const handleScopeSelect = (scope: 'GLOBAL' | 'TEMPLATE' | 'TENANT') => {
    setSelectedScope(scope)
    setStep('form')
    
    // Update budget source based on scope
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        budgetSource: scope === 'TENANT' ? 'TENANT_BUDGET' : 'PLATFORM_BUDGET'
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let endpoint = ''
      let payload = { ...formData }

      switch (selectedScope) {
        case 'GLOBAL':
          endpoint = `${API_BASE}/superadmin/campaigns/global`
          break
        case 'TEMPLATE':
          endpoint = `${API_BASE}/superadmin/campaigns/templates`
          break
        case 'TENANT':
          endpoint = `${API_BASE}/superadmin/campaigns/global` // SuperAdmin can create tenant campaigns too
          payload = { ...payload, campaignScope: 'TENANT' }
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`${selectedScope} campaign created successfully`)
        onSuccess?.()
        onClose()
        resetForm()
      } else {
        toast.error(data.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Create campaign error:', error)
      toast.error('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('scope')
    setSelectedScope('GLOBAL')
    setFormData({
      name: '',
      description: '',
      templateCategory: 'PROMOTIONAL',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      priority: 0,
      triggers: [{ type: 'ORDER_CHECKOUT', conditions: {} }],
      audience: { targetType: 'ALL_USERS', userSegments: [], customFilters: {} },
      promotions: [],
      budget: { type: 'UNLIMITED', totalAmount: 1000, budgetSource: 'PLATFORM_BUDGET' },
      limits: { totalUsageLimit: 0, perUserLimit: 1, dailyLimit: 0 },
      stacking: { allowStackingWithCoupons: false, allowStackingWithDiscounts: false, allowStackingWithLoyalty: true, stackingPriority: 0 },
      applicableTenancies: [],
      autoApprovalRules: { maxBudget: 5000, maxDiscountPercentage: 25, requiresApproval: true }
    })
  }

  const addPromotion = () => {
    setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      promotions: prev.promotions.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            {step === 'scope' ? 'Create New Campaign' : `Create ${selectedScope} Campaign`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'scope' ? (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Campaign Scope</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CAMPAIGN_SCOPES.map((scope) => {
                  const Icon = scope.icon
                  return (
                    <button
                      key={scope.value}
                      onClick={() => setSelectedScope(scope.value as any)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedScope === scope.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${selectedScope === scope.value ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900">{scope.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{scope.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleScopeSelect(selectedScope)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Continue with {selectedScope} Campaign
              </button>
            </div>
          </div>
        ) : (
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
                  placeholder="e.g., Summer Sale Campaign"
                />
              </div>

              {selectedScope === 'TEMPLATE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Category *
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your campaign..."
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
            {selectedScope === 'GLOBAL' && (
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
                    
                    {tenancies.map(tenancy => (
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
                                applicableTenancies: formData.applicableTenancies.filter(id => id !== tenancy._id)
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
                  audience: { ...formData.audience, targetType: e.target.value as any }
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
                      budget: { ...formData.budget, type: e.target.value as any }
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

            {/* Promotions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Attached Promotions</h4>
                <button
                  type="button"
                  onClick={addPromotion}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Promotion
                </button>
              </div>

              {formData.promotions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No promotions added yet</p>
                  <button
                    type="button"
                    onClick={addPromotion}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add First Promotion
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.promotions.map((promotion, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <select
                        value={promotion.type}
                        onChange={(e) => {
                          const newPromotions = [...formData.promotions]
                          newPromotions[index] = { ...promotion, type: e.target.value as any, promotionId: '' }
                          setFormData({ ...formData, promotions: newPromotions })
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="DISCOUNT">Discount</option>
                        <option value="COUPON">Coupon</option>
                        <option value="LOYALTY_POINTS">Loyalty Points</option>
                        <option value="WALLET_CREDIT">Wallet Credit</option>
                      </select>

                      <select
                        value={promotion.promotionId}
                        onChange={(e) => {
                          const newPromotions = [...formData.promotions]
                          newPromotions[index] = { ...promotion, promotionId: e.target.value }
                          setFormData({ ...formData, promotions: newPromotions })
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select {promotion.type.toLowerCase().replace('_', ' ')}</option>
                        {getPromotionOptions(promotion.type).map((promo: any) => (
                          <option key={promo.id} value={promo.id}>
                            {promo.name}
                          </option>
                        ))}
                      </select>
                      {getPromotionOptions(promotion.type).length === 0 && (
                        <span className="text-xs text-amber-600">
                          No {promotion.type.toLowerCase()}s available
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removePromotion(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => setStep('scope')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back to Scope
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create {selectedScope} Campaign
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}