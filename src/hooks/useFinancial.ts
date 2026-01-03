import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'

interface FinancialOverview {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  totalFees: number
  revenueGrowth: number
  settlementStats: {
    total: { count: number; amount: number }
    completed: { count: number; amount: number }
    pending: { count: number; amount: number }
    failed: { count: number; amount: number }
  }
  pendingApprovals: {
    transactions: number
    settlements: number
    totalAmount: number
  }
}

interface Transaction {
  _id: string
  transactionId: string
  type: string
  subType: string
  amount: number
  netAmount: number
  currency: string
  status: string
  paymentMethod: string
  requiresApproval: boolean
  approvalStatus: string
  customerId?: any
  branchId?: any
  orderId?: any
  description: string
  createdAt: string
}

interface Settlement {
  _id: string
  settlementId: string
  type: string
  recipientName: string
  grossAmount: number
  netAmount: number
  status: string
  paymentMethod: string
  periodStart: string
  periodEnd: string
  createdAt: string
}

interface FinancialReport {
  _id: string
  reportId: string
  title: string
  type: string
  status: string
  startDate: string
  endDate: string
  summary: any
  createdAt: string
}

interface TransactionFilters {
  page?: number
  limit?: number
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  branchId?: string
  customerId?: string
  minAmount?: number
  maxAmount?: number
  paymentMethod?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}

interface SettlementFilters {
  page?: number
  limit?: number
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  recipientId?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  sortBy?: string
  sortOrder?: string
}

interface ReportFilters {
  page?: number
  limit?: number
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}

export function useFinancialOverview(timeframe: string = '30d') {
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getFinancialOverview(timeframe)
      setOverview(response.data.overview)
      setRevenueTrend(response.data.revenueTrend)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [timeframe])

  return {
    overview,
    revenueTrend,
    loading,
    error,
    refetch: fetchOverview
  }
}

export function useTransactions(filters: TransactionFilters = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getTransactions(filters)
      setTransactions(response.data.transactions)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [JSON.stringify(filters)])

  const approveRefund = async (transactionId: string, notes?: string) => {
    try {
      const response = await superAdminApi.approveRefund(transactionId, notes)
      await fetchTransactions()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to approve refund')
    }
  }

  const rejectRefund = async (transactionId: string, reason: string) => {
    try {
      const response = await superAdminApi.rejectRefund(transactionId, reason)
      await fetchTransactions()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to reject refund')
    }
  }

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    approveRefund,
    rejectRefund
  }
}

export function useTransaction(transactionId: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getTransaction(transactionId)
      setTransaction(response.data.transaction)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transaction')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (transactionId) {
      fetchTransaction()
    }
  }, [transactionId])

  return {
    transaction,
    loading,
    error,
    refetch: fetchTransaction
  }
}

export function useSettlements(filters: SettlementFilters = {}) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  const fetchSettlements = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getSettlements(filters)
      setSettlements(response.data.settlements)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settlements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettlements()
  }, [JSON.stringify(filters)])

  const createSettlement = async (settlementData: any) => {
    try {
      const response = await superAdminApi.createSettlement(settlementData)
      await fetchSettlements()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create settlement')
    }
  }

  const approveSettlement = async (settlementId: string, comments?: string) => {
    try {
      const response = await superAdminApi.approveSettlement(settlementId, comments)
      await fetchSettlements()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to approve settlement')
    }
  }

  return {
    settlements,
    loading,
    error,
    pagination,
    fetchSettlements,
    createSettlement,
    approveSettlement
  }
}

export function useFinancialReports(filters: ReportFilters = {}) {
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getFinancialReports(filters)
      setReports(response.data.reports)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [JSON.stringify(filters)])

  const generateReport = async (reportData: {
    type: string
    startDate: string
    endDate: string
    filters?: any
  }) => {
    try {
      const response = await superAdminApi.generateFinancialReport(reportData)
      await fetchReports()
      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to generate report')
    }
  }

  return {
    reports,
    loading,
    error,
    pagination,
    fetchReports,
    generateReport
  }
}

export function useFinancialReport(reportId: string) {
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await superAdminApi.getFinancialReport(reportId)
      setReport(response.data.report)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  return {
    report,
    loading,
    error,
    refetch: fetchReport
  }
}
