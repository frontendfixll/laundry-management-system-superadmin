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
import {
  Play,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Activity,
  Shield,
  Copy,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface PolicyTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestContext {
  subject: {
    id: string;
    role: string;
    tenant_id?: string;
    is_read_only?: boolean;
    approval_limit?: number;
    platform_role?: string;
    department?: string;
    email?: string;
  };
  action: {
    action: string;
    method?: string;
    scope?: string;
  };
  resource: {
    resource_type: string;
    id?: string;
    tenant_id?: string;
    amount?: number;
    automation_scope?: string;
    event_tenant_id?: string;
  };
  environment: {
    current_time?: string;
    business_hours?: boolean;
    incident_mode?: boolean;
    ip_address?: string;
    user_agent?: string;
    endpoint?: string;
    method?: string;
    request_frequency?: number;
    network_trust?: boolean;
  };
}

interface TestResult {
  decision: 'ALLOW' | 'DENY';
  evaluationTime: number;
  appliedPolicies: Array<{
    policyId: string;
    policyName: string;
    effect: string;
    matched: boolean;
    reason: string;
  }>;
  context: TestContext;
  error?: string;
}

export default function PolicyTestModal({ isOpen, onClose }: PolicyTestModalProps) {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [context, setContext] = useState<TestContext>({
    subject: {
      id: 'test-user-123',
      role: 'admin',
      tenant_id: 'tenant-123',
      is_read_only: false,
      approval_limit: 1000,
      email: 'test@example.com'
    },
    action: {
      action: 'view',
      method: 'GET'
    },
    resource: {
      resource_type: 'order',
      id: 'order-123',
      tenant_id: 'tenant-123'
    },
    environment: {
      business_hours: true,
      incident_mode: false,
      ip_address: '192.168.1.100',
      network_trust: true,
      request_frequency: 1
    }
  });

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await api.post('/superadmin/abac/test', { context });
      setTestResult(response.data.data);
      toast.success('Policy test completed successfully');
    } catch (error: any) {
      console.error('Error testing ABAC policy:', error);
      toast.error(error.response?.data?.message || 'Failed to test ABAC policy');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: string) => {
    const presets: { [key: string]: TestContext } = {
      'tenant-isolation': {
        subject: {
          id: 'user-123',
          role: 'admin',
          tenant_id: 'tenant-123',
          email: 'admin@tenant123.com'
        },
        action: { action: 'view' },
        resource: {
          resource_type: 'order',
          id: 'order-456',
          tenant_id: 'tenant-456' // Different tenant
        },
        environment: { business_hours: true, incident_mode: false }
      },
      'financial-limits': {
        subject: {
          id: 'finance-user',
          role: 'finance',
          approval_limit: 1000,
          email: 'finance@company.com'
        },
        action: { action: 'approve' },
        resource: {
          resource_type: 'refund',
          amount: 1500 // Exceeds limit
        },
        environment: { business_hours: true, incident_mode: false }
      },
      'read-only': {
        subject: {
          id: 'auditor-123',
          role: 'auditor',
          is_read_only: true,
          email: 'auditor@company.com'
        },
        action: { action: 'create' }, // Write operation
        resource: { resource_type: 'order' },
        environment: { business_hours: true, incident_mode: false }
      },
      'business-hours': {
        subject: {
          id: 'finance-user',
          role: 'finance',
          email: 'finance@company.com'
        },
        action: { action: 'approve' },
        resource: {
          resource_type: 'payout',
          amount: 500
        },
        environment: {
          business_hours: false, // Outside business hours
          incident_mode: false
        }
      }
    };

    if (presets[preset]) {
      setContext(presets[preset]);
      toast.success(`Loaded ${preset} test scenario`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const resetContext = () => {
    setContext({
      subject: {
        id: 'test-user-123',
        role: 'admin',
        tenant_id: 'tenant-123',
        is_read_only: false,
        approval_limit: 1000,
        email: 'test@example.com'
      },
      action: {
        action: 'view',
        method: 'GET'
      },
      resource: {
        resource_type: 'order',
        id: 'order-123',
        tenant_id: 'tenant-123'
      },
      environment: {
        business_hours: true,
        incident_mode: false,
        ip_address: '192.168.1.100',
        network_trust: true,
        request_frequency: 1
      }
    });
    setTestResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test ABAC Policies</DialogTitle>
          <div className="sr-only">
            Test interface for evaluating ABAC policies against different contexts and scenarios.
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Configuration</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetContext}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button onClick={runTest} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Testing...' : 'Run Test'}
                </Button>
              </div>
            </div>

            {/* Preset Scenarios */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Test Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('tenant-isolation')}
                  >
                    Tenant Isolation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('financial-limits')}
                  >
                    Financial Limits
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('read-only')}
                  >
                    Read-Only User
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('business-hours')}
                  >
                    Business Hours
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subject Attributes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Subject (User) Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">User ID</Label>
                    <Input
                      value={context.subject.id}
                      onChange={(e) => setContext({
                        ...context,
                        subject: { ...context.subject, id: e.target.value }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Select
                      value={context.subject.role}
                      onValueChange={(value) => setContext({
                        ...context,
                        subject: { ...context.subject, role: value }
                      })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="TenantAdmin">Tenant Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Tenant ID</Label>
                    <Input
                      value={context.subject.tenant_id || ''}
                      onChange={(e) => setContext({
                        ...context,
                        subject: { ...context.subject, tenant_id: e.target.value }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Approval Limit</Label>
                    <Input
                      type="number"
                      value={context.subject.approval_limit || ''}
                      onChange={(e) => setContext({
                        ...context,
                        subject: { ...context.subject, approval_limit: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={context.subject.is_read_only || false}
                      onChange={(e) => setContext({
                        ...context,
                        subject: { ...context.subject, is_read_only: e.target.checked }
                      })}
                    />
                    Read-Only User
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Action Attributes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Action Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Action</Label>
                    <Select
                      value={context.action.action}
                      onValueChange={(value) => setContext({
                        ...context,
                        action: { ...context.action, action: value }
                      })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="notify">Notify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">HTTP Method</Label>
                    <Select
                      value={context.action.method || 'GET'}
                      onValueChange={(value) => setContext({
                        ...context,
                        action: { ...context.action, method: value }
                      })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Attributes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Resource Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Resource Type</Label>
                    <Select
                      value={context.resource.resource_type}
                      onValueChange={(value) => setContext({
                        ...context,
                        resource: { ...context.resource, resource_type: value }
                      })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="payout">Payout</SelectItem>
                        <SelectItem value="tenancy">Tenancy</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="automation_rule">Automation Rule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Resource ID</Label>
                    <Input
                      value={context.resource.id || ''}
                      onChange={(e) => setContext({
                        ...context,
                        resource: { ...context.resource, id: e.target.value }
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Tenant ID</Label>
                    <Input
                      value={context.resource.tenant_id || ''}
                      onChange={(e) => setContext({
                        ...context,
                        resource: { ...context.resource, tenant_id: e.target.value }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      value={context.resource.amount || ''}
                      onChange={(e) => setContext({
                        ...context,
                        resource: { ...context.resource, amount: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Attributes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Environment Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={context.environment.business_hours || false}
                      onChange={(e) => setContext({
                        ...context,
                        environment: { ...context.environment, business_hours: e.target.checked }
                      })}
                    />
                    Business Hours
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={context.environment.incident_mode || false}
                      onChange={(e) => setContext({
                        ...context,
                        environment: { ...context.environment, incident_mode: e.target.checked }
                      })}
                    />
                    Incident Mode
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">IP Address</Label>
                    <Input
                      value={context.environment.ip_address || ''}
                      onChange={(e) => setContext({
                        ...context,
                        environment: { ...context.environment, ip_address: e.target.value }
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Request Frequency</Label>
                    <Input
                      type="number"
                      value={context.environment.request_frequency || ''}
                      onChange={(e) => setContext({
                        ...context,
                        environment: { ...context.environment, request_frequency: Number(e.target.value) }
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Results</h3>

            {testResult ? (
              <div className="space-y-4">
                {/* Decision Summary */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center mb-4">
                      {testResult.decision === 'ALLOW' ? (
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-16 w-16 text-red-500" />
                      )}
                    </div>
                    <div className="text-center">
                      <Badge className={`text-lg px-4 py-2 ${testResult.decision === 'ALLOW'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {testResult.decision}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Evaluated in {testResult.evaluationTime}ms
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Applied Policies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Applied Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResult.appliedPolicies.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No policies matched this request
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {testResult.appliedPolicies.map((policy, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{policy.policyName}</span>
                              <div className="flex gap-2">
                                <Badge variant={policy.matched ? "default" : "outline"}>
                                  {policy.matched ? 'Matched' : 'Not Matched'}
                                </Badge>
                                <Badge variant="secondary">{policy.effect}</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">{policy.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Raw Response */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Raw Response</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2))}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test</h3>
                    <p className="text-gray-600">Configure your test scenario and click "Run Test"</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}