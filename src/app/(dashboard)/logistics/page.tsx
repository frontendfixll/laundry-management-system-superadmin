'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight,
  Phone, Mail, IndianRupee
} from 'lucide-react'

interface LogisticsPartner {
  _id: string
  companyName: string
  contactPerson: { name: string; phone: string; email?: string }
  coverageAreas: { pincode: string; area: string; isActive: boolean }[]
  rateCard: { perOrder: number; perKm: number; flatRate: number }
  sla: { pickupTime: number; deliveryTime: number }
  isActive: boolean
  performance: { totalOrders: number; completedOrders: number }
  createdAt: string
}

export default function LogisticsPartnersPage() {
  const [partners, setPartners] = useState<LogisticsPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<LogisticsPartner | null>(null)
  const [activeTab, setActiveTab] = useState<'partners' | 'settlement'>('partners')
  
  // Settlement state
  const [settlementPartnerId, setSettlementPartnerId] = useState('')
  const [settlementMonth, setSettlementMonth] = useState(new Date().getMonth() + 1)
  const [settlementYear, setSettlementYear] = useState(new Date().getFullYear())
  const [settlementData, setSettlementData] = useState<any>(null)

  // Form state
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    flatRate: 50,
    perOrder: 0,
    perKm: 0,
    pickupTime: 2,
    deliveryTime: 4,
    coverageAreas: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  const getAuthHeaders = () => {
    let token = null
    
    // First try superadmin-storage (Zustand persist format)
    try {
      const SuperAdminData = localStorage.getItem('superadmin-storage')
      if (SuperAdminData) {
        const parsed = JSON.parse(SuperAdminData)
        token = parsed.state?.token || parsed.token
      }
    } catch (e) {
      console.error('Error parsing superadmin-storage:', e)
    }
    
    // Fallback to legacy token keys
    if (!token) {
      token = localStorage.getItem('superadmin-token') || localStorage.getItem('SuperAdminToken') || localStorage.getItem('token')
    }
    
    return { 
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [search, statusFilter])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      
      const res = await fetch(`${API_URL}/superadmin/logistics/partners?${params}`, {
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (data.success) setPartners(data.data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        companyName: form.companyName,
        contactPerson: {
          name: form.contactName,
          phone: form.contactPhone,
          email: form.contactEmail
        },
        rateCard: {
          flatRate: form.flatRate,
          perOrder: form.perOrder,
          perKm: form.perKm
        },
        sla: {
          pickupTime: form.pickupTime,
          deliveryTime: form.deliveryTime
        },
        coverageAreas: form.coverageAreas.split(',').map(p => ({
          pincode: p.trim(),
          area: '',
          isActive: true
        }))
      }

      const url = editingPartner 
        ? `${API_URL}/superadmin/logistics/partners/${editingPartner._id}`
        : `${API_URL}/superadmin/logistics/partners`
      
      const res = await fetch(url, {
        method: editingPartner ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        resetForm()
        fetchPartners()
      } else {
        alert(data.message || 'Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  const resetForm = () => {
    setForm({
      companyName: '', contactName: '', contactPhone: '', contactEmail: '',
      flatRate: 50, perOrder: 0, perKm: 0, pickupTime: 2, deliveryTime: 4, coverageAreas: ''
    })
    setEditingPartner(null)
  }

  const handleEdit = (partner: LogisticsPartner) => {
    setEditingPartner(partner)
    setForm({
      companyName: partner.companyName,
      contactName: partner.contactPerson.name,
      contactPhone: partner.contactPerson.phone,
      contactEmail: partner.contactPerson.email || '',
      flatRate: partner.rateCard.flatRate,
      perOrder: partner.rateCard.perOrder,
      perKm: partner.rateCard.perKm,
      pickupTime: partner.sla.pickupTime,
      deliveryTime: partner.sla.deliveryTime,
      coverageAreas: partner.coverageAreas.map(a => a.pincode).join(', ')
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/superadmin/logistics/partners/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      if ((await res.json()).success) fetchPartners()
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`${API_URL}/superadmin/logistics/partners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if ((await res.json()).success) fetchPartners()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // Settlement functions
  const fetchSettlement = async () => {
    if (!settlementPartnerId) return
    try {
      const res = await fetch(
        `${API_URL}/superadmin/logistics/partners/${settlementPartnerId}/settlement?month=${settlementMonth}&year=${settlementYear}`,
        { headers: getAuthHeaders() }
      )
      const data = await res.json()
      if (data.success) setSettlementData(data.data)
    } catch (error) {
      console.error('Settlement error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logistics Partners</h1>
          <p className="text-gray-600 mt-1">Manage delivery partners, export orders, and settlements</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'partners', label: 'Partners', icon: Truck },
            { id: 'settlement', label: 'Settlement', icon: IndianRupee }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : partners.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No partners found</h3>
                <p className="text-gray-600">Add your first logistics partner</p>
              </div>
            ) : (
              partners.map(partner => (
                <div key={partner._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{partner.companyName}</h3>
                      <p className="text-sm text-gray-500">{partner.contactPerson.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      partner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {partner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {partner.contactPerson.phone}
                    </div>
                    {partner.contactPerson.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {partner.contactPerson.email}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      ₹{partner.rateCard.flatRate}/order
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{partner.performance.totalOrders}</div>
                      <div className="text-xs text-gray-500">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{partner.performance.completedOrders}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(partner)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(partner._id, partner.companyName)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(partner._id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                        partner.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {partner.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{partner.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settlement Tab */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Settlement Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner</label>
                <select
                  value={settlementPartnerId}
                  onChange={(e) => setSettlementPartnerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Partner</option>
                  {partners.map(p => (
                    <option key={p._id} value={p._id}>{p.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={settlementMonth}
                  onChange={(e) => setSettlementMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={settlementYear}
                  onChange={(e) => setSettlementYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchSettlement}
                  disabled={!settlementPartnerId}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Generate Report
                </button>
              </div>
            </div>

            {settlementData && (
              <div className="space-y-6">
                {/* Partner Info */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">{settlementData.partner.companyName}</h4>
                  <p className="text-sm text-purple-700">
                    {settlementData.partner.contactPerson.name} • {settlementData.partner.contactPerson.phone}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    Rate: ₹{settlementData.partner.rateCard.flatRate}/order
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{settlementData.stats.totalOrders}</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{settlementData.stats.pickupOrders}</div>
                    <div className="text-sm text-gray-600">Pickups</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{settlementData.stats.deliveryOrders}</div>
                    <div className="text-sm text-gray-600">Deliveries</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{settlementData.stats.completedOrders}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>

                {/* Settlement Amount */}
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                  <h4 className="text-lg font-semibold mb-4">Settlement Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm opacity-80">Pickup Amount</div>
                      <div className="text-2xl font-bold">₹{settlementData.settlement.pickupAmount}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Delivery Amount</div>
                      <div className="text-2xl font-bold">₹{settlementData.settlement.deliveryAmount}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Total Payable</div>
                      <div className="text-3xl font-bold">₹{settlementData.settlement.totalAmount}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Quick Delivery Services"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="email@example.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flat Rate (₹)</label>
                  <input
                    type="number"
                    value={form.flatRate}
                    onChange={(e) => setForm({ ...form, flatRate: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per Order (₹)</label>
                  <input
                    type="number"
                    value={form.perOrder}
                    onChange={(e) => setForm({ ...form, perOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per KM (₹)</label>
                  <input
                    type="number"
                    value={form.perKm}
                    onChange={(e) => setForm({ ...form, perKm: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup SLA (hours)</label>
                  <input
                    type="number"
                    value={form.pickupTime}
                    onChange={(e) => setForm({ ...form, pickupTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery SLA (hours)</label>
                  <input
                    type="number"
                    value={form.deliveryTime}
                    onChange={(e) => setForm({ ...form, deliveryTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Pincodes</label>
                <input
                  type="text"
                  value={form.coverageAreas}
                  onChange={(e) => setForm({ ...form, coverageAreas: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="110001, 110002, 110003"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated pincodes</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingPartner ? 'Update' : 'Create'} Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

