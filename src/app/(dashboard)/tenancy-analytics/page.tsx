'use client';

import { useState, useEffect } from 'react';
import { useTenancyAnalytics } from '@/hooks/useTenancyAnalytics';
import { useTenancies } from '@/hooks/useTenancies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PrivacyToggle from '@/components/ui/PrivacyToggle';
import PrivateRevenueCard from '@/components/ui/PrivateRevenueCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function TenancyAnalyticsPage() {
  const { platformAnalytics, loading, error, fetchPlatformAnalytics } = useTenancyAnalytics();
  const { tenancies, fetchTenancies } = useTenancies();
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchPlatformAnalytics(period);
    fetchTenancies();
  }, [fetchPlatformAnalytics, fetchTenancies, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    fetchPlatformAnalytics(newPeriod);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const planData = platformAnalytics?.tenanciesByPlan 
    ? Object.entries(platformAnalytics.tenanciesByPlan).map(([name, value]) => ({ name, value }))
    : [];

  const statusData = platformAnalytics?.tenanciesByStatus
    ? Object.entries(platformAnalytics.tenanciesByStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenancy Analytics</h1>
          <p className="text-muted-foreground">Platform-wide tenancy performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchPlatformAnalytics(period)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{error}</div>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenancies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformAnalytics?.overview.totalTenancies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformAnalytics?.overview.activeTenancies || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Tenancies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{platformAnalytics?.overview.newTenancies || 0}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <PrivateRevenueCard
          title="Platform Revenue"
          amount={formatCurrency(platformAnalytics?.overview.platformRevenue || 0)}
          subtitle="From subscriptions"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          storageKey="platform-revenue-analytics"
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformAnalytics?.overview.totalTenancies 
                ? Math.round((platformAnalytics.overview.activeTenancies / platformAnalytics.overview.totalTenancies) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of all tenancies</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Plan Distribution
            </CardTitle>
            <CardDescription>Tenancies by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {planData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {planData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Signup Trend
            </CardTitle>
            <CardDescription>New tenancy signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {platformAnalytics?.dailySignups && platformAnalytics.dailySignups.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={platformAnalytics.dailySignups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="_id" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No signup data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenancies Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top by Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tenancies by Orders</CardTitle>
            <CardDescription>Highest order volume this period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenancy</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformAnalytics?.topTenanciesByOrders?.length ? (
                  platformAnalytics.topTenanciesByOrders.map((t, i) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.subdomain}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={i === 0 ? 'default' : 'secondary'}>{t.orderCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tenancies by Revenue</CardTitle>
            <CardDescription>Highest revenue this period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenancy</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformAnalytics?.topTenanciesByRevenue?.length ? (
                  platformAnalytics.topTenanciesByRevenue.map((t, i) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.subdomain}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <PrivateRevenueCard
                          title=""
                          amount={formatCurrency(t.revenue)}
                          storageKey={`tenancy-revenue-${t._id}`}
                          className="inline-flex"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
