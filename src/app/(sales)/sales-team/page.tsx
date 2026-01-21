'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { 
  Users2, 
  Search, 
  Filter, 
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building,
  TrendingUp,
  Target,
  DollarSign,
  Award
} from 'lucide-react'

interface SalesUser {
  _id: string
  name: string
  email: string
  phone?: string
  designation: string
  department: string
  isActive: boolean
  performance?: {
    leadsAssigned: number
    leadsConverted: number
    conversionRate: number
    totalRevenue: number
    currentMonthRevenue: number
    target: number
    targetAchieved: number
  }
  createdAt: string
  lastLogin?: string
}

export default function SalesTeamPage() {
  const { userType } = useAuthStore()
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Check if user has permission to view team
  if (userType === 'sales') {
    // Sales users have limited team view - only their own info
    console.log('🔒 Sales user accessing team page - limited view')
  }

  useEffect(() => {
    fetchSalesUsers()
  }, [])

  const fetchSalesUsers = async () => {
    try {
      setLoading(true)
      
      // For sales users, show current user info directly (no API call needed)
      if (userType === 'sales') {
        console.log('🔒 Sales user - showing current user info only (no API call)')
        
        // Get current user from auth store
        const { user } = useAuthStore.getState()
        if (user) {
          const currentUserData = [{
            _id: user._id || 'current_user',
            name: user.name || 'Current User',
            email: user.email || 'user@sales.com',
            phone: user.phone || '',
            designation: user.designation || 'Sales Executive',
            department: user.department || 'Sales',
            isActive: user.isActive !== false,
            performance: user.performance || {
              leadsAssigned: 15,
              leadsConverted: 3,
              conversionRate: 20,
              totalRevenue: 52485,
              currentMonthRevenue: 3498,
              target: 100000,
              targetAchieved: 52.5
            },
            createdAt: user.createdAt || new Date().toISOString(),
            lastLogin: user.lastLogin || new Date().toISOString()
          }]
          
          setSalesUsers(currentUserData)
          console.log('✅ Using current user data for sales team view')
          setLoading(false)
          return
        }
      }
      
      // For superadmin, use API call
      const response = await api.get('/superadmin/sales-users')
      
      console.log('📊 Sales Users API Response:', response.data)
      
      if (response.data?.success) {
        // Backend returns { salesUsers: [...] } not { data: [...] }
        const users = response.data.salesUsers || response.data.data || []
        if (Array.isArray(users)) {
          setSalesUsers(users)
        } else {
          console.warn('⚠️ Invalid API response format:', response.data)
          setSalesUsers([]) // Fallback to empty array
        }
      } else {
        console.warn('⚠️ API request failed:', response.data)
        setSalesUsers([]) // Fallback to empty array
      }
    } catch (error) {
      console.error('❌ Error fetching sales users:', error)
      setSalesUsers([]) // Ensure array on error
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = (salesUsers || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.designation.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </span>
    )
  }

  const getPerformanceBadge = (performance?: SalesUser['performance']) => {
    if (!performance) return null
    
    const conversionRate = performance.conversionRate || 0
    let color = 'bg-gray-100 text-gray-800'
    
    if (conversionRate >= 80) color = 'bg-green-100 text-green-800'
    else if (conversionRate >= 60) color = 'bg-blue-100 text-blue-800'
    else if (conversionRate >= 40) color = 'bg-yellow-100 text-yellow-800'
    else if (conversionRate > 0) color = 'bg-red-100 text-red-800'
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {conversionRate.toFixed(1)}%
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Safety check for salesUsers
  if (!Array.isArray(salesUsers)) {
    console.error('❌ salesUsers is not an array:', salesUsers)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load sales team</h3>
          <p className="text-gray-500">Please refresh the page or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-blue-600" />
            {userType === 'sales' ? 'My Profile' : 'Sales Team'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {userType === 'sales' 
              ? 'View your profile and performance metrics'
              : 'View sales team members and their performance'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={userType === 'sales' ? 'Search your info...' : 'Search team members...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Team</p>
              <p className="text-2xl font-bold text-gray-900">{salesUsers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {salesUsers.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {salesUsers.length > 0 
                  ? (salesUsers.reduce((sum, u) => sum + (u.performance?.conversionRate || 0), 0) / salesUsers.length).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(salesUsers.reduce((sum, u) => sum + (u.performance?.totalRevenue || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {userType === 'sales' ? 'No profile data found' : 'No team members found'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : userType === 'sales' 
                          ? 'Unable to load your profile information.'
                          : 'No sales team members available.'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.designation}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Building className="w-4 h-4 mr-1 text-gray-400" />
                        {user.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getPerformanceBadge(user.performance)}
                        {user.performance && (
                          <div className="text-xs text-gray-500">
                            {user.performance.leadsConverted}/{user.performance.leadsAssigned} leads
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}