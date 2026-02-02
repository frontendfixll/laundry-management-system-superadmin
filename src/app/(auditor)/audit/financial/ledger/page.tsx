'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  BarChart3,
  Search,
  Filter,
  Calendar,
  Download,
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  CreditCard,
  Banknote
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'

interface LedgerEntry {
  _id: string
  tenantId: string
  tenantName: string
  businessName: string
  ledger: {
    openingBalance: number
    closingBalance: number
    totalCredits: number
    totalDebits: number
    netMovement: number
    lastReconciled: Date
    reconciliationStatus: 'reconciled' | 'pending' | 'discrepancy'
  }
  transactions: {
    creditTransactions: {
      count: number
      amount: number
      categories: {
        payments: number
        refunds: number
        adjustments: number
        bonuses: number
      }
    }
    debitTransactions: {
      count: number
      amount: number
      categories: {
        fees: number
        chargebacks: number
        penalties: number
        withdrawals: number
      }
    }
  }
  balanceHistory: {
    date: Date
    balance: number
    movement: number
    type: 'credit' | 'debit'
    description: string
  }[]
  discrepancies: {
    type: string
    amount: number
    description: string
    detectedAt: Date
    status: 'open' | 'investigating' | 'resolved'
  }[]
  riskMetrics: {
    balanceVolatility: number
    negativeBalanceDays: number
    largeTransactionCount: number
    riskScore: number
  }
  auditChecks: {
    balanceIntegrity: boolean
    transactionMatching: boolean
    reconciliationCurrent: boolean
    lastAuditDate: Date
    nextAuditDue: Date
  }
}

export default function LedgerBalancePage() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [dateRange, setDateRange] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalBalance: 0,
    positiveBalances: 0,
    negativeBalances: 0,
    discrepancies: 0,
    pendingReconciliation: 0,
    avgBalance: 0
  })

  useEffect(() => {
    fetchLedgerData()
  }, [page, selectedStatus, selectedRisk, dateRange, searchQuery])

  const fetchLedgerData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedRisk !== 'all' && { risk: selectedRisk }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/financial/ledger?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch ledger data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setLedgerEntries(data.data.ledgerEntries)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch ledger data')
      }
      
    } catch (error) {
      console.error('Error fetching ledger data:', error)
      // Fallback to mock data
      const mockLedgerEntries: LedgerEntry[] = [
        {
          _id: '1',
          tenantId: 'tenant_001',
          tenantName: 'clean-fresh',
          businessName: 'Clean & Fresh Laundry',
          ledger: {
            openingBalance: 150000,
            closingBalance: 185600,
            totalCredits: 245600,
            totalDebits: 210000,
            netMovement: 35600,
            lastReconciled: new Date(Date.now() - 86400000),
            reconciliationStatus: 'reconciled'
          },
          transactions: {
            creditTransactions: {
              count: 0,
              amount: 245600,
              categories: {
                payments: 220000,
                refunds: 0,
                adjustments: 8000,
                bonuses: 2000
              }
            },
            debitTransactions: {
              count: 45,
              amount: 210000,
              categories: {
                fees: 180000,
                chargebacks: 15000,
                penalties: 10000,
                withdrawals: 5000
              }
            }
          },
          balanceHistory: [
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              balance: 150000,
              movement: 0,
              type: 'credit',
              description: 'Opening balance'
            },
            {
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              balance: 175000,
              movement: 25000,
              type: 'credit',
              description: 'Customer payments'
            },
            {
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              balance: 165000,
              movement: -10000,
              type: 'debit',
              description: 'Platform fees'
            },
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              balance: 185600,
              movement: 20600,
              type: 'credit',
              description: 'Settlement received'
            }
          ],
          discrepancies: [],
          riskMetrics: {
            balanceVolatility: 12.5,
            negativeBalanceDays: 0,
            largeTransactionCount: 3,
            riskScore: 2
          },
          auditChecks: {
            balanceIntegrity: true,
            transactionMatching: true,
            reconciliationCurrent: true,
            lastAuditDate: new Date(Date.now() - 86400000),
            nextAuditDue: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
          }
        },
        {
          _id: '2',
          tenantId: 'tenant_002',
          tenantName: 'quickwash',
          businessName: 'QuickWash Services',
          ledger: {
            openingBalance: 85000,
            closingBalance: -5600,
            totalCredits: 125000,
            totalDebits: 165600,
            netMovement: -40600,
            lastReconciled: new Date(Date.now() - 172800000),
            reconciliationStatus: 'discrepancy'
          },
          transactions: {
            creditTransactions: {
              count: 89,
              amount: 125000,
              categories: {
                payments: 110000,
                refunds: 8000,
                adjustments: 5000,
                bonuses: 2000
              }
            },
            debitTransactions: {
              count: 67,
              amount: 165600,
              categories: {
                fees: 120000,
                chargebacks: 25000,
                penalties: 0,
                withdrawals: 5000
              }
            }
          },
          balanceHistory: [
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              balance: 85000,
              movement: 0,
              type: 'credit',
              description: 'Opening balance'
            },
            {
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              balance: 65000,
              movement: -20000,
              type: 'debit',
              description: 'Large chargeback'
            },
            {
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              balance: 15000,
              movement: -50000,
              type: 'debit',
              description: 'Platform fees and penalties'
            },
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              balance: -5600,
              movement: -20600,
              type: 'debit',
              description: 'Additional chargebacks'
            }
          ],
          discrepancies: [
            {
              type: 'NEGATIVE_BALANCE',
              amount: -5600,
              description: 'Account balance has gone negative due to excessive chargebacks',
              detectedAt: new Date(Date.now() - 86400000),
              status: 'investigating'
            },
            {
              type: 'RECONCILIATION_MISMATCH',
              amount: 2500,
              description: 'Transaction totals do not match ledger entries',
              detectedAt: new Date(Date.now() - 172800000),
              status: 'open'
            }
          ],
          riskMetrics: {
            balanceVolatility: 45.8,
            negativeBalanceDays: 2,
            largeTransactionCount: 8,
            riskScore: 5
          },
          auditChecks: {
            balanceIntegrity: false,
            transactionMatching: false,
            reconciliationCurrent: false,
            lastAuditDate: new Date(Date.now() - 172800000),
            nextAuditDue: new Date(Date.now() - 86400000)
          }
        }
      ]

      const mockStats = {
        totalTenants: 247,
        totalBalance: 0,
        positiveBalances: 235,
        negativeBalances: 12,
        discrepancies: 18,
        pendingReconciliation: 23,
        avgBalance: 63500
      }

      setLedgerEntries(mockLedgerEntries)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getReconciliationColor = (status: string) => {
    switch (status) {
      case 'reconciled': return 'text-green-700 bg-green-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'discrepancy': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-700 bg-red-100'
    if (score >= 3) return 'text-orange-700 bg-orange-100'
    if (score >= 2) return 'text-yellow-700 bg-yellow-100'
    return 'text-green-700 bg-green-100'
  }

  const getDiscrepancyStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-700 bg-red-100'
      case 'investigating': return 'text-orange-700 bg-orange-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Ledger Balance Integrity
            </h1>
            <p className="text-blue-100 mt-2">
              Real-time monitoring of tenant ledger balances, reconciliation status, and financial integrity
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Balance: {formatCurrency(stats.totalBalance)}</p>
            <p className="text-xs text-blue-200">Financial Integrity</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Tenants</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalTenants}</p>
            </div>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Positive</p>
              <p className="text-xl font-bold text-green-900 mt-1">{stats.positiveBalances}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Negative</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.negativeBalances}</p>
            </div>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Total Balance</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{formatCurrency(stats.totalBalance)}</p>
            </div>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Discrepancies</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.discrepancies}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Pending</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.pendingReconciliation}</p>
            </div>
            <Activity className="w-5 h-5 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Avg Balance</p>
              <p className="text-lg font-bold text-indigo-900 mt-1">{formatCurrency(stats.avgBalance)}</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Balance Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Platform Balance Trends
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { date: '2024-01-01', totalBalance: 12000000, positiveCount: 220, negativeCount: 8 },
              { date: '2024-02-01', totalBalance: 13500000, positiveCount: 225, negativeCount: 10 },
              { date: '2024-03-01', totalBalance: 14200000, positiveCount: 230, negativeCount: 12 },
              { date: '2024-04-01', totalBalance: 0, positiveCount: 235, negativeCount: 15 },
              { date: '2024-05-01', totalBalance: 0, positiveCount: 232, negativeCount: 18 },
              { date: '2024-06-01', totalBalance: 0, positiveCount: 235, negativeCount: 12 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'totalBalance' ? formatCurrency(value as number) : value,
                name === 'totalBalance' ? 'Total Balance' : name === 'positiveCount' ? 'Positive Balances' : 'Negative Balances'
              ]} />
              <Area type="monotone" dataKey="totalBalance" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Line type="monotone" dataKey="positiveCount" stroke="#10B981" />
              <Line type="monotone" dataKey="negativeCount" stroke="#EF4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="reconciled">Reconciled</option>
            <option value="pending">Pending</option>
            <option value="discrepancy">Discrepancy</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk (4-5)</option>
            <option value="medium">Medium Risk (2-3)</option>
            <option value="low">Low Risk (1)</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Ledger Entries List */}
      <div className="space-y-4">
        {ledgerEntries.map((entry) => (
          <div key={entry._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReconciliationColor(entry.ledger.reconciliationStatus)}`}>
                    {entry.ledger.reconciliationStatus.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(entry.riskMetrics.riskScore)}`}>
                    Risk: {entry.riskMetrics.riskScore}/5
                  </span>
                  {entry.ledger.closingBalance < 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                      NEGATIVE BALANCE
                    </span>
                  )}
                  {entry.discrepancies.length > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-700 bg-orange-100">
                      DISCREPANCIES
                    </span>
                  )}
                </div>

                {/* Tenant Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{entry.businessName}</h3>
                  <p className="text-sm text-gray-600">{entry.tenantName} • {entry.tenantId}</p>
                </div>

                {/* Balance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-700 font-medium">Opening Balance</p>
                    <p className={`text-lg font-bold ${entry.ledger.openingBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {formatCurrency(entry.ledger.openingBalance)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">Total Credits</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(entry.ledger.totalCredits)}</p>
                    <p className="text-xs text-blue-600">{entry.transactions.creditTransactions.count} txns</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-700 font-medium">Total Debits</p>
                    <p className="text-lg font-bold text-orange-900">{formatCurrency(entry.ledger.totalDebits)}</p>
                    <p className="text-xs text-orange-600">{entry.transactions.debitTransactions.count} txns</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium">Net Movement</p>
                    <p className={`text-lg font-bold ${entry.ledger.netMovement >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {entry.ledger.netMovement >= 0 ? '+' : ''}{formatCurrency(entry.ledger.netMovement)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${entry.ledger.closingBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-xs font-medium ${entry.ledger.closingBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      Closing Balance
                    </p>
                    <p className={`text-lg font-bold ${entry.ledger.closingBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {formatCurrency(entry.ledger.closingBalance)}
                    </p>
                  </div>
                </div>

                {/* Transaction Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Credit Categories</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Payments:</span>
                        <span className="font-medium">{formatCurrency(entry.transactions.creditTransactions.categories.payments)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Refunds:</span>
                        <span className="font-medium">{formatCurrency(entry.transactions.creditTransactions.categories.refunds)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Adjustments:</span>
                        <span className="font-medium">{formatCurrency(entry.transactions.creditTransactions.categories.adjustments)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-700 mb-2">Debit Categories</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-600">Fees:</span>
                        <span className="font-medium">{formatCurrency(entry.transactions.debitTransactions.categories.fees)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Chargebacks:</span>
                        <span className="font-medium">{formatCurrency(entry.transactions.debitTransactions.categories.chargebacks)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Penalties:</span>
                        <span className="font-medium">{formatCurrency(entry.transactions.debitTransactions.categories.penalties)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Volatility</p>
                      <p className="font-medium">{entry.riskMetrics.balanceVolatility}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Negative Days</p>
                      <p className="font-medium">{entry.riskMetrics.negativeBalanceDays}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Large Txns</p>
                      <p className="font-medium">{entry.riskMetrics.largeTransactionCount}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Risk Score</p>
                      <p className={`font-medium ${entry.riskMetrics.riskScore >= 4 ? 'text-red-600' : entry.riskMetrics.riskScore >= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                        {entry.riskMetrics.riskScore}/5
                      </p>
                    </div>
                  </div>
                </div>

                {/* Discrepancies */}
                {entry.discrepancies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                      Discrepancies
                    </h4>
                    <div className="space-y-2">
                      {entry.discrepancies.map((discrepancy, index) => (
                        <div key={index} className="bg-red-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-red-900">{discrepancy.type.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-red-700">{formatCurrency(Math.abs(discrepancy.amount))}</span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getDiscrepancyStatusColor(discrepancy.status)}`}>
                                {discrepancy.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-red-700">{discrepancy.description}</p>
                          <p className="text-xs text-red-600 mt-1">
                            Detected: {discrepancy.detectedAt.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit Status */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Audit Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      {entry.auditChecks.balanceIntegrity ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Balance Integrity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.auditChecks.transactionMatching ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Transaction Matching</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.auditChecks.reconciliationCurrent ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Reconciliation Current</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Last Audit: {entry.auditChecks.lastAuditDate.toLocaleDateString()} • 
                    Next Due: {entry.auditChecks.nextAuditDue.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Last Reconciled:</div>
                  <div>{entry.ledger.lastReconciled.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}