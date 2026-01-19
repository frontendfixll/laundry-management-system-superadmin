'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import UpgradeRequestsList from '@/components/upgrades/UpgradeRequestsList'
import UpgradeRequestForm from '@/components/upgrades/UpgradeRequestForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

interface Tenancy {
  _id: string
  name: string
  slug: string
  contactPerson?: {
    name: string
    email: string
    phone: string
  }
  contact?: {
    name: string
    email: string
    phone: string
  }
  subscription?: {
    planId?: any
  }
  currentPlan?: any
}

interface BillingPlan {
  _id: string
  name: string
  displayName: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: Record<string, any>
}

interface UpgradeRequest {
  _id: string
  tenancy: {
    _id: string
    name: string
    slug: string
    contactPerson?: {
      name: string
      email: string
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
}

export default function UpgradesPage() {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'create'>('list')
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([])
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState<any>(null)

  // Modals
  const [showTenancySelector, setShowTenancySelector] = useState(false)

  useEffect(() => {
    // Load initial data
    Promise.all([
      fetchUpgradeRequests(),
      fetchStats()
    ])
  }, [])

  // Separate effect for search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUpgradeRequests()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter])

  useEffect(() => {
    if (view === 'create' && !tenancies.length && !billingPlans.length) {
      // Only fetch if we don't have the data already
      Promise.all([
        fetchTenancies(),
        fetchBillingPlans()
      ])
    }
  }, [view])

  const fetchUpgradeRequests = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await api.get('/sales/upgrades', { params })
      
      if (response.data?.success) {
        setUpgradeRequests(response.data.data.upgradeRequests || [])
      }
    } catch (error: any) {
      console.error('Error fetching upgrade requests:', error)
      toast.error('Failed to fetch upgrade requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/sales/upgrades/stats')
      if (response.data?.success) {
        const statsData = response.data.data.stats || []
        const summary = response.data.data.summary || {}
        
        // Process stats
        const processedStats = {
          total: summary.totalRequests || 0,
          pending: statsData.find((s: any) => s._id === 'pending')?.count || 0,
          completed: statsData.find((s: any) => s._id === 'completed')?.count || 0,
          overdue: summary.overdueRequests || 0,
          totalValue: statsData.reduce((sum: number, s: any) => sum + (s.totalValue || 0), 0)
        }
        
        setStats(processedStats)
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchTenancies = async () => {
    try {
      const response = await api.get('/superadmin/tenancies', {
        params: { limit: 100, status: 'active' }
      })
      
      if (response.data?.success) {
        setTenancies(response.data.data.tenancies || [])
      }
    } catch (error: any) {
      console.error('Error fetching tenancies:', error)
      toast.error('Failed to fetch tenancies')
    }
  }

  const fetchBillingPlans = async () => {
    try {
      const response = await api.get('/superadmin/billing/plans')
      
      if (response.data?.success) {
        setBillingPlans(response.data.data.plans || [])
      }
    } catch (error: any) {
      console.error('Error fetching billing plans:', error)
      toast.error('Failed to fetch billing plans')
    }
  }

  const handleCreateUpgradeRequest = async (upgradeData: any) => {
    try {
      setCreating(true)
      const response = await api.post('/sales/upgrades/request', upgradeData)
      
      if (response.data?.success) {
        toast.success('Upgrade request created successfully!')
        setView('list')
        setSelectedTenancy(null)
        fetchUpgradeRequests()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error creating upgrade request:', error)
      toast.error(error.response?.data?.message || 'Failed to create upgrade request')
    } finally {
      setCreating(false)
    }
  }

  const handleView = (request: UpgradeRequest) => {
    router.push(`/upgrades/${request._id}`)
  }

  const handleEdit = (request: UpgradeRequest) => {
    // For now, redirect to view page since edit functionality can be added later
    router.push(`/upgrades/${request._id}`)
  }

  const handleCancel = async (request: UpgradeRequest) => {
    if (!confirm('Are you sure you want to cancel this upgrade request?')) {
      return
    }

    try {
      await api.delete(`/sales/upgrades/${request._id}`, {
        data: { reason: 'Cancelled by sales team' }
      })
      
      toast.success('Upgrade request cancelled successfully')
      fetchUpgradeRequests()
      fetchStats()
    } catch (error: any) {
      console.error('Error cancelling upgrade request:', error)
      toast.error('Failed to cancel upgrade request')
    }
  }

  const handleRecordPayment = (request: UpgradeRequest) => {
    router.push(`/upgrades/${request._id}/payment`)
  }

  const handleSendReminder = async (request: UpgradeRequest) => {
    try {
      await api.post(`/sales/upgrades/${request._id}/send-email`)
      
      toast.success('Payment email sent successfully')
      fetchUpgradeRequests()
    } catch (error: any) {
      console.error('Error sending reminder:', error)
      toast.error('Failed to send payment email')
    }
  }

  const handleExtendDueDate = (request: UpgradeRequest) => {
    // For now, redirect to view page where extend functionality can be added
    router.push(`/upgrades/${request._id}`)
  }

  const handleActivate = async (request: UpgradeRequest) => {
    if (!confirm('Are you sure you want to activate this upgrade? This will change the customer\'s plan immediately.')) {
      return
    }

    try {
      await api.post(`/sales/upgrades/${request._id}/activate`)
      
      toast.success('Upgrade activated successfully!')
      fetchUpgradeRequests()
      fetchStats()
    } catch (error: any) {
      console.error('Error activating upgrade:', error)
      toast.error('Failed to activate upgrade')
    }
  }

  const handleTenancySelect = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy)
    setShowTenancySelector(false)
  }

  const startCreateFlow = () => {
    setShowTenancySelector(true)
  }

  if (view === 'create' && selectedTenancy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView('list')
              setSelectedTenancy(null)
            }}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upgrade Requests
          </Button>
        </div>
        
        <UpgradeRequestForm
          tenancy={selectedTenancy}
          availablePlans={billingPlans}
          onSubmit={handleCreateUpgradeRequest}
          onCancel={() => {
            setView('list')
            setSelectedTenancy(null)
          }}
          loading={creating}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <UpgradeRequestsList
        requests={upgradeRequests}
        loading={loading}
        onCreateNew={startCreateFlow}
        onView={handleView}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onRecordPayment={handleRecordPayment}
        onSendReminder={handleSendReminder}
        onExtendDueDate={handleExtendDueDate}
        onActivate={handleActivate}
        onSearch={setSearchQuery}
        onFilterStatus={setStatusFilter}
        stats={stats}
      />

      {/* Tenancy Selector Modal */}
      <Dialog open={showTenancySelector} onOpenChange={setShowTenancySelector}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Customer for Upgrade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const query = e.target.value.toLowerCase()
                  // Filter tenancies based on search
                }}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tenancies.map((tenancy) => (
                <div
                  key={tenancy._id}
                  onClick={() => handleTenancySelect(tenancy)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenancy.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tenancy.contactPerson?.name || tenancy.contact?.name || 'No contact'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Current Plan: {tenancy.subscription?.planId?.displayName || tenancy.currentPlan?.displayName || 'No Plan'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}