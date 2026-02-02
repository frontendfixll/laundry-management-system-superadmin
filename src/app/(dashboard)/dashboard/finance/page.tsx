'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  IndianRupee,
  Calendar,
  Users,
  Target,
  RefreshCw,
  Search
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

interface FinanceStats {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  payments: {
    total: number
    successful: number
    pendingRefunds: number
    successRate: number
    avgTransactionValue: number
  }
}

interface RecentTransaction {
  id: string
  customer: string
  tenancy: string
  amount: number
  type: 'payment' | 'refund'
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
}

export default function FinanceDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        revenue: {
          total: 2456789,
          thisMonth: 345678,
          lastMonth: 298456,
          growth: 12.5
        },
        payments: {
          total: 12456,
          successful: 12233,
          pendingRefunds: 23,
          successRate: 98.5,
          avgTransactionValue: 197
        }
      })

      setRecentTransactions([
        {
          id: 'TXN-001',
          customer: 'John Doe',
          tenancy: 'QuickWash',
          amount: 250,
          type: 'payment',
          status: 'completed',
          createdAt: '2024-01-24T10:30:00Z'
        },
        {
          id: 'TXN-002',
          customer: 'Jane Smith',
          tenancy: 'CleanPro',
          amount: 180,
          type: 'payment',
          status: 'completed',
          createdAt: '2024-01-24T09:15:00Z'
        },
        {
          id: 'REF-001',
          customer: 'Mike Johnson',
          tenancy: 'LaundryMax',
          amount: 75,
          type: 'refund',
          status: 'pending',
          createdAt: '2024-01-24T08:45:00Z'
        }
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-blue-100 text-blue-700'
      case 'refund': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Monitor financial performance and transactions.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats?.revenue.total.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-200" />
                <p className="text-green-100 text-xs">+{stats?.revenue.growth}% from last month</p>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold">₹{stats?.revenue.thisMonth.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-blue-200" />
                <p className="text-blue-100 text-xs">+{stats?.revenue.growth}% from last month</p>
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Transactions</p>
              <p className="text-3xl font-bold">{stats?.payments.total.toLocaleString()}</p>
              <p className="text-purple-100 text-xs">Success rate: {stats?.payments.successRate}%</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Refunds</p>
              <p className="text-3xl font-bold">{stats?.payments.pendingRefunds}</p>
              <p className="text-orange-100 text-xs">Requires attention</p>
            </div>
            <Receipt className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Avg Transaction</p>
              <p className="text-3xl font-bold">₹{stats?.payments.avgTransactionValue}</p>
              <p className="text-indigo-100 text-xs">Per transaction</p>
            </div>
            <PieChart className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Success Rate</p>
              <p className="text-3xl font-bold">{stats?.payments.successRate}%</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-4 h-4 text-pink-200" />
                <p className="text-pink-100 text-xs">+0.5% improvement</p>
              </div>
            </div>
            <Receipt className="w-8 h-8 text-pink-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">{transaction.id}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900">{transaction.customer}</p>
                        <p className="text-xs text-gray-500">{transaction.tenancy}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${transaction.type === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.type === 'refund' ? '-' : '+'}₹{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
                  <p className="text-xs text-gray-500">Month over month</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">+12.5%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Success</p>
                  <p className="text-xs text-gray-500">Transaction success rate</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats?.payments.successRate}%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Avg Transaction</p>
                  <p className="text-xs text-gray-500">Per transaction value</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">₹{stats?.payments.avgTransactionValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Receipt className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Generate Report</p>
              <p className="text-xs text-gray-500">Financial reports</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Process Refunds</p>
              <p className="text-xs text-gray-500">Pending refunds</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Search className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Transaction Search</p>
              <p className="text-xs text-gray-500">Find transactions</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">Financial analytics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}