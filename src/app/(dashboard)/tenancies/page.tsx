'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Building2, Users, Calendar, Settings, Trash2, Edit, Mail, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TenanciesPage() {
  const { 
    tenancies, 
    loading, 
    error, 
    fetchTenancies,
    createTenancy, 
    updateTenancy, 
    updateTenancyStatus,
    deleteTenancy,
    inviteLaundryAdmin 
  } = useTenancies();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    subdomain: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  });

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchTenancies();
  }, [fetchTenancies]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.ownerName || !createForm.ownerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createTenancy({
      name: createForm.name,
      subdomain: createForm.subdomain || undefined,
      description: createForm.description || undefined,
      owner: {
        name: createForm.ownerName,
        email: createForm.ownerEmail,
        phone: createForm.ownerPhone || undefined,
      }
    });

    if (result.success) {
      toast.success('Tenancy created successfully');
      if (result.tempPassword) {
        toast.success(`Temp password: ${result.tempPassword}`, { duration: 10000 });
      }
      setIsCreateOpen(false);
      setCreateForm({ name: '', subdomain: '', description: '', ownerName: '', ownerEmail: '', ownerPhone: '' });
    } else {
      toast.error(result.message || 'Failed to create tenancy');
    }
  };

  const handleStatusChange = async (tenancy: Tenancy, newStatus: Tenancy['status']) => {
    const success = await updateTenancyStatus(tenancy._id, newStatus);
    if (success) {
      toast.success(`Tenancy ${newStatus}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tenancy? This action cannot be undone.')) {
      const success = await deleteTenancy(id);
      if (success) {
        toast.success('Tenancy deleted');
      }
    }
  };

  const handleInvite = async () => {
    if (!selectedTenancy || !inviteForm.name || !inviteForm.email || !inviteForm.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await inviteLaundryAdmin({
      tenancyId: selectedTenancy._id,
      name: inviteForm.name,
      email: inviteForm.email,
      phone: inviteForm.phone,
    });

    if (result.success) {
      toast.success('Invitation sent successfully');
      setIsInviteOpen(false);
      setInviteForm({ name: '', email: '', phone: '' });
      setSelectedTenancy(null);
    } else {
      toast.error(result.message || 'Failed to send invitation');
    }
  };

  const openInviteDialog = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy);
    setInviteForm({ name: '', email: '', phone: '' });
    setIsInviteOpen(true);
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
          <DialogContent className="max-w-lg">
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
              <Button onClick={handleCreate} disabled={loading}>Create Tenancy</Button>
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
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenancies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                          title="Invite Admin"
                          onClick={() => openInviteDialog(tenancy)}
                        >
                          <Mail className="h-4 w-4" />
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
                          onClick={() => handleDelete(tenancy._id)}
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

      {/* Invite Admin Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Laundry Admin</DialogTitle>
            <DialogDescription>
              Send an invitation to manage {selectedTenancy?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-name">Name *</Label>
              <Input
                id="invite-name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="Admin Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-phone">Phone *</Label>
              <Input
                id="invite-phone"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
