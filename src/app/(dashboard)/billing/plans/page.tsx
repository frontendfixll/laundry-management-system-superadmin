'use client';

import { useState, useEffect } from 'react';
import { useBilling, BillingPlan } from '@/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Settings, 
  Edit, 
  Check, 
  X,
  Zap,
  Crown,
  Building2,
  Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function BillingPlansPage() {
  const { plans, loading, fetchPlans, updatePlan } = useBilling();
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    priceMonthly: 0,
    priceYearly: 0,
    maxOrders: 0,
    maxStaff: 0,
    maxCustomers: 0,
    maxBranches: 0,
    customDomain: false,
    advancedAnalytics: false,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
    customBranding: true,
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openEditDialog = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setFormData({
      displayName: plan.displayName,
      priceMonthly: plan.price.monthly,
      priceYearly: plan.price.yearly,
      maxOrders: plan.features.maxOrders,
      maxStaff: plan.features.maxStaff,
      maxCustomers: plan.features.maxCustomers,
      maxBranches: plan.features.maxBranches,
      customDomain: plan.features.customDomain,
      advancedAnalytics: plan.features.advancedAnalytics,
      apiAccess: plan.features.apiAccess,
      whiteLabel: plan.features.whiteLabel,
      prioritySupport: plan.features.prioritySupport,
      customBranding: plan.features.customBranding,
      isActive: plan.isActive
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    
    setSaving(true);
    try {
      const success = await updatePlan(editingPlan.name, {
        displayName: formData.displayName,
        price: {
          monthly: formData.priceMonthly,
          yearly: formData.priceYearly
        },
        features: {
          maxOrders: formData.maxOrders,
          maxStaff: formData.maxStaff,
          maxCustomers: formData.maxCustomers,
          maxBranches: formData.maxBranches,
          customDomain: formData.customDomain,
          advancedAnalytics: formData.advancedAnalytics,
          apiAccess: formData.apiAccess,
          whiteLabel: formData.whiteLabel,
          prioritySupport: formData.prioritySupport,
          customBranding: formData.customBranding
        },
        isActive: formData.isActive
      });

      if (success) {
        toast.success('Plan updated successfully');
        setIsEditOpen(false);
        setEditingPlan(null);
      } else {
        toast.error('Failed to update plan');
      }
    } catch (err) {
      toast.error('Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    if (amount === -1) return 'Custom';
    return `₹${amount.toLocaleString()}`;
  };

  const formatLimit = (value: number) => {
    if (value === -1) return 'Unlimited';
    return value.toLocaleString();
  };

  if (loading && plans.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Billing Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans and pricing</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || Zap;
          const colorClass = planColors[plan.name] || planColors.free;
          
          return (
            <Card key={plan._id} className={`relative ${colorClass} border-2 flex flex-col h-full`}>
              {!plan.isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                </div>
                <CardDescription className="capitalize">{plan.name} plan</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                {/* Pricing */}
                <div>
                  <div className="text-3xl font-bold">{formatPrice(plan.price.monthly)}</div>
                  <div className="text-sm text-muted-foreground">
                    {plan.price.monthly > 0 ? '/month' : ''}
                  </div>
                  {plan.price.yearly > 0 && (
                    <div className="text-sm text-green-600">
                      {formatPrice(plan.price.yearly)}/year (save {Math.round((1 - plan.price.yearly / (plan.price.monthly * 12)) * 100)}%)
                    </div>
                  )}
                </div>

                {/* Limits */}
                <div className="space-y-1 text-sm mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orders</span>
                    <span className="font-medium">{formatLimit(plan.features.maxOrders)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff</span>
                    <span className="font-medium">{formatLimit(plan.features.maxStaff)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customers</span>
                    <span className="font-medium">{formatLimit(plan.features.maxCustomers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branches</span>
                    <span className="font-medium">{formatLimit(plan.features.maxBranches)}</span>
                  </div>
                </div>

                {/* Features - Fixed height section */}
                <div className="space-y-1 text-sm border-t pt-3 mt-4 flex-1">
                  <FeatureRow label="Custom Branding" enabled={plan.features.customBranding} />
                  <FeatureRow label="Custom Domain" enabled={plan.features.customDomain} />
                  <FeatureRow label="Analytics" enabled={plan.features.advancedAnalytics} />
                  <FeatureRow label="API Access" enabled={plan.features.apiAccess} />
                  <FeatureRow label="White Label" enabled={plan.features.whiteLabel} />
                  <FeatureRow label="Priority Support" enabled={plan.features.prioritySupport} />
                </div>

                {/* Button always at bottom */}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => openEditDialog(plan)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingPlan?.displayName} Plan</DialogTitle>
            <DialogDescription>Update pricing and feature limits</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Plan Active</Label>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h4 className="font-medium">Pricing</h4>
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <p className="text-xs text-muted-foreground">
                    Suggested: ₹{Math.round(formData.priceMonthly * 10)} (2 months free)
                  </p>
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-3">
              <h4 className="font-medium">Usage Limits</h4>
              <p className="text-xs text-muted-foreground">Use -1 for unlimited</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max Orders/Month</Label>
                  <Input
                    type="number"
                    value={formData.maxOrders}
                    onChange={(e) => setFormData({ ...formData, maxOrders: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Staff</Label>
                  <Input
                    type="number"
                    value={formData.maxStaff}
                    onChange={(e) => setFormData({ ...formData, maxStaff: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Customers</Label>
                  <Input
                    type="number"
                    value={formData.maxCustomers}
                    onChange={(e) => setFormData({ ...formData, maxCustomers: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Branches</Label>
                  <Input
                    type="number"
                    value={formData.maxBranches}
                    onChange={(e) => setFormData({ ...formData, maxBranches: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-medium">Features</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <FeatureToggle
                  label="Custom Branding"
                  checked={formData.customBranding}
                  onChange={(checked) => setFormData({ ...formData, customBranding: checked })}
                />
                <FeatureToggle
                  label="Custom Domain"
                  checked={formData.customDomain}
                  onChange={(checked) => setFormData({ ...formData, customDomain: checked })}
                />
                <FeatureToggle
                  label="Advanced Analytics"
                  checked={formData.advancedAnalytics}
                  onChange={(checked) => setFormData({ ...formData, advancedAnalytics: checked })}
                />
                <FeatureToggle
                  label="API Access"
                  checked={formData.apiAccess}
                  onChange={(checked) => setFormData({ ...formData, apiAccess: checked })}
                />
                <FeatureToggle
                  label="White Label"
                  checked={formData.whiteLabel}
                  onChange={(checked) => setFormData({ ...formData, whiteLabel: checked })}
                />
                <FeatureToggle
                  label="Priority Support"
                  checked={formData.prioritySupport}
                  onChange={(checked) => setFormData({ ...formData, prioritySupport: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {enabled ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      )}
    </div>
  );
}

function FeatureToggle({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
