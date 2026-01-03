import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

interface WeeklyOrderData {
  name: string
  date: string
  orders: number
  revenue: number
}

interface OrderStatusData {
  name: string
  value: number
  color: string
  status: string
  [key: string]: string | number
}

interface RevenueData {
  daily: Array<{
    name: string
    date: string
    revenue: number
    orders: number
  }>
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
}

interface HourlyOrderData {
  hour: string
  orders: number
  revenue: number
}

interface ServiceDistributionData {
  name: string
  value: number
  revenue: number
  color: string
}

export function useAdminAnalytics() {
  const [weeklyOrders, setWeeklyOrders] = useState<WeeklyOrderData[]>([])
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch each endpoint separately to handle permission errors gracefully
      const results = await Promise.allSettled([
        api.get('/admin/analytics/weekly-orders'),
        api.get('/admin/analytics/order-status'),
        api.get('/admin/analytics/revenue'),
        api.get('/admin/analytics/service-distribution')
      ])

      // Check if all failed due to permission
      const allForbidden = results.every(r => 
        r.status === 'rejected' && r.reason?.response?.status === 403
      )
      
      if (allForbidden) {
        setHasPermission(false)
        setLoading(false)
        return
      }

      // Process successful results
      if (results[0].status === 'fulfilled' && results[0].value.data.success) {
        setWeeklyOrders(results[0].value.data.data)
      }
      if (results[1].status === 'fulfilled' && results[1].value.data.success) {
        setOrderStatus(results[1].value.data.data)
      }
      if (results[2].status === 'fulfilled' && results[2].value.data.success) {
        setRevenueData(results[2].value.data.data)
      }
      if (results[3].status === 'fulfilled' && results[3].value.data.success) {
        setServiceDistribution(results[3].value.data.data)
      }
    } catch (err: any) {
      // Don't set error for permission issues - handle silently
      if (err.response?.status !== 403) {
        console.error('Error fetching analytics:', err)
        setError(err.response?.data?.message || 'Failed to fetch analytics')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    weeklyOrders,
    orderStatus,
    revenueData,
    serviceDistribution,
    loading,
    error,
    hasPermission,
    refetch: fetchAnalytics
  }
}

export function useBranchAnalytics() {
  const [hourlyOrders, setHourlyOrders] = useState<HourlyOrderData[]>([])
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [hourlyRes, statusRes] = await Promise.all([
        api.get('/admin/analytics/hourly-orders'),
        api.get('/admin/analytics/order-status')
      ])

      if (hourlyRes.data.success) {
        setHourlyOrders(hourlyRes.data.data)
      }
      if (statusRes.data.success) {
        setOrderStatus(statusRes.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching branch analytics:', err)
      setError(err.response?.data?.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    hourlyOrders,
    orderStatus,
    loading,
    error,
    refetch: fetchAnalytics
  }
}


// Center Admin Analytics Hooks

import { superAdminApi } from '@/lib/superAdminApi'

interface AnalyticsOverview {
  customerMetrics: {
    totalCustomers: number
    newCustomers: number
    retentionRate: number
    growth: number
  }
  revenueMetrics: {
    totalRevenue: number
    averageOrderValue: number
    growth: number
  }
  orderMetrics: {
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    completionRate: number
  }
  branchMetrics: {
    totalBranches: number
    activeBranches: number
    averageRevenuePerBranch: number
    totalBranchRevenue: number
  }
}

interface AnalyticsItem {
  _id: string
  analyticsId: string
  type: string
  status: string
  startDate: string
  endDate: string
  createdAt: string
  createdBy: {
    name: string
  }
}

interface AnalyticsFilters {
  type: string
  status: string
  search: string
  page: number
  limit: number
}

export function useAnalyticsOverview(timeframe: string) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await superAdminApi.getAnalyticsOverview(timeframe)
      
      if (response.success && response.data?.overview) {
        setOverview(response.data.overview)
      }
    } catch (err: any) {
      console.error('Error fetching analytics overview:', err)
      setError(err.message || 'Failed to fetch overview')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  return { overview, loading, error, refetch: fetchOverview }
}

export function useAnalytics(filters: AnalyticsFilters) {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await superAdminApi.getAnalytics({
        page: filters.page,
        limit: filters.limit,
        type: filters.type || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      })
      
      if (response.success && response.data) {
        setAnalytics(response.data.analytics || [])
        setPagination(response.data.pagination || {
          current: filters.page,
          pages: 1,
          total: 0,
          limit: filters.limit
        })
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, pagination, loading, error, refetch: fetchAnalytics }
}

export function useAnalyticsGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCustomerRetentionAnalysis = async (data: { startDate: string; endDate: string }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await superAdminApi.generateCustomerRetentionAnalysis(data)
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateBranchPerformanceAnalysis = async (data: { startDate: string; endDate: string }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await superAdminApi.generateBranchPerformanceAnalysis(data)
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateRevenueForecast = async (data: { 
    startDate: string
    endDate: string
    forecastHorizon: number
    methodology: string 
  }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await superAdminApi.generateRevenueForecast(data)
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateExpansionAnalysis = async (data: {
    targetLocation: { city: string; area: string; pincode: string }
    marketData: {
      populationDensity: number
      averageIncome: number
      competitorCount: number
      marketSaturation: number
      demandEstimate: number
    }
  }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await superAdminApi.generateExpansionAnalysis(data)
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    generateCustomerRetentionAnalysis,
    generateBranchPerformanceAnalysis,
    generateRevenueForecast,
    generateExpansionAnalysis
  }
}

export function useAnalyticsById(analyticsId: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!analyticsId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await superAdminApi.getAnalyticsById(analyticsId)
      
      if (response.success && response.data) {
        setAnalytics(response.data.analytics || response.data)
      }
    } catch (err: any) {
      console.error('Error fetching analytics by ID:', err)
      setError(err.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [analyticsId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, loading, error, refetch: fetchAnalytics }
}
