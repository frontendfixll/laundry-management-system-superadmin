'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Zap,
  BarChart3,
  CheckCircle,
  XCircle,
  Plus,
  Play,
  Pause,
  Settings,
  Globe,
  Building2,
  TrendingUp,
  Trash2,
  Pencil
} from 'lucide-react';
import { superAdminAutomationApi, AutomationStats, AutomationRule } from '@/services/automationApi';
import CreatePlatformRuleModal from '@/components/automation/CreatePlatformRuleModal';
import toast from 'react-hot-toast';

export default function SuperAdminAutomationPage() {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [platformRules, setPlatformRules] = useState<AutomationRule[]>([]);
  const [tenantRules, setTenantRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, allRulesData] = await Promise.all([
        superAdminAutomationApi.getStats(),
        superAdminAutomationApi.getRules({ limit: 50 })
      ]);

      setStats(statsData);

      // Separate platform and tenant rules
      const platform = allRulesData.rules.filter(rule => rule.scope === 'PLATFORM');
      const tenant = allRulesData.rules.filter(rule => rule.scope === 'TENANT');

      setPlatformRules(platform);
      setTenantRules(tenant);
    } catch (error) {
      console.error('Error loading automation dashboard:', error);
      toast.error('Failed to load automation dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      setToggleLoading(ruleId);
      const updatedRule = await superAdminAutomationApi.toggleRule(ruleId);

      // Update the appropriate rules array
      if (updatedRule.scope === 'PLATFORM') {
        setPlatformRules(prev => prev.map(rule =>
          rule.ruleId === ruleId ? updatedRule : rule
        ));
      } else {
        setTenantRules(prev => prev.map(rule =>
          rule.ruleId === ruleId ? updatedRule : rule
        ));
      }

      toast.success(`Rule ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to toggle rule');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleTestRule = async (ruleId: string) => {
    try {
      await superAdminAutomationApi.testRule(ruleId);
      toast.success('Rule test completed successfully');
    } catch (error) {
      console.error('Error testing rule:', error);
      toast.error('Failed to test rule');
    }
  };

  const handleEditRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setCreateModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this automation rule? This action cannot be undone.')) {
      return;
    }

    try {
      await superAdminAutomationApi.deleteRule(ruleId);
      toast.success('Rule deleted successfully');

      // Remove from state locally
      setPlatformRules(prev => prev.filter(r => r.ruleId !== ruleId));
      setTenantRules(prev => prev.filter(r => r.ruleId !== ruleId));

      loadDashboardData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    loadDashboardData();
  };

  const renderRulesList = (rules: AutomationRule[], scope: 'PLATFORM' | 'TENANT') => {
    if (rules.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            {scope === 'PLATFORM' ? (
              <Globe className="h-12 w-12 text-gray-300" />
            ) : (
              <Building2 className="h-12 w-12 text-gray-300" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {scope.toLowerCase()} rules yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first {scope.toLowerCase()} automation rule to get started
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create {scope} Rule
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.ruleId} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium text-gray-900">{rule.name}</h3>
                <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {rule.scope}
                </Badge>
                {rule.scope === 'TENANT' && rule.tenantId && (
                  <Badge variant="outline" className="text-xs">
                    Tenant: {typeof rule.tenantId === 'object' ? (rule.tenantId as any).name || (rule.tenantId as any).businessName || (rule.tenantId as any)._id : rule.tenantId}
                  </Badge>
                )}
              </div>
              {rule.description && (
                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {rule.executionCount} executions
                </span>
                {rule.lastExecuted && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Last: {new Date(rule.lastExecuted).toLocaleDateString()}
                  </span>
                )}
                <span>Trigger: {rule.trigger.eventType}</span>
                <span>Priority: {rule.priority}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestRule(rule.ruleId)}
              >
                Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditRule(rule)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteRule(rule.ruleId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant={rule.isActive ? "destructive" : "default"}
                size="sm"
                onClick={() => handleToggleRule(rule.ruleId)}
                disabled={toggleLoading === rule.ruleId}
              >
                {toggleLoading === rule.ruleId ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : rule.isActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Automation Engine</h1>
          <p className="text-gray-600">Manage platform-wide and tenant automation rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateRule}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engine Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {stats.isRunning ? (
                      <>
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-600">Running</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-red-600">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalExecutions > 0
                      ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Exec Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.averageExecutionTime)}ms
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rules Tabs */}
      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Platform Rules ({platformRules.length})
          </TabsTrigger>
          <TabsTrigger value="tenant" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Tenant Rules ({tenantRules.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform-Level Automation Rules
              </CardTitle>
              <p className="text-sm text-gray-600">
                These rules manage tenant subscriptions, billing, SLAs, and platform operations
              </p>
            </CardHeader>
            <CardContent>
              {renderRulesList(platformRules, 'PLATFORM')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tenant-Level Automation Rules
              </CardTitle>
              <p className="text-sm text-gray-600">
                These rules manage tenant-specific workflows like orders, customers, and payments
              </p>
            </CardHeader>
            <CardContent>
              {renderRulesList(tenantRules, 'TENANT')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Automation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Detailed analytics and insights coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Platform Rule Modal */}
      <CreatePlatformRuleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        initialData={selectedRule}
      />
    </div>
  );
}