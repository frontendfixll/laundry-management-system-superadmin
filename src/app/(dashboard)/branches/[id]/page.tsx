'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowLeft,
  Edit,
  Loader2,
  Calendar,
  Star
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Branch {
  _id: string
  name: string
  code: string
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  contact: {
    phone: string
    email?: string
  }
  operatingHours: {
    openTime: string
    closeTime: string
    workingDays: string[]
  }
  capacity: {
    maxOrdersPerDay: number
    maxWeightPerDay: number
  }
  metrics: {
    totalOrders: number
    completedOrders: number
    averageRating: number
    totalRevenue: number
  }
  isActive: boolean
  status: string
  manager?: {
    _id: string
    name: string
    email: string
  }
  staff: any[]
  createdAt: string
}

export default function BranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBranch()
    }
  }, [params.id])

  const fetchBranch = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/superadmin/branches/${params.id}`)
      setBranch(response.data.data?.branch || response.data.data)
    } catch (error) {
      console.error('Error fetching branch:', error)
      toast.error('Failed to fetch branch details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Branch not found</h3>
        <Link href="/superadmin/branches">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Branches
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/branches">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{branch.name}</h1>
            <p className="text-gray-600">Branch Code: {branch.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            branch.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {branch.isActive ? 'Active' : 'Inactive'}
          </span>
          <Button variant="outline">
            <Link href={`/superadmin/branches/${params.id}/edit`} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit Branch
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{branch.metrics?.totalOrders || 0}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(branch.metrics?.totalRevenue || 0)}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{branch.metrics?.averageRating?.toFixed(1) || '0.0'}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{branch.staff?.length || 0}</div>
              <div className="text-sm text-gray-600">Staff</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Branch Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="text-gray-800">
                  {branch.address?.addressLine1}
                  {branch.address?.addressLine2 && <>, {branch.address.addressLine2}</>}
                  <br />
                  {branch.address?.city}, {branch.address?.state} - {branch.address?.pincode}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="text-gray-800">{branch.contact?.phone}</div>
              </div>
            </div>
            {branch.contact?.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="text-gray-800">{branch.contact.email}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Operating Hours</div>
                <div className="text-gray-800">
                  {branch.operatingHours?.openTime} - {branch.operatingHours?.closeTime}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-600">Created</div>
                <div className="text-gray-800">
                  {new Date(branch.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Manager */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Capacity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Max Orders/Day</span>
                <span className="font-medium">{branch.capacity?.maxOrdersPerDay || 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Weight/Day</span>
                <span className="font-medium">{branch.capacity?.maxWeightPerDay || 500} kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Center Admin</h3>
            {branch.manager ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium text-lg">
                    {branch.manager.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{branch.manager.name}</div>
                  <div className="text-sm text-gray-600">{branch.manager.email}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No manager assigned</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Assign Manager
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
