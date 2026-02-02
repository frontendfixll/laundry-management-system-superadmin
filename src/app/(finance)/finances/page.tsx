'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react'
import { superAdminApi } from '@/lib/superAdminApi'
import Link from 'next/link'

interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  revenueGrowth: number
  totalTransactions: number
}

export default function FinancesPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState('30d')

  useEffect(() => {
    fetchFinanceStats()
  }, [timeframe])

  const fetchFinanceStats = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await superAdminApi.getFinancialOverview(timeframe)
      const data = response.data.overview
      setStats({
        totalRevenue: data.totalRevenue || 0,
        totalExpenses: data.totalFees || 0,
        netProfit: (data.totalRevenue || 0) - (data.totalFees || 0),
        pendingPayments: data.pendingApprovals?.totalAmount || 0,
        revenueGrowth: data.revenueGrowth || 0,
        totalTransactions: data.totalTransactions || 0
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Finances Overview</h1>
          <p className="text-gray-600">Track revenue, expenses and financial health</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">This Year</option>
          </select>
          <Button onClick={fetchFinanceStats} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{formatCurrency(stats.totalExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{formatCurrency(stats.netProfit)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{formatCurrency(stats.pendingPayments)}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/superadmin/financial/transactions" className="block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Transactions</h3>
                    <p className="text-sm text-gray-600">{stats.totalTransactions} total transactions</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link href="/superadmin/financial" className="block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Financial Management</h3>
                    <p className="text-sm text-gray-600">Detailed financial reports</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link href="/superadmin/financial/settlements" className="block">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Settlements</h3>
                    <p className="text-sm text-gray-600">Manage branch settlements</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

