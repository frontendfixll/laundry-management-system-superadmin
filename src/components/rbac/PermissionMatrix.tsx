'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

// Permission modules and actions matching backend
const MODULES = [
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'customers', label: 'Customers', icon: '👥' },
  { key: 'branches', label: 'Branches', icon: '🏢' },
  { key: 'services', label: 'Services', icon: '🧺' },
  { key: 'support', label: 'Support Tickets', icon: '🎫' },
  { key: 'financial', label: 'Financial', icon: '💰' },
  { key: 'reports', label: 'Reports', icon: '📊' },
  { key: 'users', label: 'Users', icon: '👤' },
  { key: 'settings', label: 'Settings', icon: '⚙️' }
]

const COMMON_ACTIONS = ['view', 'create', 'update', 'delete']

const ADVANCED_ACTIONS: Record<string, string[]> = {
  orders: ['assign', 'cancel', 'refund'],
  support: ['respond', 'resolve', 'escalate', 'assign'],
  financial: ['approve', 'export'],
  reports: ['export'],
  users: ['assignRole'],
  services: ['approveChanges']
}

const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  assign: 'Assign',
  cancel: 'Cancel',
  refund: 'Refund',
  approve: 'Approve',
  export: 'Export',
  assignRole: 'Assign Role',
  approveChanges: 'Approve Changes',
  respond: 'Respond',
  resolve: 'Resolve',
  escalate: 'Escalate'
}

interface Permissions {
  [module: string]: {
    [action: string]: boolean
  }
}

interface PermissionMatrixProps {
  permissions: Permissions
  onChange: (permissions: Permissions) => void
  maxPermissions?: Permissions // For staff - can't exceed admin's permissions
  disabled?: boolean
  compact?: boolean
}

export function PermissionMatrix({ 
  permissions, 
  onChange, 
  maxPermissions,
  disabled = false,
  compact = false
}: PermissionMatrixProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    compact ? [] : MODULES.map(m => m.key)
  )

  const getModuleActions = (moduleKey: string) => {
    const actions = [...COMMON_ACTIONS]
    if (ADVANCED_ACTIONS[moduleKey]) {
      actions.push(...ADVANCED_ACTIONS[moduleKey])
    }
    return actions
  }

  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    )
  }

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    if (disabled) return
    
    // Check if exceeds max permissions (for staff)
    if (value && maxPermissions && !maxPermissions[module]?.[action]) {
      return // Can't enable permission that admin doesn't have
    }

    const newPermissions = {
      ...permissions,
      [module]: {
        ...permissions[module],
        [action]: value
      }
    }
    onChange(newPermissions)
  }

  const toggleAllModulePermissions = (moduleKey: string, enable: boolean) => {
    if (disabled) return
    
    const actions = getModuleActions(moduleKey)
    const newModulePerms: Record<string, boolean> = {}
    
    actions.forEach(action => {
      // Check max permissions for staff
      if (enable && maxPermissions && !maxPermissions[moduleKey]?.[action]) {
        newModulePerms[action] = false
      } else {
        newModulePerms[action] = enable
      }
    })

    onChange({
      ...permissions,
      [moduleKey]: newModulePerms
    })
  }

  const getModulePermissionCount = (moduleKey: string) => {
    const actions = getModuleActions(moduleKey)
    const enabled = actions.filter(a => permissions[moduleKey]?.[a]).length
    return { enabled, total: actions.length }
  }

  const isPermissionDisabled = (module: string, action: string) => {
    if (disabled) return true
    if (maxPermissions && !maxPermissions[module]?.[action]) return true
    return false
  }

  return (
    <div className="space-y-2">
      {MODULES.map(module => {
        const isExpanded = expandedModules.includes(module.key)
        const { enabled, total } = getModulePermissionCount(module.key)
        const actions = getModuleActions(module.key)
        
        return (
          <div key={module.key} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Module Header */}
            <div 
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                enabled > 0 ? 'bg-purple-50' : 'bg-white'
              }`}
              onClick={() => toggleModule(module.key)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{module.icon}</span>
                <span className="font-medium text-gray-800">{module.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  enabled === total 
                    ? 'bg-green-100 text-green-700' 
                    : enabled > 0 
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {enabled}/{total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!disabled && (
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleAllModulePermissions(module.key, true)}
                      className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllModulePermissions(module.key, false)}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      None
                    </button>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Permissions Grid */}
            {isExpanded && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {actions.map(action => {
                    const isChecked = permissions[module.key]?.[action] || false
                    const isDisabledPerm = isPermissionDisabled(module.key, action)
                    const isAdvanced = ADVANCED_ACTIONS[module.key]?.includes(action)
                    
                    return (
                      <label
                        key={action}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isDisabledPerm 
                            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                            : isChecked 
                              ? 'bg-purple-100 border border-purple-300' 
                              : 'bg-white border border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handlePermissionChange(module.key, action, e.target.checked)}
                          disabled={isDisabledPerm}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                          isChecked 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${isAdvanced ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>
                          {ACTION_LABELS[action]}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
