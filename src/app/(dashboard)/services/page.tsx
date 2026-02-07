'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { RevenueCard } from '@/components/ui/RevenueCard'
import {
  Sparkles,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Clock,
  Zap,
  X,
  Save,
  AlertCircle,
  Check,
  Package,
  Loader2
} from 'lucide-react'

const ITEMS_PER_PAGE = 8

// Toast notification component
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => (
  <div className="fixed top-20 right-4 z-[100] space-y-2">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${toast.type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
          }`}
      >
        {toast.type === 'success' ? (
          <Check className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{toast.message}</span>
        <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
)

interface Branch {
  _id: string
  name: string
  code: string
}

interface BranchConfig {
  branch: Branch
  isActive: boolean
  priceMultiplier: number
  customTurnaround?: {
    standard?: number
    express?: number
  }
}

interface Service {
  _id: string
  name: string
  code: string
  displayName: string
  description: string
  icon: string
  category: string
  basePriceMultiplier: number
  turnaroundTime: {
    standard: number
    express: number
  }
  branches: BranchConfig[]
  isActive: boolean
  isExpressAvailable: boolean
  sortOrder: number
  createdAt: string
}

interface ServiceItem {
  _id: string
  name: string
  itemId: string
  category: string
  basePrice: number
  description: string
}

const categoryOptions = [
  { value: 'laundry', label: 'Laundry' },
  { value: 'dry_cleaning', label: 'Dry Cleaning' },
  { value: 'pressing', label: 'Pressing' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'other', label: 'Other' }
]

const itemCategoryOptions = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'household', label: 'Household' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'others', label: 'Others' }
]

const iconOptions = [
  'Shirt', 'Sparkles', 'Award', 'Zap', 'Star', 'Crown', 'Diamond', 'Flame', 'Scissors'
]

export default function SuperAdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null)
  const [deleteServiceName, setDeleteServiceName] = useState<string>('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Items management state
  const [showItemsModal, setShowItemsModal] = useState(false)
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'men',
    basePrice: 0,
    description: ''
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    displayName: '',
    description: '',
    icon: 'Shirt',
    category: 'laundry',
    basePriceMultiplier: 1.0,
    turnaroundStandard: 48,
    turnaroundExpress: 24,
    isExpressAvailable: true,
    sortOrder: 0
  })

  useEffect(() => {
    fetchServices()
    fetchBranches()
  }, [])

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null

    // Try unified auth-storage (new unified store)
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        const token = parsed.state?.token || parsed.token
        if (token) return token
      } catch (e) {
        console.error('Error parsing auth-storage:', e)
      }
    }

    // Try legacy superadmin-storage
    const superAdminData = localStorage.getItem('superadmin-storage')
    if (superAdminData) {
      try {
        const parsed = JSON.parse(superAdminData)
        if (parsed.state?.token) return parsed.state.token
      } catch (e) {
        console.error('Error parsing superadmin-storage:', e)
      }
    }

    // Try other legacy keys
    return localStorage.getItem('superadmin-token') ||
      localStorage.getItem('superAdminToken') ||
      localStorage.getItem('token')
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/superadmin/services`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.data?.services || [])
      } else {
        setError('Failed to fetch services')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/superadmin/branches`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBranches(data.data?.branches || data.branches || [])
      }
    } catch (err) {
      console.error('Failed to fetch branches')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getAuthToken()
      const url = isEditing
        ? `${API_URL}/superadmin/services/${selectedService?._id}`
        : `${API_URL}/superadmin/services`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          displayName: formData.displayName || formData.name,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          basePriceMultiplier: formData.basePriceMultiplier,
          turnaroundTime: {
            standard: formData.turnaroundStandard,
            express: formData.turnaroundExpress
          },
          isExpressAvailable: formData.isExpressAvailable,
          sortOrder: formData.sortOrder
        })
      })

      if (response.ok) {
        fetchServices()
        setShowModal(false)
        resetForm()
        showToast(isEditing ? 'Service updated successfully!' : 'Service created successfully!')
      } else {
        const data = await response.json()
        showToast(data.message || 'Failed to save service', 'error')
      }
    } catch (err) {
      showToast('Failed to save service', 'error')
    }
  }

  const openDeleteModal = (service: Service) => {
    setDeleteServiceId(service._id)
    setDeleteServiceName(service.displayName)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!deleteServiceId) return

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/superadmin/services/${deleteServiceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      if (response.ok) {
        // Update state locally instead of re-fetching
        setServices(prev => prev.filter(s => s._id !== deleteServiceId))
        showToast('Service deleted successfully!')
      } else {
        showToast('Failed to delete service', 'error')
      }
    } catch (err) {
      showToast('Failed to delete service', 'error')
    } finally {
      setShowDeleteModal(false)
      setDeleteServiceId(null)
      setDeleteServiceName('')
    }
  }

  const handleToggleStatus = async (service: Service) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/superadmin/services/${service._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ isActive: !service.isActive })
      })

      if (response.ok) {
        // Update state locally instead of re-fetching
        setServices(prev => prev.map(s =>
          s._id === service._id ? { ...s, isActive: !s.isActive } : s
        ))
        showToast(service.isActive ? 'Service disabled successfully!' : 'Service enabled successfully!')
      } else {
        showToast('Failed to update service status', 'error')
      }
    } catch (err) {
      showToast('Failed to update service status', 'error')
    }
  }

  const handleAssignBranch = async (serviceId: string, branchId: string, isActive: boolean) => {
    const branch = branches.find(b => b._id === branchId)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/superadmin/services/${serviceId}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ branchId, isActive })
      })

      if (response.ok) {
        const data = await response.json()
        // Update selectedService with new data
        if (data.data?.service) {
          setSelectedService(data.data.service)
          // Also update in services list locally
          setServices(prev => prev.map(s =>
            s._id === serviceId ? data.data.service : s
          ))
        }
        showToast(isActive
          ? `Service enabled for ${branch?.name || 'branch'}!`
          : `Service disabled for ${branch?.name || 'branch'}!`
        )
      } else {
        showToast('Failed to assign service to branch', 'error')
      }
    } catch (err) {
      showToast('Failed to assign service to branch', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      displayName: '',
      description: '',
      icon: 'Shirt',
      category: 'laundry',
      basePriceMultiplier: 1.0,
      turnaroundStandard: 48,
      turnaroundExpress: 24,
      isExpressAvailable: true,
      sortOrder: 0
    })
    setIsEditing(false)
    setSelectedService(null)
  }

  const openEditModal = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      code: service.code,
      displayName: service.displayName,
      description: service.description,
      icon: service.icon,
      category: service.category,
      basePriceMultiplier: service.basePriceMultiplier,
      turnaroundStandard: service.turnaroundTime.standard,
      turnaroundExpress: service.turnaroundTime.express,
      isExpressAvailable: service.isExpressAvailable,
      sortOrder: service.sortOrder
    })
    setIsEditing(true)
    setShowModal(true)
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.code.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || service.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE)
  const paginatedServices = filteredServices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'laundry': return 'bg-blue-100 text-blue-800'
      case 'dry_cleaning': return 'bg-purple-100 text-purple-800'
      case 'pressing': return 'bg-orange-100 text-orange-800'
      case 'specialty': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Items management functions
  const handleOpenItemsModal = async (service: Service) => {
    setSelectedService(service)
    setShowItemsModal(true)
    setItemsLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/service-items?service=${service.code}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      if (response.ok) {
        const data = await response.json()
        const fullItems = data.items?.filter((item: any) => item.service === service.code) || []
        setServiceItems(fullItems)
      }
    } catch (err) {
      showToast('Failed to load items', 'error')
    } finally {
      setItemsLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.name || newItem.basePrice <= 0 || !selectedService) {
      showToast('Name and price are required', 'error')
      return
    }

    try {
      setAddingItem(true)
      const token = getAuthToken()
      const itemId = `${selectedService.code}_${newItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`

      const response = await fetch(`${API_URL}/service-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          name: newItem.name,
          itemId,
          service: selectedService.code,
          category: newItem.category,
          basePrice: newItem.basePrice,
          description: newItem.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setServiceItems(prev => [...prev, data.data])
        setShowAddItemForm(false)
        setNewItem({ name: '', category: 'men', basePrice: 0, description: '' })
        showToast('Item added successfully!')
      } else {
        const errorData = await response.json()
        showToast(errorData.message || 'Failed to add item', 'error')
      }
    } catch (err) {
      showToast('Failed to add item', 'error')
    } finally {
      setAddingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      setDeletingItem(itemId)
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/service-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      if (response.ok) {
        setServiceItems(prev => prev.filter(i => i._id !== itemId))
        showToast('Item deleted successfully!')
      } else {
        showToast('Failed to delete item', 'error')
      }
    } catch (err) {
      showToast('Failed to delete item', 'error')
    } finally {
      setDeletingItem(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Services Management</h1>
          <p className="text-[11px] text-gray-600">Manage laundry services and branch assignments</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }} className="bg-teal-500 hover:bg-teal-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Services</p>
              <p className="text-lg font-bold text-gray-800">{services.length}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-green-600">{services.filter(s => s.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Express Available</p>
              <p className="text-2xl font-bold text-orange-600">{services.filter(s => s.isExpressAvailable).length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-purple-600">{branches.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Services ({filteredServices.length})</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600">Create your first service to get started.</p>
            </div>
          ) : (
            paginatedServices.map((service) => (
              <div key={service._id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.isActive ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'bg-gray-400'
                      }`}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-800">{service.displayName}</h3>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${getCategoryBadgeColor(service.category)}`}>
                          {service.category.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {service.isExpressAvailable && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800">
                            <Zap className="w-2.5 h-2.5 mr-1" />
                            Express
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 mb-1 leading-tight">{service.description}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                        <span>Code: <strong>{service.code}</strong></span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-0.5" />
                          {service.turnaroundTime.standard}h / {service.turnaroundTime.express}h
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenItemsModal(service)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Items
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedService(service); setShowBranchModal(true) }}
                    >
                      <Building2 className="w-4 h-4 mr-1" />
                      Branches
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(service)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(service)}
                      className={service.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                    >
                      {service.isActive ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      {service.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(service)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredServices.length > ITEMS_PER_PAGE && (
          <Pagination
            current={currentPage}
            pages={totalPages}
            total={filteredServices.length}
            limit={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName="services"
          />
        )}
      </div>

      {/* Create/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Service' : 'Create New Service'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Leave empty to use service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.basePriceMultiplier}
                    onChange={(e) => setFormData({ ...formData, basePriceMultiplier: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standard TAT (hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.turnaroundStandard}
                    onChange={(e) => setFormData({ ...formData, turnaroundStandard: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Express TAT (hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.turnaroundExpress}
                    onChange={(e) => setFormData({ ...formData, turnaroundExpress: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isExpressAvailable}
                    onChange={(e) => setFormData({ ...formData, isExpressAvailable: e.target.checked })}
                    className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Express Service Available</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm() }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Assignment Modal */}
      {showBranchModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Branch Assignments</h2>
                <p className="text-sm text-gray-600">{selectedService.displayName}</p>
              </div>
              <button onClick={() => setShowBranchModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enable or disable this service for specific branches. Enabled branches will offer this service to customers.
              </p>

              <div className="space-y-3">
                {branches.map((branch) => {
                  const branchConfig = selectedService.branches?.find(
                    b => b.branch?._id === branch._id || b.branch === branch._id
                  )
                  const isAssigned = !!branchConfig
                  const isActive = branchConfig?.isActive ?? false

                  return (
                    <div key={branch._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{branch.name}</p>
                        <p className="text-sm text-gray-500">Code: {branch.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          size="sm"
                          variant={isActive ? 'outline' : 'default'}
                          className={isActive ? 'text-red-600 hover:bg-red-50' : 'bg-teal-500 hover:bg-teal-600'}
                          onClick={() => handleAssignBranch(selectedService._id, branch._id, !isActive)}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {branches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No branches available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowBranchModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Service</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{deleteServiceName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowDeleteModal(false); setDeleteServiceId(null); setDeleteServiceName('') }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Items Modal */}
      {showItemsModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Items</h3>
                <p className="text-sm text-gray-500">{selectedService.displayName}</p>
              </div>
              <button
                onClick={() => {
                  setShowItemsModal(false)
                  setSelectedService(null)
                  setServiceItems([])
                  setShowAddItemForm(false)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                </div>
              ) : (
                <>
                  {/* Add Item Form */}
                  {showAddItemForm ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-800 mb-3">Add New Item</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Item name (e.g., Shirt, Saree)"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            {itemCategoryOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={newItem.basePrice || ''}
                            onChange={(e) => setNewItem({ ...newItem, basePrice: parseFloat(e.target.value) || 0 })}
                            min="0"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAddItem}
                            disabled={addingItem || !newItem.name || newItem.basePrice <= 0}
                            className="flex-1 bg-teal-500 hover:bg-teal-600"
                          >
                            {addingItem ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Item
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddItemForm(false)
                              setNewItem({ name: '', category: 'men', basePrice: 0, description: '' })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddItemForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-600 mb-4"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Item
                    </button>
                  )}

                  {/* Items List */}
                  {serviceItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No items added yet</p>
                      <p className="text-sm">Add items that customers can select for this service</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {serviceItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <RevenueCard
                              title=""
                              amount={`₹${item.basePrice}`}
                              storageKey={`service-base-price-${item._id}`}
                              className="bg-transparent p-0 inline-block"
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            disabled={deletingItem === item._id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {deletingItem === item._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500">
                💡 Items added here will be available for customers when they select this service.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

