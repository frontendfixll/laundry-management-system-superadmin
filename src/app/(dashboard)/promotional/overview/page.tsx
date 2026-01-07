'use client'

import { useState, useEffect } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Gift,
  Percent,
  Users2,
  Star,
  Crown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Tag
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface PromotionalOverview {
  coupons: {
    totalCoupons: number
    activeCoupons: number
    globalCoupons: number
    totalSavings: number
    totalOrders: number
    totalUsage: number
  }
  discounts: {
    totalDiscounts: number
    activeDiscounts: number
    globalDiscounts: number
    totalSavings: number
    totalOrders: number
  }
  referrals: {
    totalPrograms: number
    activePrograms: number
    globalPrograms: number
    totalReferrals: number
    successfulReferrals: number
  }
  loyalty: {
    totalPrograms: number
    activePrograms: number
    globalPrograms: number
    totalMembers: number
    activeMembers: number
    totalPointsIssued: number
  }
  topTenancies: Array<{
    _id: string
    tenancyName: string
    tenancySlug: string
    discountCount: number
    totalSavings: number
    totalOrders: number
    avgSavingsPerOrder: number
  }>
}

interface Tenancy {
  _id: string
  name: string
  slug: string
  domain?: string
  subdomain?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function PromotionalOverviewPage() {
  const { token } = useSuperAdminStore()
  const [overview, setOverview] = useState<PromotionalOverview>({
    coupons: {
      totalCoupons: 0,
      activeCoupons: 0,
      globalCoupons: 0,
      totalSavings: 0,
      totalOrders: 0,
      totalUsage: 0
    },
    discounts: {
      totalDiscounts: 0,
      activeDiscounts: 0,
      globalDiscounts: 0,
      totalSavings: 0,
      totalOrders: 0
    },
    referrals: {
      totalPrograms: 0,
      activePrograms: 0,
      globalPrograms: 0,
      totalReferrals: 0,
      successfulReferrals: 0
    },
    loyalty: {
      totalPrograms: 0,
      activePrograms: 0,
      globalPrograms: 0,
      totalMembers: 0,
      activeMembers: 0,
      totalPointsIssued: 0
    },
    topTenancies: []
  })
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [selectedTenancy, setSelectedTenancy] = useState<string>('')

  useEffect(() => {
    fetchOverview()
    fetchTenancies()
  }, [])

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      if (selectedTenancy) params.append('tenancyId', selectedTenancy)

      const res = await fetch(`${API_BASE}/superadmin/promotional/overview?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setOverview(data.data.overview)
      }
    } catch (error) {
      console.error('Failed to fetch overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenancies = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/promotional/tenancies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setTenancies(data.data.tenancies)
      }
    } catch (error) {
      console.error('Failed to fetch tenancies:', error)
    }
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  const applyFilters = () => {
    fetchOverview()
  }

  const resetFilters = () => {
    setDateRange({
      startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    })
    setSelectedTenancy('')
    setTimeout(fetchOverview, 100)
  }

  const setQuickDateRange = (days: number) => {
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    setDateRange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotional Programs Overview</h1>
          <p className="text-gray-600">Global analytics and performance across all tenancies</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenancy
              </label>
              <select
                value={selectedTenancy}
                onChange={(e) => setSelectedTenancy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Tenancies</option>
                {tenancies.map(tenancy => (
                  <option key={tenancy._id} value={tenancy._id}>
                    {tenancy.name} ({tenancy.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Quick Date Ranges */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 mr-2">Quick ranges:</span>
          <button
            onClick={() => setQuickDateRange(7)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Last 7 days
          </button>
          <button
            onClick={() => setQuickDateRange(30)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Last 30 days
          </button>
          <button
            onClick={() => setQuickDateRange(90)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Last 90 days
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Coupons Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Tag className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs text-gray-500">Coupons</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-medium">{overview.coupons.totalCoupons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{overview.coupons.activeCoupons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Global</span>
                  <span className="font-medium text-purple-600">{overview.coupons.globalCoupons}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usage</span>
                    <span className="font-medium text-orange-600">{overview.coupons.totalUsage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Discounts Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Discounts</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-medium">{overview.discounts.totalDiscounts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{overview.discounts.activeDiscounts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Global</span>
                  <span className="font-medium text-purple-600">{overview.discounts.globalDiscounts}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Savings</span>
                    <span className="font-medium text-blue-600">${overview.discounts.totalSavings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users2 className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Referrals</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Programs</span>
                  <span className="font-medium">{overview.referrals.totalPrograms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{overview.referrals.activePrograms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Global</span>
                  <span className="font-medium text-purple-600">{overview.referrals.globalPrograms}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {overview.referrals.totalReferrals > 0 
                        ? `${Math.round((overview.referrals.successfulReferrals / overview.referrals.totalReferrals) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs text-gray-500">Loyalty</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Programs</span>
                  <span className="font-medium">{overview.loyalty.totalPrograms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{overview.loyalty.activePrograms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Global</span>
                  <span className="font-medium text-purple-600">{overview.loyalty.globalPrograms}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Members</span>
                    <span className="font-medium text-yellow-600">{overview.loyalty.totalMembers.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Combined Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Combined</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Programs</span>
                  <span className="font-medium">
                    {overview.coupons.totalCoupons + overview.discounts.totalDiscounts + overview.referrals.totalPrograms + overview.loyalty.totalPrograms}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Programs</span>
                  <span className="font-medium text-green-600">
                    {overview.coupons.activeCoupons + overview.discounts.activeDiscounts + overview.referrals.activePrograms + overview.loyalty.activePrograms}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Global Programs</span>
                  <span className="font-medium text-purple-600">
                    {overview.coupons.globalCoupons + overview.discounts.globalDiscounts + overview.referrals.globalPrograms + overview.loyalty.globalPrograms}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Savings</span>
                    <span className="font-medium text-purple-600">
                      ${(overview.coupons.totalSavings + overview.discounts.totalSavings).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Tenancies */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Performing Tenancies</h2>
                  <p className="text-sm text-gray-600">Tenancies with highest promotional program usage</p>
                </div>
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            {overview.topTenancies.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-600">No promotional activity found for the selected period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenancy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Programs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Savings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Savings/Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overview.topTenancies.map((tenancy, index) => (
                      <tr key={tenancy._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tenancy.tenancyName}</div>
                            <div className="text-sm text-gray-500">@{tenancy.tenancySlug}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tenancy.discountCount} programs
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${tenancy.totalSavings.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tenancy.totalOrders}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">${tenancy.avgSavingsPerOrder.toFixed(2)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}