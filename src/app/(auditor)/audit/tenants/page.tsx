'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Download
} from 'lucide-react'

interface TenantOverview {
  _id: string
  businessName: string
  subdomain: string
  totalOrders: number
  totalRevenue: number
  activeUsers: number
  lastActivity: Date
  status: 'active' | 'inactive' | 'suspended'
  riskScore: number
  isActive: boolean
  createdAt: Date
}

export default function CrossTenantOverviewPage() {
  const { token } = useAuthStore()
  const [tenants, setTenants] = useState<TenantOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('totalRevenue')

  useEffect(() => {
    fetchTenantOverview()
  }, [])

  const fetchTenantOverview = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/superadmin/audit/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTenants(data.data.tenants)
        }
      }
    } catch (error) {
      console.error('Error fetching tenant overview:', error)
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 4) return 'text-red-700 bg-red-100 border-red-200'
    if (score >= 3) return 'text-orange-700 bg-orange-100 border-orange-200'
    if (score >= 2) return 'text-yellow-700 bg-yellow-100 border-yellow-200'
    return 'text-green-700 bg-green-100 border-green-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border-green-200'
      case 'inactive': return 'text-gray-700 bg-gray-100 border-gray-200'
      case 'suspended': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const filteredTenants = tenants
    .filter(tenant => {
      const matchesSearch = tenant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && tenant.isActive) ||
                           (selectedStatus === 'inactive' && !tenant.isActive)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'totalRevenue': return b.totalRevenue - a.totalRevenue
        case 'totalOrders': return b.totalOrders - a.totalOrders
        case 'activeUsers': return b.activeUsers - a.activeUsers
        case 'riskScore': return b.riskScore - a.riskScore
        case 'businessName': return a.businessName.localeCompare(b.businessName)
        default: return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Building2 className="w-8 h-8 mr-3" />
              Cross-Tenant Overview
            </h1>
            <p className="text-indigo-100 mt-2">
              Platform-wide visibility across all tenant operations
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Total Tenants</p>
            <p className="text-2xl font-bold">{tenants.length}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active Tenants</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {tenants.filter(t => t.isActive).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(tenants.reduce((sum, t) => sum + t.totalRevenue, 0))}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Total Orders</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {tenants.reduce((sum, t) => sum + t.totalOrders, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">High Risk</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {tenants.filter(t => t.riskScore >= 4).length}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="totalRevenue">Sort by Revenue</option>
            <option value="totalOrders">Sort by Orders</option>
            <option value="activeUsers">Sort by Users</option>
            <option value="riskScore">Sort by Risk Score</option>
            <option value="businessName">Sort by Name</option>
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Tenant Overview</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.businessName}</div>
                        <div className="text-sm text-gray-500">{tenant.subdomain}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.totalOrders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(tenant.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.activeUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tenant.isActive ? 'active' : 'inactive')}`}>
                        {tenant.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskScoreColor(tenant.riskScore)}`}>
                        {tenant.riskScore}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.lastActivity).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}