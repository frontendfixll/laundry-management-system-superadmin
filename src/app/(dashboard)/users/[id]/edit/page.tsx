'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
    EyeOff,
    Search,
    RefreshCw
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

// Use central module definitions instead of hardcoded array
const ALL_MODULES = ALL_MODULE_DEFINITIONS

export default function EditUserPage() {
    const router = useRouter()
    const params = useParams()
    const userId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [loadingRoles, setLoadingRoles] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [roles, setRoles] = useState<Role[]>([])
    const [showPermissions, setShowPermissions] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roleId: '',
        isActive: true
    })

    const [customPermissions, setCustomPermissions] = useState<Record<string, any>>({})
    const [originalUser, setOriginalUser] = useState<any>(null)

    // Filter modules based on selected role
    const MODULES = React.useMemo(() => {
        if (!formData.roleId) return ALL_MODULES

        const selectedRole = roles.find(r => r._id === formData.roleId)
        if (!selectedRole) return ALL_MODULES

        const relevantModuleIds = getModulesForRole(selectedRole.slug)
        return ALL_MODULES.filter(module => relevantModuleIds.includes(module.id))
    }, [formData.roleId, roles])

    // Fetch roles and user data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('auth-storage')
                if (!token) throw new Error('No auth token found')
                const parsed = JSON.parse(token)
                const authToken = parsed.state?.token
                if (!authToken) throw new Error('Invalid auth token')

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

                // Fetch roles
                const rolesRes = await fetch(`${API_URL}/superadmin/rbac/roles`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
                const rolesData = await rolesRes.json()
                if (rolesData.success) {
                    setRoles(rolesData.data.roles)
                }

                // Fetch user
                const userRes = await fetch(`${API_URL}/superadmin/rbac/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
                const userData = await userRes.json()
                if (userData.success) {
                    const u = userData.data.user
                    setOriginalUser(u)
                    setFormData({
                        name: u.name,
                        email: u.email,
                        roleId: u.roles[0]?._id || '',
                        isActive: u.isActive
                    })

                    // Handle existing custom permissions (merging with role defaults for UI)
                    const userOverrides = u.customPermissions || {}
                    const userRoleId = u.roles[0]?._id
                    const userRole = rolesData.data.roles.find((r: any) => r._id === userRoleId)

                    if (userRole) {
                        const SHORT_CODES: Record<string, string> = { 'r': 'view', 'c': 'create', 'u': 'update', 'd': 'delete', 'e': 'export' }
                        const mergedPermissions: Record<string, any> = {}

                        MODULES.forEach(module => {
                            const rolePermString = userRole.permissions[module.id] || ''
                            const roleActions = {
                                view: rolePermString.includes('r'),
                                create: rolePermString.includes('c'),
                                update: rolePermString.includes('u'),
                                delete: rolePermString.includes('d'),
                                export: rolePermString.includes('e')
                            }

                            const overrides = userOverrides[module.id] || {}
                            // Merge role actions with user overrides
                            mergedPermissions[module.id] = {
                                ...roleActions,
                                ...overrides
                            }
                        })
                        setCustomPermissions(mergedPermissions)

                        // If user has any overrides, show the section
                        if (Object.keys(userOverrides).length > 0) {
                            setShowPermissions(true)
                        }
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch data')
            } finally {
                setLoading(false)
                setLoadingRoles(false)
            }
        }

        fetchData()
    }, [userId])

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handlePermissionChange = (moduleId: string, action: string, value: boolean) => {
        setCustomPermissions(prev => ({
            ...prev,
            [moduleId]: {
                ...(prev[moduleId] || {}),
                [action]: value
            }
        }))
    }

    const toggleAllModulePermissions = (moduleId: string, enable: boolean) => {
        setCustomPermissions(prev => ({
            ...prev,
            [moduleId]: {
                view: enable, create: enable, update: enable, delete: enable, export: enable
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            const token = localStorage.getItem('auth-storage')
            const parsed = JSON.parse(token!)
            const authToken = parsed.state?.token
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

            const selectedRole = roles.find(r => r._id === formData.roleId)

            // Calculate delta before sending
            const deltaPermissions: Record<string, any> = {}
            if (selectedRole) {
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
                    if (hasChange) deltaPermissions[module.id] = moduleDelta
                })
            }

            const response = await fetch(`${API_URL}/superadmin/rbac/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    ...formData,
                    customPermissions: deltaPermissions
                })
            })

            if (response.ok) {
                window.location.href = '/users'
            } else {
                const data = await response.json()
                setError(data.message || 'Update failed')
            }
        } catch (err) {
            setError('Update failed')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading user details...</div>

    const selectedRole = roles.find(role => role._id === formData.roleId)

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/users" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="text-2xl font-bold font-heading">Edit Platform User</h1>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500" required />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Role Selection</h2>
                    <select value={formData.roleId} onChange={e => handleInputChange('roleId', e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Role</option>
                        {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                    {selectedRole && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4 border border-blue-50">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: selectedRole.color + '20', color: selectedRole.color }}><Shield className="w-5 h-5" /></div>
                            <div>
                                <div className="font-semibold">{selectedRole.name}</div>
                                <div className="text-sm text-gray-500">{selectedRole.description}</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between p-4 bg-purple-50/50 rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium text-purple-900">Permission Tuning</h4>
                            <p className="text-xs text-purple-600">Advanced: Override role defaults for this specific user</p>
                        </div>
                        <button type="button" onClick={() => setShowPermissions(!showPermissions)} className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-50">
                            {showPermissions ? 'Hide Advanced' : 'Fine-tune Permissions'}
                        </button>
                    </div>
                </div>

                {showPermissions && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-lg font-semibold">User-Specific Overrides</h3>
                        <div className="space-y-4">
                            {MODULES.map(module => (
                                <div key={module.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">{module.label}</span>
                                        <div className="space-x-2">
                                            <button type="button" onClick={() => toggleAllModulePermissions(module.id, true)} className="text-xs text-blue-600 hover:underline">Enable All</button>
                                            <button type="button" onClick={() => toggleAllModulePermissions(module.id, false)} className="text-xs text-red-600 hover:underline">Disable All</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {['view', 'create', 'update', 'delete', 'export'].map(action => (
                                            <label key={action} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={customPermissions[module.id]?.[action] || false}
                                                    onChange={e => handlePermissionChange(module.id, action, e.target.checked)}
                                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">{action}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-6">
                    <Link href="/users" className="px-6 py-2 text-gray-500 hover:text-gray-700">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update User
                    </button>
                </div>
            </form>
        </div>
    )
}
