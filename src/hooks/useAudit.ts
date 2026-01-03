'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

export interface AuditLog {
  _id: string
  action: string
  category: string
  description: string
  userEmail: string
  userType: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  status: 'success' | 'failure' | 'warning'
  timestamp: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  metadata?: Record<string, any>
}

export interface AuditStats {
  overview: {
    totalLogs: number
    timeframe: string
    startDate: string
    endDate: string
  }
  breakdown: {
    byCategory: Array<{ _id: string; count: number }>
    byRiskLevel: Array<{ _id: string; count: number }>
    byStatus: Array<{ _id: string; count: number }>
  }
  activity: {
    timeline: Array<{
      _id: { year: number; month: number; day: number }
      total: number
      success: number
      failure: number
      high_risk: number
    }>
    recentHighRisk: AuditLog[]
    topUsers: Array<{ _id: string; count: number }>
    topActions: Array<{ _id: string; count: number }>
  }
}

export interface ActivitySummary {
  last24h: number
  last7d: number
  criticalAlerts: number
  failedLogins: number
  systemErrors: number
  alerts: {
    highFailedLogins: boolean
    criticalIssues: boolean
    systemIssues: boolean
  }
}

export function useAudit(filters?: {
  page?: number
  limit?: number
  category?: string
  action?: string
  userEmail?: string
  riskLevel?: string
  status?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}, timeframe: string = '30d') {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 50
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getAuditLogs(filters)
      setLogs(response.data.logs)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await superAdminApi.getAuditStats(timeframe)
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch audit stats:', err)
    }
  }

  const fetchActivitySummary = async () => {
    try {
      const response = await superAdminApi.getActivitySummary()
      setActivitySummary(response.data.summary)
    } catch (err) {
      console.error('Failed to fetch activity summary:', err)
    }
  }

  const exportLogs = async (format: 'json' | 'csv', exportFilters?: any) => {
    try {
      // Build query params
      const params = new URLSearchParams()
      params.append('format', format)
      if (exportFilters?.category) params.append('category', exportFilters.category)
      if (exportFilters?.riskLevel) params.append('riskLevel', exportFilters.riskLevel)
      if (exportFilters?.startDate) params.append('startDate', exportFilters.startDate)
      if (exportFilters?.endDate) params.append('endDate', exportFilters.endDate)

      // Get token
      let token = null
      const superAdminData = localStorage.getItem('superadmin-storage')
      if (superAdminData) {
        try {
          const parsed = JSON.parse(superAdminData)
          token = parsed.state?.token || parsed.token
        } catch (e) {}
      }
      if (!token) {
        const authData = localStorage.getItem('laundry-auth')
        if (authData) {
          try {
            const parsed = JSON.parse(authData)
            token = parsed.state?.token || parsed.token
          } catch (e) {}
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/audit/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the response as blob for download
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-logs-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export audit logs'
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchStats()
    fetchActivitySummary()
  }, [timeframe])

  return {
    logs,
    stats,
    activitySummary,
    pagination,
    loading,
    error,
    exportLogs,
    refetch: () => {
      fetchLogs()
      fetchStats()
      fetchActivitySummary()
    }
  }
}

export function useAuditLog(logId: string) {
  const [log, setLog] = useState<AuditLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLog = async () => {
    if (!logId) return

    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getAuditLog(logId)
      setLog(response.data.log)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLog()
  }, [logId])

  return {
    log,
    loading,
    error,
    refetch: fetchLog
  }
}
