'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  ArrowLeft,
  Save,
  Mail,
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { ALL_MODULE_DEFINITIONS } from '@/config/moduleDefinitions'
import { getModulesForRole } from '@/config/roleModules'

interface Role {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  isDefault: boolean
  userCount: number
  permissions: Record<string, string>
}

interface Permission {
  module: string
  label: string
  actions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
    export: boolean
  }
}

// Use central module definitions instead of hardcoded array
const ALL_MODULES = ALL_MODULE_DEFINITIONS

export default function CreateUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [showPermissions, setShowPermissions] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    isActive: true
  })

  // Module permissions state initialized as false
  const [customPermissions, setCustomPermissions] = useState<Record<string, any>>({})

  // Filter modules based on selected role
  const MODULES = React.useMemo(() => {
    if (!formData.roleId) return ALL_MODULES

    const selectedRole = roles.find(r => r._id === formData.roleId)
    if (!selectedRole) return ALL_MODULES

    const relevantModuleIds = getModulesForRole(selectedRole.slug)
    return ALL_MODULES.filter(module => relevantModuleIds.includes(module.id))
  }, [formData.roleId, roles])

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('auth-storage')
        if (!token) throw new Error('No auth token found')

        const parsed = JSON.parse(token)
        const authToken = parsed.state?.token
        if (!authToken) throw new Error('Invalid auth token')

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        const response = await fetch(`${API_URL}/superadmin/rbac/roles`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch roles')
        }

        const data = await response.json()
        if (data.success) {
          // Filter out Super Admin role (cannot create new SuperAdmins)
          const availableRoles = data.data.roles.filter((role: Role) =>
            role.slug !== 'super-admin'
          )
          setRoles(availableRoles)
        } else {
          throw new Error(data.message || 'Failed to fetch roles')
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch roles')
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  // Sync permissions when role is selected
  useEffect(() => {
    if (formData.roleId) {
      const selectedRole = roles.find(r => r._id === formData.roleId)
      if (selectedRole && selectedRole.permissions) {
        const newPermissions: Record<string, any> = {}

        // Convert compact strings back to objects for UI
        const SHORT_CODES: Record<string, string> = { 'r': 'view', 'c': 'create', 'u': 'update', 'd': 'delete', 'e': 'export' }

        MODULES.forEach(module => {
          const permString = selectedRole.permissions[module.id] || ''
          const actions: Record<string, boolean> = {
            view: permString.includes('r'),
            create: permString.includes('c'),
            update: permString.includes('u'),
            delete: permString.includes('d'),
            export: permString.includes('e')
          }
          newPermissions[module.id] = actions
        })

        setCustomPermissions(newPermissions)
        // Show permissions section when a role is selected to allow fine-tuning - Changed to stay false by default
        // setShowPermissions(true)
      }
    }
  }, [formData.roleId, roles])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handlePermissionChange = (moduleId: string, action: string, value: boolean) => {
    setCustomPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || { view: false, create: false, update: false, delete: false, export: false }),
        [action]: value
      }
    }))
  }

  const toggleAllModulePermissions = (moduleId: string, enable: boolean) => {
    setCustomPermissions(prev => ({
      ...prev,
      [moduleId]: {
        view: enable,
        create: enable,
        update: enable,
        delete: enable,
        export: enable
      }
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!formData.password) {
      setError('Password is required')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (!formData.roleId) {
      setError('Please select a role')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token found')

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      // Calculate delta between selected role and custom modifications
      const deltaPermissions: Record<string, any> = {}
      if (selectedRole && selectedRole.permissions) {
        const SHORT_CODES: Record<string, string> = { 'r': 'view', 'c': 'create', 'u': 'update', 'd': 'delete', 'e': 'export' }

        MODULES.forEach(module => {
          const permString = selectedRole.permissions[module.id] || ''
          const baseActions = {
            view: permString.includes('r'),
            create: permString.includes('c'),
            update: permString.includes('u'),
            delete: permString.includes('d'),
            export: permString.includes('e')
          }

          const currentActions = customPermissions[module.id] || baseActions
          const moduleDelta: Record<string, boolean> = {}
          let hasChange = false

          Object.keys(currentActions).forEach(action => {
            if (currentActions[action] !== baseActions[action]) {
              moduleDelta[action] = currentActions[action]
              hasChange = true
            }
          })

          if (hasChange) {
            deltaPermissions[module.id] = moduleDelta
          }
        })
      }

      const response = await fetch(`${API_URL}/superadmin/rbac/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          roleId: formData.roleId,
          isActive: formData.isActive,
          customPermissions: deltaPermissions // Send only differences
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create user')
      }

      const data = await response.json()
      if (data.success) {
        // Redirect to users list
        // router.push('/users')
        window.location.href = '/users' // Use window location to ensure fresh load
      } else {
        throw new Error(data.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setError(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = roles.find(role => role._id === formData.roleId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/users"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Platform User</h1>
            <p className="text-gray-600 mt-1">
              Create a new user with platform-level access
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g., john@company.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Selection</h2>

          {loadingRoles ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.roleId}
                    onChange={(e) => handleInputChange('roleId', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Preview */}
              {selectedRole && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedRole.color + '20', color: selectedRole.color }}
                    >
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedRole.name}</h3>
                      <p className="text-sm text-gray-500">Platform Role</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{selectedRole.description}</p>
                </div>
              )}
            </>
          )}

          {/* Custom Permissions Toggle */}
          {selectedRole && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Custom Permissions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Override role defaults for this specific user only</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPermissions(!showPermissions)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showPermissions
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
              >
                {showPermissions ? 'Hide Customizations' : 'Customize Permissions'}
              </button>
            </div>
          )}

          {/* Status */}
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Active User</span>
            </label>
          </div>
        </div>

        {/* Custom Permissions Selection */}
        {showPermissions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Fine-tune Permissions</h2>
              <p className="text-sm text-gray-500">Override role permissions for this specific user</p>
            </div>

            <div className="space-y-4">
              {MODULES.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{module.label}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleAllModulePermissions(module.id, true)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        Enable All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => toggleAllModulePermissions(module.id, false)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Disable All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['view', 'create', 'update', 'delete', 'export'].map((action) => (
                      <label key={action} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customPermissions[module.id]?.[action] || false}
                          onChange={(e) => handlePermissionChange(module.id, action, e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Link
            href="/users"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || loadingRoles || !formData.name.trim() || !formData.email.trim() || !formData.password || !formData.roleId}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create User'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
