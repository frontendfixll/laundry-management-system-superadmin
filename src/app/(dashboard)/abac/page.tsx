'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  TestTube
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import PolicyCreateModal from '@/components/abac/PolicyCreateModal';
import PolicyDetailsModal from '@/components/abac/PolicyDetailsModal';
import AuditLogViewer from '@/components/abac/AuditLogViewer';
import PolicyTestModal from '@/components/abac/PolicyTestModal';

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
  evaluationCount: number;
  allowCount: number;
  denyCount: number;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ABACStatistics {
  overview: Array<{
    _id: string;
    count: number;
    avgEvaluationTime: number;
  }>;
  topPolicies: Array<{
    policyId: string;
    name: string;
    category: string;
    evaluationCount: number;
    successRate: number;
  }>;
  recentDenials: Array<{
    appliedPolicies: Array<{
      reason: string;
      policyName: string;
    }>;
    resourceType: string;
    action: string;
    createdAt: string;
  }>;
}

export default function ABACManagementPage() {
  const [policies, setPolicies] = useState<ABACPolicy[]>([]);
  const [statistics, setStatistics] = useState<ABACStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<ABACPolicy | null>(null);

  useEffect(() => {
    loadPolicies();
    loadStatistics();
  }, []);

  const loadPolicies = async () => {
    try {
      const response = await api.get('/superadmin/abac/policies');
      setPolicies(response.data.data.policies);
    } catch (error) {
      console.error('Error loading ABAC policies:', error);
      toast.error('Failed to load ABAC policies');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/superadmin/abac/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error loading ABAC statistics:', error);
    }
  };

  const togglePolicy = async (policyId: string) => {
    try {
      await api.patch(`/superadmin/abac/policies/${policyId}/toggle`);
      toast.success('Policy status updated successfully');
      loadPolicies();
    } catch (error) {
      console.error('Error toggling policy:', error);
      toast.error('Failed to update policy status');
    }
  };

  const viewPolicy = (policy: ABACPolicy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(true);
  };

  const editPolicy = (policy: ABACPolicy) => {
    setSelectedPolicy(policy);
    // TODO: Implement edit modal
    toast('Edit functionality coming soon', { icon: 'ℹ️' });
  };

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await api.delete(`/superadmin/abac/policies/${policyId}`);
      toast.success('Policy deleted successfully');
      loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    }
  };

  const refreshCache = async () => {
    try {
      await api.post('/superadmin/abac/cache/refresh');
      toast.success('ABAC policy cache refreshed successfully');
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast.error('Failed to refresh policy cache');
    }
  };

  const initializeCorePolicy = async (policyId: string) => {
    try {
      await api.post(`/superadmin/abac/core-policies/${policyId}/initialize`);
      toast.success(`Core policy ${policyId} initialized successfully`);
      loadPolicies();
    } catch (error) {
      console.error('Error initializing core policy:', error);
      toast.error('Failed to initialize core policy');
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScope = scopeFilter === 'all' || policy.scope === scopeFilter;
    const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && policy.isActive) ||
                         (statusFilter === 'inactive' && !policy.isActive);

    return matchesSearch && matchesScope && matchesCategory && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ABAC Policy Management</h1>
          <p className="text-gray-600">Manage Attribute-Based Access Control policies</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshCache} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Cache
          </Button>
          <Button onClick={() => setShowTestModal(true)} variant="outline" size="sm">
            <TestTube className="h-4 w-4 mr-2" />
            Test Policies
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search policies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={scopeFilter} onValueChange={setScopeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="PLATFORM">Platform</SelectItem>
                    <SelectItem value="TENANT">Tenant</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="TENANT_ISOLATION">Tenant Isolation</SelectItem>
                    <SelectItem value="READ_ONLY_ENFORCEMENT">Read-Only</SelectItem>
                    <SelectItem value="FINANCIAL_LIMITS">Financial Limits</SelectItem>
                    <SelectItem value="TIME_BOUND_ACTIONS">Time-Bound</SelectItem>
                    <SelectItem value="AUTOMATION_SCOPE">Automation Scope</SelectItem>
                    <SelectItem value="NOTIFICATION_SAFETY">Notification Safety</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Core Policies Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  'TENANT_ISOLATION',
                  'READ_ONLY_ENFORCEMENT', 
                  'FINANCIAL_APPROVAL_LIMITS',
                  'BUSINESS_HOURS_PAYOUTS',
                  'AUTOMATION_SCOPE_PROTECTION',
                  'NOTIFICATION_TENANT_SAFETY'
                ].map(policyId => (
                  <Button
                    key={policyId}
                    variant="outline"
                    size="sm"
                    onClick={() => initializeCorePolicy(policyId)}
                    className="text-xs"
                  >
                    Init {policyId.split('_')[0]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Policies List */}
          <div className="grid gap-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(policy.category)}
                        <h3 className="font-semibold text-lg">{policy.name}</h3>
                        <Badge className={getScopeColor(policy.scope)}>
                          {policy.scope}
                        </Badge>
                        <Badge className={getEffectColor(policy.effect)}>
                          {policy.effect}
                        </Badge>
                        <Badge variant="outline">
                          Priority: {policy.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{policy.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>ID: {policy.policyId}</span>
                        <span>Evaluations: {policy.evaluationCount}</span>
                        <span>Allows: {policy.allowCount}</span>
                        <span>Denies: {policy.denyCount}</span>
                        <span>Created by: {policy.createdBy.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {policy.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${policy.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePolicy(policy._id)}
                      >
                        {policy.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => viewPolicy(policy)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => editPolicy(policy)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deletePolicy(policy._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPolicies.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {statistics && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statistics.overview.map((stat) => (
                  <Card key={stat._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stat._id === 'ALLOW' ? 'Allowed Requests' : 'Denied Requests'}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          stat._id === 'ALLOW' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {stat._id === 'ALLOW' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Avg: {stat.avgEvaluationTime?.toFixed(2)}ms
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Top Policies */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.topPolicies.map((policy) => (
                      <div key={policy.policyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="text-sm text-gray-600">{policy.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{policy.evaluationCount} evaluations</p>
                          <p className="text-sm text-gray-600">{policy.successRate.toFixed(1)}% success rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Denials */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Access Denials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.recentDenials.map((denial, index) => (
                      <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-800">
                            {denial.action} on {denial.resourceType}
                          </span>
                          <span className="text-sm text-red-600">
                            {new Date(denial.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {denial.appliedPolicies.map((policy, pIndex) => (
                          <p key={pIndex} className="text-sm text-red-700">
                            {policy.policyName}: {policy.reason}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PolicyCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadPolicies();
          loadStatistics();
        }}
      />

      <PolicyDetailsModal
        policy={selectedPolicy}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPolicy(null);
        }}
        onEdit={editPolicy}
        onToggle={togglePolicy}
      />

      <PolicyTestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
      />
    </div>
  );
}