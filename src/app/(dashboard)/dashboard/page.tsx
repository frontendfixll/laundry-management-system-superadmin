'use client'

import { useState } from 'react'
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard'
import { useSuperAdminStore } from '@/store/superAdminStore'
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
  Building2
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
} from 'recharts'

export default function SuperAdminDashboard() {
  const { admin } = useSuperAdminStore()
  const {
    dashboardData,
    loading,
    error,
    fetchDashboardOverview,
    isDataStale,
    clearError
  } = useSuperAdminDashboard()

  const [timeframe, setTimeframe] = useState('30d')

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
      csvRows.push('Active Customers,' + (dashboardData.overview.activeCustomers || 0))
      csvRows.push('Active Branches,' + (dashboardData.overview.activeBranches || 0))
      csvRows.push('Pending Orders,' + (dashboardData.overview.pendingOrders || 0))
      csvRows.push('Completed Orders,' + (dashboardData.overview.completedOrders || 0))
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
    
    // Top Branches Performance
    if (dashboardData.topBranches && dashboardData.topBranches.length > 0) {
      csvRows.push('BRANCH PERFORMANCE')
      csvRows.push('')
      csvRows.push('Rank,Branch Name,Branch Code,Total Orders,Revenue (₹)')
      dashboardData.topBranches.forEach((branch: any, index: number) => {
        csvRows.push(`${index + 1},${branch.branchName || 'N/A'},${branch.branchCode || 'N/A'},${branch.totalOrders || 0},${branch.totalRevenue || 0}`)
      })
      csvRows.push('')
      csvRows.push('')
    }
    
    // Daily/Weekly Revenue Trend
    if (dashboardData.revenue && dashboardData.revenue.length > 0) {
      csvRows.push('REVENUE TREND')
      csvRows.push('')
      csvRows.push('Date,Revenue (₹),Number of Orders')
      dashboardData.revenue.forEach((item: any) => {
        csvRows.push(`${item._id || item.date},${item.revenue || 0},${item.orders || 0}`)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { clearError(); fetchDashboardOverview(timeframe); }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={handleClearAndRetry}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              Clear Session & Login Again
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            If the problem persists, try clearing your browser cache.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {admin?.name}! 👋</h1>
              <p className="text-purple-100 mt-1">Here's what's happening with your laundry business today.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {dashboardData && (
              <div className="flex items-center space-x-2 text-sm bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isDataStale ? 'bg-yellow-400' : 'bg-green-400'}`} />
                <span className="text-purple-100">
                  {new Date(dashboardData.generatedAt).toLocaleTimeString()}
                </span>
              </div>
            )}

            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="24h" className="text-gray-800">Last 24 hours</option>
              <option value="7d" className="text-gray-800">Last 7 days</option>
              <option value="30d" className="text-gray-800">Last 30 days</option>
              <option value="90d" className="text-gray-800">Last 90 days</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-all flex items-center space-x-2 font-medium shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tenancies</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.tenancies.total}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Tenancies</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData.tenancies.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New This Period</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.tenancies.new}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Platform Revenue</p>
                <p className="text-2xl font-bold text-purple-600">₹{(dashboardData.tenancies.platformRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Order Status Distribution</h3>
            <p className="text-sm text-gray-500">Current order status breakdown</p>
          </div>
          <div className="h-48">
            {dashboardData?.orderDistribution && dashboardData.orderDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.orderDistribution.map((item: any, idx: number) => ({
                      name: item._id?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
                      value: item.count,
                      color: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'][idx % 7]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData.orderDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'][index % 7]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No order data available
              </div>
            )}
          </div>
          {/* Legend */}
          {dashboardData?.orderDistribution && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {dashboardData.orderDistribution.slice(0, 6).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'][idx % 6] }}
                  ></div>
                  <span className="text-xs text-gray-600 truncate">
                    {item._id?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
                  </span>
                  <span className="text-xs font-bold text-gray-800">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Branches Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Branch Performance</h3>
            <p className="text-sm text-gray-500">Revenue by branch</p>
          </div>
          <div className="h-48">
            {dashboardData?.topBranches && dashboardData.topBranches.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.topBranches.map((branch: any) => ({
                  name: branch.branchCode || branch.branchName?.slice(0, 8) || 'Branch',
                  revenue: branch.totalRevenue || 0,
                  orders: branch.totalOrders || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#branchGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No branch data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {dashboardData && (
            <RevenueChart data={dashboardData.revenue} loading={loading} />
          )}
        </div>
        <div>
          {dashboardData && (
            <SystemAlerts 
              alerts={dashboardData.alerts} 
              loading={loading}
              onDismiss={(alertId) => {
                console.log('Alert dismissed:', alertId)
              }}
              onClearAll={() => {
                console.log('All alerts cleared')
              }}
            />
          )}
        </div>
      </div>

      {/* Top Branches - Full Width */}
      <div>
        {dashboardData && (
          <TopBranches branches={dashboardData.topBranches} loading={loading} />
        )}
      </div>

      {/* Footer Info - System Status */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              (dashboardData?.systemHealth?.uptime || 99.9) >= 99 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30' 
                : (dashboardData?.systemHealth?.uptime || 99.9) >= 95
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-yellow-500/30'
                  : 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/30'
            }`}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                System Status: {(dashboardData?.systemHealth?.uptime || 99.9) >= 99 ? 'All Good! ✅' : (dashboardData?.systemHealth?.uptime || 99.9) >= 95 ? 'Minor Issues ⚠️' : 'Issues Detected ❌'}
              </h4>
              <p className="text-gray-600 text-sm">
                {(dashboardData?.systemHealth?.uptime || 99.9) >= 99 
                  ? 'All services are running smoothly.' 
                  : 'Some services may be experiencing issues.'} Last check: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold bg-clip-text text-transparent ${
              (dashboardData?.systemHealth?.uptime || 99.9) >= 99
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                : (dashboardData?.systemHealth?.uptime || 99.9) >= 95
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                  : 'bg-gradient-to-r from-red-600 to-pink-600'
            }`}>
              {(dashboardData?.systemHealth?.uptime || 99.9).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  )
}

