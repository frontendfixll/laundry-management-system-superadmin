'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Clock, 
  User, 
  Activity, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  X,
  Edit,
  Power,
  PowerOff
} from 'lucide-react';

interface AttributeCondition {
  name: string;
  operator: string;
  value: any;
}

interface ABACPolicy {
  _id: string;
  name: string;
  description: string;
  policyId: string;
  scope: 'PLATFORM' | 'TENANT';
  category: string;
  effect: 'ALLOW' | 'DENY';
  priority: number;
  isActive: boolean;
  subjectAttributes: AttributeCondition[];
  actionAttributes: AttributeCondition[];
  resourceAttributes: AttributeCondition[];
  environmentAttributes: AttributeCondition[];
  evaluationCount: number;
  allowCount: number;
  denyCount: number;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface PolicyDetailsModalProps {
  policy: ABACPolicy | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (policy: ABACPolicy) => void;
  onToggle?: (policyId: string) => void;
}

export default function PolicyDetailsModal({ 
  policy, 
  isOpen, 
  onClose, 
  onEdit, 
  onToggle 
}: PolicyDetailsModalProps) {
  if (!policy) return null;

  const getScopeColor = (scope: string) => {
    return scope === 'PLATFORM' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getEffectColor = (effect: string) => {
    return effect === 'DENY' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TENANT_ISOLATION': return <Shield className="h-4 w-4" />;
      case 'FINANCIAL_LIMITS': return <BarChart3 className="h-4 w-4" />;
      case 'TIME_BOUND_ACTIONS': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return `[${value.join(', ')}]`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getOperatorLabel = (operator: string): string => {
    const operatorMap: { [key: string]: string } = {
      'equals': 'Equals',
      'not_equals': 'Not Equals',
      'in': 'In Array',
      'not_in': 'Not In Array',
      'greater_than': 'Greater Than',
      'less_than': 'Less Than',
      'contains': 'Contains',
      'regex': 'Regex Match'
    };
    return operatorMap[operator] || operator;
  };

  const renderAttributeSection = (title: string, attributes: AttributeCondition[], icon: React.ReactNode) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="outline" className="ml-auto">
            {attributes.length} condition{attributes.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attributes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No {title.toLowerCase()} conditions defined
          </p>
        ) : (
          <div className="space-y-3">
            {attributes.map((attr, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{attr.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getOperatorLabel(attr.operator)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-mono bg-white px-2 py-1 rounded border">
                    {formatValue(attr.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const successRate = policy.evaluationCount > 0 
    ? ((policy.allowCount / policy.evaluationCount) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {getCategoryIcon(policy.category)}
              {policy.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {policy.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                policy.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {policy.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Policy Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getScopeColor(policy.scope)}>
                  {policy.scope}
                </Badge>
                <Badge className={getEffectColor(policy.effect)}>
                  {policy.effect}
                </Badge>
                <Badge variant="outline">
                  Priority: {policy.priority}
                </Badge>
                <Badge variant="outline">
                  Version: {policy.version}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{policy.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Policy ID:</span>
                  <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                    {policy.policyId}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{policy.category.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {policy.evaluationCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Evaluations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {policy.allowCount}
                  </div>
                  <div className="text-sm text-gray-600">Allowed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {policy.denyCount}
                  </div>
                  <div className="text-sm text-gray-600">Denied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {successRate}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Policy Conditions</h3>
              <Badge variant="outline" className="text-xs">
                All conditions must match (AND logic)
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderAttributeSection(
                'Subject Attributes', 
                policy.subjectAttributes, 
                <User className="h-4 w-4" />
              )}
              {renderAttributeSection(
                'Action Attributes', 
                policy.actionAttributes, 
                <Activity className="h-4 w-4" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderAttributeSection(
                'Resource Attributes', 
                policy.resourceAttributes, 
                <Shield className="h-4 w-4" />
              )}
              {renderAttributeSection(
                'Environment Attributes', 
                policy.environmentAttributes, 
                <Clock className="h-4 w-4" />
              )}
            </div>
          </div>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created By:</span>
                  <span className="ml-2">{policy.createdBy.name}</span>
                  <span className="text-gray-500 ml-1">({policy.createdBy.email})</span>
                </div>
                <div>
                  <span className="font-medium">Created At:</span>
                  <span className="ml-2">{new Date(policy.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">{new Date(policy.updatedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Policy Version:</span>
                  <span className="ml-2">{policy.version}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {onToggle && (
                <Button
                  variant="outline"
                  onClick={() => onToggle(policy._id)}
                  className={policy.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                >
                  {policy.isActive ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(policy)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Policy
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}