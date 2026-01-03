import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface RiskOverview {
  complaintStats: {
    total: number
    open: number
    inProgress: number
    escalated: number
    resolved: number
    closed: number
    avgResolutionTime: number
  }
  escalatedComplaints: number
  slaBreaches: number
  fraudSuspicious: number
  blacklistStats: {
    totalEntries: number
    activeEntries: number
    highRiskEntries: number
    byType: Record<string, any>
  }
  pendingAppeals: number
  highRiskEntries: number
}

interface Complaint {
  _id: string
  complaintId: string
  title: string
  description: string
  category: string
  severity: string
  priority: string
  status: string
  isEscalated: boolean
  escalationLevel: number
  customerName: string
  customerEmail: string
  assignedTo?: any
  createdAt: string
}

interface BlacklistEntry {
  _id: string
  entryId: string
  entityType: string
  identifiers: {
    name?: string
    email?: string
    phone?: string
    deviceId?: string
    ipAddress?: string
  }
  reason: string
  description: string
  severity: string
  status: string
  riskScore: number
  createdAt: string
}

interface SLAConfig {
  _id: string
  configId: string
  name: string
  description: string
  isActive: boolean
  isDefault: boolean
  targets: any[]
  scope: string
  createdAt: string
}

interface ComplaintFilters {
  page?: number
  limit?: number
  status?: string
  category?: string
  severity?: string
  priority?: string
  isEscalated?: boolean
  slaBreached?: boolean
  fraudRisk?: string
  startDate?: string
  endDate?: string
  branchId?: string
  customerId?: string
  assignedTo?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}

interface BlacklistFilters {
  page?: number
  limit?: number
  entityType?: string
  status?: string
  reason?: string
  severity?: string
  riskScore?: number
  search?: string
  sortBy?: string
  sortOrder?: string
}

interface SLAFilters {
  page?: number
  limit?: number
  isActive?: boolean
  scope?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}

export function useRiskOverview(timeframe: string = '30d') {
  const [overview, setOverview] = useState<RiskOverview | null>(null)
  const [escalatedComplaints, setEscalatedComplaints] = useState<Complaint[]>([])
  const [slaBreaches, setSlaBreaches] = useState<Complaint[]>([])
  const [fraudSuspicious, setFraudSuspicious] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getRiskOverview(timeframe)
      setOverview(response.data.overview)
      setEscalatedComplaints(response.data.escalatedComplaints)
      setSlaBreaches(response.data.slaBreaches)
      setFraudSuspicious(response.data.fraudSuspicious)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [timeframe])

  return {
    overview,
    escalatedComplaints,
    slaBreaches,
    fraudSuspicious,
    loading,
    error,
    refetch: fetchOverview
  }
}

export function useComplaints(filters: ComplaintFilters = {}) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getComplaints(filters)
      setComplaints(response.data.complaints)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [JSON.stringify(filters)])

  const escalateComplaint = async (complaintId: string, reason: string, level?: number) => {
    try {
      const response = await superAdminApi.escalateComplaint(complaintId, reason, level)
      await fetchComplaints()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to escalate complaint')
    }
  }

  const assignComplaint = async (complaintId: string, assignedTo: string, assignedToModel: string) => {
    try {
      const response = await superAdminApi.assignComplaint(complaintId, assignedTo, assignedToModel)
      await fetchComplaints()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to assign complaint')
    }
  }

  const resolveComplaint = async (complaintId: string, resolution: string, resolutionType: string, amount?: number) => {
    try {
      const response = await superAdminApi.resolveComplaint(complaintId, resolution, resolutionType, amount)
      await fetchComplaints()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to resolve complaint')
    }
  }

  return {
    complaints,
    loading,
    error,
    pagination,
    fetchComplaints,
    escalateComplaint,
    assignComplaint,
    resolveComplaint
  }
}

export function useComplaint(complaintId: string) {
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaint = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getComplaint(complaintId)
      setComplaint(response.data.complaint)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaint')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId])

  return {
    complaint,
    loading,
    error,
    refetch: fetchComplaint
  }
}

export function useBlacklistEntries(filters: BlacklistFilters = {}) {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getBlacklistEntries(filters)
      setEntries(response.data.entries)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blacklist entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [JSON.stringify(filters)])

  const createEntry = async (entryData: any) => {
    try {
      const response = await superAdminApi.createBlacklistEntry(entryData)
      await fetchEntries()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create blacklist entry')
    }
  }

  const updateEntry = async (entryId: string, entryData: any) => {
    try {
      const response = await superAdminApi.updateBlacklistEntry(entryId, entryData)
      await fetchEntries()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update blacklist entry')
    }
  }

  const checkBlacklist = async (entityType: string, identifiers: any) => {
    try {
      const response = await superAdminApi.checkBlacklist(entityType, identifiers)
      return response.data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to check blacklist')
    }
  }

  return {
    entries,
    loading,
    error,
    pagination,
    fetchEntries,
    createEntry,
    updateEntry,
    checkBlacklist
  }
}

export function useSLAConfigurations(filters: SLAFilters = {}) {
  const [configs, setConfigs] = useState<SLAConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getSLAConfigurations(filters)
      setConfigs(response.data.configs)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch SLA configurations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [JSON.stringify(filters)])

  const createConfig = async (configData: any) => {
    try {
      const response = await superAdminApi.createSLAConfiguration(configData)
      await fetchConfigs()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create SLA configuration')
    }
  }

  return {
    configs,
    loading,
    error,
    pagination,
    fetchConfigs,
    createConfig
  }
}
