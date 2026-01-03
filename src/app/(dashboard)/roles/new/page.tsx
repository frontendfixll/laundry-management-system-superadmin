'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoles } from '@/hooks/useRoles'
import { 
  Shield, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  DollarSign,
  Settings,
  Users,
  FileText,
  Database,
  BarChart3,
  Crown,
  Key
} from 'lucide-react'
import Link from 'next/link'

const moduleIcons = {
  orders: FileText,
  customers: Users,
  inventory: Database,
  reports: BarChart3,
  settings: Settings,
  staff: Users,
  finances: DollarSign,
  analytics: BarChart3
}

const availableActions = ['create', 'read', 'update', 'delete', 'approve', 'export']

export default function NewRolePage() {
  const router = useRouter()
  const { createRole, loading } = useRoles()
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    level: 5,
    category: 'custom',
    permissions: [] as any[],
    settings: {
      canCreateUsers: false,
      canAssignRoles: false,
      canModifyBranch: false,
      canViewReports: false,
      canExportData: false,
      requireApproval: false,
      sessionTimeout: 8,
      maxConcurrentSessions: 3
    },
    financialLimits: {
      maxRefundAmount: 0,
      maxDiscountPercent: 0,
      maxOrderValue: 0,
      canProcessPayments: false,
      canViewFinancials: false
    },
    operationalLimits: {
      maxOrdersPerDay: 0,
      canCancelOrders: false,
      canModifyOrders: false,
      canAssignDrivers: false,
      canManageInventory: false
    },
    systemAccess: {
      dashboardAccess: true,
      mobileAppAccess: true,
      apiAccess: false,
      adminPanelAccess: false
    }
  })

  const [errors, setErrors] = useState<any>({})
  const [activeTab, setActiveTab] = useState('basic')

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) newErrors.name = 'Role name is required'
    if (!/^[a-z_]+$/.test(formData.name)) newErrors.name = 'Role name must be lowercase with underscores only'
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await createRole(formData)
      router.push('/superadmin/roles')
    } catch (error) {
      console.error('Create role error:', error)
    }
  }

  const addPermission = () => {
    setFormData({
      ...formData,
      permissions: [
        ...formData.permissions,
        {
          module: 'orders',
          actions: ['read'],
          restrictions: {}
        }
      ]
    })
  }

  const removePermission = (index: number) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter((_, i) => i !== index)
    })
  }

  const updatePermission = (index: number, field: string, value: any) => {
    const updatedPermissions = [...formData.permissions]
    if (field === 'actions') {
      updatedPermissions[index] = { ...updatedPermissions[index], [field]: value }
    } else if (field.startsWith('restrictions.')) {
      const restrictionField = field.replace('restrictions.', '')
      updatedPermissions[index] = {
        ...updatedPermissions[index],
        restrictions: {
          ...updatedPermissions[index].restrictions,
          [restrictionField]: value
        }
      }
    } else {
      updatedPermissions[index] = { ...updatedPermissions[index], [field]: value }
    }
    setFormData({ ...formData, permissions: updatedPermissions })
  }

  const toggleAction = (permissionIndex: number, action: string) => {
    const permission = formData.permissions[permissionIndex]
    const actions = permission.actions.includes(action)
      ? permission.actions.filter((a: string) => a !== action)
      : [...permission.actions, action]
    
    updatePermission(permissionIndex, 'actions', actions)
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Shield },
    { id: 'permissions', name: 'Permissions', icon: Key },
    { id: 'financial', name: 'Financial Limits', icon: DollarSign },
    { id: 'operational', name: 'Operational', icon: Settings },
    { id: 'system', name: 'System Access', icon: Crown }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/superadmin/roles"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Role</h1>
            <p className="text-gray-600 mt-1">Define permissions and access levels</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/superadmin/roles"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Role'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z_]/g, '') })}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., center_admin"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  <p className="text-gray-500 text-sm mt-1">Lowercase with underscores only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.displayName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Center Admin"
                  />
                  {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="management">Management</option>
                    <option value="operations">Operations</option>
                    <option value="support">Support</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authority Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>Level 1 - Highest Authority</option>
                    <option value={2}>Level 2 - Senior Management</option>
                    <option value={3}>Level 3 - Middle Management</option>
                    <option value={4}>Level 4 - Supervisory</option>
                    <option value={5}>Level 5 - Staff Level</option>
                    <option value={6}>Level 6 - Entry Level</option>
                  </select>
                  <p className="text-gray-500 text-sm mt-1">Lower numbers = higher authority</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the role's responsibilities and scope..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500 characters</p>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Module Permissions</h3>
                <button
                  onClick={addPermission}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Permission</span>
                </button>
              </div>

              {formData.permissions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No permissions added yet</p>
                  <p className="text-gray-500 text-sm">Add permissions to define what this role can do</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.permissions.map((permission, index) => {
                    const ModuleIcon = moduleIcons[permission.module as keyof typeof moduleIcons] || Settings
                    
                    return (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <ModuleIcon className="w-5 h-5 text-purple-600" />
                            <select
                              value={permission.module}
                              onChange={(e) => updatePermission(index, 'module', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="orders">Orders</option>
                              <option value="customers">Customers</option>
                              <option value="inventory">Inventory</option>
                              <option value="reports">Reports</option>
                              <option value="settings">Settings</option>
                              <option value="staff">Staff</option>
                              <option value="finances">Finances</option>
                              <option value="analytics">Analytics</option>
                            </select>
                          </div>
                          
                          <button
                            onClick={() => removePermission(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allowed Actions
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {availableActions.map((action) => (
                              <label key={action} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permission.actions.includes(action)}
                                  onChange={() => toggleAction(index, action)}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{action}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Restrictions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Amount (₹)
                            </label>
                            <input
                              type="number"
                              value={permission.restrictions?.maxAmount || ''}
                              onChange={(e) => updatePermission(index, 'restrictions.maxAmount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0 = no limit"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Discount (%)
                            </label>
                            <input
                              type="number"
                              value={permission.restrictions?.maxDiscount || ''}
                              onChange={(e) => updatePermission(index, 'restrictions.maxDiscount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="0 = no limit"
                              max="100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Time Restriction
                            </label>
                            <select
                              value={permission.restrictions?.timeRestriction || ''}
                              onChange={(e) => updatePermission(index, 'restrictions.timeRestriction', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">No restriction</option>
                              <option value="business_hours_only">Business hours only</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permission.restrictions?.branchRestriction || false}
                              onChange={(e) => updatePermission(index, 'restrictions.branchRestriction', e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">Restrict to own branch only</span>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.financialLimits.maxRefundAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialLimits: { ...formData.financialLimits, maxRefundAmount: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum refund amount this role can approve</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={formData.financialLimits.maxDiscountPercent}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialLimits: { ...formData.financialLimits, maxDiscountPercent: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="100"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum discount percentage allowed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.financialLimits.maxOrderValue}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialLimits: { ...formData.financialLimits, maxOrderValue: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum order value this role can handle (0 = no limit)</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.financialLimits.canProcessPayments}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialLimits: { ...formData.financialLimits, canProcessPayments: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Can process payments</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.financialLimits.canViewFinancials}
                    onChange={(e) => setFormData({
                      ...formData,
                      financialLimits: { ...formData.financialLimits, canViewFinancials: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Can view financial reports</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'operational' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Orders Per Day
                  </label>
                  <input
                    type="number"
                    value={formData.operationalLimits.maxOrdersPerDay || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      operationalLimits: { ...formData.operationalLimits, maxOrdersPerDay: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum orders this role can handle per day (0 = no limit)</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operationalLimits.canCancelOrders}
                    onChange={(e) => setFormData({
                      ...formData,
                      operationalLimits: { ...formData.operationalLimits, canCancelOrders: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Can cancel orders</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operationalLimits.canModifyOrders}
                    onChange={(e) => setFormData({
                      ...formData,
                      operationalLimits: { ...formData.operationalLimits, canModifyOrders: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Can modify orders</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operationalLimits.canAssignDrivers}
                    onChange={(e) => setFormData({
                      ...formData,
                      operationalLimits: { ...formData.operationalLimits, canAssignDrivers: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Can assign drivers</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.operationalLimits.canManageInventory}
                    onChange={(e) => setFormData({
                      ...formData,
                      operationalLimits: { ...formData.operationalLimits, canManageInventory: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Can manage inventory</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.settings.sessionTimeout}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, sessionTimeout: parseInt(e.target.value) || 8 }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    value={formData.settings.maxConcurrentSessions}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, maxConcurrentSessions: parseInt(e.target.value) || 3 }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">System Access</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.systemAccess.dashboardAccess}
                      onChange={(e) => setFormData({
                        ...formData,
                        systemAccess: { ...formData.systemAccess, dashboardAccess: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Dashboard access</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.systemAccess.mobileAppAccess}
                      onChange={(e) => setFormData({
                        ...formData,
                        systemAccess: { ...formData.systemAccess, mobileAppAccess: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Mobile app access</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.systemAccess.apiAccess}
                      onChange={(e) => setFormData({
                        ...formData,
                        systemAccess: { ...formData.systemAccess, apiAccess: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">API access</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.systemAccess.adminPanelAccess}
                      onChange={(e) => setFormData({
                        ...formData,
                        systemAccess: { ...formData.systemAccess, adminPanelAccess: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Admin panel access</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Role Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.canCreateUsers}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, canCreateUsers: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Can create users</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.canAssignRoles}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, canAssignRoles: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Can assign roles</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.canViewReports}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, canViewReports: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Can view reports</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.canExportData}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, canExportData: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Can export data</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.requireApproval}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, requireApproval: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require approval for sensitive operations</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
