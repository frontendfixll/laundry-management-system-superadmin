'use client'

import { useState, useEffect } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import CreateCampaignModal from '@/components/campaigns/CreateCampaignModal'
import {
  Target,
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Globe,
  Building2,
  Crown,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Copy
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Campaign {
  _id: string
  name: string
  description?: string
  campaignScope: 'TENANT' | 'GLOBAL' | 'TEMPLATE'
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  priority: number
  tenancy?: {
    _id: string
    name: string
    slug: string
  }
  applicableTenancies: Array<{
    _id: string
    name: string
    slug: string
  }>
  promotions: Array<{
    type: string
    promotionId: string
  }>
  budget: {
    type: string
    totalAmount: number
    spentAmount: number
    budgetSource: string
  }
  limits: {
    totalUsageLimit: number
    usedCount: number
    perUserLimit: number
  }
  analytics: {
    conversions: number
    totalSavings: number
    totalRevenue: number
    uniqueUsers: number
  }
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
  templateCategory?: string
}

interface Tenancy {
  _id: string
  name: string
  slug: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CAMPAIGN_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'bg-orange-100 text-orange-800' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'PAUSED', label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export default function SuperAdminCampaignsPage() {
  const { token } = useSuperAdminStore()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tenancyFilter, setTenancyFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchTenancies()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (scopeFilter !== 'all') params.append('scope', scopeFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (tenancyFilter !== 'all') params.append('tenancyId', tenancyFilter)

      const res = await fetch(`${API_BASE}/superadmin/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.data.campaigns || [])
      } else {
        toast.error(data.message || 'Failed to load campaigns')
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

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

  const handleApproval = async (campaignId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Campaign ${action}d successfully`)
        fetchCampaigns()
      } else {
        toast.error(data.message || `Failed to ${action} campaign`)
      }
    } catch (error) {
      console.error('Approval error:', error)
      toast.error(`Failed to ${action} campaign`)
    }
  }

  const handleToggleStatus = async (campaignId: string) => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Campaign status updated successfully')
        fetchCampaigns()
      } else {
        toast.error(data.message || 'Failed to update campaign status')
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update campaign status')
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Campaign deleted successfully')
        fetchCampaigns()
      } else {
        toast.error(data.message || 'Failed to delete campaign')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PAUSED':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'PENDING_APPROVAL':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'GLOBAL':
        return <Globe className="w-4 h-4 text-purple-500" />
      case 'TEMPLATE':
        return <Copy className="w-4 h-4 text-blue-500" />
      case 'TENANT':
        return <Building2 className="w-4 h-4 text-green-500" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'GLOBAL':
        return 'bg-purple-100 text-purple-800'
      case 'TEMPLATE':
        return 'bg-blue-100 text-blue-800'
      case 'TENANT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    const statusObj = CAMPAIGN_STATUSES.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesScope = scopeFilter === 'all' || campaign.campaignScope === scopeFilter
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesTenancy = tenancyFilter === 'all' || 
                          campaign.tenancy?._id === tenancyFilter ||
                          campaign.applicableTenancies.some(t => t._id === tenancyFilter)
    
    return matchesSearch && matchesScope && matchesStatus && matchesTenancy
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Manage global campaigns, templates, and tenant campaigns across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh campaigns"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Scopes</option>
              <option value="GLOBAL">Global</option>
              <option value="TEMPLATE">Template</option>
              <option value="TENANT">Tenant</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              {CAMPAIGN_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={tenancyFilter}
              onChange={(e) => setTenancyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tenancies</option>
              {tenancies.map(tenancy => (
                <option key={tenancy._id} value={tenancy._id}>
                  {tenancy.name} (@{tenancy.slug})
                </option>
              ))}
            </select>

            <button
              onClick={fetchCampaigns}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start managing promotional activities</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope & Tenancies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {getScopeIcon(campaign.campaignScope)}
                          <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                          {campaign.campaignScope === 'TEMPLATE' && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        {campaign.description && (
                          <div className="text-sm text-gray-500 mt-1">{campaign.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScopeColor(campaign.campaignScope)}`}>
                            {campaign.campaignScope}
                          </span>
                          <span className="text-xs text-gray-500">
                            Priority: {campaign.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.promotions?.length || 0} promotions
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {campaign.campaignScope === 'TENANT' && campaign.tenancy ? (
                          <div>
                            <div className="font-medium text-gray-900">{campaign.tenancy.name}</div>
                            <div className="text-gray-500">@{campaign.tenancy.slug}</div>
                          </div>
                        ) : campaign.campaignScope === 'GLOBAL' ? (
                          <div>
                            {campaign.applicableTenancies.length === 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Globe className="w-3 h-3 mr-1" />
                                All Tenancies
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {campaign.applicableTenancies.length} selected
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {campaign.applicableTenancies.slice(0, 2).map(t => t.name).join(', ')}
                                  {campaign.applicableTenancies.length > 2 && ` +${campaign.applicableTenancies.length - 2} more`}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Copy className="w-3 h-3 mr-1" />
                            Template
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(campaign.startDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-gray-500">
                          to {format(new Date(campaign.endDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created by {campaign.createdBy.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {campaign.analytics?.conversions || 0} conversions
                        </div>
                        <div className="text-green-600">
                          ${(campaign.analytics?.totalSavings || 0).toFixed(2)} saved
                        </div>
                        <div className="text-blue-600">
                          ${(campaign.analytics?.totalRevenue || 0).toFixed(2)} revenue
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.limits?.usedCount || 0} / {campaign.limits?.totalUsageLimit || '∞'} uses
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {campaign.budget?.type === 'UNLIMITED' ? 'Unlimited' : `$${campaign.budget?.totalAmount || 0}`}
                        </div>
                        <div className="text-red-600">
                          ${(campaign.budget?.spentAmount || 0).toFixed(2)} spent
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.budget?.budgetSource?.replace('_', ' ').toLowerCase()}
                        </div>
                        {campaign.budget?.type !== 'UNLIMITED' && campaign.budget?.totalAmount > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full" 
                              style={{ 
                                width: `${Math.min((campaign.budget.spentAmount / campaign.budget.totalAmount) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{campaign.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {/* Handle view/edit */}}
                          className="text-blue-600 hover:text-blue-900"
                          title="View campaign"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {/* Handle edit */}}
                          className="text-purple-600 hover:text-purple-900"
                          title="Edit campaign"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {campaign.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleApproval(campaign._id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve campaign"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(campaign._id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject campaign"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {(campaign.status === 'ACTIVE' || campaign.status === 'PAUSED') && (
                          <button
                            onClick={() => handleToggleStatus(campaign._id)}
                            className={campaign.status === 'ACTIVE' ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                            title={campaign.status === 'ACTIVE' ? 'Pause campaign' : 'Resume campaign'}
                          >
                            {campaign.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {/* Handle analytics */}}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  )
}