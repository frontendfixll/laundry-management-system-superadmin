'use client'

import { useState } from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react'

interface RevenueData {
  daily: Array<{
    _id: { year: number; month: number; day: number }
    revenue: number
    orders: number
  }>
  byService: Array<{
    _id: string
    revenue: number
    orders: number
  }>
}

interface RevenueChartProps {
  data: RevenueData
  loading?: boolean
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1']

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'pie'>('bar')
  const [timeRange, setTimeRange] = useState('7d')

  // Add null checks for safety
  if (!data || !data.daily || !data.byService) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Format daily data for charts
  const formatDailyData = (dailyData: RevenueData['daily']) => {
    if (!dailyData || !Array.isArray(dailyData)) return []
    return dailyData.map(item => ({
      date: `${item._id?.day || 0}/${item._id?.month || 0}`,
      revenue: item.revenue || 0,
      orders: item.orders || 0,
      fullDate: new Date(item._id?.year || 2024, (item._id?.month || 1) - 1, item._id?.day || 1)
    })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
  }

  // Format service data for pie chart
  const formatServiceData = (serviceData: RevenueData['byService']) => {
    if (!serviceData || !Array.isArray(serviceData)) return []
    return serviceData.map((item, index) => ({
      name: item._id || 'Unknown Service',
      value: item.revenue || 0,
      orders: item.orders || 0,
      color: COLORS[index % COLORS.length]
    }))
  }

  const allDailyData = formatDailyData(data.daily)

  // Filter daily data based on selected time range
  const dailyChartData = (() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return allDailyData.filter(item => item.fullDate >= cutoff)
  })()

  const serviceChartData = formatServiceData(data.byService)

  // Summary uses full dataset (not filtered by local timeRange) so header always reflects real totals
  let totalRevenue = 0
  let totalOrders = 0
  if (chartType === 'pie') {
    serviceChartData.forEach(s => { totalRevenue += s.value; totalOrders += s.orders })
  } else {
    allDailyData.forEach(item => { totalRevenue += item.revenue; totalOrders += item.orders })
  }
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Analytics</h3>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Revenue: ₹{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Orders: {totalOrders.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span>Avg: ₹{avgOrderValue.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'area' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <AreaChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'bar' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'pie' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        {dailyChartData.length === 0 && chartType !== 'pie' && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-500">No orders in this period</p>
              <p className="text-xs text-gray-400 mt-1">Try selecting a wider time range</p>
            </div>
          </div>
        )}
        {(dailyChartData.length > 0 || chartType === 'pie') && (
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' && (
            <AreaChart 
              data={dailyChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          )}

          {chartType === 'bar' && (
            <BarChart 
              data={dailyChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}

          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={serviceChartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={2}
                dataKey="value"
              >
                {serviceChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
        )}
      </div>

      {/* Service Legend for Pie Chart */}
      {chartType === 'pie' && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          {serviceChartData.map((service, index) => (
            <div key={service.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: service.color }}
              ></div>
              <span className="text-sm text-gray-600 truncate">
                {service.name}
              </span>
              <span className="text-sm font-medium text-gray-900">
                ₹{service.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
