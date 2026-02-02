'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Check, 
  X,
  Zap,
  Crown,
  Building2,
  Rocket,
  Plus,
  Trash2,
  Star,
  Settings,
  Shirt,
  Sparkles,
  Megaphone,
  Wallet,
  Users,
  Award,
  Package,
  Palette,
  Globe,
  HeadphonesIcon,
  Code,
  BarChart3,
  Shield,
  UserCog,
  Truck,
  CreditCard,
  UserCheck,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { getAuthHeaders } from '@/lib/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FeatureDefinition {
  _id: string;
  key: string;
  name: string;
  description?: string;
  category: string;
  valueType: 'boolean' | 'number';
  defaultValue: boolean | number;
  isActive: boolean;
  sortOrder: number;
  icon?: string;
}

interface BillingPlan {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  price: { monthly: number; yearly: number };
  features: Record<string, boolean | number>;
  trialDays?: number;
  isPopular?: boolean;
  badge?: string;
  isActive: boolean;
  isDefault?: boolean;
  isCustom?: boolean;
  showOnMarketing: boolean;
  sortOrder?: number;
}

const planIcons: Record<string, any> = {
  free: Zap,
  basic: Building2,
  pro: Rocket,
  enterprise: Crown
};

const planColors: Record<string, string> = {
  free: 'bg-gray-100 border-gray-300',
  basic: 'bg-blue-50 border-blue-300',
  pro: 'bg-purple-50 border-purple-300',
  enterprise: 'bg-amber-50 border-amber-300'
};

const categoryLabels: Record<string, string> = {
  admin_permissions: 'Admin Permissions',
  platform: 'Platform',
  limits: 'Limits',
  branding: 'Branding',
  support: 'Support'
};

const iconMap: Record<string, any> = {
  Shirt, Sparkles, Megaphone, Wallet, Users, Award, Package, Building2, 
  Palette, Globe, HeadphonesIcon, Code, BarChart3, Zap, Shield, UserCog,
  Truck, CreditCard, UserCheck, FileText
};

export default function BillingPlansPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [featureDefinitions, setFeatureDefinitions] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; name: string } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    displayName: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    trialDays: number;
    isPopular: boolean;
    badge: string;
    isActive: boolean;
    showOnMarketing: boolean;
    features: Record<string, boolean | number>;
  }>({
    name: '',
    displayName: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    trialDays: 14,
    isPopular: false,
    badge: '',
    isActive: true,
    showOnMarketing: true,
    features: {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/superadmin/billing/plans?includeInactive=true`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPlans(data.data.plans || []);
        setFeatureDefinitions(data.data.featureDefinitions || []);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFeatures = (): Record<string, boolean | number> => {
    const defaults: Record<string, boolean | number> = {};
    featureDefinitions.forEach(f => {
      defaults[f.key] = f.defaultValue;
    });
    return defaults;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      priceMonthly: 0,
      priceYearly: 0,
      trialDays: 14,
      isPopular: false,
      badge: '',
      isActive: true,
      showOnMarketing: true,
      features: getDefaultFeatures()
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (plan: BillingPlan) => {
    setEditingPlan(plan);
    // Merge plan features with defaults (in case new features were added)
    const mergedFeatures = { ...getDefaultFeatures(), ...plan.features };
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || '',
      priceMonthly: plan.price.monthly,
      priceYearly: plan.price.yearly,
      trialDays: plan.trialDays || 14,
      isPopular: plan.isPopular || false,
      badge: plan.badge || '',
      isActive: plan.isActive,
      showOnMarketing: plan.showOnMarketing !== false,
      features: mergedFeatures
    });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/billing/plans/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName || formData.name,
          description: formData.description,
          price: {
            monthly: formData.priceMonthly,
            yearly: formData.priceYearly
          },
          features: formData.features,
          trialDays: formData.trialDays,
          isPopular: formData.isPopular,
          badge: formData.badge,
          showOnMarketing: formData.showOnMarketing
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Plan created!');
        setIsCreateOpen(false);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create plan');
      }
    } catch (err) {
      toast.error('Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/billing/plans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editingPlan.name,
          displayName: formData.displayName,
          description: formData.description,
          price: {
            monthly: formData.priceMonthly,
            yearly: formData.priceYearly
          },
          features: formData.features,
          trialDays: formData.trialDays,
          isPopular: formData.isPopular,
          badge: formData.badge,
          isActive: formData.isActive,
          showOnMarketing: formData.showOnMarketing
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Plan updated!');
        setIsEditOpen(false);
        setEditingPlan(null);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update plan');
      }
    } catch (err) {
      toast.error('Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planName: string) => {
    setDeleting(planName);
    try {
      const response = await fetch(`${API_URL}/superadmin/billing/plans/${planName}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Plan deleted!');
        fetchData();
      } else {
        toast.error(data.message || 'Failed to delete plan');
      }
    } catch (err) {
      toast.error('Failed to delete plan');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const updateFeature = (key: string, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  const isDefaultPlan = (name: string) => ['free', 'basic', 'pro', 'enterprise'].includes(name);

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    if (amount === -1) return 'Custom';
    return `₹${amount.toLocaleString()}`;
  };

  const formatLimit = (value: number) => {
    if (value === -1) return 'Unlimited';
    return value.toLocaleString();
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
  };

  const getFeaturesByCategory = () => {
    const grouped: Record<string, FeatureDefinition[]> = {};
    featureDefinitions.filter(f => f.isActive).forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f);
    });
    return grouped;
  };

  const countEnabledFeatures = (plan: BillingPlan) => {
    return Object.entries(plan.features || {}).filter(([_, v]) => v === true || (typeof v === 'number' && v !== 0)).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const featuresByCategory = getFeaturesByCategory();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans with dynamic features</p>
        </div>
        <div className="flex gap-2">
          <Link href="/billing/features">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Features
            </Button>
          </Link>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || Star;
          const colorClass = planColors[plan.name] || 'bg-green-50 border-green-300';
          const isCustom = !isDefaultPlan(plan.name);
          
          return (
            <Card key={plan._id} className={`relative ${colorClass} border-2 flex flex-col h-full`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white">{plan.badge || 'Popular'}</Badge>
                </div>
              )}
              {isCustom && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Custom</Badge>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {plan.showOnMarketing && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Public</Badge>
                )}
                {!plan.isActive && (
                  <Badge variant="destructive">Disabled</Badge>
                )}
              </div>
              
              <CardHeader className="pb-2 pt-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                </div>
                {plan.description && (
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="flex flex-col flex-1">
                <div className="mb-4">
                  <div className="text-3xl font-bold">{formatPrice(plan.price.monthly)}</div>
                  <div className="text-sm text-muted-foreground">
                    {plan.price.monthly > 0 ? '/month' : ''}
                  </div>
                  {plan.price.yearly > 0 && (
                    <div className="text-sm text-green-600">
                      {formatPrice(plan.price.yearly)}/year
                    </div>
                  )}
                  {plan.trialDays && plan.trialDays > 0 && (
                    <div className="text-xs text-amber-600 mt-1">
                      {plan.trialDays} days trial
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="text-xs text-muted-foreground mb-3">
                  {countEnabledFeatures(plan)} features enabled
                </div>

                {/* Key Limits */}
                <div className="space-y-1 text-sm flex-1">
                  {plan.features.max_orders !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orders</span>
                      <span className="font-medium">{formatLimit(plan.features.max_orders as number)}</span>
                    </div>
                  )}
                  {plan.features.max_staff !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staff</span>
                      <span className="font-medium">{formatLimit(plan.features.max_staff as number)}</span>
                    </div>
                  )}
                  {plan.features.max_branches !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Branches</span>
                      <span className="font-medium">{formatLimit(plan.features.max_branches as number)}</span>
                    </div>
                  )}
                </div>

                {/* Key Features */}
                <div className="space-y-1 text-sm border-t pt-3 mt-3">
                  <FeatureRow label="Campaigns" enabled={!!plan.features.campaigns} />
                  <FeatureRow label="Loyalty" enabled={!!plan.features.loyalty_points} />
                  <FeatureRow label="Analytics" enabled={!!plan.features.advanced_analytics} />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => openEditDialog(plan)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {isCustom && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteConfirm({ isOpen: true, name: plan.name })}
                      disabled={deleting === plan.name}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setEditingPlan(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateOpen ? 'Create New Plan' : `Edit ${editingPlan?.displayName} Plan`}
            </DialogTitle>
            <DialogDescription>
              Configure pricing and features for this plan
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plan Name (slug) *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                    placeholder="e.g., premium_plus"
                    disabled={!!editingPlan}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Name *</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g., Premium Plus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this plan"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Monthly Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yearly Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.priceYearly}
                    onChange={(e) => setFormData({ ...formData, priceYearly: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trial Days</Label>
                  <Input
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6 mt-4">
              {Object.entries(featuresByCategory).map(([category, features]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {categoryLabels[category] || category}
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {features.map((feature) => {
                      const Icon = getIcon(feature.icon);
                      const value = formData.features[feature.key];
                      
                      return (
                        <div
                          key={feature.key}
                          className="flex items-center justify-between p-3 border rounded-lg bg-white"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <div>
                              <span className="text-sm font-medium">{feature.name}</span>
                              {feature.description && (
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                              )}
                            </div>
                          </div>
                          {feature.valueType === 'boolean' ? (
                            <Switch
                              checked={value === true}
                              onCheckedChange={(c) => updateFeature(feature.key, c)}
                            />
                          ) : (
                            <Input
                              type="number"
                              className="w-24 h-8 text-sm"
                              value={value as number || 0}
                              onChange={(e) => updateFeature(feature.key, parseInt(e.target.value) || 0)}
                              placeholder="-1 = unlimited"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Plan Active</Label>
                    <p className="text-xs text-muted-foreground">Enable or disable this plan</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Show on Marketing Page</Label>
                    <p className="text-xs text-muted-foreground">Display on public pricing page</p>
                  </div>
                  <Switch
                    checked={formData.showOnMarketing}
                    onCheckedChange={(c) => setFormData({ ...formData, showOnMarketing: c })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Mark as Popular</Label>
                    <p className="text-xs text-muted-foreground">Highlight this plan on pricing page</p>
                  </div>
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={(c) => setFormData({ ...formData, isPopular: c })}
                  />
                </div>

                {formData.isPopular && (
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g., Most Popular, Best Value"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setIsEditOpen(false);
              setEditingPlan(null);
            }}>
              Cancel
            </Button>
            <Button onClick={isCreateOpen ? handleCreate : handleSave} disabled={saving}>
              {saving ? 'Saving...' : isCreateOpen ? 'Create Plan' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm?.isOpen || false}
        title="Delete Plan"
        message={`Delete "${deleteConfirm?.name}" plan? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.name)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {enabled ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-300" />}
    </div>
  );
}
