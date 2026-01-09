import { useState, useEffect } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import toast from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface Campaign {
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
  triggers: Array<{
    type: string
    conditions?: any
  }>
  audience: {
    targetType: string
    userSegments?: string[]
    customFilters?: any
  }
  promotions: Array<{
    type: string
    promotionId: any
    promotionModel: string
    overrides?: any
  }>
  budget: {
    type: string
    totalAmount: number
    spentAmount: number
    budgetSource: string
    perUserLimit?: number
  }
  limits: {
    totalUsageLimit: number
    usedCount: number
    perUserLimit: number
    dailyLimit: number
  }
  stacking: {
    allowStackingWithCoupons: boolean
    allowStackingWithDiscounts: boolean
    allowStackingWithLoyalty: boolean
    stackingPriority: number
  }
  analytics: {
    impressions: number
    clicks: number
    conversions: number
    totalSavings: number
    totalRevenue: number
    uniqueUsers: number
  }
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdByModel: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  templateCategory?: string
  isTemplate?: boolean
  autoApprovalRules?: any
}

export interface CampaignFilters {
  search?: string
  status?: string
  scope?: string
  tenancyId?: string
  page?: number
  limit?: number
}

export function useCampaigns(filters?: CampaignFilters) {
  const { token } = useSuperAdminStore()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  })

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.scope) params.append('scope', filters.scope)
      if (filters?.tenancyId) params.append('tenancyId', filters.tenancyId)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const res = await fetch(`${API_BASE}/superadmin/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      
      if (data.success) {
        setCampaigns(data.data.campaigns || [])
        setPagination(data.data.pagination || { current: 1, pages: 1, total: 0 })
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

  useEffect(() => {
    if (token) {
      fetchCampaigns()
    }
  }, [token, filters?.search, filters?.status, filters?.scope, filters?.tenancyId, filters?.page])

  return {
    campaigns,
    loading,
    pagination,
    refetch: fetchCampaigns
  }
}

export function useCampaign(campaignId: string | null) {
  const { token } = useSuperAdminStore()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaign = async () => {
    if (!campaignId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      
      if (data.success) {
        setCampaign(data.data.campaign)
      } else {
        setError(data.message || 'Failed to load campaign')
        toast.error(data.message || 'Failed to load campaign')
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      setError('Failed to load campaign')
      toast.error('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && campaignId) {
      fetchCampaign()
    }
  }, [token, campaignId])

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign
  }
}

export function useCreateCampaign() {
  const { token } = useSuperAdminStore()
  const [loading, setLoading] = useState(false)

  const createCampaign = async (campaignData: any, scope: 'GLOBAL' | 'TEMPLATE') => {
    setLoading(true)
    try {
      const endpoint = scope === 'GLOBAL' 
        ? `${API_BASE}/superadmin/campaigns/global`
        : `${API_BASE}/superadmin/campaigns/templates`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaignData),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(`${scope} campaign created successfully`)
        return { success: true, campaign: data.data.campaign }
      } else {
        toast.error(data.message || 'Failed to create campaign')
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Create campaign error:', error)
      toast.error('Failed to create campaign')
      return { success: false, message: 'Failed to create campaign' }
    } finally {
      setLoading(false)
    }
  }

  return { createCampaign, loading }
}

export function useUpdateCampaign() {
  const { token } = useSuperAdminStore()
  const [loading, setLoading] = useState(false)

  const updateCampaign = async (campaignId: string, updates: any) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Campaign updated successfully')
        return { success: true, campaign: data.data.campaign }
      } else {
        toast.error(data.message || 'Failed to update campaign')
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Update campaign error:', error)
      toast.error('Failed to update campaign')
      return { success: false, message: 'Failed to update campaign' }
    } finally {
      setLoading(false)
    }
  }

  return { updateCampaign, loading }
}

export function useDeleteCampaign() {
  const { token } = useSuperAdminStore()
  const [loading, setLoading] = useState(false)

  const deleteCampaign = async (campaignId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Campaign deleted successfully')
        return { success: true }
      } else {
        toast.error(data.message || 'Failed to delete campaign')
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Delete campaign error:', error)
      toast.error('Failed to delete campaign')
      return { success: false, message: 'Failed to delete campaign' }
    } finally {
      setLoading(false)
    }
  }

  return { deleteCampaign, loading }
}

export function useCampaignActions() {
  const { token } = useSuperAdminStore()
  const [loading, setLoading] = useState(false)

  const approveCampaign = async (campaignId: string, action: 'approve' | 'reject', reason?: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(`Campaign ${action}d successfully`)
        return { success: true }
      } else {
        toast.error(data.message || `Failed to ${action} campaign`)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Approval error:', error)
      toast.error(`Failed to ${action} campaign`)
      return { success: false, message: `Failed to ${action} campaign` }
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (campaignId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/superadmin/campaigns/${campaignId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Campaign status updated successfully')
        return { success: true }
      } else {
        toast.error(data.message || 'Failed to update campaign status')
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update campaign status')
      return { success: false, message: 'Failed to update campaign status' }
    } finally {
      setLoading(false)
    }
  }

  return { approveCampaign, toggleStatus, loading }
}

export function useCampaignAnalytics(filters?: {
  startDate?: string
  endDate?: string
  tenancyId?: string
  scope?: string
}) {
  const { token } = useSuperAdminStore()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.tenancyId) params.append('tenancyId', filters.tenancyId)
      if (filters?.scope) params.append('scope', filters.scope)

      const res = await fetch(`${API_BASE}/superadmin/campaigns/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      
      if (data.success) {
        setAnalytics(data.data.analytics)
      } else {
        toast.error(data.message || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAnalytics()
    }
  }, [token, filters?.startDate, filters?.endDate, filters?.tenancyId, filters?.scope])

  return {
    analytics,
    loading,
    refetch: fetchAnalytics
  }
}

export function useTenancies() {
  const { token } = useSuperAdminStore()
  const [tenancies, setTenancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchTenancies()
    }
  }, [token])

  return { tenancies, loading }
}
