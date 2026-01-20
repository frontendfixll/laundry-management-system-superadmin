'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenancies, Tenancy } from '@/hooks/useTenancies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, Users, Calendar, Settings, Trash2, Edit, RefreshCw, Tag, Check, X, Shield } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/lib/superAdminApi';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface BillingPlan {
  _id: string;
  name: string;
  displayName: string;
  price: { monthly: number; yearly: number };
  trialDays: number;
  features: Record<string, boolean>;
}

// All available features for permissions
const ALL_FEATURES = [
  { key: 'orders', label: 'Orders', description: 'Order management' },
  { key: 'customers', label: 'Customers', description: 'Customer management' },
  { key: 'inventory', label: 'Inventory', description: 'Inventory management' },
  { key: 'services', label: 'Services', description: 'Service management' },
  { key: 'branches', label: 'Branches', description: 'Branch management' },
  { key: 'branch_admins', label: 'Branch Admins', description: 'Branch admin management' },
  { key: 'campaigns', label: 'Campaigns', description: 'Marketing campaigns' },
  { key: 'banners', label: 'Banners', description: 'Banner management' },
  { key: 'coupons', label: 'Coupons', description: 'Coupon management' },
  { key: 'discounts', label: 'Discounts', description: 'Discount management' },
  { key: 'referral_program', label: 'Referral Program', description: 'Referral system' },
  { key: 'loyalty_points', label: 'Loyalty Points', description: 'Loyalty program' },
  { key: 'wallet', label: 'Wallet', description: 'Customer wallet' },
  { key: 'logistics', label: 'Logistics', description: 'Delivery management' },
  { key: 'tickets', label: 'Support Tickets', description: 'Support system' },
  { key: 'reviews', label: 'Reviews', description: 'Customer reviews' },
  { key: 'refunds', label: 'Refunds', description: 'Refund management' },
  { key: 'payments', label: 'Payments', description: 'Payment management' },
  { key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Analytics & reports' },
  { key: 'custom_branding', label: 'Custom Branding', description: 'Branding customization' },
  { key: 'custom_domain', label: 'Custom Domain', description: 'Custom domain support' },
  { key: 'api_access', label: 'API Access', description: 'API integration' },
  { key: 'white_label', label: 'White Label', description: 'White label branding' },
  { key: 'priority_support', label: 'Priority Support', description: 'Priority support' },
];

export default function TenanciesPage() {
  const router = useRouter();
  const { 
    tenancies, 
    loading, 
    error, 
    fetchTenancies,
    createTenancy, 
    updateTenancy, 
    updateTenancyStatus,
    deleteTenancy
  } = useTenancies();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null);
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    subdomain: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    planId: '',
    trialDays: 14,
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    planId: '',
    features: {} as Record<string, boolean>,
  });

  useEffect(() => {
    fetchTenancies();
    fetchBillingPlans();
  }, [fetchTenancies]);

  const fetchBillingPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await superAdminApi.getBillingPlans();
      if (response.success) {
        setBillingPlans(response.data?.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch billing plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.ownerName || !createForm.ownerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!createForm.planId) {
      toast.error('Please select a billing plan');
      return;
    }

    const selectedPlan = billingPlans.find(p => p._id === createForm.planId);

    const result = await createTenancy({
      name: createForm.name,
      subdomain: createForm.subdomain || undefined,
      description: createForm.description || undefined,
      owner: {
        name: createForm.ownerName,
        email: createForm.ownerEmail,
        phone: createForm.ownerPhone || undefined,
      },
      subscription: {
        plan: selectedPlan?.name || 'free',
        planId: createForm.planId,
        status: 'trial',
        features: selectedPlan?.features || {},
        trialDays: createForm.trialDays
      }
    });

    if (result.success) {
      toast.success('Tenancy created successfully');
      if (result.tempPassword) {
        toast.success(`Temp password: ${result.tempPassword}`, { duration: 10000 });
      }
      setIsCreateOpen(false);
      setCreateForm({ name: '', subdomain: '', description: '', ownerName: '', ownerEmail: '', ownerPhone: '', planId: '', trialDays: 14 });
    } else {
      toast.error(result.message || 'Failed to create tenancy');
    }
  };

  const openEditModal = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy);
    setEditForm({
      name: tenancy.name,
      description: tenancy.description || '',
      planId: tenancy.subscription?.planId || '',
      features: { ...tenancy.subscription?.features } || {},
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedTenancy) return;
    
    setSaving(true);
    try {
      const result = await updateTenancy(selectedTenancy._id, {
        name: editForm.name,
        description: editForm.description,
        subscription: {
          ...selectedTenancy.subscription,
          features: editForm.features,
        }
      });

      if (result) {
        toast.success('Tenancy updated successfully');
        setIsEditOpen(false);
        fetchTenancies();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update tenancy');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: string) => {
    setEditForm(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: !prev.features[key]
      }
    }));
  };

  const handleStatusChange = async (tenancy: Tenancy, newStatus: Tenancy['status']) => {
    const success = await updateTenancyStatus(tenancy._id, newStatus);
    if (success) {
      toast.success(`Tenancy ${newStatus}`);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteTenancy(id);
    if (success) {
      toast.success('Tenancy deleted');
    }
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      suspended: 'destructive',
      pending: 'secondary',
      inactive: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-amber-100 text-amber-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan] || colors.free}`}>
        {plan}
      </span>
    );
  };

  const countEnabledFeatures = (features: Record<string, boolean>) => {
    return Object.values(features || {}).filter(v => v === true).length;
  };

  if (loading && tenancies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenancies</h1>
          <p className="text-muted-foreground">Manage laundry business tenants on the platform</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenancy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tenancy</DialogTitle>
              <DialogDescription>Add a new laundry business to the platform</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Clean & Fresh Laundry"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={createForm.subdomain}
                  onChange={(e) => setCreateForm({ ...createForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="cleanfresh"
                />
                <p className="text-xs text-muted-foreground">
                  Portal: {createForm.subdomain || 'subdomain'}.laundry-platform.com
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Brief description of the laundry business"
                />
              </div>

              {/* Plan Selection */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Billing Plan *
                </h4>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="plan">Select Plan</Label>
                    <Select
                      value={createForm.planId}
                      onValueChange={(value) => {
                        const plan = billingPlans.find(p => p._id === value);
                        setCreateForm({ 
                          ...createForm, 
                          planId: value,
                          trialDays: plan?.trialDays || 14
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a billing plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {billingPlans.map((plan) => (
                          <SelectItem key={plan._id} value={plan._id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{plan.displayName}</span>
                              <span className="text-muted-foreground text-xs">
                                (₹{plan.price.monthly}/mo)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trialDays">Trial Days</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      min="0"
                      max="90"
                      value={createForm.trialDays}
                      onChange={(e) => setCreateForm({ ...createForm, trialDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Owner/Admin Details</h4>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="ownerName">Admin Name *</Label>
                    <Input
                      id="ownerName"
                      value={createForm.ownerName}
                      onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ownerEmail">Admin Email *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={createForm.ownerEmail}
                      onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
                      placeholder="admin@cleanfresh.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ownerPhone">Admin Phone</Label>
                    <Input
                      id="ownerPhone"
                      value={createForm.ownerPhone}
                      onChange={(e) => setCreateForm({ ...createForm, ownerPhone: e.target.value })}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading || !createForm.planId}>Create Tenancy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenancies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenancies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenancies.filter(t => t.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenancies.filter(t => t.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenancies.filter(t => {
                const created = new Date(t.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenancies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenancies</CardTitle>
          <CardDescription>A list of all laundry businesses on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenancies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tenancies found. Create your first tenancy to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tenancies.map((tenancy) => (
                  <TableRow key={tenancy._id}>
                    <TableCell className="font-medium">{tenancy.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{tenancy.subdomain}</code>
                    </TableCell>
                    <TableCell>{getPlanBadge(tenancy.subscription?.plan || 'free')}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {countEnabledFeatures(tenancy.subscription?.features || {})} enabled
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(tenancy.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {tenancy.owner?.name && <div>{tenancy.owner.name}</div>}
                        {tenancy.owner?.email && <div className="text-muted-foreground text-xs">{tenancy.owner.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenancy.createdAt 
                        ? format(new Date(tenancy.createdAt), 'MMM d, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Manage Owner Permissions"
                          onClick={() => router.push(`/tenancies/${tenancy._id}`)}
                        >
                          <Shield className="h-4 w-4 text-purple-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit Features"
                          onClick={() => openEditModal(tenancy)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        {tenancy.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Suspend"
                            onClick={() => handleStatusChange(tenancy, 'suspended')}
                          >
                            <RefreshCw className="h-4 w-4 text-orange-500" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Activate"
                            onClick={() => handleStatusChange(tenancy, 'active')}
                          >
                            <RefreshCw className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: tenancy._id, name: tenancy.name })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Tenancy Modal with Permissions */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenancy</DialogTitle>
            <DialogDescription>Update tenancy details and permissions</DialogDescription>
          </DialogHeader>
          {selectedTenancy && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Business Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              {/* Current Plan Info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Plan:</span>
                  {getPlanBadge(selectedTenancy.subscription?.plan || 'free')}
                </div>
              </div>

              {/* Permissions Section */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Feature Permissions ({countEnabledFeatures(editForm.features)} enabled)
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable or disable features for this tenancy. These override the plan defaults.
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                  {ALL_FEATURES.map((feature) => (
                    <div 
                      key={feature.key}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        editForm.features[feature.key] 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleFeature(feature.key)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{feature.label}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        editForm.features[feature.key] 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-500'
                      }`}>
                        {editForm.features[feature.key] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm?.isOpen || false}
        title="Delete Tenancy"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
