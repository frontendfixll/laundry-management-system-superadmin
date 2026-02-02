'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, TrendingUp, Users, DollarSign, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAddOns } from '@/hooks/useAddOns'
import { AddOnCreateModal } from '@/components/addons/AddOnCreateModal'
import { AddOnEditModal } from '@/components/addons/AddOnEditModal'
import { AddOnAnalyticsModal } from '@/components/addons/AddOnAnalyticsModal'
import { AddOnDeleteModal } from '@/components/addons/AddOnDeleteModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  hidden: 'bg-yellow-100 text-yellow-800',
  deprecated: 'bg-red-100 text-red-800'
}

const categoryColors = {
  capacity: 'bg-blue-100 text-blue-800',
  feature: 'bg-purple-100 text-purple-800',
  usage: 'bg-orange-100 text-orange-800',
  branding: 'bg-pink-100 text-pink-800',
  integration: 'bg-indigo-100 text-indigo-800',
  support: 'bg-green-100 text-green-800'
}

export default function AddOnsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAddOn, setEditingAddOn] = useState(null)
  const [viewingAnalytics, setViewingAnalytics] = useState(null)
  const [deletingAddOn, setDeletingAddOn] = useState(null)

  const {
    addOns,
    loading,
    error,
    summary,
    pagination,
    createAddOn,
    updateAddOn,
    deleteAddOn,
    refetch
  } = useAddOns({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    sortBy,
    sortOrder,
    page,
    limit: 20
  })

  const handleCreateAddOn = async (data) => {
    try {
      await createAddOn(data)
      setShowCreateModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to create add-on:', error)
    }
  }

  const handleUpdateAddOn = async (id, data) => {
    try {
      await updateAddOn(id, data)
      setEditingAddOn(null)
      refetch()
    } catch (error) {
      console.error('Failed to update add-on:', error)
    }
  }

  const handleDeleteAddOn = async (id) => {
    try {
      await deleteAddOn(id)
      setDeletingAddOn(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete add-on:', error)
    }
  }

  const handleToggleMarketplace = async (addOn) => {
    try {
      await updateAddOn(addOn._id, {
        showOnMarketplace: !addOn.showOnMarketplace
      })
      toast.success(
        addOn.showOnMarketplace 
          ? 'Add-on hidden from marketplace' 
          : 'Add-on shown on marketplace',
        {
          duration: 3000,
          position: 'top-right',
        }
      )
    } catch (error) {
      console.error('Failed to toggle marketplace visibility:', error)
      toast.error('Failed to update marketplace visibility', {
        duration: 3000,
        position: 'top-right',
      })
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add-ons Management</h1>
          <p className="text-gray-600 mt-1">
            Manage add-ons, pricing, and subscriber analytics
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Add-on
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Add-ons</p>
              <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">{summary?.total || 0}</p>
              <p className="text-xs lg:text-sm text-blue-600 mt-1 lg:mt-2">{summary?.active || 0} active</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active Subscriptions</p>
              <p className="text-2xl lg:text-3xl font-semibold text-green-600 mt-1 lg:mt-2">
                {addOns?.reduce((sum, addon) => sum + (addon.stats?.activeSubscriptions || 0), 0) || 0}
              </p>
              <p className="text-xs lg:text-sm text-green-600 mt-1 lg:mt-2">Across all add-ons</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Revenue</p>
              <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">
                {formatCurrency(
                  addOns?.reduce((sum, addon) => sum + (addon.stats?.totalRevenue || 0), 0) || 0
                )}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1 lg:mt-2">All-time revenue</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Avg. Conversion</p>
              <p className="text-2xl lg:text-3xl font-semibold text-blue-600 mt-1 lg:mt-2">
                {addOns?.length > 0 
                  ? (addOns.reduce((sum, addon) => sum + parseFloat((addon.stats?.conversionRate || 0).toString()), 0) / addOns.length).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs lg:text-sm text-amber-600 mt-1 lg:mt-2">Views to purchases</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search add-ons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="capacity">Capacity</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="branding">Branding</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="analytics.purchases-desc">Most Popular</SelectItem>
                <SelectItem value="analytics.revenue-desc">Highest Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons</CardTitle>
          <CardDescription>
            {pagination?.total || 0} add-ons found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading add-ons: {error.message}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('pricing.monthly')}
                    >
                      Pricing
                    </TableHead>
                    <TableHead className="text-right">Subscribers</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created
                    </TableHead>
                    <TableHead className="text-center">Marketplace</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addOns?.map((addOn) => (
                    <TableRow key={addOn._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{addOn.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {addOn.description}
                          </div>
                          {addOn.isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={categoryColors[addOn.category]}
                        >
                          {addOn.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={statusColors[addOn.status]}
                        >
                          {addOn.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {addOn.pricing.monthly && (
                            <div className="text-sm">
                              {formatCurrency(addOn.pricing.monthly)}/mo
                            </div>
                          )}
                          {addOn.pricing.yearly && (
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(addOn.pricing.yearly)}/yr
                            </div>
                          )}
                          {addOn.pricing.oneTime && (
                            <div className="text-sm">
                              {formatCurrency(addOn.pricing.oneTime)} one-time
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {addOn.stats?.activeSubscriptions || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(addOn.stats?.totalRevenue || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(addOn.stats?.conversionRate || 0).toString()}%
                      </TableCell>
                      <TableCell>
                        {formatDate(addOn.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Switch
                            checked={addOn.showOnMarketplace}
                            onCheckedChange={() => handleToggleMarketplace(addOn)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          {addOn.showOnMarketplace && (
                            <Globe className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingAnalytics(addOn)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingAddOn(addOn)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingAddOn(addOn)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <AddOnCreateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAddOn}
        />
      )}

      {editingAddOn && (
        <AddOnEditModal
          open={!!editingAddOn}
          addOn={editingAddOn}
          onClose={() => setEditingAddOn(null)}
          onSubmit={(data) => handleUpdateAddOn(editingAddOn._id, data)}
        />
      )}

      {viewingAnalytics && (
        <AddOnAnalyticsModal
          open={!!viewingAnalytics}
          addOn={viewingAnalytics}
          onClose={() => setViewingAnalytics(null)}
        />
      )}

      {deletingAddOn && (
        <AddOnDeleteModal
          open={!!deletingAddOn}
          addOn={deletingAddOn}
          onClose={() => setDeletingAddOn(null)}
          onConfirm={() => handleDeleteAddOn(deletingAddOn._id)}
        />
      )}
    </div>
  )
}