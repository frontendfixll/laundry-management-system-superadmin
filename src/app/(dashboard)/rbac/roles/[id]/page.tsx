'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Shield,
  ArrowLeft,
  Edit,
  Users,
  Crown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Plus,
  Minus,
  Key,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { getModulesForRole } from '@/config/roleModules'

interface PlatformRole {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  isDefault: boolean
  isActive: boolean
  assignmentCount: number
  permissionCount: number
  permissions: Record<string, Record<string, boolean>>
  createdAt: string
  updatedAt: string
}

interface AssignedUser {
  _id: string
  name: string
  email: string
  isActive: boolean
  lastLogin?: string
  customPermissions?: Record<string, any>
}

export default function PlatformRoleDetailsPage() {
  const params = useParams()
  const roleId = params.id as string

  const [role, setRole] = useState<PlatformRole | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoleDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')
      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/roles/${roleId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setRole(data.data.role)
        setAssignedUsers(data.data.assignedAdmins || [])
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (roleId) fetchRoleDetails()
  }, [roleId])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const searchUsers = async (query: string) => {
    if (!query) return setSearchResults([])
    try {
      setSearching(true)
      const token = localStorage.getItem('auth-storage')
      const parsed = JSON.parse(token || '{}')
      const authToken = parsed.state?.token
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/superadmins?search=${query}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const data = await response.json()
      if (data.success) {
        // Filter out those already assigned
        const filtered = data.data.users.filter((u: any) => !assignedUsers.find(au => au._id === u._id))
        setSearchResults(filtered)
      }
    } finally {
      setSearching(false)
    }
  }

  const assignUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth-storage')
      const parsed = JSON.parse(token || '{}')
      const authToken = parsed.state?.token
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          superadminId: userId,
          roleIds: [...assignedUsers.map(u => u._id), roleId]
        })
      })
      if (response.ok) {
        fetchRoleDetails()
        setSearchQuery('')
        setSearchResults([])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchUsers(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const modulePermissions = getModulePermissions(role)

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Role Architecture...</div>

  if (error || !role) return <div className="p-8 text-center text-red-500">Error: {error || 'Role not found'}</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Condensed Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all">
        <div className="flex items-center space-x-3">
          <Link href="/rbac/roles" className="p-1.5 hover:bg-gray-50 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-400" /></Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: role.color + '20', color: role.color }}><Crown className="w-4 h-4" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs">{role.name}</h1>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{role.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/rbac/roles/${role._id}/edit`} className="px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all flex items-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Edit Role</Link>
          <div className="relative group/search">
            <div className="flex items-center bg-purple-50 rounded-lg border border-purple-100 px-2 py-1">
              <Plus className="w-3 h-3 text-purple-600 mr-1.5" />
              <input
                type="text"
                placeholder="Find and Add Personnel..."
                className="bg-transparent text-[10px] font-bold text-purple-900 placeholder-purple-300 focus:outline-none w-32"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden py-1 scale-95 group-hover/search:scale-100 transition-transform origin-top-right">
                {searchResults.map(u => (
                  <button
                    key={u._id}
                    onClick={() => assignUser(u._id)}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[9px] font-bold">{u.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-800 truncate">{u.name}</p>
                      <p className="text-[8px] text-gray-400 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col: Permissions Summary (Medium width) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-tight flex items-center gap-1.5"><Shield className="w-3 h-3" /> Role Permissions</h3>
              <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold">{modulePermissions.filter(m => m.enabledCount > 0).length} Active Modules</span>
            </div>
            <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {modulePermissions.map(({ module, actions, enabledCount }) => (
                <div key={module} className={`p-3 rounded-lg border transition-all ${enabledCount > 0 ? 'border-purple-100 bg-purple-50/30' : 'border-gray-100 bg-gray-50/20 grayscale opacity-60'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-700 capitalize">{module.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {enabledCount > 0 ? `${enabledCount} permissions` : 'No access'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(actions).map(([action, enabled]) => (
                      <div 
                        key={action} 
                        className={`px-2 py-1 rounded text-[9px] font-medium capitalize ${
                          enabled 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                        title={`${action.charAt(0).toUpperCase() + action.slice(1)} ${enabled ? 'allowed' : 'denied'}`}
                      >
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Personnel & Controls (Wide width) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Personnel Table - Compact */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-tight flex items-center gap-1.5"><Users className="w-3 h-3" /> Assigned Personnel</h3>
              <div className="flex gap-2">
                <Link href="/users/create" className="text-[10px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1">+ Create New User</Link>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              {assignedUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <User className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 italic">No personnel attached to this role.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">User</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">RBAC Status</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase text-right">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedUsers.map((user) => {
                      const hasOverrides = user.customPermissions && Object.keys(user.customPermissions).length > 0;
                      return (
                        <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                                <p className="text-[9px] text-gray-400 truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {hasOverrides ? (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                  <Key className="w-3 h-3" /> Overridden
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                  <Shield className="w-3 h-3" /> Standard
                                </div>
                              )}
                              <Link href={`/users/${user._id}/edit`} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500"><Edit className="w-3 h-3" /></Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Analytics - Compact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Activity className="w-4 h-4" /></div>
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Utilization</p>
                <p className="text-sm font-bold text-gray-700">Moderate</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Integrity</p>
                <p className="text-sm font-bold text-gray-700">Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getActionLabel(action: string): string {
  const actionLabels: Record<string, string> = {
    'view': 'V',
    'create': 'C', 
    'update': 'U',
    'delete': 'D',
    'export': 'E'
  }
  return actionLabels[action] || action.charAt(0).toUpperCase()
}

function getPermissionsList(role: any) {
  if (!role?.permissions) return []
  const permissions: string[] = []
  Object.entries(role.permissions).forEach(([module, actions]) => {
    Object.entries(actions as any).forEach(([action, enabled]) => {
      if (enabled) permissions.push(`${module}.${action}`)
    })
  })
  return permissions
}

function parseActions(actions: any) {
  if (typeof actions === 'string') {
    return {
      view: actions.includes('r'),
      create: actions.includes('c'),
      update: actions.includes('u'),
      delete: actions.includes('d'),
      export: actions.includes('e')
    }
  }
  const actionsObj = actions || {}
  return {
    view: !!actionsObj.view || !!actionsObj.r,
    create: !!actionsObj.create || !!actionsObj.c,
    update: !!actionsObj.update || !!actionsObj.u,
    delete: !!actionsObj.delete || !!actionsObj.d,
    export: !!actionsObj.export || !!actionsObj.e
  }
}

function getModulePermissions(role: any) {
  if (!role?.permissions) return []

  // Get only relevant modules for this role
  const relevantModules = getModulesForRole(role.slug)

  return relevantModules.map(module => {
    const rawActions = role.permissions[module] || ''
    const actions = parseActions(rawActions)
    return {
      module,
      actions,
      enabledCount: Object.values(actions).filter(Boolean).length
    }
  })
}
