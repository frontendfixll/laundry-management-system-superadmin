// SuperAdmin Automation API Service
import { api } from '@/lib/api';

export interface AutomationRule {
  _id: string;
  ruleId: string;
  name: string;
  description?: string;
  scope: 'PLATFORM' | 'TENANT';
  tenantId?: string;
  trigger: {
    eventType: string;
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
    delay?: number;
  }>;
  isActive: boolean;
  priority: number;
  executionCount: number;
  lastExecuted?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  activeRules: number;
  isRunning: boolean;
  queueLength: number;
}

export interface CreateRuleData {
  name: string;
  description?: string;
  scope: 'PLATFORM' | 'TENANT';
  tenantId?: string;
  trigger: {
    eventType: string;
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
    delay?: number;
  }>;
  priority?: number;
}

class SuperAdminAutomationApiService {
  // Get automation engine statistics
  async getStats(): Promise<AutomationStats> {
    const response = await api.get('/automation/stats');
    return response.data.data;
  }

  // Get automation rules (SuperAdmin can see all)
  async getRules(params?: {
    scope?: string;
    tenantId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    rules: AutomationRule[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get('/automation/rules', { params });
    return response.data.data;
  }

  // Create automation rule (SuperAdmin can create platform rules)
  async createRule(ruleData: CreateRuleData): Promise<AutomationRule> {
    const response = await api.post('/automation/rules', ruleData);
    return response.data.data;
  }

  // Update automation rule
  async updateRule(ruleId: string, updates: Partial<CreateRuleData>): Promise<AutomationRule> {
    const response = await api.put(`/automation/rules/${ruleId}`, updates);
    return response.data.data;
  }

  // Delete automation rule
  async deleteRule(ruleId: string): Promise<void> {
    await api.delete(`/automation/rules/${ruleId}`);
  }

  // Toggle automation rule status
  async toggleRule(ruleId: string): Promise<AutomationRule> {
    const response = await api.patch(`/automation/rules/${ruleId}/toggle`);
    return response.data.data;
  }

  // Test automation rule
  async testRule(ruleId: string, testData?: Record<string, any>): Promise<void> {
    await api.post(`/automation/rules/${ruleId}/test`, { testData });
  }

  // Get rule execution history
  async getRuleHistory(ruleId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    ruleId: string;
    ruleName: string;
    executionCount: number;
    lastExecuted?: string;
    history: any[];
  }> {
    const response = await api.get(`/automation/rules/${ruleId}/history`, { params });
    return response.data.data;
  }

  // Manually trigger automation event (SuperAdmin only)
  async triggerEvent(eventType: string, eventData: Record<string, any>, context?: Record<string, any>): Promise<void> {
    await api.post('/automation/trigger', {
      eventType,
      eventData,
      context
    });
  }

  // SuperAdmin specific: Get platform-wide automation analytics
  async getPlatformAnalytics(): Promise<{
    totalRules: number;
    platformRules: number;
    tenantRules: number;
    executionsByScope: Record<string, number>;
    topTriggers: Array<{ eventType: string; count: number }>;
    recentExecutions: Array<{
      ruleId: string;
      ruleName: string;
      scope: string;
      executedAt: string;
      status: string;
    }>;
  }> {
    const response = await api.get('/automation/analytics/platform');
    return response.data.data;
  }

  // SuperAdmin specific: Bulk operations
  async bulkToggleRules(ruleIds: string[], isActive: boolean): Promise<void> {
    await api.patch('/automation/rules/bulk-toggle', {
      ruleIds,
      isActive
    });
  }

  async bulkDeleteRules(ruleIds: string[]): Promise<void> {
    await api.delete('/automation/rules/bulk-delete', {
      data: { ruleIds }
    });
  }
}

export const superAdminAutomationApi = new SuperAdminAutomationApiService();