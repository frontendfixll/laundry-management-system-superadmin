import { useState, useEffect, useCallback } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface DashboardOverview {
  overview: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    activeBranches: number
    averageOrderValue: number
    periodStats: {
      orders: number
      revenue: number
      customers: number
    }
    growth: {
      orders: number
      revenue: number
      customers: number
    }
  }
  tenancies?: {
    total: number
    active: number
    new: number
    platformRevenue: number
    byPlan: Record<string, number>
  }
  recentOrders: any[]
  topBranches: any[]
  revenue: {
    daily: any[]
    byService: any[]
  }
  customerGrowth: any[]
  orderDistribution: any[]
  recentActivities: any[]
  alerts: any[]
  systemHealth?: {
    uptime: number
    status: string
    totalOperations?: number
    failedOperations?: number
    recentErrors?: number
    lastChecked: string
  }
  timeframe: string
  generatedAt: string
}

interface AnalyticsData {
  revenue?: any[]
  orders?: any[]
  customers?: any[]
  branches?: any[]
}

export const useSuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard overview
  const fetchDashboardOverview = useCallback(async (timeframe: string = '30d') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getDashboardOverview(timeframe)
      setDashboardData(response.data)
    } catch (err: any) {
      setError(err.message)
      console.error('Dashboard overview error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch detailed analytics
  const fetchAnalytics = useCallback(async (params: {
    startDate: string
    endDate: string
    groupBy?: string
    metrics?: string[]
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await superAdminApi.getDetailedAnalytics(params)
      setAnalyticsData(response.data)
    } catch (err: any) {
      setError(err.message)
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh dashboard data
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  useEffect(() => {
    if (autoRefresh && dashboardData) {
      const interval = setInterval(() => {
        fetchDashboardOverview(dashboardData.timeframe)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, dashboardData, fetchDashboardOverview])

  // Initial load
  useEffect(() => {
    fetchDashboardOverview()
  }, [fetchDashboardOverview])

  return {
    // Data
    dashboardData,
    analyticsData,
    loading,
    error,
    
    // Actions
    fetchDashboardOverview,
    fetchAnalytics,
    
    // Auto-refresh
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    
    // Computed values
    isDataStale: dashboardData ? 
      (Date.now() - new Date(dashboardData.generatedAt).getTime()) > 300000 : false, // 5 minutes
    
    // Helper methods
    refreshData: () => fetchDashboardOverview(dashboardData?.timeframe),
    clearError: () => setError(null)
  }
}
