'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings, Globe, Building2 } from 'lucide-react';
import { superAdminAutomationApi, CreateRuleData, AutomationRule } from '@/services/automationApi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface CreatePlatformRuleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AutomationRule | null;
}

// Platform-specific event types
const PLATFORM_EVENT_TYPES = [
  { value: 'SUBSCRIPTION_EXPIRING', label: 'Subscription Expiring', description: 'When tenant subscription is about to expire' },
  { value: 'SUBSCRIPTION_EXPIRED', label: 'Subscription Expired', description: 'When tenant subscription has expired' },
  { value: 'SUBSCRIPTION_UPGRADED', label: 'Subscription Upgraded', description: 'When tenant upgrades their plan' },
  { value: 'SUBSCRIPTION_DOWNGRADED', label: 'Subscription Downgraded', description: 'When tenant downgrades their plan' },
  { value: 'TENANT_CREATED', label: 'Tenant Created', description: 'When a new tenant is created' },
  { value: 'TENANT_INACTIVE', label: 'Tenant Inactive', description: 'When tenant hasn\'t been active' },
  { value: 'TENANT_EXCEEDED_LIMITS', label: 'Tenant Exceeded Limits', description: 'When tenant exceeds plan limits' },
  { value: 'TENANT_SLA_BREACH', label: 'SLA Breach', description: 'When tenant SLA is breached' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed', description: 'When tenant payment fails' },
  { value: 'PAYMENT_OVERDUE', label: 'Payment Overdue', description: 'When tenant payment is overdue' },
];

// Tenant-specific event types
const TENANT_EVENT_TYPES = [
  { value: 'ORDER_PLACED', label: 'Order Placed', description: 'When a new order is created' },
  { value: 'ORDER_STATUS_CHANGED', label: 'Order Status Changed', description: 'When order status is updated' },
  { value: 'ORDER_DELAYED', label: 'Order Delayed', description: 'When order is delayed beyond expected time' },
  { value: 'ORDER_COMPLETED', label: 'Order Completed', description: 'When order is marked as completed' },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received', description: 'When payment is successfully processed' },
  { value: 'USER_REGISTERED', label: 'User Registered', description: 'When a new user signs up' },
  { value: 'USER_INACTIVE', label: 'User Inactive', description: 'When user hasn\'t been active for a period' },
];

// Platform-specific action types
const PLATFORM_ACTION_TYPES = [
  { value: 'SEND_NOTIFICATION', label: 'Send Notification', description: 'Send real-time notification' },
  { value: 'SEND_EMAIL', label: 'Send Email', description: 'Send email notification' },
  { value: 'LOCK_FEATURE', label: 'Lock Feature', description: 'Lock tenant features' },
  { value: 'UNLOCK_FEATURE', label: 'Unlock Feature', description: 'Unlock tenant features' },
  { value: 'CREATE_TASK', label: 'Create Task', description: 'Create a task for platform team' },
  { value: 'TRIGGER_WEBHOOK', label: 'Trigger Webhook', description: 'Call external webhook' },
  { value: 'UPDATE_STATUS', label: 'Update Status', description: 'Update tenant/subscription status' },
];

// Regular action types for tenant rules
const TENANT_ACTION_TYPES = [
  { value: 'SEND_NOTIFICATION', label: 'Send Notification', description: 'Send real-time notification' },
  { value: 'SEND_EMAIL', label: 'Send Email', description: 'Send email notification' },
  { value: 'UPDATE_STATUS', label: 'Update Status', description: 'Update entity status' },
  { value: 'CREATE_TASK', label: 'Create Task', description: 'Create a task for staff' },
  { value: 'TRIGGER_WEBHOOK', label: 'Trigger Webhook', description: 'Call external webhook' },
];

// Notification types
const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'critical', label: 'Critical' },
];

export default function CreatePlatformRuleModal({ open, onClose, onSuccess, initialData }: CreatePlatformRuleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRuleData>({
    name: '',
    description: '',
    scope: 'PLATFORM',
    trigger: {
      eventType: '',
      conditions: {}
    },
    actions: [],
    priority: 1
  });
  const [tenants, setTenants] = useState<any[]>([]);

  React.useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/superadmin/tenancies');
      if (response.data.success) {
        // Handle both array and paginated response structures
        const tenantsData = response.data.data.tenancies || response.data.data;
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description,
          scope: initialData.scope,
          trigger: initialData.trigger,
          actions: initialData.actions.map(a => ({
            type: a.type,
            config: a.config || {},
            delay: a.delay
          })),
          priority: initialData.priority,
          tenantId: initialData.tenantId && typeof initialData.tenantId === 'object'
            ? (initialData.tenantId as any)._id
            : initialData.tenantId
        });
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.trigger.eventType || formData.actions.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate if all actions have a type
    const invalidActions = formData.actions.some(action => !action.type);
    if (invalidActions) {
      toast.error('Please select an Action Type for all added actions');
      return;
    }

    // Validate Tenant ID for Tenant scope (SuperAdmins need to specify a tenant)
    if (formData.scope === 'TENANT' && !formData.tenantId) {
      toast.error('Tenant ID is required for Tenant-scope rules. Please select Platform scope or use the Tenant context.');
      return;
    }

    try {
      setLoading(true);
      if (initialData) {
        await superAdminAutomationApi.updateRule(initialData.ruleId, formData);
        toast.success('Automation rule updated successfully');
      } else {
        await superAdminAutomationApi.createRule(formData);
        toast.success('Platform automation rule created successfully');
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create automation rule');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      scope: 'PLATFORM',
      trigger: {
        eventType: '',
        conditions: {}
      },
      actions: [],
      priority: 1
    });
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', config: {} }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const updateActionConfig = (index: number, configKey: string, configValue: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index
          ? { ...action, config: { ...action.config, [configKey]: configValue } }
          : action
      )
    }));
  };

  const renderActionConfig = (action: any, index: number) => {
    switch (action.type) {
      case 'SEND_NOTIFICATION':
        return (
          <div className="space-y-3">
            <div>
              <Label>Notification Title</Label>
              <Input
                value={action.config.title || ''}
                onChange={(e) => updateActionConfig(index, 'title', e.target.value)}
                placeholder="e.g., Subscription Expiring Soon"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={action.config.message || ''}
                onChange={(e) => updateActionConfig(index, 'message', e.target.value)}
                placeholder="e.g., Your subscription expires in {{daysUntilExpiry}} days"
                rows={3}
              />
            </div>
            <div>
              <Label>Notification Type</Label>
              <Select
                value={action.config.notificationType || ''}
                onValueChange={(value) => updateActionConfig(index, 'notificationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'LOCK_FEATURE':
      case 'UNLOCK_FEATURE':
        return (
          <div className="space-y-3">
            <div>
              <Label>Feature Name</Label>
              <Input
                value={action.config.feature || ''}
                onChange={(e) => updateActionConfig(index, 'feature', e.target.value)}
                placeholder="e.g., order_creation, customer_management"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={action.config.reason || ''}
                onChange={(e) => updateActionConfig(index, 'reason', e.target.value)}
                placeholder="e.g., Subscription expired"
              />
            </div>
          </div>
        );

      case 'SEND_EMAIL':
        return (
          <div className="space-y-3">
            <div>
              <Label>Email Subject</Label>
              <Input
                value={action.config.subject || ''}
                onChange={(e) => updateActionConfig(index, 'subject', e.target.value)}
                placeholder="e.g., Subscription Renewal Required"
              />
            </div>
            <div>
              <Label>Email Template</Label>
              <Input
                value={action.config.template || ''}
                onChange={(e) => updateActionConfig(index, 'template', e.target.value)}
                placeholder="e.g., subscription_expiry_warning"
              />
            </div>
          </div>
        );

      case 'CREATE_TASK':
        return (
          <div className="space-y-3">
            <div>
              <Label>Task Title</Label>
              <Input
                value={action.config.title || ''}
                onChange={(e) => updateActionConfig(index, 'title', e.target.value)}
                placeholder="e.g., Review tenant plan upgrade"
              />
            </div>
            <div>
              <Label>Assignee</Label>
              <Input
                value={action.config.assignee || ''}
                onChange={(e) => updateActionConfig(index, 'assignee', e.target.value)}
                placeholder="e.g., sales_team, platform_admin"
              />
            </div>
          </div>
        );

      case 'TRIGGER_WEBHOOK':
        return (
          <div className="space-y-3">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={action.config.url || ''}
                onChange={(e) => updateActionConfig(index, 'url', e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getEventTypes = () => {
    return formData.scope === 'PLATFORM' ? PLATFORM_EVENT_TYPES : TENANT_EVENT_TYPES;
  };

  const getActionTypes = () => {
    return formData.scope === 'PLATFORM' ? PLATFORM_ACTION_TYPES : TENANT_ACTION_TYPES;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Create'} Platform Automation Rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Subscription Expiry Warning"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="scope">Rule Scope *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value: 'PLATFORM' | 'TENANT') => setFormData(prev => ({
                    ...prev,
                    scope: value,
                    trigger: { eventType: '', conditions: {} }, // Reset trigger when scope changes
                    actions: [] // Reset actions when scope changes
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLATFORM">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Platform Level</div>
                          <div className="text-sm text-gray-500">Manages tenants, subscriptions, billing</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="TENANT">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Tenant Level</div>
                          <div className="text-sm text-gray-500">Manages orders, customers, payments</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.scope === 'TENANT' && (
                <div>
                  <Label htmlFor="tenantId">Select Tenant *</Label>
                  <Select
                    value={typeof formData.tenantId === 'string' ? formData.tenantId : ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tenantId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => {
                        const tId = typeof tenant._id === 'string' ? tenant._id : String(tenant._id || '');
                        const tName = typeof tenant.name === 'string' ? tenant.name : (typeof tenant.businessName === 'string' ? tenant.businessName : 'Unnamed');
                        const tSlug = typeof tenant.slug === 'string' ? tenant.slug : '-';

                        return (
                          <SelectItem key={tId} value={tId}>
                            {tName} ({tSlug})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High (1)</SelectItem>
                    <SelectItem value="2">Medium (2)</SelectItem>
                    <SelectItem value="3">Low (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Trigger Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trigger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Event Type *</Label>
                <Select
                  value={formData.trigger.eventType}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger, eventType: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getEventTypes().map(event => (
                      <SelectItem key={event.value} value={event.value}>
                        <div>
                          <div className="font-medium">{event.label}</div>
                          <div className="text-sm text-gray-500">{event.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Actions</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No actions configured yet</p>
                  <p className="text-sm">Add an action to define what happens when this rule triggers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.actions.map((action, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">Action {index + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAction(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Action Type</Label>
                            <Select
                              value={action.type}
                              onValueChange={(value) => updateAction(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select action type" />
                              </SelectTrigger>
                              <SelectContent>
                                {getActionTypes().map(actionType => (
                                  <SelectItem key={actionType.value} value={actionType.value}>
                                    <div>
                                      <div className="font-medium">{actionType.label}</div>
                                      <div className="text-sm text-gray-500">{actionType.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {action.type && renderActionConfig(action, index)}

                          <div>
                            <Label>Delay (milliseconds)</Label>
                            <Input
                              type="number"
                              value={action.delay || 0}
                              onChange={(e) => updateAction(index, 'delay', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              {initialData ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}