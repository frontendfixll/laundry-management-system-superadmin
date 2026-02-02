'use client'

import React, { useState } from 'react'
import { X, TrendingUp, Users, DollarSign, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAddOnAnalytics } from '@/hooks/useAddOns'
import { formatCurrency, formatDate, formatNumber, formatPercentage } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AddOnAnalyticsModalProps {
  open: boolean
  addOn: any
  onClose: () => void
}

export function AddOnAnalyticsModal({ open, addOn, onClose }: AddOnAnalyticsModalProps) {
  const [period, setPeriod] = useState('30d')
  const { analytics, loading, error } = useAddOnAnalytics(addOn?._id, period)

  if (!open || !addOn) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">Add-on Analytics</h2>
            <p className="text-sm text-muted-foreground truncate">
              {addOn.displayName} • {addOn.category}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading analytics: {error.message}
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.subscriptions?.total || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.subscriptions?.active || 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(analytics.revenue?.totalRevenue || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.revenue?.totalTransactions || 0} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.performance?.views || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.performance?.conversionRate || 0}% conversion
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.subscriptions?.churnRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.subscriptions?.cancelled || 0} cancelled
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Subscription Trend */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Subscription Trend</CardTitle>
                    <CardDescription className="text-xs">New subscriptions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.trends?.subscriptions || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="newSubscriptions" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                    <CardDescription className="text-xs">Revenue by billing cycle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Monthly', value: analytics.revenue?.monthly || 0 },
                          { name: 'Yearly', value: analytics.revenue?.yearly || 0 },
                          { name: 'One-time', value: analytics.revenue?.oneTime || 0 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="value" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Tenants */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Top Customers</CardTitle>
                  <CardDescription className="text-xs">Highest spending customers for this add-on</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[200px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Customer</TableHead>
                          <TableHead className="text-right text-xs">Total Spent</TableHead>
                          <TableHead className="text-right text-xs">Transactions</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.topTenants && analytics.topTenants.length > 0 ? (
                          analytics.topTenants.map((tenant: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium text-sm">
                                {tenant.tenantName}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {formatCurrency(tenant.totalSpent)}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {tenant.transactionCount}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-4">
                              No customer data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Views</span>
                      <span className="font-medium">{analytics.performance?.views || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Purchases</span>
                      <span className="font-medium">{analytics.performance?.purchases || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(analytics.performance?.conversionRate || 0, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Average Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transaction Value</span>
                      <span className="font-medium">
                        {formatCurrency(analytics.revenue?.averageTransaction || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer LTV</span>
                      <span className="font-medium">
                        {formatCurrency((analytics.revenue?.totalRevenue || 0) / Math.max(analytics.subscriptions?.total || 1, 1))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Recurring</span>
                      <span className="font-medium">
                        {formatCurrency(analytics.revenue?.monthlyRecurring || 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Growth Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth Rate</span>
                      <span className="font-medium text-green-600">
                        +{analytics.growth?.subscriptionGrowth || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Growth</span>
                      <span className="font-medium text-green-600">
                        +{analytics.growth?.revenueGrowth || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Retention Rate</span>
                      <span className="font-medium">
                        {100 - (analytics.subscriptions?.churnRate || 0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No analytics data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}