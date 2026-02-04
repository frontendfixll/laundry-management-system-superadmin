'use client'

import { useState } from 'react'
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { useAuthStore } from '@/store/authStore'
import StatsCards from '@/components/dashboard/StatsCards'
import RevenueChart from '@/components/dashboard/RevenueChart'
import SystemAlerts from '@/components/dashboard/SystemAlerts'
import TopBranches from '@/components/dashboard/TopBranches'
import {
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Shield,
  Building2,
  BarChart3
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getDashboardRoute } from '@/utils/dashboardRouter'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { admin } = useSuperAdminStore()
  const { user } = useAuthStore()
  const {
    dashboardData,
    loading,
    error,
    fetchDashboardOverview,
    isDataStale,
    clearError
  } = useSuperAdminDashboard()

  const [timeframe, setTimeframe] = useState('30d')

  // Role-based redirection logic
  useEffect(() => {
    if (user) {
      const correctRoute = getDashboardRoute(user as any)
      if (correctRoute !== '/dashboard') {
        console.log('🔄 Dashboard - Redirecting to correct portal:', correctRoute)
        router.replace(correctRoute)
      }
    }
  }, [user, router])

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    fetchDashboardOverview(newTimeframe)
  }

  const handleExport = () => {
    if (!dashboardData) return

    // Prepare CSV data with proper Excel formatting
    const csvRows: string[] = []

    // Report Header
    csvRows.push('SUPER ADMIN DASHBOARD REPORT')
    csvRows.push('')
    csvRows.push('Report Date,' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
    csvRows.push('Report Time,' + new Date().toLocaleTimeString('en-IN'))
    csvRows.push('Period,' + (timeframe === '24h' ? 'Last 24 Hours' : timeframe === '7d' ? 'Last 7 Days' : timeframe === '30d' ? 'Last 30 Days' : 'Last 90 Days'))
    csvRows.push('')
    csvRows.push('')

    // Overview Summary Section
    csvRows.push('BUSINESS SUMMARY')
    csvRows.push('')
    csvRows.push('Metric,Value')
    if (dashboardData.overview) {
      csvRows.push('Total Revenue (₹),' + (dashboardData.overview.totalRevenue || 0))
      csvRows.push('Total Orders,' + (dashboardData.overview.totalOrders || 0))
      csvRows.push('Active Customers,' + (dashboardData.overview.totalCustomers || 0))
      csvRows.push('Active Branches,' + (dashboardData.overview.activeBranches || 0))
      csvRows.push('Pending Orders,' + (dashboardData.overview.periodStats?.orders || 0))
      csvRows.push('Completed Orders,' + (dashboardData.overview.totalOrders || 0))
      if (dashboardData.overview.totalOrders > 0) {
        const avgOrderValue = Math.round((dashboardData.overview.totalRevenue || 0) / dashboardData.overview.totalOrders)
        csvRows.push('Average Order Value (₹),' + avgOrderValue)
      }
    }
    csvRows.push('')
    csvRows.push('')

    // Order Status Distribution
    if (dashboardData.orderDistribution && dashboardData.orderDistribution.length > 0) {
      csvRows.push('ORDER STATUS BREAKDOWN')
      csvRows.push('')
      csvRows.push('Order Status,Number of Orders')
      dashboardData.orderDistribution.forEach((item: any) => {
        const statusName = (item._id || 'Unknown')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        csvRows.push(statusName + ',' + item.count)
      })
      csvRows.push('')
      csvRows.push('')
    }

    // Plan Distribution
    if (dashboardData.tenancies?.byPlan && Object.keys(dashboardData.tenancies.byPlan).length > 0) {
      csvRows.push('PLAN DISTRIBUTION')
      csvRows.push('')
      csvRows.push('Plan Name,Tenancy Count,Percentage')
      Object.entries(dashboardData.tenancies.byPlan).forEach(([planName, count]) => {
        const percentage = Math.round(((count as number) / dashboardData.tenancies!.total) * 100)
        csvRows.push(`${planName},${count},${percentage}%`)
      })
      csvRows.push('')
      csvRows.push('')
    }

    // Daily/Weekly Revenue Trend
    if (dashboardData.revenue?.daily && dashboardData.revenue.daily.length > 0) {
      csvRows.push('REVENUE TREND')
      csvRows.push('')
      csvRows.push('Date,Revenue (₹),Number of Orders')
      dashboardData.revenue.daily.forEach((item: any) => {
        const dateStr = item._id ? `${item._id.day}/${item._id.month}` : item.date
        csvRows.push(`${dateStr},${item.revenue || 0},${item.orders || 0}`)
      })
      csvRows.push('')
      csvRows.push('')
    }

    // Recent Orders List
    if (dashboardData.recentOrders && dashboardData.recentOrders.length > 0) {
      csvRows.push('RECENT ORDERS')
      csvRows.push('')
      csvRows.push('Order ID,Customer Name,Order Status,Amount (₹),Order Date')
      dashboardData.recentOrders.forEach((order: any) => {
        const statusName = (order.status || 'Unknown')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        csvRows.push(`${order.orderNumber},${order.customer?.name || 'N/A'},${statusName},${order.totalAmount || order.pricing?.total || 0},${orderDate}`)
      })
      csvRows.push('')
      csvRows.push('')
    }

    // System Status
    csvRows.push('SYSTEM STATUS')
    csvRows.push('')
    csvRows.push('Parameter,Value')
    csvRows.push('System Uptime,' + (dashboardData.systemHealth?.uptime?.toFixed(1) || 99.9) + '%')
    csvRows.push('Status,' + ((dashboardData.systemHealth?.uptime || 99.9) >= 99 ? 'All Systems Operational' : 'Some Issues Detected'))

    // Create and download CSV
    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel Hindi support
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Dashboard-Report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    const handleClearAndRetry = () => {
      // Clear all superadmin storage
      localStorage.removeItem('superadmin-storage')
      localStorage.removeItem('superadmin-token')
      localStorage.removeItem('superAdminToken')
      // Redirect to login
      window.location.href = '/auth/login'
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 p-8 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { clearError(); fetchDashboardOverview(timeframe); }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
            <button
              onClick={handleClearAndRetry}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Clear Session & Login Again
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            If the problem persists, please contact system administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Minimal Header */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 font-light">Platform overview and analytics</p>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-3">
            {dashboardData && (
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isDataStale ? 'bg-amber-400' : 'bg-green-500'}`} />
                <span className="font-light">
                  {new Date(dashboardData.generatedAt).toLocaleTimeString()}
                </span>
              </div>
            )}

            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400 font-light"
            >
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>

            <button
              onClick={handleExport}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-light"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {dashboardData?.overview && (
        <StatsCards data={dashboardData.overview} loading={loading} />
      )}

      {/* Tenancy Stats */}
      {dashboardData?.tenancies && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Tenancies</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{dashboardData.tenancies.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Tenancies</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{dashboardData.tenancies.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">New This Period</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">{dashboardData.tenancies.new}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Platform Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">₹{(dashboardData.tenancies.platformRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row - Professional Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Status Pie Chart */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl p-6 shadow-sm hover:bg-white transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            <p className="text-sm text-gray-500 font-light">Current breakdown</p>
          </div>
          <div className="h-48">
            {dashboardData?.orderDistribution && dashboardData.orderDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.orderDistribution.map((item: any, idx: number) => ({
                      name: item._id?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
                      value: item.count,
                      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][idx % 7]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dashboardData.orderDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][index % 7]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-light">No data available</p>
                </div>
              </div>
            )}
          </div>
          {/* Enhanced Legend */}
          {dashboardData?.orderDistribution && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              {dashboardData.orderDistribution.slice(0, 4).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][idx % 4] }}
                  ></div>
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {item._id?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Distribution Bar Chart */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl p-6 shadow-sm hover:bg-white transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
            <p className="text-sm text-gray-500 font-light">Subscription plans breakdown</p>
          </div>
          <div className="h-48">
            {dashboardData?.tenancies?.byPlan && Object.keys(dashboardData.tenancies.byPlan).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(dashboardData.tenancies.byPlan)
                    .map(([planName, count]) => ({
                      name: planName.replace(/Plan|Subscription/gi, '').trim() || 'Basic',
                      count: count as number,
                      percentage: Math.round(((count as number) / dashboardData.tenancies!.total) * 100)
                    }))
                    .sort((a, b) => b.count - a.count)
                  }
                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v) => `${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} tenancies (${props.payload.percentage}%)`,
                      'Count'
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-light">No plan data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl p-6 shadow-sm hover:bg-white transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <p className="text-sm text-gray-500">Active notifications</p>
          </div>
          <div className="h-48">
            {dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
              <div className="space-y-3 h-full overflow-y-auto no-scrollbar">
                {dashboardData.alerts.slice(0, 4).map((alert: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 truncate">{alert.message || 'System Alert'}</p>
                      <p className="text-xs text-red-600 mt-1">{alert.type || 'Warning'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">All Systems Operational</p>
                  <p className="text-xs text-gray-500">No alerts in the last 24 hours</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Revenue Trend Chart - Large Version */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl p-6 shadow-sm hover:bg-white transition-all duration-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-600 mt-1">Revenue analysis over time</p>
            </div>
            <div className="h-64">
              {dashboardData?.revenue && dashboardData.revenue.daily && Array.isArray(dashboardData.revenue.daily) && dashboardData.revenue.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData.revenue.daily.map((item: any, index: number) => ({
                      date: item._id ? `${item._id.day}/${item._id.month}` : `Day ${index + 1}`,
                      revenue: item.revenue || 0,
                      orders: item.orders || 0
                    }))}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradientLarge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#revenueGradientLarge)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No Revenue Data</p>
                    <p className="text-xs text-gray-600">Data will appear once orders are processed</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          {dashboardData && (
            <TopBranches branches={dashboardData.topBranches} loading={loading} />
          )}
        </div>
      </div>

      {/* Footer Info - System Status */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm p-6 hover:bg-white transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${(dashboardData?.systemHealth?.uptime || 99.9) >= 99
              ? 'bg-green-50'
              : (dashboardData?.systemHealth?.uptime || 99.9) >= 95
                ? 'bg-amber-50'
                : 'bg-red-50'
              }`}>
              <CheckCircle className={`w-6 h-6 ${(dashboardData?.systemHealth?.uptime || 99.9) >= 99
                ? 'text-green-600'
                : (dashboardData?.systemHealth?.uptime || 99.9) >= 95
                  ? 'text-amber-600'
                  : 'text-red-600'
                }`} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                System Status: {(dashboardData?.systemHealth?.uptime || 99.9) >= 99 ? 'Operational' : (dashboardData?.systemHealth?.uptime || 99.9) >= 95 ? 'Minor Issues' : 'Issues Detected'}
              </h4>
              <p className="text-gray-600 text-sm mt-1">
                {(dashboardData?.systemHealth?.uptime || 99.9) >= 99
                  ? 'All services running smoothly'
                  : 'Some services may have issues'} • Last check: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${(dashboardData?.systemHealth?.uptime || 99.9) >= 99
              ? 'text-green-600'
              : (dashboardData?.systemHealth?.uptime || 99.9) >= 95
                ? 'text-amber-600'
                : 'text-red-600'
              }`}>
              {(dashboardData?.systemHealth?.uptime || 99.9).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 font-medium">System Uptime</div>
          </div>
        </div>
      </div>
    </div>
  )
}

