import { useState, useEffect, useCallback, useMemo } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface AddOn {
  _id: string
  name: string
  slug: string
  displayName: string
  description: string
  shortDescription?: string
  category: 'capacity' | 'feature' | 'usage' | 'branding' | 'integration' | 'support'
  subcategory?: string
  tags: string[]
  pricing: {
    monthly?: number
    yearly?: number
    oneTime?: number
    regional?: Map<string, any>
    variants?: any[]
    discounts?: any[]
  }
  billingCycle: 'monthly' | 'yearly' | 'one-time' | 'usage-based'
  config: any
  eligibility: any
  icon: string
  color: string
  images?: any[]
  benefits: string[]
  features: string[]
  useCases: string[]
  status: 'draft' | 'active' | 'hidden' | 'deprecated'
  isPopular: boolean
  isRecommended: boolean
  isFeatured: boolean
  showOnMarketplace: boolean
  showOnPricingPage: boolean
  sortOrder: number
  trialDays: number
  maxQuantity: number
  analytics: {
    views: number
    purchases: number
    revenue: number
    conversionRate: number
    lastPurchase?: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  version: string
  changelog?: any[]
  createdBy: any
  updatedBy?: any
  createdAt: string
  updatedAt: string
  stats?: {
    activeSubscriptions: number
    totalRevenue: number
    conversionRate: string
  }
}

interface AddOnFilters {
  search?: string
  status?: string
  category?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface AddOnSummary {
  total: number
  active: number
  draft: number
  hidden: number
  deprecated: number
}

interface AddOnPagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface UseAddOnsReturn {
  addOns: AddOn[] | null
  loading: boolean
  error: Error | null
  summary: AddOnSummary | null
  pagination: AddOnPagination | null
  createAddOn: (data: Partial<AddOn>) => Promise<AddOn>
  updateAddOn: (id: string, data: Partial<AddOn>) => Promise<AddOn>
  deleteAddOn: (id: string) => Promise<void>
  assignAddOn: (addOnId: string, data: any) => Promise<void>
  getAnalytics: (addOnId: string, period?: string) => Promise<any>
  getSubscribers: (addOnId: string, filters?: any) => Promise<any>
  getCategories: () => Promise<any>
  refetch: () => void
}

export function useAddOns(filters: AddOnFilters = {}): UseAddOnsReturn {
  const [addOns, setAddOns] = useState<AddOn[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [summary, setSummary] = useState<AddOnSummary | null>(null)
  const [pagination, setPagination] = useState<AddOnPagination | null>(null)

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    search: filters.search,
    status: filters.status,
    category: filters.category,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.search,
    filters.status,
    filters.category,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit
  ])

  const fetchAddOns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await superAdminApi.getAddOns(memoizedFilters)
      
      if (response.success) {
        setAddOns(response.data.addOns)
        setSummary(response.data.summary)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.message || 'Failed to fetch add-ons')
      }
    } catch (err) {
      console.error('Error fetching add-ons:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

  useEffect(() => {
    fetchAddOns()
  }, [fetchAddOns])

  const createAddOn = async (data: Partial<AddOn>): Promise<AddOn> => {
    try {
      const response = await superAdminApi.createAddOn(data)
      
      if (response.success) {
        await fetchAddOns() // Refresh the list
        return response.data.addOn
      } else {
        throw new Error(response.message || 'Failed to create add-on')
      }
    } catch (err) {
      console.error('Error creating add-on:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const updateAddOn = async (id: string, data: Partial<AddOn>): Promise<AddOn> => {
    try {
      const response = await superAdminApi.updateAddOn(id, data)
      
      if (response.success) {
        // Update local state instead of refetching
        setAddOns(prevAddOns => 
          prevAddOns?.map(addOn => 
            addOn._id === id 
              ? { ...addOn, ...data, updatedAt: new Date().toISOString() }
              : addOn
          ) || null
        )
        return response.data.addOn
      } else {
        throw new Error(response.message || 'Failed to update add-on')
      }
    } catch (err) {
      console.error('Error updating add-on:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const deleteAddOn = async (id: string): Promise<void> => {
    try {
      const response = await superAdminApi.deleteAddOn(id)
      
      if (response.success) {
        await fetchAddOns() // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete add-on')
      }
    } catch (err) {
      console.error('Error deleting add-on:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const assignAddOn = async (addOnId: string, data: any): Promise<void> => {
    try {
      const response = await superAdminApi.assignAddOnToTenant(addOnId, data)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to assign add-on')
      }
    } catch (err) {
      console.error('Error assigning add-on:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const getAnalytics = async (addOnId: string, period = '30d'): Promise<any> => {
    try {
      const response = await superAdminApi.getAddOnAnalytics(addOnId, period)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch analytics')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const getSubscribers = async (addOnId: string, filters: any = {}): Promise<any> => {
    try {
      const response = await superAdminApi.getAddOnSubscribers(addOnId, filters)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch subscribers')
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const getCategories = async (): Promise<any> => {
    try {
      const response = await superAdminApi.getAddOnCategories()
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const refetch = useCallback(() => {
    fetchAddOns()
  }, [fetchAddOns])

  return {
    addOns,
    loading,
    error,
    summary,
    pagination,
    createAddOn,
    updateAddOn,
    deleteAddOn,
    assignAddOn,
    getAnalytics,
    getSubscribers,
    getCategories,
    refetch
  }
}

// Hook for single add-on management
export function useAddOn(id: string) {
  const [addOn, setAddOn] = useState<AddOn | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAddOn = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await superAdminApi.getAddOn(id)
      
      if (response.success) {
        setAddOn(response.data.addOn)
      } else {
        throw new Error(response.message || 'Failed to fetch add-on')
      }
    } catch (err) {
      console.error('Error fetching add-on:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAddOn()
  }, [fetchAddOn])

  return {
    addOn,
    loading,
    error,
    refetch: fetchAddOn
  }
}

// Hook for add-on analytics
export function useAddOnAnalytics(addOnId: string, period = '30d') {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!addOnId) return

    try {
      setLoading(true)
      setError(null)

      const response = await superAdminApi.getAddOnAnalytics(addOnId, period)
      
      if (response.success) {
        setAnalytics(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch analytics')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [addOnId, period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  }
}