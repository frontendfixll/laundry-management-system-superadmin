'use client'

import { useState, useEffect } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import {
  Users2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  DollarSign,
  Gift,
  TrendingUp,
  AlertCircle,
  X,
  Loader2,
  Filter,
  Globe,
  Building2,
  Link,
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface ReferralReward {
  type: 'credit' | 'coupon' | 'discount' | 'points' | 'free_service'
  value: number
  couponCode?: string
  serviceId?: string
  pointsType?: 'loyalty' | 'referral'
}

interface ReferralProgram {
  _id: string
  name: string
  description?: string
  referrerReward: ReferralReward
  refereeReward: ReferralReward
  minOrderValue: number
  maxReferralsPerUser: number
  referralCodeExpiry: number
  enableMultiLevel: boolean
  maxLevels: number
  levelRewards: Array<{
    level: number
    reward: ReferralReward
  }>
  startDate: string
  endDate: string
  isActive: boolean
  isGlobal: boolean
  applicableTenancies: Array<{
    _id: string
    name: string
    slug: string
  }>
  totalReferrals: number
  successfulReferrals: number
  totalRewardsGiven: number
  createdAt: string
}

interface Tenancy {
  _id: string
  name: string
  slug: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const REWARD_TYPES = [
  { value: 'credit', label: 'Account Credit', icon: DollarSign },
  { value: 'coupon', label: 'Coupon Code', icon: Gift },
  { value: 'discount', label: 'Discount Percentage', icon: TrendingUp },
  { value: 'points', label: 'Loyalty Points', icon: Award },
  { value: 'free_service', label: 'Free Service', icon: Gift }
]

export default function GlobalReferralsPage() {
  const { token } = useSuperAdminStore()
  const [programs, setPrograms] = useState<ReferralProgram[]>([])
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<ReferralProgram | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    referrerReward: {
      type: 'credit' as const,
      value: 10,
      couponCode: '',
      pointsType: 'referral' as const
    },
    refereeReward: {
      type: 'credit' as const,
      value: 5,
      couponCode: '',
      pointsType: 'referral' as const
    },
    minOrderValue: 0,
    maxReferralsPerUser: 0,
    referralCodeExpiry: 30,
    enableMultiLevel: false,
    maxLevels: 1,
    levelRewards: [] as Array<{
      level: number
      reward: ReferralReward
    }>,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
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

      const res = await fetch(`${API_BASE}/superadmin/promotional/referrals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPrograms(data.data.programs || [])
      }
    } catch (error) {
      console.error('Failed to fetch referral programs:', error)
      toast.error('Failed to load global referral programs')
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
        ? `${API_BASE}/superadmin/promotional/referrals/${editingProgram._id}`
        : `${API_BASE}/superadmin/promotional/referrals`
      
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
        toast.success(`Global referral program ${editingProgram ? 'updated' : 'created'} successfully`)
        setShowModal(false)
        resetForm()
        fetchPrograms()
      } else {
        toast.error(data.message || 'Failed to save global referral program')
      }
    } catch (error) {
      console.error('Save referral program error:', error)
      toast.error('Failed to save global referral program')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (program: ReferralProgram) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description || '',
      referrerReward: program.referrerReward,
      refereeReward: program.refereeReward,
      minOrderValue: program.minOrderValue,
      maxReferralsPerUser: program.maxReferralsPerUser,
      referralCodeExpiry: program.referralCodeExpiry,
      enableMultiLevel: program.enableMultiLevel,
      maxLevels: program.maxLevels,
      levelRewards: program.levelRewards,
      startDate: format(new Date(program.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(program.endDate), 'yyyy-MM-dd'),
      isActive: program.isActive,
      applicableTenancies: program.applicableTenancies.map(t => t._id)
    })
    setShowModal(true)
  }

  const handleDelete = async (programId: string) => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/promotional/referrals/${programId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Global referral program deleted successfully')
        fetchPrograms()
      } else {
        toast.error(data.message || 'Failed to delete referral program')
      }
    } catch (error) {
      console.error('Delete referral program error:', error)
      toast.error('Failed to delete referral program')
    }
    setDeleteConfirm(null)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      referrerReward: {
        type: 'credit',
        value: 10,
        couponCode: '',
        pointsType: 'referral'
      },
      refereeReward: {
        type: 'credit',
        value: 5,
        couponCode: '',
        pointsType: 'referral'
      },
      minOrderValue: 0,
      maxReferralsPerUser: 0,
      referralCodeExpiry: 30,
      enableMultiLevel: false,
      maxLevels: 1,
      levelRewards: [],
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      isActive: true,
      applicableTenancies: []
    })
    setEditingProgram(null)
  }

  const addLevelReward = () => {
    const newLevel = formData.levelRewards.length + 2 // Start from level 2
    setFormData({
      ...formData,
      levelRewards: [...formData.levelRewards, {
        level: newLevel,
        reward: {
          type: 'credit',
          value: 5,
          pointsType: 'referral'
        }
      }]
    })
  }

  const removeLevelReward = (index: number) => {
    setFormData({
      ...formData,
      levelRewards: formData.levelRewards.filter((_, i) => i !== index)
    })
  }

  const updateLevelReward = (index: number, updates: any) => {
    const newLevelRewards = [...formData.levelRewards]
    newLevelRewards[index] = { ...newLevelRewards[index], ...updates }
    setFormData({ ...formData, levelRewards: newLevelRewards })
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && program.isActive) ||
                         (statusFilter === 'inactive' && !program.isActive)
    
    return matchesSearch && matchesStatus
  })

  const formatReward = (reward: ReferralReward) => {
    switch (reward.type) {
      case 'credit':
        return `$${reward.value} credit`
      case 'coupon':
        return `${reward.value}% coupon`
      case 'discount':
        return `${reward.value}% discount`
      case 'points':
        return `${reward.value} points`
      case 'free_service':
        return 'Free service'
      default:
        return 'Unknown reward'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Referral Programs</h1>
          <p className="text-gray-600">Create and manage global referral programs across tenancies</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Global Referral Program
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
                placeholder="Search global referral programs..."
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
            <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No global referral programs found</h3>
            <p className="text-gray-600 mb-4">Create your first global referral program to get started</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Create Global Referral Program
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
                    Rewards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicable Tenancies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
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
                {filteredPrograms.map((program) => (
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
                        <div className="text-xs text-gray-400 mt-1">
                          Min Order: ${program.minOrderValue} • Expiry: {program.referralCodeExpiry} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Referrer:</span>
                          <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {formatReward(program.referrerReward)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Referee:</span>
                          <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatReward(program.refereeReward)}
                          </span>
                        </div>
                        {program.enableMultiLevel && (
                          <div className="text-xs text-purple-600">
                            Multi-level ({program.maxLevels} levels)
                          </div>
                        )}
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
                        <div className="text-gray-900">{program.totalReferrals} referrals</div>
                        <div className="text-green-600">{program.successfulReferrals} successful</div>
                        <div className="text-xs text-gray-500">
                          {program.totalReferrals > 0 
                            ? `${Math.round((program.successfulReferrals / program.totalReferrals) * 100)}% success rate`
                            : 'No referrals yet'
                          }
                        </div>
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
                          onClick={() => setDeleteConfirm({ isOpen: true, id: program._id })}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users2 className="w-5 h-5 text-purple-600" />
                {editingProgram ? 'Edit Global Referral Program' : 'Create New Global Referral Program'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., Global Referral Rewards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code Expiry (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.referralCodeExpiry}
                    onChange={(e) => setFormData({ ...formData, referralCodeExpiry: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
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
                  placeholder="Describe your global referral program..."
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

              {/* Referrer Reward */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Referrer Reward (Existing Customer)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward Type
                    </label>
                    <select
                      value={formData.referrerReward.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        referrerReward: { ...formData.referrerReward, type: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {REWARD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.referrerReward.type === 'credit' ? 'Amount ($)' : 
                       formData.referrerReward.type === 'points' ? 'Points' : 'Value (%)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.referrerReward.type === 'credit' ? '0.01' : '1'}
                      value={formData.referrerReward.value}
                      onChange={(e) => setFormData({
                        ...formData,
                        referrerReward: { ...formData.referrerReward, value: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Referee Reward */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Referee Reward (New Customer)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward Type
                    </label>
                    <select
                      value={formData.refereeReward.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        refereeReward: { ...formData.refereeReward, type: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {REWARD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.refereeReward.type === 'credit' ? 'Amount ($)' : 
                       formData.refereeReward.type === 'points' ? 'Points' : 'Value (%)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.refereeReward.type === 'credit' ? '0.01' : '1'}
                      value={formData.refereeReward.value}
                      onChange={(e) => setFormData({
                        ...formData,
                        refereeReward: { ...formData.refereeReward, value: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Program Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0 = no minimum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Referrals Per User
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxReferralsPerUser}
                    onChange={(e) => setFormData({ ...formData, maxReferralsPerUser: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0 = unlimited"
                  />
                </div>
              </div>

              {/* Multi-level Referrals */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableMultiLevel"
                    checked={formData.enableMultiLevel}
                    onChange={(e) => setFormData({ ...formData, enableMultiLevel: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="enableMultiLevel" className="text-sm text-gray-700">
                    Enable Multi-level Referrals
                  </label>
                </div>

                {formData.enableMultiLevel && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Level Rewards</h4>
                      <button
                        type="button"
                        onClick={addLevelReward}
                        className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Level
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Levels
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.maxLevels}
                          onChange={(e) => setFormData({ ...formData, maxLevels: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {formData.levelRewards.map((levelReward, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-600">Level {levelReward.level}</h5>
                          <button
                            type="button"
                            onClick={() => removeLevelReward(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Level
                            </label>
                            <input
                              type="number"
                              min="2"
                              value={levelReward.level}
                              onChange={(e) => updateLevelReward(index, { level: parseInt(e.target.value) || 2 })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Reward Type
                            </label>
                            <select
                              value={levelReward.reward.type}
                              onChange={(e) => updateLevelReward(index, {
                                reward: { ...levelReward.reward, type: e.target.value as any }
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            >
                              {REWARD_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Value
                            </label>
                            <input
                              type="number"
                              min="0"
                              step={levelReward.reward.type === 'credit' ? '0.01' : '1'}
                              value={levelReward.reward.value}
                              onChange={(e) => updateLevelReward(index, {
                                reward: { ...levelReward.reward, value: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
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
                  {editingProgram ? 'Update Global Referral Program' : 'Create Global Referral Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm?.isOpen || false}
        title="Delete Referral Program"
        message="Are you sure you want to delete this global referral program?"
        confirmText="Delete"
        type="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}