'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface AttributeCondition {
  name: string;
  operator: string;
  value: string | string[] | number | boolean;
}

interface PolicyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'in', label: 'In Array' },
  { value: 'not_in', label: 'Not In Array' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'regex', label: 'Regex Match' }
];

const CATEGORIES = [
  { value: 'TENANT_ISOLATION', label: 'Tenant Isolation' },
  { value: 'READ_ONLY_ENFORCEMENT', label: 'Read-Only Enforcement' },
  { value: 'FINANCIAL_LIMITS', label: 'Financial Limits' },
  { value: 'TIME_BOUND_ACTIONS', label: 'Time-Bound Actions' },
  { value: 'AUTOMATION_SCOPE', label: 'Automation Scope' },
  { value: 'NOTIFICATION_SAFETY', label: 'Notification Safety' },
  { value: 'CUSTOM', label: 'Custom' }
];

export default function PolicyCreateModal({ isOpen, onClose, onSuccess }: PolicyCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    policyId: '',
    scope: 'TENANT' as 'PLATFORM' | 'TENANT',
    category: 'CUSTOM',
    effect: 'DENY' as 'ALLOW' | 'DENY',
    priority: 100
  });

  const [subjectAttributes, setSubjectAttributes] = useState<AttributeCondition[]>([]);
  const [actionAttributes, setActionAttributes] = useState<AttributeCondition[]>([]);
  const [resourceAttributes, setResourceAttributes] = useState<AttributeCondition[]>([]);
  const [environmentAttributes, setEnvironmentAttributes] = useState<AttributeCondition[]>([]);

  const addAttribute = (type: 'subject' | 'action' | 'resource' | 'environment') => {
    const newAttribute: AttributeCondition = {
      name: '',
      operator: 'equals',
      value: ''
    };

    switch (type) {
      case 'subject':
        setSubjectAttributes([...subjectAttributes, newAttribute]);
        break;
      case 'action':
        setActionAttributes([...actionAttributes, newAttribute]);
        break;
      case 'resource':
        setResourceAttributes([...resourceAttributes, newAttribute]);
        break;
      case 'environment':
        setEnvironmentAttributes([...environmentAttributes, newAttribute]);
        break;
    }
  };

  const removeAttribute = (type: 'subject' | 'action' | 'resource' | 'environment', index: number) => {
    switch (type) {
      case 'subject':
        setSubjectAttributes(subjectAttributes.filter((_, i) => i !== index));
        break;
      case 'action':
        setActionAttributes(actionAttributes.filter((_, i) => i !== index));
        break;
      case 'resource':
        setResourceAttributes(resourceAttributes.filter((_, i) => i !== index));
        break;
      case 'environment':
        setEnvironmentAttributes(environmentAttributes.filter((_, i) => i !== index));
        break;
    }
  };

  const updateAttribute = (
    type: 'subject' | 'action' | 'resource' | 'environment',
    index: number,
    field: keyof AttributeCondition,
    value: any
  ) => {
    const updateArray = (arr: AttributeCondition[]) => {
      const newArr = [...arr];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    };

    switch (type) {
      case 'subject':
        setSubjectAttributes(updateArray(subjectAttributes));
        break;
      case 'action':
        setActionAttributes(updateArray(actionAttributes));
        break;
      case 'resource':
        setResourceAttributes(updateArray(resourceAttributes));
        break;
      case 'environment':
        setEnvironmentAttributes(updateArray(environmentAttributes));
        break;
    }
  };

  const parseValue = (value: string, operator: string) => {
    if (operator === 'in' || operator === 'not_in') {
      return value.split(',').map(v => v.trim());
    }
    if (operator === 'greater_than' || operator === 'less_than') {
      return Number(value);
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.policyId) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Process attributes
      const processedSubjectAttributes = subjectAttributes.map(attr => ({
        ...attr,
        value: parseValue(attr.value as string, attr.operator)
      }));

      const processedActionAttributes = actionAttributes.map(attr => ({
        ...attr,
        value: parseValue(attr.value as string, attr.operator)
      }));

      const processedResourceAttributes = resourceAttributes.map(attr => ({
        ...attr,
        value: parseValue(attr.value as string, attr.operator)
      }));

      const processedEnvironmentAttributes = environmentAttributes.map(attr => ({
        ...attr,
        value: parseValue(attr.value as string, attr.operator)
      }));

      const policyData = {
        ...formData,
        policyId: formData.policyId.toUpperCase().replace(/\s+/g, '_'),
        subjectAttributes: processedSubjectAttributes,
        actionAttributes: processedActionAttributes,
        resourceAttributes: processedResourceAttributes,
        environmentAttributes: processedEnvironmentAttributes
      };

      await api.post('/superadmin/abac/policies', policyData);

      toast.success('ABAC policy created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating ABAC policy:', error);
      toast.error(error.response?.data?.message || 'Failed to create ABAC policy');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      policyId: '',
      scope: 'TENANT',
      category: 'CUSTOM',
      effect: 'DENY',
      priority: 100
    });
    setSubjectAttributes([]);
    setActionAttributes([]);
    setResourceAttributes([]);
    setEnvironmentAttributes([]);
  };

  const renderAttributeSection = (
    title: string,
    attributes: AttributeCondition[],
    type: 'subject' | 'action' | 'resource' | 'environment'
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addAttribute(type)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {attributes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No {title.toLowerCase()} conditions defined
          </p>
        ) : (
          attributes.map((attr, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs">Attribute Name</Label>
                <Input
                  placeholder="e.g., role, tenant_id, action"
                  value={attr.name}
                  onChange={(e) => updateAttribute(type, index, 'name', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="w-32">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={attr.operator}
                  onValueChange={(value) => updateAttribute(type, index, 'operator', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs">Value</Label>
                <Input
                  placeholder={attr.operator === 'in' || attr.operator === 'not_in' ? 'val1,val2,val3' : 'value'}
                  value={attr.value as string}
                  onChange={(e) => updateAttribute(type, index, 'value', e.target.value)}
                  className="h-8"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAttribute(type, index)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create ABAC Policy</DialogTitle>
          <div className="sr-only">
            Create a new Attribute-Based Access Control policy by defining subject, action, resource, and environment attributes.
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Custom Tenant Access Policy"
                required
              />
            </div>
            <div>
              <Label htmlFor="policyId">Policy ID *</Label>
              <Input
                id="policyId"
                value={formData.policyId}
                onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                placeholder="e.g., CUSTOM_TENANT_ACCESS"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this policy controls and when it applies"
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={formData.scope}
                onValueChange={(value: 'PLATFORM' | 'TENANT') => setFormData({ ...formData, scope: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLATFORM">Platform</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="effect">Effect</Label>
              <Select
                value={formData.effect}
                onValueChange={(value: 'ALLOW' | 'DENY') => setFormData({ ...formData, effect: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALLOW">Allow</SelectItem>
                  <SelectItem value="DENY">Deny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="1000"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Attribute Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Policy Conditions</h3>
              <Badge variant="outline" className="text-xs">
                All conditions must match (AND logic)
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderAttributeSection('Subject Attributes', subjectAttributes, 'subject')}
              {renderAttributeSection('Action Attributes', actionAttributes, 'action')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderAttributeSection('Resource Attributes', resourceAttributes, 'resource')}
              {renderAttributeSection('Environment Attributes', environmentAttributes, 'environment')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}