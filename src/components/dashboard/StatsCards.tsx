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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Orders',
      value: (data.totalOrders || 0).toLocaleString(),
      change: data.growth?.orders || 0,
      changeText: `+${data.periodStats?.orders || 0} this period`,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/30'
    },
    {
      name: 'Total Revenue',
      value: `₹${(data.totalRevenue || 0).toLocaleString()}`,
      change: data.growth?.revenue || 0,
      changeText: `+₹${(data.periodStats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/30'
    },
    {
      name: 'Total Customers',
      value: (data.totalCustomers || 0).toLocaleString(),
      change: data.growth?.customers || 0,
      changeText: `+${data.periodStats?.customers || 0} new`,
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/30'
    },
    {
      name: 'Active Branches',
      value: (data.activeBranches || 0).toString(),
      change: 0,
      changeText: 'Operational',
      icon: Building2,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/30'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        
        return (
          <div
            key={stat.name}
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${stat.shadow}`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                {stat.change !== 0 && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                    {stat.change > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-3xl font-bold mb-1">
                {stat.value}
              </div>
              
              <div className="text-sm font-medium text-white/90 mb-1">
                {stat.name}
              </div>
              
              <div className="text-xs text-white/70">
                {stat.changeText}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
