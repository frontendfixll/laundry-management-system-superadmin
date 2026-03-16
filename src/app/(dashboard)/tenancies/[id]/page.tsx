'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Building2, User, Settings, Shield, Save,
  RefreshCw, CheckCircle, XCircle, Users, Search,
  ShoppingCart, GitBranch, TrendingUp, IndianRupee,
  UserPlus, X, Eye, EyeOff
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/lib/superAdminApi';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TenancyOwner { _id: string; name: string; email: string; phone?: string; permissions: Record<string, Record<string, boolean>>; }

interface TenancyDetail {
  _id: string; name: string; businessName: string; subdomain: string; status: string;
  owner: TenancyOwner | null;
  subscription: { plan: string; status: string; features: Record<string, boolean | number>; };
  createdAt: string;
}

interface RoleStat { count: number; active: number; }

interface OverviewData {
  tenancy: TenancyDetail;
  summary: {
    branches: { total: number; active: number; inactive: number };
    users: { total: number; customers: RoleStat; admins: RoleStat; branchAdmins: RoleStat; staff: RoleStat; support: RoleStat };
    orders: { total: number; completed: number; pending: number; cancelled: number; revenue: number };
  };
  recentOrders: any[];
}

interface TenancyUser { _id: string; name: string; email: string; phone: string; role: string; isActive: boolean; isVIP: boolean; totalOrders: number; createdAt: string; }
interface UsersData { users: TenancyUser[]; roleSummary: Record<string, number>; pagination: Pagination; }

interface Branch { _id: string; name: string; code: string; status: string; address: { city?: string; state?: string; addressLine1?: string }; manager?: { name: string; email: string }; metrics?: { totalOrders?: number; totalRevenue?: number; customerCount?: number }; createdAt: string; }
interface BranchesData { branches: Branch[]; pagination: Pagination; }

interface Order { _id: string; orderNumber: string; status: string; isCancelled: boolean; pricing: { total?: number }; paymentStatus: string; serviceType: string; createdAt: string; customer?: { name: string; phone: string }; branch?: { name: string }; }
interface OrdersData { orders: Order[]; pagination: Pagination; }

interface Pagination { current: number; pages: number; total: number; limit: number; }

// ─── Permissions config ───────────────────────────────────────────────────────

const PERMISSION_MODULES = [
  { key: 'orders', label: 'Orders', description: 'Order management and processing', actions: ['view', 'create', 'update', 'delete', 'assign', 'cancel', 'process'] },
  { key: 'customers', label: 'Customers', description: 'Customer management', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'inventory', label: 'Inventory', description: 'Inventory and stock management', actions: ['view', 'create', 'update', 'delete', 'restock', 'writeOff'] },
  { key: 'services', label: 'Services', description: 'Service management and pricing', actions: ['view', 'create', 'update', 'delete', 'toggle', 'updatePricing'] },
  { key: 'staff', label: 'Staff', description: 'Staff management and attendance', actions: ['view', 'create', 'update', 'delete', 'assignShift', 'manageAttendance'] },
  { key: 'logistics', label: 'Logistics', description: 'Delivery and logistics management', actions: ['view', 'create', 'update', 'delete', 'assign', 'track'] },
  { key: 'tickets', label: 'Support Tickets', description: 'Customer support and tickets', actions: ['view', 'create', 'update', 'delete', 'assign', 'resolve', 'escalate'] },
  { key: 'performance', label: 'Performance', description: 'Analytics and performance reports', actions: ['view', 'create', 'update', 'delete', 'export'] },
  { key: 'analytics', label: 'Analytics', description: 'Business analytics and insights', actions: ['view'] },
  { key: 'settings', label: 'Settings', description: 'System settings and configuration', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'coupons', label: 'Coupons', description: 'Coupon and discount management', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'branches', label: 'Branches', description: 'Branch management', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'branchAdmins', label: 'Branch Admins', description: 'Branch administrator management', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'support', label: 'Support', description: 'Support system management', actions: ['view', 'create', 'update', 'delete', 'assign', 'manage'] }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  active: 'text-green-600', inactive: 'text-gray-400', suspended: 'text-red-500',
  placed: 'text-blue-500', confirmed: 'text-blue-600', processing: 'text-yellow-600',
  delivered: 'text-green-600', completed: 'text-green-700', cancelled: 'text-red-500',
  maintenance: 'text-orange-500'
};

function StatusDot({ status, cancelled }: { status: string; cancelled?: boolean }) {
  const s = cancelled ? 'cancelled' : status;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusColor[s] ?? 'text-gray-500'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.replace(/_/g, ' ')}
    </span>
  );
}

function Pager({ pagination, page, onPage }: { pagination: Pagination; page: number; onPage: (p: number) => void }) {
  if (pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-muted-foreground">Page {pagination.current} of {pagination.pages} · {pagination.total} total</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TenancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenancyId = params.id as string;

  // overview
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // permissions
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);

  // users tab
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('all');
  const [userStatus, setUserStatus] = useState('all');
  const [usersPage, setUsersPage] = useState(1);

  // branches tab
  const [branchesData, setBranchesData] = useState<BranchesData | null>(null);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [branchStatus, setBranchStatus] = useState('all');
  const [branchesPage, setBranchesPage] = useState(1);

  // orders tab
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);

  // create user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });

  const { isConnected } = useNotificationsWebSocket();

  useEffect(() => { fetchOverview(); }, [tenancyId]);

  // WebSocket: refresh overview when tenancy features/permissions change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkForSocket = () => {
      const socket = (window as any).__notificationSocket;
      if (socket?.connected) {
        socket.on('tenancyFeaturesUpdated', (d: any) => { if (d.tenancyId === tenancyId) fetchOverview(); });
        socket.on('tenancyPermissionsUpdated', (d: any) => { if (d.tenancyId === tenancyId) fetchOverview(); });
        return true;
      }
      return false;
    };
    if (!checkForSocket()) {
      let r = 0;
      const iv = setInterval(() => { if (checkForSocket() || ++r >= 10) clearInterval(iv); }, 1000);
      return () => clearInterval(iv);
    }
    return () => {
      const socket = (window as any).__notificationSocket;
      socket?.off('tenancyFeaturesUpdated');
      socket?.off('tenancyPermissionsUpdated');
    };
  }, [tenancyId, isConnected]);

  // ── Fetch functions ────────────────────────────────────────────────────────

  const fetchOverview = async () => {
    try {
      setOverviewLoading(true);
      const [ovRes, permRes] = await Promise.all([
        superAdminApi.get(`/tenancies/${tenancyId}/overview`),
        superAdminApi.get(`/tenancies/${tenancyId}/owner/permissions`)
      ]);
      if (ovRes?.success) setOverview(ovRes.data);
      if (permRes?.success) setPermissions(permRes.data.owner.permissions || {});
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tenancy');
      if (err.message?.includes('Session expired')) router.push('/auth/login?expired=true');
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setUsersLoading(true);
      const p = new URLSearchParams({ page: String(page), limit: '20' });
      if (userRole !== 'all') p.append('role', userRole);
      if (userStatus !== 'all') p.append('status', userStatus);
      if (userSearch.trim()) p.append('search', userSearch.trim());
      const res = await superAdminApi.get(`/tenancies/${tenancyId}/users?${p}`);
      if (res?.success) { setUsersData(res.data); setUsersPage(page); }
    } catch (err: any) { toast.error(err.message || 'Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const fetchBranches = async (page = 1) => {
    try {
      setBranchesLoading(true);
      const p = new URLSearchParams({ page: String(page), limit: '20' });
      if (branchStatus !== 'all') p.append('status', branchStatus);
      if (branchSearch.trim()) p.append('search', branchSearch.trim());
      const res = await superAdminApi.get(`/tenancies/${tenancyId}/branches?${p}`);
      if (res?.success) { setBranchesData(res.data); setBranchesPage(page); }
    } catch (err: any) { toast.error(err.message || 'Failed to load branches'); }
    finally { setBranchesLoading(false); }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setOrdersLoading(true);
      const p = new URLSearchParams({ page: String(page), limit: '20' });
      if (orderStatus !== 'all') p.append('status', orderStatus);
      if (orderSearch.trim()) p.append('search', orderSearch.trim());
      const res = await superAdminApi.get(`/tenancies/${tenancyId}/orders?${p}`);
      if (res?.success) { setOrdersData(res.data); setOrdersPage(page); }
    } catch (err: any) { toast.error(err.message || 'Failed to load orders'); }
    finally { setOrdersLoading(false); }
  };

  // ── Create tenancy user ───────────────────────────────────────────────────
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password) {
      toast.error('All fields are required');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setCreateUserLoading(true);
      const res = await superAdminApi.post(`/tenancies/${tenancyId}/users`, newUser);
      if (res?.success) {
        toast.success(res.message || 'User created successfully');
        setShowCreateUser(false);
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'customer' });
        setShowPassword(false);
        fetchUsers(1);
        fetchOverview();
      } else {
        toast.error(res?.message || 'Failed to create user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setCreateUserLoading(false);
    }
  };

  // ── Permission helpers ─────────────────────────────────────────────────────

  const handlePermissionChange = (module: string, action: string, value: boolean) =>
    setPermissions(p => ({ ...p, [module]: { ...p[module], [action]: value } }));

  const handleModuleToggle = (module: string, enable: boolean) => {
    const cfg = PERMISSION_MODULES.find(m => m.key === module);
    if (!cfg) return;
    setPermissions(p => ({ ...p, [module]: Object.fromEntries(cfg.actions.map(a => [a, enable])) }));
  };

  const grantAll = () => {
    const all: Record<string, Record<string, boolean>> = {};
    PERMISSION_MODULES.forEach(m => { all[m.key] = Object.fromEntries(m.actions.map(a => [a, true])); });
    setPermissions(all);
  };

  const revokeAll = () => {
    const none: Record<string, Record<string, boolean>> = {};
    PERMISSION_MODULES.forEach(m => { none[m.key] = Object.fromEntries(m.actions.map(a => [a, false])); });
    setPermissions(none);
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const res = await superAdminApi.patch(`/tenancies/${tenancyId}/owner/permissions`, { permissions });
      if (res?.success || res?.data?.success) toast.success('Permissions saved');
      else toast.error('Failed to save permissions');
    } catch (err: any) { toast.error(err.message || 'Failed to save permissions'); }
    finally { setSaving(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (overviewLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!overview) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Tenancy not found</h2>
        <Button onClick={() => router.push('/tenancies')}><ArrowLeft className="w-4 h-4 mr-2" />All Tenancies</Button>
      </div>
    </div>
  );

  const { tenancy, summary } = overview;

  let enabledModules = 0, totalPerms = 0;
  Object.keys(permissions).forEach(m => {
    const en = Object.values(permissions[m] || {}).filter(Boolean);
    if (en.length) { enabledModules++; totalPerms += en.length; }
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tenancy.name}</h1>
            <p className="text-xs text-muted-foreground">{tenancy.subdomain}.laundrylobby.com</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-muted-foreground">{isConnected ? 'Live' : 'Offline'}</span>
          <Button variant="outline" size="sm" onClick={fetchOverview} disabled={overviewLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${overviewLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Badge variant={tenancy.status === 'active' ? 'default' : 'secondary'}>{tenancy.status}</Badge>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Branches</p>
                <p className="text-2xl font-bold">{summary.branches.total}</p>
                <p className="text-xs text-green-600">{summary.branches.active} active</p>
              </div>
              <GitBranch className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{summary.users.customers.count}</p>
                <p className="text-xs text-green-600">{summary.users.customers.active} active</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">{(summary.users.staff.count) + (summary.users.branchAdmins.count) + (summary.users.admins.count)}</p>
                <p className="text-xs text-muted-foreground">{summary.users.admins.count} admin · {summary.users.staff.count} staff</p>
              </div>
              <User className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{summary.orders.total}</p>
                <p className="text-xs text-muted-foreground">{summary.orders.pending} pending</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">₹{(summary.orders.revenue / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-green-600">{summary.orders.completed} completed</p>
              </div>
              <IndianRupee className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4"
        onValueChange={(v) => {
          if (v === 'users' && !usersData) fetchUsers(1);
          if (v === 'branches' && !branchesData) fetchBranches(1);
          if (v === 'orders' && !ordersData) fetchOrders(1);
        }}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-3.5 h-3.5 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="branches"><GitBranch className="w-3.5 h-3.5 mr-1" />Branches</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="w-3.5 h-3.5 mr-1" />Orders</TabsTrigger>
          <TabsTrigger value="permissions"><Shield className="w-3.5 h-3.5 mr-1" />Permissions</TabsTrigger>
          <TabsTrigger value="features"><Settings className="w-3.5 h-3.5 mr-1" />Features</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tenancy info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Tenancy Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Business Name" value={tenancy.businessName || tenancy.name} />
                <Row label="Subdomain" value={`${tenancy.subdomain}.laundrylobby.com`} />
                <Row label="Status" value={<Badge variant={tenancy.status === 'active' ? 'default' : 'secondary'}>{tenancy.status}</Badge>} />
                <Row label="Plan" value={<span className="capitalize">{tenancy.subscription.plan}</span>} />
                <Row label="Sub Status" value={tenancy.subscription.status} />
                <Row label="Created" value={new Date(tenancy.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </CardContent>
            </Card>

            {/* Owner info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Owner / Admin</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {tenancy.owner ? (
                  <>
                    <Row label="Name" value={tenancy.owner.name} />
                    <Row label="Email" value={tenancy.owner.email} />
                    {tenancy.owner.phone && <Row label="Phone" value={tenancy.owner.phone} />}
                    <Row label="Permissions" value={`${enabledModules} modules · ${totalPerms} actions`} />
                  </>
                ) : <p className="text-muted-foreground">No owner assigned</p>}
              </CardContent>
            </Card>
          </div>

          {/* User breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-base">User Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Customers', stat: summary.users.customers },
                  { label: 'Admins', stat: summary.users.admins },
                  { label: 'Branch Admins', stat: summary.users.branchAdmins },
                  { label: 'Staff', stat: summary.users.staff },
                  { label: 'Support', stat: summary.users.support },
                ].map(({ label, stat }) => (
                  <div key={label} className="border rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xs text-green-600 mt-0.5">{stat.active} active</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { /* switch to orders tab */ }}>View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              {overview.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 pr-3 font-medium">Order #</th>
                      <th className="text-left py-2 pr-3 font-medium">Customer</th>
                      <th className="text-left py-2 pr-3 font-medium">Branch</th>
                      <th className="text-left py-2 pr-3 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentOrders.map((o: any) => (
                      <tr key={o._id} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-mono text-xs">{o.orderNumber}</td>
                        <td className="py-2 pr-3">{o.customer?.name ?? '—'}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{o.branch?.name ?? '—'}</td>
                        <td className="py-2 pr-3"><StatusDot status={o.status} cancelled={o.isCancelled} /></td>
                        <td className="py-2">₹{(o.pricing?.total ?? 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── USERS ── */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['admin', 'branch_admin', 'staff', 'customer', 'support'].map((role) => (
              <Card key={role}>
                <CardContent className="pt-4 pb-3">
                  <div className="text-2xl font-bold">{usersData?.roleSummary[role] ?? '—'}</div>
                  <p className="text-xs text-muted-foreground capitalize">{role.replace('_', ' ')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">All Users</CardTitle>
                  <CardDescription>{usersData ? `${usersData.pagination.total} users` : 'Loading…'}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchUsers(1)} disabled={usersLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${usersLoading ? 'animate-spin' : ''}`} />Refresh
                  </Button>
                  <Button size="sm" onClick={() => setShowCreateUser(true)}>
                    <UserPlus className="w-4 h-4 mr-1" />Add User
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Name, email, phone…" value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers(1)} className="pl-8" />
                </div>
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="All roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="branch_admin">Branch Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userStatus} onValueChange={setUserStatus}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="All status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchUsers(1)}>Search</Button>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? <Spinner /> : !usersData || usersData.users.length === 0 ? <Empty msg="No users found" /> : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        {['Name', 'Email', 'Phone', 'Role', 'Status', 'Orders', 'Joined'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.users.map(u => (
                        <tr key={u._id} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="py-2 pr-4">
                            {u.name}
                            {u.isVIP && <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">VIP</Badge>}
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">{u.email}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{u.phone}</td>
                          <td className="py-2 pr-4"><Badge variant="outline" className="capitalize text-xs">{u.role.replace('_', ' ')}</Badge></td>
                          <td className="py-2 pr-4">
                            <span className={`inline-flex items-center gap-1 text-xs ${u.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />{u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 pr-4">{u.totalOrders ?? 0}</td>
                          <td className="py-2 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pager pagination={usersData.pagination} page={usersPage} onPage={fetchUsers} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BRANCHES ── */}
        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Branches</CardTitle>
                  <CardDescription>{branchesData ? `${branchesData.pagination.total} branches` : 'Loading…'}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchBranches(1)} disabled={branchesLoading}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${branchesLoading ? 'animate-spin' : ''}`} />Refresh
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Name, code, city…" value={branchSearch} onChange={e => setBranchSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBranches(1)} className="pl-8" />
                </div>
                <Select value={branchStatus} onValueChange={setBranchStatus}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="All status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchBranches(1)}>Search</Button>
              </div>
            </CardHeader>
            <CardContent>
              {branchesLoading ? <Spinner /> : !branchesData || branchesData.branches.length === 0 ? <Empty msg="No branches found" /> : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        {['Name', 'Code', 'City', 'Manager', 'Status', 'Orders', 'Revenue'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {branchesData.branches.map(b => (
                        <tr key={b._id} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="py-2 pr-4 font-medium">{b.name}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{b.code}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{b.address?.city ?? '—'}</td>
                          <td className="py-2 pr-4">{b.manager?.name ?? <span className="text-muted-foreground">—</span>}</td>
                          <td className="py-2 pr-4"><StatusDot status={b.status} /></td>
                          <td className="py-2 pr-4">{b.metrics?.totalOrders ?? 0}</td>
                          <td className="py-2">₹{(b.metrics?.totalRevenue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pager pagination={branchesData.pagination} page={branchesPage} onPage={fetchBranches} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ORDERS ── */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Orders</CardTitle>
                  <CardDescription>{ordersData ? `${ordersData.pagination.total} orders` : 'Loading…'}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchOrders(1)} disabled={ordersLoading}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${ordersLoading ? 'animate-spin' : ''}`} />Refresh
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Order number…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchOrders(1)} className="pl-8" />
                </div>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="All status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchOrders(1)}>Search</Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? <Spinner /> : !ordersData || ordersData.orders.length === 0 ? <Empty msg="No orders found" /> : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        {['Order #', 'Customer', 'Branch', 'Service', 'Status', 'Payment', 'Amount', 'Date'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ordersData.orders.map(o => (
                        <tr key={o._id} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="py-2 pr-4 font-mono text-xs">{o.orderNumber}</td>
                          <td className="py-2 pr-4">{o.customer?.name ?? '—'}<br /><span className="text-xs text-muted-foreground">{o.customer?.phone}</span></td>
                          <td className="py-2 pr-4 text-muted-foreground">{o.branch?.name ?? '—'}</td>
                          <td className="py-2 pr-4 text-xs capitalize">{o.serviceType?.replace(/_/g, ' ')}</td>
                          <td className="py-2 pr-4"><StatusDot status={o.status} cancelled={o.isCancelled} /></td>
                          <td className="py-2 pr-4"><StatusDot status={o.paymentStatus} /></td>
                          <td className="py-2 pr-4 font-medium">₹{(o.pricing?.total ?? 0).toLocaleString('en-IN')}</td>
                          <td className="py-2 text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pager pagination={ordersData.pagination} page={ordersPage} onPage={fetchOrders} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PERMISSIONS ── */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>Owner Permissions</CardTitle>
                  <CardDescription>Manage what the tenancy owner can access</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={revokeAll}><XCircle className="w-4 h-4 mr-1" />Revoke All</Button>
                  <Button variant="outline" size="sm" onClick={grantAll}><CheckCircle className="w-4 h-4 mr-1" />Grant All</Button>
                  <Button size="sm" onClick={savePermissions} disabled={saving}>
                    {saving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PERMISSION_MODULES.map(mod => {
                  const mp = permissions[mod.key] || {};
                  const enabled = mod.actions.filter(a => mp[a]);
                  const allOn = enabled.length === mod.actions.length;
                  return (
                    <div key={mod.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-sm">{mod.label}</h3>
                          <p className="text-xs text-muted-foreground">{mod.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={allOn ? 'default' : enabled.length ? 'secondary' : 'outline'} className="text-xs">
                            {enabled.length}/{mod.actions.length}
                          </Badge>
                          <Button size="sm" variant={allOn ? 'destructive' : 'default'} onClick={() => handleModuleToggle(mod.key, !allOn)}>
                            {allOn ? 'Disable All' : 'Enable All'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {mod.actions.map(action => (
                          <label key={action} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={mp[action] || false}
                              onChange={e => handlePermissionChange(mod.key, action, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-xs capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEATURES ── */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Tenancy Features</CardTitle>
              <CardDescription>Features enabled for this tenancy's plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(tenancy.subscription.features).map(([feat, on]) => (
                  <div key={feat} className={`flex items-center gap-2 p-2 rounded-lg border ${on ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm capitalize">{feat.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateUser(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add User to {tenancy.name}</h2>
              <button onClick={() => setShowCreateUser(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cu-name">Full Name *</Label>
                <Input id="cu-name" placeholder="Enter full name" value={newUser.name}
                  onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-email">Email *</Label>
                <Input id="cu-email" type="email" placeholder="user@example.com" value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-phone">Phone (10 digits) *</Label>
                <Input id="cu-phone" placeholder="9876543210" value={newUser.phone} maxLength={10}
                  onChange={e => setNewUser(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-password">Password *</Label>
                <div className="relative">
                  <Input id="cu-password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={newUser.password}
                    onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-role">Role *</Label>
                <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="branch_admin">Branch Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
              <Button onClick={handleCreateUser} disabled={createUserLoading}>
                {createUserLoading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-dashed last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-blue-500" /></div>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-8 text-muted-foreground text-sm">{msg}</div>;
}
