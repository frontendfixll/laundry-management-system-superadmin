'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Shield,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Crown,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react'
import Link from 'next/link'
import { MODULE_LABELS } from '@/config/moduleDefinitions'
import { getModulesForRole } from '@/config/roleModules'

interface Permission {
  module: string
  actions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
    export: boolean
  }
}

interface PlatformRole {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  isDefault: boolean
  isActive: boolean
  permissions: Record<string, Record<string, boolean>>
}

// Use central module labels instead of hardcoded
const moduleLabels = MODULE_LABELS

const predefinedColors = [
  '#dc2626', '#2563eb', '#059669', '#7c3aed', '#ea580c',
  '#0891b2', '#be123c', '#4338ca', '#0d9488', '#c2410c'
]

export default function EditPlatformRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: predefinedColors[0],
    isActive: true
  })

  const [originalRole, setOriginalRole] = useState<PlatformRole | null>(null)

  const fetchRole = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/roles/${roleId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        const role = data.data.role
        setOriginalRole(role)

        // Set form data
        setFormData({
          name: role.name,
          description: role.description || '',
          color: role.color,
          isActive: role.isActive
        })
      } else {
        throw new Error(data.message || 'Failed to fetch role')
      }
    } catch (error) {
      console.error('Error fetching role:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch role')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (roleId) {
      fetchRole()
    }
  }, [roleId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Role name is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laundrylobby-backend-1.vercel.app/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          color: formData.color,
          isActive: formData.isActive
          // Permissions are not editable - managed per user
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update role')
      }

      const data = await response.json()
      if (data.success) {
        // Redirect to role details
        router.push(`/rbac/roles/${roleId}`)
      } else {
        throw new Error(data.message || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setError(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading role details...</p>
        </div>
      </div>
    )
  }

  if (error && !originalRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Role</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/rbac/roles"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Roles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/rbac/roles/${roleId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Platform Role</h1>
            <p className="text-gray-600 mt-1">
              Modify role permissions and settings
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Platform Finance Admin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={originalRole?.isDefault}
              />
              {originalRole?.isDefault && (
                <p className="text-xs text-gray-500 mt-1">
                  Default roles cannot be renamed
                </p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Theme
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: formData.color }}
                />
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {predefinedColors.map((color, index) => (
                    <option key={color} value={color}>
                      Color {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role's purpose and responsibilities..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Role</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Inactive roles cannot be assigned to users
              </p>
            </div>
          </div>
        </div>

        {/* Info Alert - Permissions managed per user */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Role Permissions
              </h3>
              <p className="text-sm text-blue-700">
                Permissions for this role are managed at the user level. To modify permissions,
                edit individual users and customize their permissions under the <strong>Users</strong> section.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                This prevents accidental changes that would affect all users assigned to this role.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.color + '20', color: formData.color }}
              >
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {formData.name || 'Role Name'}
                </h3>
                <p className="text-sm text-gray-500">{originalRole?.name || formData.name}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {formData.description || 'Role description will appear here...'}
            </p>

            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: formData.color + '20',
                  color: formData.color,
                  border: `1px solid ${formData.color}40`
                }}
              >
                {formData.name || 'Role'}
              </span>

              <div className="flex items-center space-x-1">
                {formData.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Link
            href={`/rbac/roles/${roleId}`}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}