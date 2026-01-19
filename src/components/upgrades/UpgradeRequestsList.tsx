'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Send,
  Plus,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'
import { format } from 'date-fns'

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
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'completed' | 'expired'
  requestedAt: string
  createdBy: {
    name: string
    email: string
  }
}

interface UpgradeRequestsListProps {
  requests: UpgradeRequest[]
  loading: boolean
  onCreateNew: () => void
  onView: (request: UpgradeRequest) => void
  onEdit: (request: UpgradeRequest) => void
  onCancel: (request: UpgradeRequest) => void
  onRecordPayment: (request: UpgradeRequest) => void
  onSendReminder: (request: UpgradeRequest) => void
  onExtendDueDate: (request: UpgradeRequest) => void
  onActivate: (request: UpgradeRequest) => void
  onSearch: (query: string) => void
  onFilterStatus: (status: string) => void
  stats?: {
    total: number
    pending: number
    completed: number
    overdue: number
    totalValue: number
  }
}

export default function UpgradeRequestsList({
  requests,
  loading,
  onCreateNew,
  onView,
  onEdit,
  onCancel,
  onRecordPayment,
  onSendReminder,
  onExtendDueDate,
  onActivate,
  onSearch,
  onFilterStatus,
  stats
}: UpgradeRequestsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      partially_paid: { variant: 'outline' as const, icon: DollarSign, color: 'text-blue-600' },
      paid: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      overdue: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
      cancelled: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      expired: { variant: 'outline' as const, icon: Clock, color: 'text-gray-600' }
    }

    const config = variants[status as keyof typeof variants] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && ['pending', 'partially_paid'].includes(status)
  }

  const canEdit = (status: string) => {
    return !['completed', 'cancelled'].includes(status)
  }

  const canRecordPayment = (status: string) => {
    return ['pending', 'partially_paid', 'overdue'].includes(status)
  }

  const canActivate = (status: string) => {
    return status === 'paid'
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    onFilterStatus(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upgrade Requests</h1>
          <p className="text-gray-600 mt-1">Manage customer plan upgrade requests</p>
        </div>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Upgrade Request
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by business name, contact person, or plan..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upgrade requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new upgrade request for a customer.
              </p>
              <div className="mt-6">
                <Button onClick={onCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Upgrade Request
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan Change</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {request.tenancy.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.tenancy.contactPerson?.name || 'No contact'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-500">From:</span> {request.fromPlan.displayName}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">To:</span> {request.toPlan.displayName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(request.pricing.customPrice)}
                          </div>
                          {request.pricing.discount > 0 && (
                            <div className="text-sm text-green-600">
                              Save {formatCurrency(request.pricing.discount)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-500">Paid:</span> {formatCurrency(request.payment.totalPaid)}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Remaining:</span> {formatCurrency(request.payment.remainingAmount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${isOverdue(request.paymentTerms.dueDate, request.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {format(new Date(request.paymentTerms.dueDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.paymentTerms.gracePeriod}d grace
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{request.createdBy.name}</div>
                          <div className="text-gray-500">
                            {format(new Date(request.requestedAt), 'MMM dd')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(request)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canEdit(request.status) && (
                              <DropdownMenuItem onClick={() => onEdit(request)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Request
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canRecordPayment(request.status) && (
                              <DropdownMenuItem onClick={() => onRecordPayment(request)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                            )}
                            {canActivate(request.status) && (
                              <DropdownMenuItem onClick={() => onActivate(request)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate Upgrade
                              </DropdownMenuItem>
                            )}
                            {['pending', 'partially_paid', 'overdue'].includes(request.status) && (
                              <>
                                <DropdownMenuItem onClick={() => onSendReminder(request)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onExtendDueDate(request)}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Extend Due Date
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            {canEdit(request.status) && (
                              <DropdownMenuItem 
                                onClick={() => onCancel(request)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Request
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}