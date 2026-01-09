'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCampaign, useCampaignActions, useDeleteCampaign } from '@/hooks/useCampaigns'
import EditCampaignModal from '@/components/campaigns/EditCampaignModal'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Globe,
  Building2,
  Copy,
  Calendar,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  AlertCircle,
  Tag,
  Layers,
  Settings,
  Crown
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CampaignDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  
  const { campaign, loading, refetch } = useCampaign(campaignId)
  const { approveCampaign, toggleStatus, loading: actionLoading } = useCampaignActions()
  const { deleteCampaign, loading: deleteLoading } = useDeleteCampaign()
  
  const [showEditModal, setShowEditModal] = useState(false)

  const handleApproval = async (action: 'approve' | 'reject') => {
    const result = await approveCampaign(campaignId, action)
    if (result.success) {
      refetch()
    }
  }

  const handleToggle = async () => {
    const result = await toggleStatus(campaignId)
    if (result.success) {
      refetch()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    const result = await deleteCampaign(campaignId)
    if (result.success) {
      router.push('/campaigns')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
        <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/campaigns')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Campaigns
        </button>
      </div>
    )
  }

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'GLOBAL': return <Globe className="w-5 h-5 text-purple-500" />
      case 'TEMPLATE': return <Copy className="w-5 h-5 text-blue-500" />
      case 'TENANT': return <Building2 className="w-5 h-5 text-green-500" />
      default: return <Target className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PENDING_APPROVAL': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const budgetUtilization = campaign.budget.type !== 'UNLIMITED' && campaign.budget.totalAmount > 0
    ? (campaign.budget.spentAmount / campaign.budget.totalAmount) * 100
    : 0

  const usageUtilization = campaign.limits.totalUsageLimit > 0
    ? (campaign.limits.usedCount / campaign.limits.totalUsageLimit) * 100
    : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/campaigns')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              {getScopeIcon(campaign.campaignScope)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                {campaign.campaignScope === 'TEMPLATE' && (
                  <Crown className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              {campaign.description && (
                <p className="text-gray-600 mb-3">{campaign.description}</p>
              )}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  Created by {campaign.createdBy.name}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status === 'PENDING_APPROVAL' && (
              <>
                <button
                  onClick={() => handleApproval('approve')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleApproval('reject')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            
            {(campaign.status === 'ACTIVE' || campaign.status === 'PAUSED') && (
              <button
                onClick={handleToggle}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  campaign.status === 'ACTIVE'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {campaign.status === 'ACTIVE' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Conversions</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {campaign.analytics.conversions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {campaign.analytics.uniqueUsers} unique users
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Savings</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${campaign.analytics.totalSavings.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Given to customers
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Revenue</span>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${campaign.analytics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Generated revenue
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Usage</span>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {campaign.limits.usedCount}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            of {campaign.limits.totalUsageLimit || '∞'} limit
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Start Date</span>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(campaign.startDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">End Date</span>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(campaign.endDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Priority</span>
                <p className="text-base font-medium text-gray-900">{campaign.priority}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Campaign Scope</span>
                <p className="text-base font-medium text-gray-900">{campaign.campaignScope}</p>
              </div>
            </div>
          </div>

          {/* Tenancies */}
          {campaign.campaignScope === 'GLOBAL' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Applicable Tenancies
              </h3>
              {campaign.applicableTenancies.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">All Tenancies (Global)</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {campaign.applicableTenancies.map(tenancy => (
                    <div key={tenancy._id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tenancy.name}</p>
                        <p className="text-xs text-gray-500">@{tenancy.slug}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Promotions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Attached Promotions
            </h3>
            {campaign.promotions.length === 0 ? (
              <p className="text-gray-500">No promotions attached</p>
            ) : (
              <div className="space-y-3">
                {campaign.promotions.map((promo, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Tag className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{promo.type}</p>
                        <p className="text-xs text-gray-500">{promo.promotionModel}</p>
                      </div>
                    </div>
                    {promo.overrides && Object.keys(promo.overrides).length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Overridden
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Triggers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Triggers
            </h3>
            <div className="space-y-2">
              {campaign.triggers.map((trigger, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {trigger.type.replace('_', ' ')}
                  </span>
                  {trigger.conditions && Object.keys(trigger.conditions).length > 0 && (
                    <span className="text-xs text-gray-500">
                      (with conditions)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Budget
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600">Budget Type</span>
                <p className="text-base font-medium text-gray-900">{campaign.budget.type}</p>
              </div>
              
              {campaign.budget.type !== 'UNLIMITED' && (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium text-gray-900">
                        ${campaign.budget.spentAmount.toFixed(2)} / ${campaign.budget.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {budgetUtilization.toFixed(1)}% utilized
                    </p>
                  </div>
                </>
              )}
              
              <div>
                <span className="text-sm text-gray-600">Budget Source</span>
                <p className="text-base font-medium text-gray-900">
                  {campaign.budget.budgetSource.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Usage Limits
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Usage</span>
                  <span className="font-medium text-gray-900">
                    {campaign.limits.usedCount} / {campaign.limits.totalUsageLimit || '∞'}
                  </span>
                </div>
                {campaign.limits.totalUsageLimit > 0 && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(usageUtilization, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {usageUtilization.toFixed(1)}% utilized
                    </p>
                  </>
                )}
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Per User Limit</span>
                <p className="text-base font-medium text-gray-900">{campaign.limits.perUserLimit}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Daily Limit</span>
                <p className="text-base font-medium text-gray-900">
                  {campaign.limits.dailyLimit || 'Unlimited'}
                </p>
              </div>
            </div>
          </div>

          {/* Audience */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-purple-600" />
              Target Audience
            </h3>
            <div>
              <span className="text-sm text-gray-600">Target Type</span>
              <p className="text-base font-medium text-gray-900">
                {campaign.audience.targetType.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Stacking Rules */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Stacking Rules
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">With Coupons</span>
                {campaign.stacking.allowStackingWithCoupons ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">With Discounts</span>
                {campaign.stacking.allowStackingWithDiscounts ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">With Loyalty</span>
                {campaign.stacking.allowStackingWithLoyalty ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCampaignModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        campaign={campaign}
        onSuccess={refetch}
      />
    </div>
  )
}
