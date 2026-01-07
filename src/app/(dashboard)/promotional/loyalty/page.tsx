'use client'

import { useState, useEffect } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import {
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Filter,
  Globe,
  Building2,
  Award,
  CreditCard,
  TrendingUp,
  Target,
  DollarSign,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface LoyaltyProgram {
  _id: string
  name: string
  description?: string
  type: 'points' | 'tiered' | 'punch_card' | 'cashback' | 'subscription'
  isActive: boolean
  isGlobal: boolean
  applicableTenancies: Array<{
    _id: string
    name: string
    slug: string
  }>
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  createdAt: string
}

interface Tenancy {
  _id: string
  name: string
  slug: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const PROGRAM_TYPES = [
  { value: 'points', label: 'Points-Based', icon: Award },
  { value: 'tiered', label: 'Tiered Membership', icon: TrendingUp },
  { value: 'punch_card', label: 'Punch Card', icon: Target },
  { value: 'cashback', label: 'Cashback', icon: DollarSign },
  { value: 'subscription', label: 'Subscription', icon: CreditCard }
]

export default function GlobalLoyaltyPage() {
  const { token } = useSuperAdminStore()
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'points' as const,
    autoEnrollment: true,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    isActive: true,
    applicableTenancies: [] as string[]
  })

  useEffect(() => {
    fetchPrograms()
    fetchTenancies()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const res = await fetch(`${API_BASE}/superadmin/promotional/loyalty?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPrograms(data.data.programs || [])
      }
    } catch (error) {
      console.error('Failed to fetch loyalty programs:', error)
      toast.error('Failed to load global loyalty programs')
    } finally {
      setLoading(false)
    }
  }

  const fetchTenancies = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/promotional/tenancies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setTenancies(data.data.tenancies || [])
      }
    } catch (error) {
      console.error('Failed to fetch tenancies:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingProgram
        ? `${API_BASE}/superadmin/promotional/loyalty/${editingProgram._id}`
        : `${API_BASE}/superadmin/promotional/loyalty`
      
      const method = editingProgram ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Global loyalty program ${editingProgram ? 'updated' : 'created'} successfully`)
        setShowModal(false)
        resetForm()
        fetchPrograms()
      } else {
        toast.error(data.message || 'Failed to save global loyalty program')
      }
    } catch (error) {
      console.error('Save loyalty program error:', error)
      toast.error('Failed to save global loyalty program')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (program: LoyaltyProgram) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description || '',
      type: program.type,
      autoEnrollment: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      isActive: program.isActive,
      applicableTenancies: program.applicableTenancies.map(t => t._id)
    })
    setShowModal(true)
  }

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this global loyalty program?')) return

    try {
      const res = await fetch(`${API_BASE}/superadmin/promotional/loyalty/${programId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Global loyalty program deleted successfully')
        fetchPrograms()
      } else {
        toast.error(data.message || 'Failed to delete loyalty program')
      }
    } catch (error) {
      console.error('Delete loyalty program error:', error)
      toast.error('Failed to delete loyalty program')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'points',
      autoEnrollment: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      isActive: true,
      applicableTenancies: []
    })
    setEditingProgram(null)
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && program.isActive) ||
                         (statusFilter === 'inactive' && !program.isActive)
    const matchesType = typeFilter === 'all' || program.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getProgramTypeInfo = (type: string) => {
    return PROGRAM_TYPES.find(t => t.value === type) || PROGRAM_TYPES[0]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Loyalty Programs</h1>
          <p className="text-gray-600">Create and manage global loyalty programs across tenancies</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Global Loyalty Program
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search global loyalty programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {PROGRAM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <button
            onClick={fetchPrograms}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No global loyalty programs found</h3>
            <p className="text-gray-600 mb-4">Create your first global loyalty program to get started</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Create Global Loyalty Program
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicable Tenancies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrograms.map((program) => {
                  const typeInfo = getProgramTypeInfo(program.type)
                  const TypeIcon = typeInfo.icon

                  return (
                    <tr key={program._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-900">{program.name}</span>
                          </div>
                          {program.description && (
                            <div className="text-sm text-gray-500 mt-1">{program.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-purple-500" />
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {typeInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {program.applicableTenancies.length === 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Globe className="w-3 h-3 mr-1" />
                              All Tenancies
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Building2 className="w-3 h-3 mr-1" />
                                {program.applicableTenancies.length} selected
                              </span>
                              <div className="text-xs text-gray-500">
                                {program.applicableTenancies.slice(0, 2).map(t => t.name).join(', ')}
                                {program.applicableTenancies.length > 2 && ` +${program.applicableTenancies.length - 2} more`}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{program.totalMembers.toLocaleString()} total</div>
                          <div className="text-green-600">{program.activeMembers.toLocaleString()} active</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            program.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {program.isActive ? (
                            <>
                              <ToggleRight className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(program)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(program._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                {editingProgram ? 'Edit Global Loyalty Program' : 'Create New Global Loyalty Program'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Global VIP Rewards"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {PROGRAM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your global loyalty program..."
                />
              </div>

              {/* Applicable Tenancies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applicable Tenancies
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.applicableTenancies.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, applicableTenancies: [] })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-green-600">All Tenancies (Global)</span>
                    </label>
                    
                    {tenancies.map(tenancy => (
                      <label key={tenancy._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.applicableTenancies.includes(tenancy._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                applicableTenancies: [...formData.applicableTenancies, tenancy._id]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                applicableTenancies: formData.applicableTenancies.filter(id => id !== tenancy._id)
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{tenancy.name} (@{tenancy.slug})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (program will be available across selected tenancies)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProgram ? 'Update Global Loyalty Program' : 'Create Global Loyalty Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}