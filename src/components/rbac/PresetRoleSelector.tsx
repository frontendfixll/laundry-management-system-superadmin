'use client'

import { useState, useEffect } from 'react'
import { Shield, Eye, Briefcase, DollarSign, Building2, Headphones } from 'lucide-react'

interface PresetRole {
  key: string
  name: string
  description: string
  permissions: Record<string, Record<string, boolean>>
}

interface PresetRoleSelectorProps {
  onSelect: (permissions: Record<string, Record<string, boolean>>) => void
  selectedPreset?: string
  disabled?: boolean
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  viewer: <Eye className="w-5 h-5" />,
  manager: <Briefcase className="w-5 h-5" />,
  financeAdmin: <DollarSign className="w-5 h-5" />,
  supportAdmin: <Headphones className="w-5 h-5" />,
  branchManager: <Building2 className="w-5 h-5" />
}

const PRESET_COLORS: Record<string, string> = {
  viewer: 'from-gray-500 to-slate-600',
  manager: 'from-blue-500 to-indigo-600',
  financeAdmin: 'from-green-500 to-emerald-600',
  supportAdmin: 'from-orange-500 to-amber-600',
  branchManager: 'from-purple-500 to-pink-600'
}

// Default presets (matching backend)
const DEFAULT_PRESETS: PresetRole[] = [
  {
    key: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to all modules',
    permissions: {
      orders: { view: true, create: false, update: false, delete: false, assign: false, cancel: false, refund: false },
      customers: { view: true, create: false, update: false, delete: false },
      branches: { view: true, create: false, update: false, delete: false },
      services: { view: true, create: false, update: false, delete: false, approveChanges: false },
      support: { view: true, create: false, update: false, delete: false, respond: false, resolve: false, escalate: false, assign: false },
      financial: { view: true, create: false, update: false, delete: false, approve: false, export: false },
      reports: { view: true, create: false, update: false, delete: false, export: false },
      users: { view: true, create: false, update: false, delete: false, assignRole: false },
      settings: { view: true, create: false, update: false, delete: false }
    }
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Operational access with order management',
    permissions: {
      orders: { view: true, create: true, update: true, delete: false, assign: true, cancel: true, refund: false },
      customers: { view: true, create: true, update: true, delete: false },
      branches: { view: true, create: false, update: false, delete: false },
      services: { view: true, create: false, update: false, delete: false, approveChanges: false },
      support: { view: true, create: false, update: true, delete: false, respond: true, resolve: true, escalate: false, assign: false },
      financial: { view: true, create: false, update: false, delete: false, approve: false, export: false },
      reports: { view: true, create: false, update: false, delete: false, export: true },
      users: { view: true, create: true, update: true, delete: false, assignRole: false },
      settings: { view: true, create: false, update: false, delete: false }
    }
  },
  {
    key: 'financeAdmin',
    name: 'Finance Admin',
    description: 'Financial operations and reporting',
    permissions: {
      orders: { view: true, create: false, update: false, delete: false, assign: false, cancel: false, refund: true },
      customers: { view: true, create: false, update: false, delete: false },
      branches: { view: true, create: false, update: false, delete: false },
      services: { view: true, create: false, update: false, delete: false, approveChanges: false },
      support: { view: false, create: false, update: false, delete: false, respond: false, resolve: false, escalate: false, assign: false },
      financial: { view: true, create: true, update: true, delete: false, approve: true, export: true },
      reports: { view: true, create: true, update: false, delete: false, export: true },
      users: { view: true, create: false, update: false, delete: false, assignRole: false },
      settings: { view: false, create: false, update: false, delete: false }
    }
  },
  {
    key: 'supportAdmin',
    name: 'Support Admin',
    description: 'Full support ticket management',
    permissions: {
      orders: { view: true, create: false, update: false, delete: false, assign: false, cancel: false, refund: false },
      customers: { view: true, create: false, update: false, delete: false },
      branches: { view: true, create: false, update: false, delete: false },
      services: { view: true, create: false, update: false, delete: false, approveChanges: false },
      support: { view: true, create: true, update: true, delete: false, respond: true, resolve: true, escalate: true, assign: true },
      financial: { view: false, create: false, update: false, delete: false, approve: false, export: false },
      reports: { view: true, create: false, update: false, delete: false, export: false },
      users: { view: true, create: false, update: false, delete: false, assignRole: false },
      settings: { view: false, create: false, update: false, delete: false }
    }
  },
  {
    key: 'branchManager',
    name: 'Branch Manager',
    description: 'Full branch operations access',
    permissions: {
      orders: { view: true, create: true, update: true, delete: true, assign: true, cancel: true, refund: true },
      customers: { view: true, create: true, update: true, delete: false },
      branches: { view: true, create: false, update: true, delete: false },
      services: { view: true, create: true, update: true, delete: false, approveChanges: false },
      support: { view: true, create: true, update: true, delete: false, respond: true, resolve: true, escalate: true, assign: true },
      financial: { view: true, create: true, update: true, delete: false, approve: false, export: true },
      reports: { view: true, create: true, update: true, delete: false, export: true },
      users: { view: true, create: true, update: true, delete: true, assignRole: true },
      settings: { view: true, create: false, update: true, delete: false }
    }
  }
]

export function PresetRoleSelector({ onSelect, selectedPreset, disabled }: PresetRoleSelectorProps) {
  const [presets, setPresets] = useState<PresetRole[]>(DEFAULT_PRESETS)
  const [selected, setSelected] = useState<string | null>(selectedPreset || null)

  const handleSelect = (preset: PresetRole) => {
    if (disabled) return
    setSelected(preset.key)
    onSelect(preset.permissions)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-purple-600" />
        <span className="font-medium text-gray-700">Quick Presets</span>
        <span className="text-xs text-gray-500">(Click to auto-fill permissions)</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map(preset => (
          <button
            key={preset.key}
            type="button"
            onClick={() => handleSelect(preset)}
            disabled={disabled}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selected === preset.key
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PRESET_COLORS[preset.key]} flex items-center justify-center text-white mb-2`}>
              {PRESET_ICONS[preset.key]}
            </div>
            <h4 className="font-semibold text-gray-800">{preset.name}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{preset.description}</p>
            
            {selected === preset.key && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
