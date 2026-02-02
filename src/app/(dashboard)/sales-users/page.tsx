'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Key,
  TrendingUp,
  Users,
  DollarSign,
  Target
} from 'lucide-react'
import axios from 'axios'
import CreateSalesUserModal from '@/components/sales/CreateSalesUserModal'
import { useSuperAdminStore } from '@/store/superAdminStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface SalesUser {
  _id: string
  name: string
  email: string
  phone?: string
  employeeId?: string
  designation: string
  isActive: boolean
  performance: {
    leadsAssigned: number
    leadsConverted: number
    conversionRate: number
    totalRevenue: number
    currentMonthRevenue: number
    target: number
    targetAchieved: number
  }
  createdAt: string
}

interface Stats {
  totalSalesUsers: number
  activeSalesUsers: number
  performance: {
    totalLeadsAssigned: number
    totalLeadsConverted: number
    totalRevenue: number
    currentMonthRevenue: number
    avgConversionRate: number
  }
  topPerformers: SalesUser[]
}

export default function SalesUsersPage() {
  const { token } = useSuperAdminStore()
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SalesUser | null>(null)

  useEffect(() => {
    if (token) {
      fetchSalesUsers()
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchSalesUsers = async () => {
    try {
      if (!token) {
        console.log('No token available')
        setLoading(false)
        return
      }
      
      const response = await axios.get(`${API_URL}/superadmin/sales-users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search }
      })
      
      if (response.data && response.data.data && response.data.data.salesUsers) {
        setSalesUsers(response.data.data.salesUsers)
      } else {
        setSalesUsers([])
      }
    } catch (error: any) {
      console.error('Error fetching sales users:', error)
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.')
      }
      setSalesUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      if (!token) return
      
      const response = await axios.get(`${API_URL}/superadmin/sales-users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data && response.data.data) {
        setStats(response.data.data)
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus ? 'deactivate' : 'activate'
      await axios.post(
        `${API_URL}/superadmin/sales-users/${userId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchSalesUsers()
      fetchStats()
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this sales user?')) return

    try {
      await axios.delete(`${API_URL}/superadmin/sales-users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchSalesUsers()
      fetchStats()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting user')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sales Team</h1>
          <p className="text-gray-600 mt-1">Manage your sales department</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sales User
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && stats.performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales Users</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.totalSalesUsers || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.activeSalesUsers || 0} active
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {formatCurrency(stats.performance?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatCurrency(stats.performance?.currentMonthRevenue || 0)} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Converted</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.performance?.totalLeadsConverted || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  of {stats.performance?.totalLeadsAssigned || 0} assigned
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Conversion Rate</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {(stats.performance?.avgConversionRate || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Performance
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchSalesUsers()}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchSalesUsers}>Search</Button>
        </div>
      </div>

      {/* Sales Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesUsers && salesUsers.length > 0 ? (
              salesUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.employeeId && (
                      <div className="text-xs text-gray-400">ID: {user.employeeId}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.designation}</div>
                  {user.phone && (
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.performance.leadsConverted} / {user.performance.leadsAssigned} leads
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.performance.conversionRate.toFixed(1)}% conversion
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(user.performance.totalRevenue)}
                  </div>
                  {user.performance.target > 0 && (
                    <div className="text-xs text-gray-500">
                      Target: {user.performance.targetAchieved.toFixed(0)}%
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? (
                        <UserX className="w-4 h-4 text-red-600" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
            ) : null}
          </tbody>
        </table>

        {(!salesUsers || salesUsers.length === 0) && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales users</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new sales user.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Sales User
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Top Performers */}
      {stats && stats.topPerformers && stats.topPerformers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-4">
            {stats.topPerformers.map((performer, index) => (
              <div key={performer._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                    <div className="text-xs text-gray-500">{performer.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(performer.performance?.totalRevenue || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {performer.performance?.leadsConverted || 0} conversions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSalesUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchSalesUsers()
          fetchStats()
        }}
      />
    </div>
  )
}
