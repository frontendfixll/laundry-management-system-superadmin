'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import {
  Settings,
  Search,
  Download,
  Shield,
  Users,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

const CODES: Record<string, string> = { r: 'view', c: 'create', u: 'update', d: 'delete', e: 'export' }

interface PermissionEntry {
  module: string
  action: string
  actionCode: string
  roles: { name: string; slug: string; isActive: boolean }[]
}

export default function PermissionMappingsPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [modules, setModules] = useState<string[]>([])

  useEffect(() => {
    fetchPermissions()
  }, [searchQuery, selectedModule])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const data = await superAdminApi.get('/audit/rbac/permissions')

      if (data.success) {
        const rolesData = data.data?.data || data.data || []
        setRoles(Array.isArray(rolesData) ? rolesData : [])

        // Build permission matrix: flatten all roles' permissions into per-module-per-action entries
        const matrix: PermissionEntry[] = []
        const moduleSet = new Set<string>()

        ;(Array.isArray(rolesData) ? rolesData : []).forEach((role: any) => {
          const perms = role.permissions || {}
          Object.entries(perms).forEach(([mod, permStr]: [string, any]) => {
            if (typeof permStr === 'string' && permStr.length > 0 && mod !== '$init') {
              moduleSet.add(mod)
              permStr.split('').forEach((code: string) => {
                const action = CODES[code] || code
                const existing = matrix.find(m => m.module === mod && m.actionCode === code)
                if (existing) {
                  if (!existing.roles.find(r => r.slug === role.slug)) {
                    existing.roles.push({ name: role.name, slug: role.slug, isActive: role.isActive })
                  }
                } else {
                  matrix.push({
                    module: mod,
                    action,
                    actionCode: code,
                    roles: [{ name: role.name, slug: role.slug, isActive: role.isActive }]
                  })
                }
              })
            }
          })
        })

        matrix.sort((a, b) => a.module.localeCompare(b.module) || a.action.localeCompare(b.action))
        setPermissionMatrix(matrix)
        setModules(Array.from(moduleSet).sort())
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setRoles([])
      setPermissionMatrix([])
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'text-blue-700 bg-blue-100'
      case 'create': return 'text-green-700 bg-green-100'
      case 'update': return 'text-yellow-700 bg-yellow-100'
      case 'delete': return 'text-red-700 bg-red-100'
      case 'export': return 'text-purple-700 bg-purple-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatModule = (mod: string) => mod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  // Filter
  const filtered = permissionMatrix.filter(entry => {
    if (selectedModule !== 'all' && entry.module !== selectedModule) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return entry.module.toLowerCase().includes(q) || entry.action.toLowerCase().includes(q) ||
        entry.roles.some(r => r.name.toLowerCase().includes(q))
    }
    return true
  })

  const totalPermissions = permissionMatrix.length
  const deletePerms = permissionMatrix.filter(e => e.action === 'delete').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Permission Mappings
            </h1>
            <p className="text-blue-100 mt-2">
              Cross-role permission matrix showing which roles have which permissions
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total: {totalPermissions} permission entries</p>
            <p className="text-xs text-blue-200">{roles.length} roles, {modules.length} modules</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 uppercase">Total Entries</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalPermissions}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-700 uppercase">Modules</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{modules.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 uppercase">Roles</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{roles.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <p className="text-xs font-semibold text-red-700 uppercase">Delete Perms</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{deletePerms}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-4 border border-yellow-200">
          <p className="text-xs font-semibold text-yellow-700 uppercase">Export Perms</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{permissionMatrix.filter(e => e.action === 'export').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search module, action, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules ({modules.length})</option>
            {modules.map(mod => (
              <option key={mod} value={mod}>{formatModule(mod)}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const csv = ['Module,Action,Roles'].concat(
                permissionMatrix.map(e => `${e.module},${e.action},"${e.roles.map(r => r.name).join(', ')}"`)
              ).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'permission-mappings.csv'; a.click()
              URL.revokeObjectURL(url)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Permission Matrix</h3>
          <p className="text-sm text-gray-600 mt-1">Each row shows a module-action pair and which roles have it</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles with Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Key className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">No permission entries found</p>
                  </td>
                </tr>
              )}
              {filtered.map((entry, i) => (
                <tr key={`${entry.module}-${entry.actionCode}-${i}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{formatModule(entry.module)}</p>
                    <p className="text-xs text-gray-500 font-mono">{entry.module}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(entry.action)}`}>
                      {entry.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.roles.map((role, j) => (
                        <span key={j} className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-700">{entry.roles.length}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}