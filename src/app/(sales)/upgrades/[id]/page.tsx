'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react'

interface UpgradeRequest {
  _id: string
  tenancy: {
    _id: string
    name: string
    slug: string
    contactPerson?: {
      name: string
      email: string
      phone: string
    }
  }
  fromPlan: {
    name: string
    displayName: string
    price: { monthly: number }
  }
  toPlan: {
    name: string
    displayName: string
    price: { monthly: number }
    features: any
  }
  pricing: {
    originalPrice: number
    customPrice: number
    discount: number
    discountReason?: string
  }
  paymentTerms: {
    method: string
    dueDate: string
    gracePeriod: number
  }
  payment: {
    totalPaid: number
    remainingAmount: number
  }
  status: string
  requestedAt: string
  createdBy: {
    name: string
    email: string
  }
  communication: {
    emailSent: boolean
    emailSentAt?: string
    customMessage?: string
  }
}

export default function UpgradeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const upgradeId = params.id as string

  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (upgradeId) {
      fetchUpgradeRequest()
    }
  }, [upgradeId])

  const fetchUpgradeRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/sales/upgrades/${upgradeId}`)
      
      if (response.data?.success) {
        setUpgradeRequest(response.data.data)
      } else {
        toast.error('Upgrade request not found')
        router.push('/upgrades')
      }
    } catch (error: any) {
      console.error('Error fetching upgrade request:', error)
      toast.error('Failed to load upgrade request')
      router.push('/upgrades')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      setActionLoading(true)
      const response = await api.post(`/sales/upgrades/${upgradeId}/send-email`)
      
      if (response.data?.success) {
        toast.success('Payment email sent successfully!')
        fetchUpgradeRequest()
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordPayment = () => {
    router.push(`/upgrades/${upgradeId}/payment`)
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this upgrade request?')) {
      return
    }

    try {
      setActionLoading(true)
      await api.delete(`/sales/upgrades/${upgradeId}`, {
        data: { reason: 'Cancelled by sales team' }
      })
      
      toast.success('Upgrade request cancelled successfully')
      router.push('/upgrades')
    } catch (error: any) {
      console.error('Error cancelling upgrade request:', error)
      toast.error('Failed to cancel upgrade request')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      partially_paid: { color: 'bg-blue-100 text-blue-800', icon: CreditCard }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentPageUrl = () => {
    return `${window.location.origin}/customer-payment/${upgradeId}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!upgradeRequest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Upgrade Request Not Found</h2>
        <p className="mt-2 text-gray-600">The requested upgrade request could not be found.</p>
        <Button onClick={() => router.push('/upgrades')} className="mt-4">
          Back to Upgrades
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/upgrades')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upgrades
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Request Details</h1>
            <p className="text-gray-600">Request ID: {upgradeRequest._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(upgradeRequest.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <p className="mt-1 text-sm text-gray-900">{upgradeRequest.tenancy.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <p className="mt-1 text-sm text-gray-900">
                  {upgradeRequest.tenancy.contactPerson?.name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                  {upgradeRequest.tenancy.contactPerson?.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {upgradeRequest.tenancy.contactPerson?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Plan Upgrade Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Upgrade Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
                <p className="text-lg font-semibold text-gray-900">{upgradeRequest.fromPlan.displayName}</p>
                <p className="text-sm text-gray-600">{formatCurrency(upgradeRequest.fromPlan.price.monthly)}/month</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Upgrade To</h3>
                <p className="text-lg font-semibold text-blue-900">{upgradeRequest.toPlan.displayName}</p>
                <p className="text-sm text-blue-700">{formatCurrency(upgradeRequest.toPlan.price.monthly)}/month</p>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Pricing Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Price:</span>
                <span className="font-medium">{formatCurrency(upgradeRequest.pricing.originalPrice)}</span>
              </div>
              {upgradeRequest.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(upgradeRequest.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Price:</span>
                  <span className="text-blue-600">{formatCurrency(upgradeRequest.pricing.customPrice)}</span>
                </div>
              </div>
            </div>
            {upgradeRequest.pricing.discountReason && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Discount Reason:</strong> {upgradeRequest.pricing.discountReason}
                </p>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Amount</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(upgradeRequest.pricing.customPrice)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(upgradeRequest.payment.totalPaid)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 font-medium">Remaining</p>
                <p className="text-xl font-bold text-orange-900">
                  {formatCurrency(upgradeRequest.payment.remainingAmount)}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{upgradeRequest.paymentTerms.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{formatDate(upgradeRequest.paymentTerms.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {upgradeRequest.status === 'pending' && (
                <>
                  <Button
                    onClick={handleSendEmail}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Payment Email
                  </Button>
                  <Button
                    onClick={handleRecordPayment}
                    variant="outline"
                    className="w-full"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </>
              )}
              <Button
                onClick={() => window.open(getPaymentPageUrl(), '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Payment Page
              </Button>
              {upgradeRequest.status !== 'completed' && upgradeRequest.status !== 'cancelled' && (
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  disabled={actionLoading}
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Request
                </Button>
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">{formatDate(upgradeRequest.requestedAt)}</p>
              </div>
              <div>
                <span className="text-gray-600">Created By:</span>
                <p className="font-medium">{upgradeRequest.createdBy.name}</p>
                <p className="text-gray-500">{upgradeRequest.createdBy.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="mt-1">{getStatusBadge(upgradeRequest.status)}</div>
              </div>
            </div>
          </div>

          {/* Communication */}
          {upgradeRequest.communication && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email Sent:</span>
                  <span className={`font-medium ${upgradeRequest.communication.emailSent ? 'text-green-600' : 'text-red-600'}`}>
                    {upgradeRequest.communication.emailSent ? 'Yes' : 'No'}
                  </span>
                </div>
                {upgradeRequest.communication.emailSentAt && (
                  <div>
                    <span className="text-gray-600">Email Sent At:</span>
                    <p className="font-medium">{formatDate(upgradeRequest.communication.emailSentAt)}</p>
                  </div>
                )}
                {upgradeRequest.communication.customMessage && (
                  <div>
                    <span className="text-gray-600">Custom Message:</span>
                    <p className="font-medium mt-1 p-2 bg-gray-50 rounded">
                      {upgradeRequest.communication.customMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}