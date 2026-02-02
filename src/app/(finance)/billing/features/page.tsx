'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Shirt,
  Sparkles,
  Megaphone,
  Wallet,
  Users,
  Award,
  Package,
  Building2,
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
import { getAuthHeaders } from '@/lib/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FeatureDefinition {
  _id: string;
  key: string;
  name: string;
  description?: string;
  category: 'admin_permissions' | 'platform' | 'limits' | 'branding' | 'support';
  valueType: 'boolean' | 'number';
  defaultValue: boolean | number;
  constraints?: {
    min?: number;
    max?: number;
    unlimitedValue?: number;
  };
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  icon?: string;
}

interface GroupedFeatures {
  admin_permissions: FeatureDefinition[];
  platform: FeatureDefinition[];
  limits: FeatureDefinition[];
  branding: FeatureDefinition[];
  support: FeatureDefinition[];
}

const categoryLabels: Record<string, string> = {
  admin_permissions: 'Admin Permissions & Powers',
  platform: 'Platform Features',
  limits: 'Usage Limits',
  branding: 'Branding & Customization',
  support: 'Support'
};

const categoryColors: Record<string, string> = {
  admin_permissions: 'bg-indigo-50 border-indigo-200',
  platform: 'bg-purple-50 border-purple-200',
  limits: 'bg-amber-50 border-amber-200',
  branding: 'bg-green-50 border-green-200',
  support: 'bg-pink-50 border-pink-200'
};

const iconMap: Record<string, any> = {
  Shirt, Sparkles, Megaphone, Wallet, Users, Award, Package, Building2, 
  Palette, Globe, HeadphonesIcon, Code, BarChart3, Shield, UserCog,
  Truck, CreditCard, UserCheck, FileText
};

export default function FeaturesPage() {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [grouped, setGrouped] = useState<GroupedFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureDefinition | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: 'platform' as FeatureDefinition['category'],
    valueType: 'boolean' as 'boolean' | 'number',
    defaultValue: false as boolean | number,
    icon: ''
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await fetch(`${API_URL}/superadmin/features?includeInactive=true`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setFeatures(data.data.features);
        setGrouped(data.data.grouped);
      }
    } catch (error) {
      toast.error('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      category: 'platform',
      valueType: 'boolean',
      defaultValue: false,
      icon: ''
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (feature: FeatureDefinition) => {
    setEditingFeature(feature);
    setFormData({
      key: feature.key,
      name: feature.name,
      description: feature.description || '',
      category: feature.category,
      valueType: feature.valueType,
      defaultValue: feature.defaultValue,
      icon: feature.icon || ''
    });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.key.trim() || !formData.name.trim()) {
      toast.error('Key and name are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/features`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Feature created!');
        setIsCreateOpen(false);
        fetchFeatures();
      } else {
        toast.error(data.message || 'Failed to create feature');
      }
    } catch (err) {
      toast.error('Failed to create feature');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingFeature) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/features/${editingFeature._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Feature updated!');
        setIsEditOpen(false);
        setEditingFeature(null);
        fetchFeatures();
      } else {
        toast.error(data.message || 'Failed to update feature');
      }
    } catch (err) {
      toast.error('Failed to update feature');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (feature: FeatureDefinition) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/features/${feature._id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Feature ${data.data.feature.isActive ? 'enabled' : 'disabled'}`);
        fetchFeatures();
      } else {
        toast.error(data.message || 'Failed to toggle feature');
      }
    } catch (err) {
      toast.error('Failed to toggle feature');
    }
  };

  const handleDelete = async (feature: FeatureDefinition) => {
    if (feature.isSystem) {
      toast.error('Cannot delete system features');
      return;
    }

    if (!confirm(`Delete "${feature.name}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`${API_URL}/superadmin/features/${feature._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Feature deleted');
        fetchFeatures();
      } else {
        toast.error(data.message || 'Failed to delete feature');
      }
    } catch (err) {
      toast.error('Failed to delete feature');
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Feature Definitions</h1>
          <p className="text-muted-foreground">
            Manage features that can be toggled on/off per billing plan
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* Features by Category */}
      {grouped && Object.entries(grouped).map(([category, categoryFeatures]) => (
        <Card key={category} className={categoryColors[category]}>
          <CardHeader>
            <CardTitle>{categoryLabels[category]}</CardTitle>
            <CardDescription>{categoryFeatures.length} features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryFeatures.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No features in this category
                </p>
              ) : (
                categoryFeatures.map((feature) => {
                  const Icon = getIcon(feature.icon);
                  return (
                    <div
                      key={feature._id}
                      className={`flex items-center justify-between p-3 rounded-lg bg-white border ${
                        !feature.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{feature.name}</span>
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {feature.key}
                            </code>
                            {feature.isSystem && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                            {feature.valueType === 'number' && (
                              <Badge variant="outline" className="text-xs">Number</Badge>
                            )}
                          </div>
                          {feature.description && (
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">
                          Default: {String(feature.defaultValue)}
                        </span>
                        <Switch
                          checked={feature.isActive}
                          onCheckedChange={() => handleToggle(feature)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(feature)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!feature.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(feature)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>
              Create a new feature that can be toggled per billing plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Feature Key *</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  placeholder="e.g., sms_notifications"
                />
                <p className="text-xs text-muted-foreground">Lowercase, underscores only</p>
              </div>
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., SMS Notifications"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this feature"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: FeatureDefinition['category']) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_permissions">Admin Permissions</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
                    <SelectItem value="limits">Limits</SelectItem>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value Type</Label>
                <Select
                  value={formData.valueType}
                  onValueChange={(v: 'boolean' | 'number') => setFormData({ 
                    ...formData, 
                    valueType: v,
                    defaultValue: v === 'boolean' ? false : 0
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Boolean (On/Off)</SelectItem>
                    <SelectItem value="number">Number (Limit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Default Value</Label>
              {formData.valueType === 'boolean' ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.defaultValue as boolean}
                    onCheckedChange={(c) => setFormData({ ...formData, defaultValue: c })}
                  />
                  <span className="text-sm">{formData.defaultValue ? 'Enabled' : 'Disabled'}</span>
                </div>
              ) : (
                <Input
                  type="number"
                  value={formData.defaultValue as number}
                  onChange={(e) => setFormData({ ...formData, defaultValue: parseInt(e.target.value) || 0 })}
                  placeholder="-1 for unlimited"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Feature'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
            <DialogDescription>
              Update feature: {editingFeature?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Feature Key</Label>
              <Input value={formData.key} disabled className="bg-gray-50" />
              <p className="text-xs text-muted-foreground">Key cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: FeatureDefinition['category']) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_permissions">Admin Permissions</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
                    <SelectItem value="limits">Limits</SelectItem>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Value</Label>
                {formData.valueType === 'boolean' ? (
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.defaultValue as boolean}
                      onCheckedChange={(c) => setFormData({ ...formData, defaultValue: c })}
                    />
                    <span className="text-sm">{formData.defaultValue ? 'Enabled' : 'Disabled'}</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={formData.defaultValue as number}
                    onChange={(e) => setFormData({ ...formData, defaultValue: parseInt(e.target.value) || 0 })}
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
