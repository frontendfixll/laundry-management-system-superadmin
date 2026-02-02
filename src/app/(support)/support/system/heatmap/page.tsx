'use client'

import { useState, useEffect } from 'react'
import { 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Eye,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react'

interface TenantHeatmapData {
  id: string
  tenantName: string
  tenantSlug: string
  location: {
    city: string
    state: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  metrics: {
    activeUsers: number
    dailyOrders: number
    revenue: number
    supportTickets: number
    systemHealth: number
    responseTime: number
    errorRate: number
    customerSatisfaction: number
  }
  status: 'healthy' | 'warning' | 'critical'
  lastUpdated: string
  tier: 'free' | 'basic' | 'premium' | 'enterprise'
  onboardedAt: string
}

interface HeatmapStats {
  totalTenants: number
  healthyTenants: number
  warningTenants: number
  criticalTenants: number
  avgHealth: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
}

export default function TenantHeatmapPage() {
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState<TenantHeatmapData[]>([])
  const [stats, setStats] = useState<HeatmapStats>({
    totalTenants: 0,
    healthyTenants: 0,
    warningTenants: 0,
    criticalTenants: 0,
    avgHealth: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [selectedTenant, setSelectedTenant] = useState<TenantHeatmapData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  useEffect(() => {
    loadHeatmapData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadHeatmapData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadHeatmapData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) return

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Load tenant heatmap data
      const response = await fetch(`${API_URL}/support/system/heatmap`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🗺️ Tenant heatmap data:', data)
        
        if (data.success) {
          setTenants(data.data.tenants || [])
          setStats(data.data.stats || stats)
        }
      } else {
        console.error('Failed to load heatmap data:', response.status)
        setMockData()
      }
    } catch (error) {
      console.error('Error loading heatmap data:', error)
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockTenants: TenantHeatmapData[] = [
      {
        id: '1',
        tenantName: 'CleanWash Laundry',
        tenantSlug: 'cleanwash',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        metrics: {
          activeUsers: 245,
          dailyOrders: 89,
          revenue: 15600,
          supportTickets: 3,
          systemHealth: 95,
          responseTime: 180,
          errorRate: 0.2,
          customerSatisfaction: 4.8
        },
        status: 'healthy',
        lastUpdated: '2026-01-27T15:30:00Z',
        tier: 'premium',
        onboardedAt: '2025-08-15T10:00:00Z'
      },
      {
        id: '2',
        tenantName: 'QuickClean Services',
        tenantSlug: 'quickclean',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        metrics: {
          activeUsers: 156,
          dailyOrders: 67,
          revenue: 12400,
          supportTickets: 8,
          systemHealth: 78,
          responseTime: 450,
          errorRate: 1.2,
          customerSatisfaction: 4.2
        },
        status: 'warning',
        lastUpdated: '2026-01-27T15:25:00Z',
        tier: 'basic',
        onboardedAt: '2025-11-20T14:30:00Z'
      },
      {
        id: '3',
        tenantName: 'FreshSpin Laundromat',
        tenantSlug: 'freshspin',
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          coordinates: { lat: 12.9716, lng: 77.5946 }
        },
        metrics: {
          activeUsers: 89,
          dailyOrders: 34,
          revenue: 8900,
          supportTickets: 12,
          systemHealth: 65,
          responseTime: 780,
          errorRate: 3.5,
          customerSatisfaction: 3.8
        },
        status: 'critical',
        lastUpdated: '2026-01-27T15:20:00Z',
        tier: 'free',
        onboardedAt: '2026-01-10T09:15:00Z'
      },
      {
        id: '4',
        tenantName: 'LaundryMaster Pro',
        tenantSlug: 'laundrymaster',
        location: {
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          coordinates: { lat: 13.0827, lng: 80.2707 }
        },
        metrics: {
          activeUsers: 312,
          dailyOrders: 145,
          revenue: 28900,
          supportTickets: 2,
          systemHealth: 98,
          responseTime: 120,
          errorRate: 0.1,
          customerSatisfaction: 4.9
        },
        status: 'healthy',
        lastUpdated: '2026-01-27T15:30:00Z',
        tier: 'enterprise',
        onboardedAt: '2025-06-01T08:00:00Z'
      },
      {
        id: '5',
        tenantName: 'WashCycle Express',
        tenantSlug: 'washcycle',
        location: {
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          coordinates: { lat: 18.5204, lng: 73.8567 }
        },
        metrics: {
          activeUsers: 198,
          dailyOrders: 76,
          revenue: 16800,
          supportTickets: 5,
          systemHealth: 88,
          responseTime: 220,
          errorRate: 0.8,
          customerSatisfaction: 4.5
        },
        status: 'healthy',
        lastUpdated: '2026-01-27T15:28:00Z',
        tier: 'premium',
        onboardedAt: '2025-09-12T11:45:00Z'
      }
    ]

    setTenants(mockTenants)
    setStats({
      totalTenants: mockTenants.length,
      healthyTenants: mockTenants.filter(t => t.status === 'healthy').length,
      warningTenants: mockTenants.filter(t => t.status === 'warning').length,
      criticalTenants: mockTenants.filter(t => t.status === 'critical').length,
      avgHealth: Math.round(mockTenants.reduce((sum, t) => sum + t.metrics.systemHealth, 0) / mockTenants.length),
      totalUsers: mockTenants.reduce((sum, t) => sum + t.metrics.activeUsers, 0),
      totalOrders: mockTenants.reduce((sum, t) => sum + t.metrics.dailyOrders, 0),
      totalRevenue: mockTenants.reduce((sum, t) => sum + t.metrics.revenue, 0)
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700'
      case 'premium': return 'bg-blue-100 text-blue-700'
      case 'basic': return 'bg-green-100 text-green-700'
      case 'free': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600'
    if (health >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.location.state.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    const matchesTier = tierFilter === 'all' || tenant.tier === tierFilter
    
    return matchesSearch && matchesStatus && matchesTier
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Tenant Heatmap</h1>
          <p className="text-gray-600 mt-1">
            Real-time visualization of tenant health and performance across regions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Map
            </button>
          </div>
          <button 
            onClick={loadHeatmapData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Tenants</p>
              <p className="text-3xl font-bold">{stats.totalTenants}</p>
              <p className="text-blue-100 text-xs">Active businesses</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Healthy Tenants</p>
              <p className="text-3xl font-bold">{stats.healthyTenants}</p>
              <p className="text-green-100 text-xs">Operating normally</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Avg Health</p>
              <p className="text-3xl font-bold">{stats.avgHealth}%</p>
              <p className="text-yellow-100 text-xs">Platform average</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-purple-100 text-xs">Active customers</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="enterprise">Enterprise</option>
              <option value="premium">Premium</option>
              <option value="basic">Basic</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenant Grid/Map */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <div key={tenant.id} className={`bg-white rounded-xl shadow-sm border-2 ${getStatusColor(tenant.status)} p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{tenant.tenantName}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{tenant.location.city}, {tenant.location.state}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getHealthIcon(tenant.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(tenant.tier)}`}>
                    {tenant.tier.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Health</span>
                  <span className={`text-sm font-medium ${getHealthColor(tenant.metrics.systemHealth)}`}>
                    {tenant.metrics.systemHealth}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-gray-900">{tenant.metrics.activeUsers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Daily Orders</span>
                  <span className="text-sm font-medium text-gray-900">{tenant.metrics.dailyOrders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <span className={`text-sm font-medium ${tenant.metrics.supportTickets > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                    {tenant.metrics.supportTickets}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Updated: {new Date(tenant.lastUpdated).toLocaleTimeString()}
                </div>
                <button 
                  onClick={() => setSelectedTenant(tenant)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map View</h3>
              <p className="text-gray-500">Map visualization would be integrated here with tenant locations</p>
              <p className="text-sm text-gray-400 mt-2">Showing {filteredTenants.length} tenants across India</p>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTenant.tenantName}</h2>
                  <p className="text-gray-600">{selectedTenant.location.city}, {selectedTenant.location.state}, {selectedTenant.location.country}</p>
                </div>
                <button 
                  onClick={() => setSelectedTenant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Target className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTenant.metrics.activeUsers}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTenant.metrics.dailyOrders}</p>
                  <p className="text-sm text-gray-600">Daily Orders</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">₹{selectedTenant.metrics.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Daily Revenue</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTenant.metrics.supportTickets}</p>
                  <p className="text-sm text-gray-600">Support Tickets</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">System Health</span>
                        <span className={`text-sm font-medium ${getHealthColor(selectedTenant.metrics.systemHealth)}`}>
                          {selectedTenant.metrics.systemHealth}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedTenant.metrics.systemHealth >= 90 ? 'bg-green-500' :
                            selectedTenant.metrics.systemHealth >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedTenant.metrics.systemHealth}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="text-sm font-medium text-gray-900">{selectedTenant.metrics.responseTime}ms</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedTenant.metrics.responseTime <= 300 ? 'bg-green-500' :
                            selectedTenant.metrics.responseTime <= 600 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((selectedTenant.metrics.responseTime / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Error Rate</span>
                        <span className="text-sm font-medium text-gray-900">{selectedTenant.metrics.errorRate}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedTenant.metrics.errorRate <= 1 ? 'bg-green-500' :
                            selectedTenant.metrics.errorRate <= 3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(selectedTenant.metrics.errorRate * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Customer Satisfaction</span>
                        <span className="text-sm font-medium text-gray-900">{selectedTenant.metrics.customerSatisfaction}/5.0</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(selectedTenant.metrics.customerSatisfaction / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tenant Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tenant Slug</p>
                      <p className="font-mono text-sm text-gray-900">{selectedTenant.tenantSlug}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Subscription Tier</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(selectedTenant.tier)}`}>
                        {selectedTenant.tier.toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center space-x-2">
                        {getHealthIcon(selectedTenant.status)}
                        <span className="text-sm font-medium text-gray-900 capitalize">{selectedTenant.status}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Onboarded</p>
                      <p className="text-sm text-gray-900">{new Date(selectedTenant.onboardedAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-sm text-gray-900">{new Date(selectedTenant.lastUpdated).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Coordinates</p>
                      <p className="font-mono text-xs text-gray-900">
                        {selectedTenant.location.coordinates.lat.toFixed(4)}, {selectedTenant.location.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}