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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-1 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                    <div className="h-2 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Top Branches</h3>
        <p className="text-xs text-gray-600 mt-1">Performance ranking</p>
      </div>

      {/* Branches List */}
      <div className="space-y-1">
        {safeBranches.length === 0 ? (
          <div className="text-center py-3">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Building2 className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">No branch data</p>
          </div>
        ) : (
          safeBranches.slice(0, 4).map((branch, index) => (
            <div
              key={branch.branchId}
              className="flex items-center justify-between p-1 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-center space-x-1 flex-1 min-w-0">
                {/* Rank Badge */}
                <div className={`w-5 h-5 ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                } rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold`}>
                  {index < 3 ? (
                    <span className="text-xs">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className="text-xs">#{index + 1}</span>
                  )}
                </div>

                {/* Branch Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-0.5">
                    <h4 className="text-xs font-medium text-gray-900 truncate">
                      {branch.branchName}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {branch.branchCode}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <span>{branch.totalOrders} orders</span>
                    <span>₹{(branch.totalRevenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>

              {/* Performance Score */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-semibold text-gray-900">
                  {((branch.totalRevenue / 10000) * 10).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {safeBranches.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs font-semibold text-gray-900">
                {safeBranches.reduce((sum, branch) => sum + (branch.totalOrders || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">
                ₹{(safeBranches.reduce((sum, branch) => sum + (branch.totalRevenue || 0), 0) / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">
                ₹{Math.round(safeBranches.reduce((sum, branch) => sum + (branch.avgOrderValue || 0), 0) / (safeBranches.length || 1))}
              </div>
              <div className="text-xs text-gray-500">Avg Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
