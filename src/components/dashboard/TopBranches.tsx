'use client'

import Link from 'next/link'
import { 
  Building2, 
  TrendingUp,
  ShoppingBag,
  DollarSign
} from 'lucide-react'

interface Branch {
  branchId: string
  branchName: string
  branchCode: string
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
}

interface TopBranchesProps {
  branches: Branch[]
  loading?: boolean
}

export default function TopBranches({ branches, loading }: TopBranchesProps) {
  // Add null check for safety
  const safeBranches = branches || []
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-500' // Gold
      case 1: return 'from-gray-400 to-gray-500' // Silver
      case 2: return 'from-orange-400 to-orange-500' // Bronze
      default: return 'from-purple-500 to-pink-500'
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Performing Branches</h3>
      </div>

      {/* Branches List */}
      <div className="space-y-4">
        {safeBranches.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No branch data available</p>
          </div>
        ) : (
          safeBranches.map((branch, index) => (
            <div
              key={branch.branchId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank Badge */}
                <div className={`w-12 h-12 bg-gradient-to-r ${getRankColor(index)} rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold`}>
                  {typeof getRankIcon(index) === 'string' && getRankIcon(index).startsWith('#') ? (
                    <span className="text-sm">{getRankIcon(index)}</span>
                  ) : (
                    <span className="text-lg">{getRankIcon(index)}</span>
                  )}
                </div>

                {/* Branch Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {branch.branchName}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {branch.branchCode}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{branch.totalOrders} orders</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      <span>₹{branch.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>₹{Math.round(branch.avgOrderValue)}/order</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {((branch.totalRevenue / 10000) * 10).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Performance Score</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Branch Performance Summary */}
      {safeBranches.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {safeBranches.reduce((sum, branch) => sum + (branch.totalOrders || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{safeBranches.reduce((sum, branch) => sum + (branch.totalRevenue || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{Math.round(safeBranches.reduce((sum, branch) => sum + (branch.avgOrderValue || 0), 0) / (safeBranches.length || 1)).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Avg Order Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      {safeBranches.length > 0 && (
        <div className="mt-4 flex items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">High Performance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Average Performance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-600">Needs Attention</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
