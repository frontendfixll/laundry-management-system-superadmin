'use client'

import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Building2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface StatsData {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  activeBranches: number
  averageOrderValue: number
  periodStats: {
    orders: number
    revenue: number
    customers: number
  }
  growth: {
    orders: number
    revenue: number
    customers: number
  }
}

interface StatsCardsProps {
  data: StatsData
  loading?: boolean
}

export default function StatsCards({ data, loading }: StatsCardsProps) {
  // Add null checks for safety
  if (!data || !data.growth || !data.periodStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      name: 'Orders',
      value: (data.totalOrders || 0).toLocaleString(),
      change: data.growth?.orders || 0,
      changeText: `+${data.periodStats?.orders || 0} this period`,
      icon: ShoppingBag,
      bgColor: 'bg-blue-50/50',
      borderColor: 'border-blue-100/50',
      hoverBg: 'hover:bg-blue-50'
    },
    {
      name: 'Revenue',
      value: `₹${(data.totalRevenue || 0).toLocaleString()}`,
      change: data.growth?.revenue || 0,
      changeText: `+₹${(data.periodStats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-green-50/50',
      borderColor: 'border-green-100/50',
      hoverBg: 'hover:bg-green-50'
    },
    {
      name: 'Customers',
      value: (data.totalCustomers || 0).toLocaleString(),
      change: data.growth?.customers || 0,
      changeText: `+${data.periodStats?.customers || 0} new`,
      icon: Users,
      bgColor: 'bg-purple-50/50',
      borderColor: 'border-purple-100/50',
      hoverBg: 'hover:bg-purple-50'
    },
    {
      name: 'Branches',
      value: (data.activeBranches || 0).toString(),
      change: 0,
      changeText: 'Active',
      icon: Building2,
      bgColor: 'bg-gray-50/50',
      borderColor: 'border-gray-100/50',
      hoverBg: 'hover:bg-gray-50'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, index) => {
          const colors = ['bg-blue-50/30', 'bg-green-50/30', 'bg-purple-50/30', 'bg-gray-50/30']
          return (
            <div key={index} className={`h-16 ${colors[index]} rounded-lg animate-pulse`}></div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        
        return (
          <div
            key={stat.name}
            className={`${stat.bgColor} ${stat.borderColor} backdrop-blur-sm border rounded-lg p-3 ${stat.hoverBg} hover:border-opacity-75 transition-all duration-200 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-1">
              <Icon className="w-3 h-3 text-gray-400" />
              {stat.change !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-light ${
                  stat.change > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.change > 0 ? (
                    <TrendingUp className="w-2 h-2" />
                  ) : (
                    <TrendingDown className="w-2 h-2" />
                  )}
                  <span>
                    {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-lg font-light text-gray-900 mb-1">
              {stat.value}
            </div>
            
            <div className="text-xs font-light text-gray-500 mb-1">
              {stat.name}
            </div>
            
            <div className="text-xs text-gray-400 font-light">
              {stat.changeText}
            </div>
          </div>
        )
      })}
    </div>
  )
}
