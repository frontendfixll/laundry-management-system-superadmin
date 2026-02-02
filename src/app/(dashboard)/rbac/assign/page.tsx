'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  Search, 
  Filter, 
  UserPlus,
  Crown,
  CheckCircle,
  AlertTriangle,
  Save,
  X,
  Eye,
  Mail,
  Calendar,
  Activity
} from 'lucide-react'

interface SuperAdmin {
  _id: string
  name: string
  email: string
  isActive: boolean
  lastLogin?: string
  roles: string[]
  createdAt: string
}

interface PlatformRole {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  isDefault: boolean
  isActive: boolean
}

export default function RoleAssignmentPage() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([])
  const [platformRoles, setPlatformRoles] = useState<PlatformRole[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null)
  const [roleAssignments, setRoleAssignments] = useState<Record<string, string[]>>({})
  const [filters, setFilters] = useState({
    search: '',
    isActive: true
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')
      
      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      // Fetch SuperAdmins and Platform Roles in parallel
      const [adminsResponse, rolesResponse] = await Promise.all([
        fetch(`${API_URL}/superadmin/rbac/superadmins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }),
        fetch(`${API_URL}/superadmin/rbac/roles`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        })
      ])
      
      if (!adminsResponse.ok || !rolesResponse.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const [adminsData, rolesData] = await Promise.all([
        adminsResponse.json(),
        rolesResponse.json()
      ])
      
      if (adminsData.success && rolesData.success) {
        const admins = adminsData.data.users || []
        const roles = rolesData.data.roles || []
        
        setSuperAdmins(admins)
        setPlatformRoles(roles)
        
        // Initialize role assignments
        const assignments: Record<string, string[]> = {}
        admins.forEach((admin: SuperAdmin) => {
          assignments[admin._id] = admin.roles || []
        })
        setRoleAssignments(assignments)
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRoleToggle = (adminId: string, roleId: string) => {
    setRoleAssignments(prev => {
      const currentRoles = prev[adminId] || []
      const newRoles = currentRoles.includes(roleId)
        ? currentRoles.filter(id => id !== roleId)
        : [...currentRoles, roleId]
      
      return {
        ...prev,
        [adminId]: newRoles
      }
    })
  }

  const handleSaveAssignments = async (adminId: string) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')
      
      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'
      
      const response = await fetch(`${API_URL}/superadmin/rbac/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          superadminId: adminId,
          roleIds: roleAssignments[adminId] || []
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save role assignments')
      }
      
      const data = await response.json()
      if (data.success) {
        // Update the superAdmins state with new role assignments
        setSuperAdmins(prev => prev.map(admin => 
          admin._id === adminId 
            ? { ...admin, roles: roleAssignments[adminId] || [] }
            : admin
        ))
        
        // Show success message (you can implement a toast here)
        console.log('Role assignments saved successfully')
      } else {
        throw new Error(data.message || 'Failed to save role assignments')
      }
    } catch (error) {
      console.error('Error saving role assignments:', error)
      setError(error instanceof Error ? error.message : 'Failed to save role assignments')
    } finally {
      setSaving(false)
    }
  }

  const filteredAdmins = superAdmins.filter(admin => {
    if (filters.search && !admin.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !admin.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.isActive !== undefined && admin.isActive !== filters.isActive) {
      return false
    }
    return true
  })

  const getRolesByAdmin = (adminId: string) => {
    const assignedRoleIds = roleAssignments[adminId] || []
    return platformRoles.filter(role => assignedRoleIds.includes(role._id))
  }

  const hasUnsavedChanges = (adminId: string) => {
    const admin = superAdmins.find(a => a._id === adminId)
    if (!admin) return false
    
    const currentRoles = admin.roles || []
    const newRoles = roleAssignments[adminId] || []
    
    return JSON.stringify(currentRoles.sort()) !== JSON.stringify(newRoles.sort())
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchData()
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Assignment</h1>
          <p className="text-gray-600 mt-1">
            Assign platform roles to SuperAdmin users (Finance Admin, Auditor, Support)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search SuperAdmins by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2">
            <label className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={filters.isActive}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Active only</span>
            </label>
          </div>
        </div>
      </div>

      {/* SuperAdmins List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">SuperAdmin Users</h2>
          <p className="text-sm text-gray-600 mt-1">Click on a user to manage their role assignments</p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No SuperAdmins found</h3>
            <p className="text-gray-600">
              {filters.search ? 'Try adjusting your search criteria' : 'No SuperAdmin users available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => {
              const assignedRoles = getRolesByAdmin(admin._id)
              const unsavedChanges = hasUnsavedChanges(admin._id)
              const isExpanded = selectedAdmin === admin._id

              return (
                <div key={admin._id} className="p-6">
                  {/* Admin Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedAdmin(isExpanded ? null : admin._id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{admin.email}</span>
                          </div>
                          {admin.lastLogin && (
                            <div className="flex items-center space-x-1">
                              <Activity className="w-4 h-4" />
                              <span>Last login: {new Date(admin.lastLogin).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Role Count */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{assignedRoles.length}</div>
                        <div className="text-xs text-gray-500">Roles</div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-1">
                        {admin.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      {/* Unsaved Changes Indicator */}
                      {unsavedChanges && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></div>
                      )}

                      {/* Expand/Collapse */}
                      <Eye className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Role Assignment Panel */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-900">Platform Role Assignment</h4>
                        {unsavedChanges && (
                          <button
                            onClick={() => handleSaveAssignments(admin._id)}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {platformRoles.map((role) => {
                          const isAssigned = (roleAssignments[admin._id] || []).includes(role._id)
                          
                          return (
                            <div
                              key={role._id}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isAssigned
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleRoleToggle(admin._id, role._id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: role.color + '20', color: role.color }}
                                  >
                                    <Crown className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{role.name}</h5>
                                    <p className="text-xs text-gray-500">{role.slug}</p>
                                  </div>
                                </div>
                                
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isAssigned
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300'
                                }`}>
                                  {isAssigned && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {role.description}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      {/* Currently Assigned Roles Summary */}
                      {assignedRoles.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Currently Assigned Roles:</h5>
                          <div className="flex flex-wrap gap-2">
                            {assignedRoles.map((role) => (
                              <span
                                key={role._id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                style={{ 
                                  backgroundColor: role.color + '20', 
                                  color: role.color,
                                  border: `1px solid ${role.color}40`
                                }}
                              >
                                {role.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">{filteredAdmins.length}</div>
          <div className="text-sm text-purple-100">SuperAdmin Users</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">{platformRoles.length}</div>
          <div className="text-sm text-green-100">Available Roles</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="text-2xl font-bold text-white">
            {filteredAdmins.reduce((sum, admin) => sum + (roleAssignments[admin._id]?.length || 0), 0)}
          </div>
          <div className="text-sm text-blue-100">Total Assignments</div>
        </div>
      </div>
    </div>
  )
}