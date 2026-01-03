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
          <h1 className="text-2xl font-bold text-gray-800">Finances Overview</h1>
          <p className="text-gray-600">Track revenue, expenses and financial health</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-white/20 text-white">
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="text-green-100 text-sm">Total Revenue</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalExpenses)}</h3>
              <p className="text-red-100 text-sm">Platform Fees</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.netProfit)}</h3>
              <p className="text-purple-100 text-sm">Net Profit</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.pendingPayments)}</h3>
              <p className="text-amber-100 text-sm">Pending Payments</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/superadmin/financial/transactions" className="block">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Transactions</h3>
                    <p className="text-sm text-gray-600">{stats.totalTransactions} total transactions</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link href="/superadmin/financial" className="block">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Financial Management</h3>
                    <p className="text-sm text-gray-600">Detailed financial reports</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link href="/superadmin/financial/settlements" className="block">
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Settlements</h3>
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

