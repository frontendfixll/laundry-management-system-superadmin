'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBranches } from '@/hooks/useBranches'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Settings,
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Navigation,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ServiceArea {
  pincode: string
  area: string
  deliveryCharge: number
  isActive: boolean
  maxDeliveryTime: number
}

export default function NewBranchPage() {
  const router = useRouter()
  const { createBranch, loading } = useBranches()
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    // Coordinates for distance-based delivery
    coordinates: {
      latitude: null as number | null,
      longitude: null as number | null
    },
    serviceableRadius: 20,
    contact: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    capacity: {
      maxOrdersPerDay: 100,
      maxWeightPerDay: 500,
      maxCustomersPerDay: 200,
      staffCount: 5
    },
    operatingHours: {
      openTime: '09:00',
      closeTime: '18:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      lunchBreak: {
        start: '13:00',
        end: '14:00'
      }
    },
    serviceAreas: [] as ServiceArea[],
    financials: {
      refundLimit: 500,
      discountLimit: 20,
      commissionRate: 10
    }
  })

  const [errors, setErrors] = useState<any>({})
  const [activeTab, setActiveTab] = useState('basic')
  const [geocodingLoading, setGeocodingLoading] = useState(false)

  // Function to get coordinates from address
  const getCoordinatesFromAddress = async () => {
    const { addressLine1, city, state, pincode } = formData.address
    
    if (!addressLine1 || !city || !pincode) {
      toast.error('Please fill address, city and pincode first')
      return
    }

    const fullAddress = `${addressLine1}, ${city}, ${state}, ${pincode}, India`
    
    setGeocodingLoading(true)
    try {
      // Use backend API for geocoding (more secure - API key stays on server)
      const response = await fetch(`${API_URL}/delivery/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: fullAddress })
      })
      const data = await response.json()
      
      if (data.success && data.data.lat && data.data.lng) {
        setFormData({
          ...formData,
          coordinates: {
            latitude: data.data.lat,
            longitude: data.data.lng
          }
        })
        toast.success('Coordinates fetched successfully!')
      } else {
        toast.error(data.message || 'Could not find coordinates for this address')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      toast.error('Failed to fetch coordinates')
    } finally {
      setGeocodingLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    // Basic Info Validation
    if (!formData.name.trim()) newErrors.name = 'Branch name is required'
    if (!formData.code.trim()) newErrors.code = 'Branch code is required'
    if (formData.code.length < 3) newErrors.code = 'Branch code must be at least 3 characters'
    
    // Address Validation
    if (!formData.address.addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!formData.address.city.trim()) newErrors.city = 'City is required'
    if (!formData.address.state.trim()) newErrors.state = 'State is required'
    if (!formData.address.pincode.trim()) newErrors.pincode = 'Pincode is required'
    if (formData.address.pincode.length !== 6) newErrors.pincode = 'Pincode must be 6 digits'
    
    // Contact Validation
    if (!formData.contact.phone.trim()) newErrors.phone = 'Phone number is required'
    if (formData.contact.phone.length < 10) newErrors.phone = 'Phone number must be at least 10 digits'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly')
      return
    }

    try {
      await createBranch(formData)
      toast.success('Branch created successfully!')
      router.push('/superadmin/branches')
    } catch (error: any) {
      console.error('Create branch error:', error)
      toast.error(error.message || 'Failed to create branch')
    }
  }

  const addServiceArea = () => {
    setFormData({
      ...formData,
      serviceAreas: [
        ...formData.serviceAreas,
        {
          pincode: '',
          area: '',
          deliveryCharge: 0,
          isActive: true,
          maxDeliveryTime: 60
        }
      ]
    })
  }

  const removeServiceArea = (index: number) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index)
    })
  }

  const updateServiceArea = (index: number, field: string, value: any) => {
    const updatedAreas = [...formData.serviceAreas]
    updatedAreas[index] = { ...updatedAreas[index], [field]: value }
    setFormData({ ...formData, serviceAreas: updatedAreas })
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Building2 },
    { id: 'contact', name: 'Contact & Location', icon: MapPin },
    { id: 'operations', name: 'Operations', icon: Clock },
    { id: 'capacity', name: 'Capacity', icon: Users },
    { id: 'service-areas', name: 'Service Areas', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/superadmin/branches"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Branch</h1>
            <p className="text-gray-600 mt-1">Add a new branch to your network</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/superadmin/branches"
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
            <span>{loading ? 'Creating...' : 'Create Branch'}</span>
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
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter branch name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., DEL001"
                    maxLength={10}
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  <p className="text-gray-500 text-sm mt-1">Unique identifier for the branch</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.address.addressLine1}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, addressLine1: e.target.value }
                      })}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Street address, building number"
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.address.addressLine2}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, addressLine2: e.target.value }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Apartment, suite, floor (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City name"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select State</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, pincode: e.target.value }
                      })}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.pincode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={formData.address.landmark}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, landmark: e.target.value }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nearby landmark (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates for Distance-Based Delivery */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📍 Location Coordinates (for Distance-Based Delivery)
                </h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-700">
                    Coordinates are required for calculating distance-based delivery charges. 
                    Click "Get Coordinates" after filling the address to auto-fetch, or enter manually.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.coordinates.latitude || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) || null }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 26.9124"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.coordinates.longitude || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) || null }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 75.7873"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serviceable Radius (km)
                    </label>
                    <input
                      type="number"
                      value={formData.serviceableRadius}
                      onChange={(e) => setFormData({
                        ...formData,
                        serviceableRadius: parseInt(e.target.value) || 20
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getCoordinatesFromAddress}
                  disabled={geocodingLoading}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {geocodingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Get Coordinates from Address</span>
                    </>
                  )}
                </button>

                {formData.coordinates.latitude && formData.coordinates.longitude && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Coordinates set: {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value }
                      })}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="branch@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.whatsapp}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, whatsapp: e.target.value }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="WhatsApp number (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-6">
              {/* Operating Hours */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHours.openTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, openTime: e.target.value }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHours.closeTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, closeTime: e.target.value }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Days</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.operatingHours.workingDays.includes(day)}
                        onChange={(e) => {
                          const workingDays = e.target.checked
                            ? [...formData.operatingHours.workingDays, day]
                            : formData.operatingHours.workingDays.filter(d => d !== day)
                          setFormData({
                            ...formData,
                            operatingHours: { ...formData.operatingHours, workingDays }
                          })
                        }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Lunch Break */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lunch Break</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lunch Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHours.lunchBreak.start}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: {
                          ...formData.operatingHours,
                          lunchBreak: { ...formData.operatingHours.lunchBreak, start: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lunch End Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHours.lunchBreak.end}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: {
                          ...formData.operatingHours,
                          lunchBreak: { ...formData.operatingHours.lunchBreak, end: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'capacity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Orders Per Day
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.maxOrdersPerDay}
                    onChange={(e) => setFormData({
                      ...formData,
                      capacity: { ...formData.capacity, maxOrdersPerDay: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="1000"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum orders this branch can handle per day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Weight Per Day (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.maxWeightPerDay}
                    onChange={(e) => setFormData({
                      ...formData,
                      capacity: { ...formData.capacity, maxWeightPerDay: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="50"
                    max="5000"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum weight capacity in kilograms</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Customers Per Day
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.maxCustomersPerDay}
                    onChange={(e) => setFormData({
                      ...formData,
                      capacity: { ...formData.capacity, maxCustomersPerDay: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="10"
                    max="1000"
                  />
                  <p className="text-gray-500 text-sm mt-1">Maximum unique customers per day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Count
                  </label>
                  <input
                    type="number"
                    value={formData.capacity.staffCount}
                    onChange={(e) => setFormData({
                      ...formData,
                      capacity: { ...formData.capacity, staffCount: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="50"
                  />
                  <p className="text-gray-500 text-sm mt-1">Expected number of staff members</p>
                </div>
              </div>

              {/* Financial Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Limit (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.financials.refundLimit}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, refundLimit: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                    <p className="text-gray-500 text-sm mt-1">Maximum refund amount Center Admin can approve</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Limit (%)
                    </label>
                    <input
                      type="number"
                      value={formData.financials.discountLimit}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, discountLimit: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="100"
                    />
                    <p className="text-gray-500 text-sm mt-1">Maximum discount percentage allowed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.financials.commissionRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, commissionRate: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="50"
                    />
                    <p className="text-gray-500 text-sm mt-1">Commission percentage on revenue</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'service-areas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Service Areas</h3>
                <button
                  onClick={addServiceArea}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Area</span>
                </button>
              </div>

              {formData.serviceAreas.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No service areas added yet</p>
                  <p className="text-gray-500 text-sm">Add service areas to define delivery zones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.serviceAreas.map((area, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={area.pincode}
                            onChange={(e) => updateServiceArea(index, 'pincode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="110001"
                            maxLength={6}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area Name
                          </label>
                          <input
                            type="text"
                            value={area.area}
                            onChange={(e) => updateServiceArea(index, 'area', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Area name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Charge (₹)
                          </label>
                          <input
                            type="number"
                            value={area.deliveryCharge}
                            onChange={(e) => updateServiceArea(index, 'deliveryCharge', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Delivery Time (min)
                          </label>
                          <input
                            type="number"
                            value={area.maxDeliveryTime}
                            onChange={(e) => updateServiceArea(index, 'maxDeliveryTime', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min="15"
                            max="180"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            onClick={() => removeServiceArea(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
